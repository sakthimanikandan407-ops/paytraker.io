import { chromium } from '@playwright/test';
import path from 'path';

const OUT = 'c:\\Users\\sakth\\.gemini\\antigravity\\scratch\\paytrack-v2\\test-results';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

// 1. Navigate to login
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(OUT, 'forgot-1-login.png'), fullPage: true });
console.log('✓ 1. Login page loaded');

// 2. Click Forgot password
const forgotBtn = page.locator('button:has-text("Forgot password")');
if (await forgotBtn.count() > 0) {
    await forgotBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, 'forgot-2-reset-view.png'), fullPage: true });
    console.log('✓ 2. Forgot password view shown');
} else {
    console.log('✗ No "Forgot password" button found');
    await browser.close();
    process.exit(1);
}

// 3. Enter email and submit
await page.locator('input[type="email"]').fill('test@example.com');
await page.screenshot({ path: path.join(OUT, 'forgot-3-email-filled.png'), fullPage: true });
console.log('✓ 3. Email entered');

await page.locator('button[type="submit"]').click();
await page.waitForTimeout(3000);
await page.screenshot({ path: path.join(OUT, 'forgot-4-result.png'), fullPage: true });
console.log('✓ 4. Submit result captured');

// 4. Click Back to Sign In (if visible)
const backBtn = page.locator('button:has-text("Back to Sign In")');
if (await backBtn.count() > 0) {
    await backBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, 'forgot-5-back-login.png'), fullPage: true });
    console.log('✓ 5. Back to login view');
}

await browser.close();
console.log('\n✅ Forgot password flow test complete');
