import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * Vitest global setup — ensures the Part 4 test database, then runs migrations
 * + seed (Part 3's proven invocation).
 *
 * TEARDOWN IS INTENTIONALLY ABSENT: the `kendrafi-part4-test` container is left
 * running between runs for fast iteration. Remove it manually with
 * `docker rm -f kendrafi-part4-test` for a clean slate.
 */
const CONTAINER = "kendrafi-part4-test";
const DB_URL = "postgresql://postgres:part4test@localhost:5544/postgres";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PRISMA_CLI = path.join(ROOT, "node_modules", "prisma", "build", "index.js");

function run(cmd: string, args: string[]): SpawnSyncReturns<string> {
  return spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", windowsHide: true });
}

function runNode(args: string[]): SpawnSyncReturns<string> {
  return spawnSync(process.execPath, args, {
    cwd: ROOT,
    encoding: "utf8",
    windowsHide: true,
    env: { ...process.env, DATABASE_URL: DB_URL },
  });
}

function sleepSync(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export default async function setup(): Promise<void> {
  // 1. Fail loudly when the Docker daemon is unreachable — never skip silently.
  const daemon = run("docker", ["info", "--format", "{{.ServerVersion}}"]);
  if (daemon.error || daemon.status !== 0) {
    throw new Error(
      "Docker daemon unreachable — start Docker Desktop, then re-run `npm run test:auth`."
    );
  }

  // 2. Idempotent container: only `docker run` when absent; start if stopped.
  const inspect = run("docker", ["inspect", CONTAINER]);
  if (inspect.status !== 0) {
    console.log(`[global-setup] creating ${CONTAINER} (postgres:17, port 5544)...`);
    const created = run("docker", [
      "run",
      "-d",
      "--name",
      CONTAINER,
      "-e",
      "POSTGRES_PASSWORD=part4test",
      "-p",
      "5544:5432",
      "postgres:17",
    ]);
    if (created.status !== 0) {
      throw new Error(`docker run ${CONTAINER} failed: ${created.stderr || created.stdout}`);
    }
  } else {
    let running = true;
    try {
      running = Boolean(JSON.parse(inspect.stdout)[0]?.State?.Running);
    } catch {
      // Unparseable inspect output — assume running, pg_isready poll decides.
    }
    if (!running) {
      console.log(`[global-setup] starting stopped container ${CONTAINER}...`);
      run("docker", ["start", CONTAINER]);
    }
  }

  // 3. Wait for Postgres readiness (pg_isready poll, ~30s budget).
  let ready = false;
  for (let i = 0; i < 30; i++) {
    if (run("docker", ["exec", CONTAINER, "pg_isready", "-U", "postgres"]).status === 0) {
      ready = true;
      break;
    }
    sleepSync(1000);
  }
  if (!ready) throw new Error(`${CONTAINER} did not report ready within 30s (pg_isready)`);

  // 4. Migrate + seed against the test database.
  const migrate = runNode([PRISMA_CLI, "migrate", "deploy"]);
  if (migrate.status !== 0) {
    throw new Error(`prisma migrate deploy failed:\n${migrate.stdout}\n${migrate.stderr}`);
  }
  const seed = runNode([path.join(ROOT, "prisma", "seed.js")]);
  if (seed.status !== 0) {
    throw new Error(`prisma seed failed:\n${seed.stdout}\n${seed.stderr}`);
  }
  console.log("[global-setup] test database ready (migrated + seeded)");
}
