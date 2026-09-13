import path from "path";
import { defineConfig } from "vitest/config";

/* Unit and integration tests run against a throwaway Postgres database.
   Locally: createdb tdrop_test. CI: the postgres service in .github/workflows/ci.yml. */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@payload-config": path.resolve(__dirname, "src/payload.config.ts"),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
    env: {
      DATABASE_URI: process.env.TEST_DATABASE_URI || "postgres://localhost:5432/tdrop_test",
      PAYLOAD_SECRET: "test-secret-not-for-production",
      NEXT_PUBLIC_SERVER_URL: "http://localhost:3111",
      STRIPE_SECRET_KEY: "",
      RESEND_API_KEY: "",
      S3_BUCKET: "",
    },
  },
});
