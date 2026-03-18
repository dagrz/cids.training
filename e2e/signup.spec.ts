// e2e/signup.spec.ts
import { test, expect } from '@playwright/test';

test.describe('CIDS.training', () => {
  test('page loads with CIDS hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('CIDS');
  });

  test('assessment flow shows result', async ({ page }) => {
    await page.goto('/');

    // Scroll to assessment
    await page.locator('#assessment').scrollIntoViewIfNeeded();

    // Answer all 4 questions (first option = score 1)
    await page.click("text=I haven't trained in months");
    await page.click('text=I scroll my phone between sets');
    await page.click("text=Protein what?");
    await page.click("text=I didn't sleep");

    // Should show result
    await expect(page.locator('text=Your priority')).toBeVisible();
  });

  test('signup form validates email', async ({ page }) => {
    await page.goto('/');
    await page.locator('#signup').scrollIntoViewIfNeeded();

    await page.fill('input[placeholder="Your email"]', 'bad-email');
    await page.locator('#signup button[type="submit"]').click();

    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('nav Start Now scrolls to signup', async ({ page }) => {
    await page.goto('/');
    await page.click('button:text("Start Now")');

    await expect(page.locator('#signup')).toBeInViewport();
  });

  test('gallery is horizontally scrollable', async ({ page }) => {
    await page.goto('/');
    const gallery = page.locator('.snap-x');
    await expect(gallery).toBeVisible();

    const scrollWidth = await gallery.evaluate((el) => el.scrollWidth);
    const clientWidth = await gallery.evaluate((el) => el.clientWidth);
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });
});
