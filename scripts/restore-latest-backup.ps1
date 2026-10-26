#Requires -Version 5.1
<#
.SYNOPSIS
  Restores the LATEST KendraFi backup into a SEPARATE throwaway database
  (kendrafi_restore_test) and verifies row counts. Never touches the
  source/production database.

.DESCRIPTION
  Part 3 (Databases & storage), Task 4. Full runbook: docs/runbooks/backups.md.

  Target selection (first wins):
    1. -TargetUrl parameter
    2. TARGET_DATABASE_URL environment variable
    3. Default: the local Docker pattern proven in Task 2/5 (PG17+ required —
       pg_dump 18.4 embeds PG17+ GUCs that PG16 cannot restore):
       docker run -d --name kendrafi-pg-restore -e POSTGRES_PASSWORD=kendrafi -p 54330:5432 postgres:17-alpine

  Safety guard: REFUSES to run if the target host looks like the Supabase
  production host (host contains "supabase", or equals the host of
  SUPABASE_URL / DIRECT_URL / DATABASE_URL when those are set).

  The script only ever DROPs / CREATEs / RESTOREs the fixed database name
  'kendrafi_restore_test'. The TARGET url's own database is used solely as
  the maintenance connection for CREATE DATABASE - it is never written to.

  Verifies row counts for all 9 schema tables (Prisma migration
  20261023200857_init): the 7 core domain tables plus organizations/users.
  PASS = restore completed + all tables present + total rows > 0.

  Exit codes: 0 = PASS, 1 = refused or FAIL.
#>
[CmdletBinding()]
param(
    [string]$TargetUrl = ''
)

$ErrorActionPreference = 'Stop'
$RestoreDbName = 'kendrafi_restore_test'
$Tables = @(
    'organizations', 'users', 'kyb_supplier_registry', 'kendra_agents',
    'merchant_private_cashflows', 'zk_solvency_commitments',
    'kendra_fsm_events', 'zerotrust_security_intercepts', 'relayer_nonce_lock'
)

function Fail([string]$Message) {
    Write-Host ""
    Write-Host "FAIL: $Message" -ForegroundColor Red
    exit 1
}

# Extract hostname from any URL without [uri] (which mis-parses the
# postgres:// scheme as opaque on .NET Framework / PowerShell 5.1).
function Get-HostFromUrl([string]$Url) {
    if (-not $Url) { return $null }
    $rest = ($Url -replace '\?.*$', '') -replace '^[a-zA-Z][a-zA-Z0-9+.\-]*://', ''
    $rest = $rest -replace '^[^/@]*@', ''   # drop user[:pass]@
    return ($rest -replace '[:/].*$', '')
}

# --- 1. Resolve + parse target URL -------------------------------------------
if (-not $TargetUrl) { $TargetUrl = $env:TARGET_DATABASE_URL }
if (-not $TargetUrl) { $TargetUrl = 'postgresql://postgres:kendrafi@localhost:54330/postgres' }
$Url = $TargetUrl -replace '\?.*$', ''   # strip Prisma-style ?schema=... params (libpq rejects unknown ones)

if ($Url -notmatch '^postgres(ql)?://') {
    Fail "TARGET url is not a postgres:// connection string: $Url"
}
# shortcut: IPv6 targets are unsupported, use 127.0.0.1 instead.
if ($Url -notmatch '^postgres(ql)?://([^:@/]*)(:([^@/]*))?@([^:/]+)(:(\d+))?(/([^/?]*))?$') {
    Fail "Cannot parse TARGET url. Expected postgresql://[user[:pass]@]host[:port][/db] - got: $Url"
}
$TargetHost = Get-HostFromUrl $Url

# --- 2. Production-host safety guard (run before anything else) ---------------
$reasons = @()
if ($TargetHost -match 'supabase') {
    $reasons += "target host '$TargetHost' looks like a Supabase (production) host"
}
foreach ($Var in 'SUPABASE_URL', 'DIRECT_URL', 'DATABASE_URL') {
    $EnvHost = Get-HostFromUrl ([Environment]::GetEnvironmentVariable($Var))
    if ($EnvHost -and $EnvHost -ieq $TargetHost) {
        $reasons += "target host '$TargetHost' equals the host of $Var (source database)"
    }
}
if ($reasons) {
    Write-Host "REFUSED - this restore drill never touches production:" -ForegroundColor Red
    $reasons | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "Restore targets must be a SEPARATE database (default: local Docker container on :54330)."
    exit 1
}

# --- 3. Tooling ----------------------------------------------------------------
foreach ($Tool in 'psql', 'pg_restore') {
    if (-not (Get-Command $Tool -ErrorAction SilentlyContinue)) {
        Fail "$Tool not found on PATH - install PostgreSQL client tools (repo has client 18.4)."
    }
}

# --- 4. Locate the latest backup ----------------------------------------------
$RepoRoot = Split-Path -Parent $PSScriptRoot
$BackupDir = Join-Path $RepoRoot 'backups'
if (-not (Test-Path -LiteralPath $BackupDir)) {
    Fail "No backups directory at '$BackupDir'. Capture a dump first - see docs/runbooks/backups.md."
}
$Latest = Get-ChildItem -LiteralPath $BackupDir -File |
    Where-Object { $_.Extension -in '.dump', '.sql' } |
    Sort-Object LastWriteTime | Select-Object -Last 1
if (-not $Latest) {
    Fail "No *.dump or *.sql backup file in '$BackupDir'. Capture a dump first - see docs/runbooks/backups.md."
}
Write-Host "Latest backup : $($Latest.Name) ($([math]::Round($Latest.Length / 1KB, 1)) KB, written $($Latest.LastWriteTime))"

# --- 5. Connection check on the target server ----------------------------------
$env:PGCONNECT_TIMEOUT = '10'
& psql $Url -tA -c 'SELECT version();' | Out-Null
if ($LASTEXITCODE -ne 0) {
    Fail "Cannot connect to target '$TargetHost'. Is the throwaway container running? See docs/runbooks/backups.md step 1."
}

# --- 6. Recreate the throwaway database ----------------------------------------
& psql $Url -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS `"$RestoreDbName`" WITH (FORCE);"
if ($LASTEXITCODE -ne 0) { Fail "DROP DATABASE failed on target '$TargetHost'." }
& psql $Url -v ON_ERROR_STOP=1 -c "CREATE DATABASE `"$RestoreDbName`";"
if ($LASTEXITCODE -ne 0) { Fail "CREATE DATABASE failed on target '$TargetHost'." }

# Build the restore URL: same authority, path swapped for kendrafi_restore_test.
$Authority = ($Url -replace '^postgres(ql)?://', '')
$SlashAt = $Authority.IndexOf('/')
if ($SlashAt -ge 0) { $Authority = $Authority.Substring(0, $SlashAt) }
$RestoreUrl = "postgresql://$Authority/$RestoreDbName"

# --- 6.5 Avoid the 'schema "public" already exists' collision -----------------
# pg_dump 18+ clients always emit CREATE SCHEMA public (pg_restore --list
# shows a 'SCHEMA - public' TOC entry), but every fresh PG 15+ database
# already ships one. If (and only if) the backup carries its own public
# schema, drop the just-created throwaway DB's empty default so the restore
# can recreate it. Runs only on kendrafi_restore_test, after the prod guard.
$CarriesPublicSchema = if ($Latest.Extension -eq '.dump') {
    [bool](& pg_restore --list $Latest.FullName | Select-String -Pattern '^\d+;\s+\d+\s+\d+\s+SCHEMA\s')
} else {
    [bool](Select-String -LiteralPath $Latest.FullName -Pattern 'CREATE SCHEMA public' -Quiet)
}
if ($CarriesPublicSchema) {
    & psql $RestoreUrl -v ON_ERROR_STOP=1 -c "DROP SCHEMA public CASCADE;"
    if ($LASTEXITCODE -ne 0) { Fail "DROP SCHEMA public failed on the fresh restore database." }
}

# --- 7. Restore ---------------------------------------------------------------
Write-Host "Restoring     : $($Latest.Name) -> database '$RestoreDbName' on $TargetHost"
if ($Latest.Extension -eq '.dump') {
    & pg_restore --no-owner --no-privileges --exit-on-error "--dbname=$RestoreUrl" $Latest.FullName
} else {
    & psql $RestoreUrl -v ON_ERROR_STOP=1 --file="$($Latest.FullName)"
}
if ($LASTEXITCODE -ne 0) { Fail "Restore of $($Latest.Name) failed - see errors above." }

# --- 8. Verify row counts (7 core domain tables + organizations/users) ---------
$Missing = @()
$Total = [long]0
$Rows = foreach ($Table in $Tables) {
    $Count = (& psql $RestoreUrl -tA -c "SELECT count(*) FROM `"$Table`"") 2>$null
    $Value = "$Count".Trim()
    if ($LASTEXITCODE -ne 0 -or -not $Value) {
        $Missing += $Table
        [pscustomobject]@{ Table = $Table; Rows = 'MISSING' }
    } else {
        $N = [long]0
        if (-not [long]::TryParse($Value, [ref]$N)) {
            $Missing += $Table
            [pscustomobject]@{ Table = $Table; Rows = 'MISSING' }
        } else {
            $Total += $N
            [pscustomobject]@{ Table = $Table; Rows = $N }
        }
    }
}
$Rows | Format-Table -AutoSize

if ($Missing) {
    Fail "Schema incomplete - missing table(s): $($Missing -join ', ')."
}
if ($Total -le 0) {
    Fail "Restore contains zero data rows across all tables - the dump is schema-only or empty."
}

Write-Host ""
Write-Host "PASS - restored $($Latest.Name) into '$RestoreDbName' on $TargetHost" -ForegroundColor Green
Write-Host "       $Total total rows across $($Tables.Count) tables (7 core domain tables + organizations/users)."
Write-Host "       The drill target is disposable; production was never touched."
exit 0
