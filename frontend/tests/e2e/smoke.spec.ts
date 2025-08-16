import { test, expect } from '@playwright/test';

// Minimal smoke test to ensure the app renders without crashing
// and the custom element is present.

test('loads app-root on home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-root')).toBeVisible();
});
