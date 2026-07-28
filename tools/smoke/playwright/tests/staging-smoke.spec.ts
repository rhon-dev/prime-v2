import { test, expect } from '@playwright/test';

// Environment variables required by the test runner (set in CI or locally):
// - BASE_URL (e.g. https://staging.prime.example.org)
// - STAFF_EMAIL and STAFF_PASSWORD (staff test account)
// - APPLICANT_EMAIL (optional) and GOOGLE_OAUTH_CLIENT_ID/SECRET (optional)
// - API_TOKEN (optional, if the project supports test API token login)

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const STAFF_EMAIL = process.env.STAFF_EMAIL;
const STAFF_PASSWORD = process.env.STAFF_PASSWORD;

if (!STAFF_EMAIL || !STAFF_PASSWORD) {
  console.warn('STAFF_EMAIL or STAFF_PASSWORD not set — staff login test will be skipped');
}

test.describe('Staging smoke tests', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/health`);
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.status).toBe('ok');
  });

  test('staff login and basic create/submit flow', async ({ page, request }) => {
    test.skip(!STAFF_EMAIL || !STAFF_PASSWORD, 'staff credentials not provided');

    // Navigate to login page and perform staff login (adjust selectors as needed)
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', STAFF_EMAIL);
    await page.fill('input[name="password"]', STAFF_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to app shell
    await page.waitForURL('**/dashboard', { timeout: 30_000 });

    // Capture auth cookies for API use
    const cookies = await page.context().cookies();

    // Create a proposal via the API using the authenticated context
    const apiContext = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        // If the backend supports cookie auth, pass cookie header manually
        cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
      }
    });

    // Create draft proposal — adjust endpoint and payload to match backend API
    const createResp = await apiContext.post('/api/proposals', {
      data: { title: 'Smoke-test Proposal', formTemplateId: 'GIA' }
    });
    expect(createResp.ok()).toBeTruthy();
    const proposal = await createResp.json();
    expect(proposal.id).toBeTruthy();

    // Save draft (if separate endpoint exists) or directly submit
    const submitResp = await apiContext.post(`/api/proposals/${proposal.id}/submit`);
    expect([200, 201, 204]).toContain(submitResp.status());

    // Trigger export (document generation)
    const exportResp = await apiContext.post(`/api/proposals/${proposal.id}/export`);
    // allow 2xx or 409 if not allowed for role
    expect([200, 201, 202, 409]).toContain(exportResp.status());
  });

  test('file upload and download via presigned url', async ({ page }) => {
    test.skip(!STAFF_EMAIL || !STAFF_PASSWORD, 'staff credentials not provided');

    // Log in again and get to a proposal page where uploads are allowed (selectors are app-specific)
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', STAFF_EMAIL);
    await page.fill('input[name="password"]', STAFF_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Navigate to a known proposal (the earlier created one) or a test upload page
    // This test assumes an upload input exists; adjust selector as needed
    // Example: await page.goto(`${BASE_URL}/proposals/${proposalId}/attachments`)

    // Use the file chooser to upload a small sample file
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      // Click the upload button that opens the file chooser
      page.click('button[data-test="upload-attachment"]')
    ]);
    await fileChooser.setFiles(require('path').resolve(__dirname, '../fixtures/sample.txt'));

    // Wait for upload to finish and for a download link to appear
    await page.waitForSelector('a[data-test="attachment-download"]', { timeout: 20000 });
    const href = await page.getAttribute('a[data-test="attachment-download"]', 'href');
    expect(href).toBeTruthy();

    // Optionally fetch the download URL and verify status
    const resp = await page.request.get(href);
    expect(resp.ok()).toBeTruthy();
    const buffer = await resp.body();
    expect(buffer.length).toBeGreaterThan(0);
  });

  test('google oauth login (if configured)', async ({ page }) => {
    test.skip(!process.env.GOOGLE_OAUTH_CLIENT_ID, 'Google OAuth not configured for tests');

    // This test requires a test OAuth client and redirect URIs that point to staging.
    // It may be flaky in fully automated runs due to third-party CAPTCHA/consent screens.
    await page.goto(`${BASE_URL}/login`);
    await page.click('button[data-test="google-login"]');

    // Further steps depend on the Google consent page and test user; consider using a service-account or mocked flow for automation.
    test.info().annotations.push({ type: 'note', description: 'Google OAuth test executed manually or via headful mode when credentials are available.' });
  });
});
