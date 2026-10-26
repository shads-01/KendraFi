import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Part 4 authorization tests (Task 3). Node environment, real Prisma client
// against the kendrafi-part4-test Docker container (see ./global-setup.ts).
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export default defineConfig({
  root: ROOT,
  resolve: {
    alias: {
      "@": path.resolve(ROOT, "src"),
      // server-only throws outside the react-server condition; vitest node
      // env counts, so point it at the package's own no-op export.
      "server-only": path.resolve(ROOT, "node_modules/server-only/empty.js"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/part4/**/*.test.ts"],
    globalSetup: ["tests/part4/global-setup.ts"],
    env: {
      // Test DB: docker container kendrafi-part4-test (PG17, port 5544) —
      // guaranteed by global-setup; injected here so src/lib/prisma.ts sees it.
      DATABASE_URL: "postgresql://postgres:part4test@localhost:5544/postgres",
      // Supabase deliberately unconfigured: endpoints must fail closed to 401.
      NEXT_PUBLIC_SUPABASE_URL: "",
      SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    },
    // Shared container + shared DB state: files run sequentially.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
