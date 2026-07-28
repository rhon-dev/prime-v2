Playwright smoke tests for PRIME v2 staging

Quickstart

1. cd tools/smoke/playwright
2. npm install
3. npm run install-playwright-browsers
4. BASE_URL=https://staging.prime.example.org STAFF_EMAIL=admin@dev.local STAFF_PASSWORD=DevAdminPassw0rd!123 npx playwright test

Notes

- The tests assume the app exposes a /api/health endpoint.
- Staff credentials should be staging-only test accounts (do not use production accounts).
- Google OAuth test requires a test OAuth client with redirect URI for the staging domain; the test is skipped if GOOGLE_OAUTH_CLIENT_ID is not set.
- Adjust selectors in tests to match the current frontend implementation of login, upload buttons, and attachment links.
- Store secrets only in CI secret store or Coolify; do not commit values in repository.

Artifacts

Smoke-test artifacts should be saved into docs/deployment/smoke-test-reports/<date>-<tag>/ with summary and logs.
