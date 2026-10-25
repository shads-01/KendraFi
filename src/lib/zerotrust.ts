import crypto from "crypto";
import fs from "fs";
import path from "path";

const SIGNATURE_HEADER_NAME = "X-ZeroTrust-Signature";
const TIMESTAMP_HEADER_NAME = "X-ZeroTrust-Timestamp";
const MAX_SKEW_SECONDS = 30;

export interface SignedZeroTrustRequest {
  signature: string;
  timestamp: string;
  body: string;
  headers: Record<string, string>;
}

/**
 * Loads secret from .env if running in a local environment without preloaded env.
 */
function loadEnvHmacSecret(): string {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/ZEROTRUST_INTERNAL_HMAC_SECRET=["']?([^"'\r\n]+)["']?/);
      if (match) return match[1];
    }
  } catch {
    // Ignore error
  }
  return "";
}

/**
 * Returns the configured inter-service Zero-Trust HMAC secret key.
 */
export function getZeroTrustSecret(): string {
  const secret = (
    process.env.ZEROTRUST_INTERNAL_HMAC_SECRET ||
    process.env.ZEROTRUST_HMAC_SECRET ||
    loadEnvHmacSecret()
  );
  if (!secret) {
    throw new Error("ZeroTrust security error: ZEROTRUST_INTERNAL_HMAC_SECRET environment variable is missing.");
  }
  return secret;
}

/**
 * Cryptographically signs an outbound payload from Next.js BFF to FastAPI.
 * Generates an HMAC-SHA256 signature over `${timestamp}.${body}` and includes
 * the anti-replay timestamp header.
 */
export function signZeroTrustPayload(body: unknown = {}): SignedZeroTrustRequest {
  const secret = getZeroTrustSecret();
  const timestamp = (Date.now() / 1000).toFixed(3);
  const bodyString = typeof body === "string" ? body : JSON.stringify(body ?? {});
  const message = `${timestamp}.${bodyString}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(message, "utf-8")
    .digest("hex");

  return {
    signature,
    timestamp,
    body: bodyString,
    headers: {
      [SIGNATURE_HEADER_NAME]: signature,
      [TIMESTAMP_HEADER_NAME]: timestamp,
      "Content-Type": "application/json",
    },
  };
}

/**
 * Validates an incoming Zero-Trust signature and enforces the 30-second anti-replay window.
 */
export function verifyZeroTrustPayload(
  signature: string | null | undefined,
  timestamp: string | null | undefined,
  body: string,
  maxSkewSeconds: number = MAX_SKEW_SECONDS
): { valid: boolean; error?: string } {
  if (!signature || !timestamp) {
    return {
      valid: false,
      error: `Missing required Zero-Trust headers (${SIGNATURE_HEADER_NAME}, ${TIMESTAMP_HEADER_NAME})`,
    };
  }

  const tsNum = parseFloat(timestamp);
  if (isNaN(tsNum)) {
    return { valid: false, error: "Invalid timestamp format" };
  }

  const now = Date.now() / 1000;
  const skew = Math.abs(now - tsNum);
  if (skew > maxSkewSeconds) {
    return {
      valid: false,
      error: `Replay attack detected: timestamp skew of ${skew.toFixed(2)}s exceeds allowed limit of ${maxSkewSeconds}s`,
    };
  }

  const secret = getZeroTrustSecret();
  const message = `${timestamp}.${body}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(message, "utf-8")
    .digest("hex");

  try {
    const sigBuffer = Buffer.from(signature.toLowerCase(), "hex");
    const expectedBuffer = Buffer.from(expectedSig.toLowerCase(), "hex");
    if (
      sigBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return { valid: true };
    }
    return { valid: false, error: "Invalid HMAC-SHA256 signature" };
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err);
    return { valid: false, error: `Signature verification failed: ${detail}` };
  }
}

/**
 * Returns the configured Python Risk Engine base URL.
 */
export function getPythonRiskEngineUrl(): string {
  return process.env.PYTHON_RISK_ENGINE_URL || "http://127.0.0.1:8000";
}

/**
 * Dispatches an HMAC-authenticated HTTP POST request from Next.js BFF to FastAPI.
 */
export async function callPythonBackend<T = unknown>(
  endpoint: string,
  body: unknown = {},
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getPythonRiskEngineUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;
  const signed = signZeroTrustPayload(body);

  const method = (options.method || "POST").toUpperCase();
  const fetchOptions: RequestInit = {
    ...options,
    method,
    headers: {
      ...signed.headers,
      ...(options.headers || {}),
    },
  };
  if (method !== "GET" && method !== "HEAD") {
    fetchOptions.body = signed.body;
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Python backend error [${response.status}]: ${errorText}`);
  }

  return response.json() as Promise<T>;
}

