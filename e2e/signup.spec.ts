// e2e/signup.spec.ts
import { test, expect } from '@playwright/test';

test.describe('CIDS.training', () => {
  test('page loads with CIDS hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('CIDS');
  });

  test('assessment exits early on weak score', async ({ page }) => {
    await page.goto('/');
    await page.locator('#assessment').scrollIntoViewIfNeeded();

    // Answer first question with weak score — should exit immediately
    await page.click("text=I haven't trained in months");

    // Should show result without asking more questions
    await expect(page.locator('text=Your priority')).toBeVisible({ timeout: 2000 });
  });

  test('assessment advances on strong score', async ({ page }) => {
    await page.goto('/');
    await page.locator('#assessment').scrollIntoViewIfNeeded();

    // Answer first question with strong score
    await page.click('text=I show up like clockwork');

    // Should advance to intensity question
    await expect(page.locator('text=I scroll my phone between sets')).toBeVisible({ timeout: 2000 });
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

  test('gallery renders images in grid', async ({ page }) => {
    await page.goto('/');
    const gallery = page.locator('.grid-cols-2');
    await expect(gallery).toBeVisible();

    // Should have 4 images
    const images = gallery.locator('img');
    await expect(images).toHaveCount(4);
  });
});
