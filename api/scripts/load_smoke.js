// k6 smoke: 20 VUs x 60s, GET /api/kendra/state every ~2s.
// Usage: docker run --rm -i grafana/k6:latest run - < api/scripts/load_smoke.js
// Target local uvicorn: http://host.docker.internal:8000 (--network host does not work on Windows Docker Desktop).
import http from "k6/http";
import { sleep } from "k6";

const TARGET = __ENV.TARGET || "http://host.docker.internal:8000";

export const options = {
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  vus: 20,
  duration: "60s",
  thresholds: {
    // informational only — 401/429 are expected-but-counted, not tuned around
    http_req_failed: [{ threshold: "rate<1", abortOnFail: false }],
  },
};

export default function () {
  const res = http.get(`${TARGET}/api/kendra/state`);
  // 401 (auth) and 429 (per-IP rate limit ~60/min) are expected; k6 counts
  // any status >= 400 as failed, so log them for the record rather than filter.
  if (res.status === 401 || res.status === 429) {
    console.log(`expected-but-counted: HTTP ${res.status}`);
  }
  sleep("2");
}
