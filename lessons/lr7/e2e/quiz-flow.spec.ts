import { test, expect } from '@playwright/test';

test.describe('Quiz Application E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage loads successfully', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('shows start screen with button', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /начать/i });
    await expect(startButton).toBeVisible();
  });

  test('has quiz game title', async ({ page }) => {
    const title = page.locator('h1');
    await expect(title).toContainText('Quiz Game');
  });

  test('theme toggle button is present', async ({ page }) => {
    const themeButton = page.locator('button').filter({ hasText: /🌙|☀️/ });
    await expect(themeButton).toBeVisible();
  });

  test('can see MobX + Zustand info', async ({ page }) => {
    const infoText = page.locator('text=MobX + Zustand');
    await expect(infoText).toBeVisible();
  });
});
