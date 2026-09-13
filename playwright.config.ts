import { defineConfig } from "@playwright/test";

/* Smoke run against a dev server on port 3111 bound to the test database.
   Prepare it once: TEST_DATABASE_URI=... npm run test:e2e:setup */
const dbUri = process.env.TEST_DATABASE_URI || "postgres://localhost:5432/tdrop_test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60000,
  retries: 0,
  use: { baseURL: "http://localhost:3111", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev -- --port 3111",
    url: "http://localhost:3111/your-profile",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      DATABASE_URI: dbUri,
      PAYLOAD_SECRET: "test-secret-not-for-production",
      NEXT_PUBLIC_SERVER_URL: "http://localhost:3111",
      STRIPE_SECRET_KEY: "",
      STRIPE_WEBHOOK_SECRET: "",
      RESEND_API_KEY: "",
      S3_BUCKET: "",
    },
  },
});
