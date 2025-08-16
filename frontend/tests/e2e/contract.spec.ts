import { test, expect } from '@playwright/test';

test.describe('Contract toevoegen', () => {
  test('kan een contract toevoegen en zien in het overzicht', async ({ page }) => {
    // Log all browser console messages for debugging
    page.on('console', msg => {
      // eslint-disable-next-line no-console
      console.log(`[browser console] ${msg.type()}: ${msg.text()}`);
    });
    // Log all page errors (uncaught exceptions)
    page.on('pageerror', error => {
      // eslint-disable-next-line no-console
      console.log(`[page error] ${error}`);
    });
    // Log all unhandled promise rejections
    page.on('requestfailed', request => {
      // eslint-disable-next-line no-console
      console.log(`[request failed] ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Log all network requests and their statuses
    page.on('requestfinished', request => {
      request.response().then(response => {
        if (response) {
          // eslint-disable-next-line no-console
          console.log(`[network] ${request.method()} ${request.url()} - ${response.status()}`);
        } else {
          // eslint-disable-next-line no-console
          console.log(`[network] ${request.method()} ${request.url()} - NO RESPONSE`);
        }
      });
    });
    page.on('requestfailed', request => {
      // eslint-disable-next-line no-console
      console.log(`[network] ${request.method()} ${request.url()} - FAILED`);
    });


    // Inject fake-indexeddb and FDBKeyRange for full IndexedDB API support in E2E tests
    const { indexedDB } = require('fake-indexeddb');
    const FDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
    await page.addInitScript(([idbSource, keyRangeSource]) => {
      // eslint-disable-next-line no-eval
      window.indexedDB = eval(idbSource);
      // eslint-disable-next-line no-eval
      window.IDBKeyRange = eval(keyRangeSource);
    }, [indexedDB.toString(), FDBKeyRange.toString()]);
    // Polyfill crypto.randomUUID if not available
    await page.addInitScript(() => {
      if (!window.crypto.randomUUID) {
        window.crypto.randomUUID = function () {
          // Simple RFC4122 version 4 compliant solution
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
      }
    });
    await page.goto('/');
    // Print the page's HTML for debugging
    const html = await page.content();
    // eslint-disable-next-line no-console
    console.log('[page HTML after navigation]\n' + html);

    // Vul het formulier in via shadow DOM selectors
    const form = page.locator('contract-add-form');
    await form.locator('input[name="name"]').fill('Test Contract');
    await form.locator('input[name="accountNumber"]').fill('NL00BANK0123456789');
    await form.locator('textarea[name="description"]').fill('Test omschrijving');
    await form.locator('button[type="submit"]').click();

    // Wacht expliciet op de succesmelding
    // Select .success inside the shadow DOM of contract-add-form using Playwright's shadow DOM piercing selector
    const successMsg = page.locator('contract-add-form >> .success');
    await expect(successMsg).toBeVisible({ timeout: 5000 });
    await expect(successMsg).toHaveText(/succesvol toegevoegd/i);

    // Controleer dat het contract in het overzicht staat
    await expect(page.locator('table')).toContainText('Test Contract');
    await expect(page.locator('table')).toContainText('NL00BANK0123456789');
    await expect(page.locator('table')).toContainText('Test omschrijving');
  });
});
