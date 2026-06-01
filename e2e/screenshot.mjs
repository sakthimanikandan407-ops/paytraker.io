import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = `file://${path.resolve(__dirname, 'fixture', 'invoice-form.html').replace(/\\/g, '/')}`;
const OUT = path.resolve(__dirname, '..', 'test-results');

const browser = await chromium.launch();

// --- Desktop screenshot (empty form) ---
const ctx1 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const p1 = await ctx1.newPage();
await p1.goto(FIXTURE, { waitUntil: 'domcontentloaded' });
await p1.screenshot({ path: path.join(OUT, 'ui-desktop-empty.png'), fullPage: true });
console.log('✓ Desktop empty form screenshot saved');

// --- Filled form ---
await p1.locator('input[name="client_name"]').fill('Acme Corporation');
await p1.locator('input[name="client_email"]').fill('billing@acme.com');
await p1.locator('input[name="amount"]').fill('4500');
await p1.locator('input[name="due_date"]').fill('2026-06-15');
await p1.screenshot({ path: path.join(OUT, 'ui-desktop-filled.png'), fullPage: true });
console.log('✓ Desktop filled form screenshot saved');

// --- Success state ---
await p1.locator('button[type="submit"]').click();
await p1.waitForTimeout(500);
await p1.screenshot({ path: path.join(OUT, 'ui-desktop-success.png'), fullPage: true });
console.log('✓ Desktop success state screenshot saved');

// --- Validation errors ---
await p1.goto(FIXTURE, { waitUntil: 'domcontentloaded' });
await p1.locator('button[type="submit"]').click();
await p1.waitForTimeout(300);
await p1.screenshot({ path: path.join(OUT, 'ui-desktop-errors.png'), fullPage: true });
console.log('✓ Desktop validation errors screenshot saved');

// --- Disabled button ---
await p1.goto(FIXTURE, { waitUntil: 'domcontentloaded' });
await p1.locator('button[type="submit"]').evaluate(el => el.disabled = true);
await p1.waitForTimeout(200);
await p1.screenshot({ path: path.join(OUT, 'ui-desktop-disabled.png'), fullPage: true });
console.log('✓ Desktop disabled button screenshot saved');
await ctx1.close();

// --- Mobile screenshot ---
const ctx2 = await browser.newContext({ viewport: { width: 375, height: 667 } });
const p2 = await ctx2.newPage();
await p2.goto(FIXTURE, { waitUntil: 'domcontentloaded' });
await p2.locator('input[name="client_name"]').fill('Mobile Corp');
await p2.locator('input[name="client_email"]').fill('m@test.com');
await p2.locator('input[name="amount"]').fill('999');
await p2.locator('input[name="due_date"]').fill('2026-12-25');
await p2.screenshot({ path: path.join(OUT, 'ui-mobile-filled.png'), fullPage: true });
console.log('✓ Mobile filled form screenshot saved');
await ctx2.close();

// --- Tablet screenshot ---
const ctx3 = await browser.newContext({ viewport: { width: 768, height: 1024 } });
const p3 = await ctx3.newPage();
await p3.goto(FIXTURE, { waitUntil: 'domcontentloaded' });
await p3.screenshot({ path: path.join(OUT, 'ui-tablet-empty.png'), fullPage: true });
console.log('✓ Tablet empty form screenshot saved');
await ctx3.close();

await browser.close();
console.log('\n✅ All UI screenshots saved to test-results/');
