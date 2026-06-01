import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

/* ──────────────────────────────────────────────────────────────
   Resolve the fixture file path to a file:// URL
   ────────────────────────────────────────────────────────────── */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_URL = `file://${path.resolve(__dirname, 'fixture', 'invoice-form.html').replace(/\\/g, '/')}`;

/* ──────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────── */

const FIELDS = {
  client_name:  { selector: 'input[name="client_name"]',  value: 'Acme Corporation' },
  client_email: { selector: 'input[name="client_email"]', value: 'billing@acme.com' },
  amount:       { selector: 'input[name="amount"]',       value: '4500' },
  due_date:     { selector: 'input[name="due_date"]',     value: '2026-06-15' },
};

const SUBMIT = 'button[type="submit"]';

async function fillValidForm(page) {
  for (const field of Object.values(FIELDS)) {
    await page.locator(field.selector).fill(field.value);
  }
}

async function css(locator, prop) {
  return locator.evaluate(
    (el, p) => window.getComputedStyle(el).getPropertyValue(p),
    prop,
  );
}

/* ══════════════════════════════════════════════════════════════
   TEST SUITE
   ══════════════════════════════════════════════════════════════ */

test.describe('Invoice Form — Full Assurance Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });
  });

  /* ────────────────────────────────────────────────────────────
     1. FUNCTIONAL TEST CASES
     ──────────────────────────────────────────────────────────── */

  test.describe('Functional Tests', () => {

    test('TC-F01 · Page loads successfully', async ({ page }) => {
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      await expect(page.locator('body')).toBeVisible();
    });

    test('TC-F02 · Form is visible on the page', async ({ page }) => {
      const form = page.locator('form');
      await expect(form).toBeVisible();
      await expect(form).toBeAttached();
    });

    test('TC-F03 · All inputs are present and interactable', async ({ page }) => {
      for (const [name, { selector }] of Object.entries(FIELDS)) {
        const input = page.locator(selector);
        await expect(input, `${name} should be visible`).toBeVisible();
        await expect(input, `${name} should be enabled`).toBeEnabled();
        await expect(input, `${name} should be editable`).toBeEditable();
      }
    });

    test('TC-F04 · User can fill form with valid data and values persist', async ({ page }) => {
      await fillValidForm(page);

      await expect(page.locator(FIELDS.client_name.selector)).toHaveValue(FIELDS.client_name.value);
      await expect(page.locator(FIELDS.client_email.selector)).toHaveValue(FIELDS.client_email.value);
      await expect(page.locator(FIELDS.amount.selector)).toHaveValue(FIELDS.amount.value);
      await expect(page.locator(FIELDS.due_date.selector)).toHaveValue(FIELDS.due_date.value);
    });

    test('TC-F05 · Submit button is present and clickable', async ({ page }) => {
      const btn = page.locator(SUBMIT);
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();

      const btnText = (await btn.textContent()).trim().toLowerCase();
      expect(
        btnText.includes('submit') ||
        btnText.includes('create') ||
        btnText.includes('save') ||
        btnText.includes('send') ||
        btnText.includes('invoice'),
      ).toBeTruthy();
    });

    test('TC-F06 · Success message appears after valid submission', async ({ page }) => {
      await fillValidForm(page);
      await page.locator(SUBMIT).click();

      const success = page.locator('#success-msg');
      await expect(success).toBeVisible({ timeout: 5_000 });
      await expect(success).toContainText(/invoice created/i);
    });

    test('TC-F07 · Empty form submission triggers validation errors', async ({ page }) => {
      // Ensure fields are empty
      for (const { selector } of Object.values(FIELDS)) {
        await page.locator(selector).fill('');
      }

      await page.locator(SUBMIT).click();

      // Custom error messages should appear
      const visibleErrors = page.locator('.error-message.visible');
      await expect(visibleErrors.first()).toBeVisible();
      const count = await visibleErrors.count();
      expect(count).toBeGreaterThan(0);
    });

    test('TC-F08 · Invalid email shows validation error', async ({ page }) => {
      await fillValidForm(page);
      await page.locator(FIELDS.client_email.selector).fill('not-an-email');
      await page.locator(SUBMIT).click();

      const emailError = page.locator('.error-message[data-for="client_email"]');
      await expect(emailError).toBeVisible();
    });

    test('TC-F09 · Amount field rejects non-numeric input', async ({ page }) => {
      const amountInput = page.locator(FIELDS.amount.selector);

      // Click into the field and type alpha chars via keyboard
      await amountInput.click();
      await page.keyboard.type('abc');

      const value = await amountInput.inputValue();

      // type="number" inputs reject alpha chars — value should remain empty
      expect(value).toBe('');

      // Verify a valid number IS accepted
      await amountInput.fill('250');
      await expect(amountInput).toHaveValue('250');
    });
  });

  /* ────────────────────────────────────────────────────────────
     2. UI / THEME / LAYOUT TEST CASES
     ──────────────────────────────────────────────────────────── */

  test.describe('UI / Theme Tests', () => {

    test('TC-U01 · Page layout is centered', async ({ page }) => {
      const form = page.locator('form');
      const box = await form.boundingBox();
      const viewport = page.viewportSize();

      expect(box).not.toBeNull();
      const formCenterX = box.x + box.width / 2;
      const viewportCenterX = viewport.width / 2;

      expect(Math.abs(formCenterX - viewportCenterX)).toBeLessThan(40);
    });

    test('TC-U02 · Form container has visible styling (padding & margin)', async ({ page }) => {
      const form = page.locator('form');
      await expect(form).toBeVisible();

      const padding = await css(form, 'padding');
      const display = await css(form, 'display');

      expect(padding).toBeDefined();
      expect(padding).not.toBe('0px');
      expect(display).not.toBe('none');
    });

    test('TC-U03 · Submit button has background color and hover effect', async ({ page }) => {
      const btn = page.locator(SUBMIT);

      const bgBefore = await css(btn, 'background-color');
      expect(bgBefore).toMatch(/rgb/);

      await btn.hover();
      await page.waitForTimeout(350);
      const bgAfter = await css(btn, 'background-color');
      expect(bgAfter).toMatch(/rgb/);

      const cursor = await css(btn, 'cursor');
      expect(cursor).toBe('pointer');
    });

    test('TC-U04 · Inputs have borders and focus ring / shadow', async ({ page }) => {
      for (const { selector } of Object.values(FIELDS)) {
        const input = page.locator(selector);

        const borderWidth = await css(input, 'border-width');
        expect(parseFloat(borderWidth)).toBeGreaterThan(0);

        await input.focus();
        await page.waitForTimeout(250);

        const outline = await css(input, 'outline');
        const shadow = await css(input, 'box-shadow');

        expect(
          outline !== 'none' || shadow !== 'none',
          `Input ${selector} should have a focus indicator`,
        ).toBeTruthy();
      }
    });

    test('TC-U05 · Font family is consistent across body and form', async ({ page }) => {
      const bodyFont = await page.evaluate(() =>
        window.getComputedStyle(document.body).fontFamily,
      );

      const formFont = await css(page.locator('form'), 'font-family');
      const btnFont = await css(page.locator(SUBMIT), 'font-family');

      expect(formFont).toBe(bodyFont);
      expect(btnFont).toBe(bodyFont);
    });

    test('TC-U06 · No overlapping elements in form', async ({ page }) => {
      const elements = await page.locator('form input, form button, form label').all();
      const boxes = [];

      for (const el of elements) {
        const box = await el.boundingBox();
        if (box) boxes.push(box);
      }

      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i];
          const b = boxes[j];

          const overlapX = a.x < b.x + b.width && a.x + a.width > b.x;
          const overlapY = a.y < b.y + b.height && a.y + a.height > b.y;

          if (overlapX && overlapY) {
            const overlapArea =
              Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
              Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

            expect(overlapArea, `Elements ${i} and ${j} overlap by ${overlapArea}px²`).toBeLessThan(100);
          }
        }
      }
    });

    test('TC-U07 · Mobile responsiveness (375×667)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(300);

      const form = page.locator('form');
      await expect(form).toBeVisible();

      const box = await form.boundingBox();
      expect(box).not.toBeNull();
      expect(box.width).toBeLessThanOrEqual(375);

      for (const { selector } of Object.values(FIELDS)) {
        const inputBox = await page.locator(selector).boundingBox();
        if (inputBox) {
          expect(inputBox.x + inputBox.width).toBeLessThanOrEqual(376);
        }
      }
    });

    test('TC-U08 · Dark/light theme consistency (if toggle exists)', async ({ page }) => {
      const themeToggle = page.locator(
        '[data-testid="theme-toggle"], button:has-text("dark"), button:has-text("theme"), [aria-label*="theme" i]',
      );

      const hasToggle = (await themeToggle.count()) > 0;

      if (hasToggle) {
        const bgLight = await page.evaluate(() =>
          window.getComputedStyle(document.body).backgroundColor,
        );
        await themeToggle.first().click();
        await page.waitForTimeout(500);
        const bgDark = await page.evaluate(() =>
          window.getComputedStyle(document.body).backgroundColor,
        );
        expect(bgLight).not.toBe(bgDark);
        await expect(page.locator('form')).toBeVisible();
      } else {
        // No toggle — verify consistent background exists
        const bg = await page.evaluate(() =>
          window.getComputedStyle(document.body).backgroundColor,
        );
        expect(bg).toBeDefined();
        expect(bg).not.toBe('');
      }
    });

    test('TC-U09 · Button disabled state has reduced opacity', async ({ page }) => {
      const btn = page.locator(SUBMIT);

      const enabledOpacity = await css(btn, 'opacity');

      await btn.evaluate((el) => (el.disabled = true));
      await page.waitForTimeout(200);

      const disabledOpacity = await css(btn, 'opacity');
      const disabledCursor = await css(btn, 'cursor');

      expect(
        parseFloat(disabledOpacity) < parseFloat(enabledOpacity) ||
        disabledCursor === 'not-allowed' ||
        disabledCursor === 'default',
        'Disabled button should have reduced opacity or non-pointer cursor',
      ).toBeTruthy();

      await btn.evaluate((el) => (el.disabled = false));
    });

    test('TC-U10 · Error messages are visible and styled', async ({ page }) => {
      for (const { selector } of Object.values(FIELDS)) {
        await page.locator(selector).fill('');
      }
      await page.locator(SUBMIT).click();
      await page.waitForTimeout(300);

      const errorLocator = page.locator('.error-message.visible');
      const errorCount = await errorLocator.count();
      expect(errorCount).toBeGreaterThan(0);

      for (let i = 0; i < errorCount; i++) {
        const el = errorLocator.nth(i);
        await expect(el).toBeVisible();

        const color = await css(el, 'color');
        const fontSize = await css(el, 'font-size');

        expect(color).toMatch(/rgb/);
        expect(parseFloat(fontSize)).toBeGreaterThan(0);
      }
    });
  });

  /* ────────────────────────────────────────────────────────────
     3. RESPONSIVE / VIEWPORT TEST CASES
     ──────────────────────────────────────────────────────────── */

  test.describe('Responsive Viewport Tests', () => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Full HD Desktop' },
      { width: 1366, height: 768,  name: 'Laptop' },
      { width: 1024, height: 768,  name: 'Tablet Landscape' },
      { width: 768,  height: 1024, name: 'Tablet Portrait' },
      { width: 414,  height: 896,  name: 'iPhone XR' },
      { width: 375,  height: 667,  name: 'iPhone SE' },
      { width: 360,  height: 800,  name: 'Android (Small)' },
    ];

    for (const vp of viewports) {
      test(`TC-R · Layout intact @ ${vp.name} (${vp.width}×${vp.height})`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.waitForTimeout(300);

        const form = page.locator('form');
        await expect(form).toBeVisible();

        const box = await form.boundingBox();
        expect(box).not.toBeNull();
        expect(box.width).toBeLessThanOrEqual(vp.width + 1);

        await expect(page.locator(SUBMIT)).toBeVisible();

        for (const { selector } of Object.values(FIELDS)) {
          await expect(page.locator(selector)).toBeVisible();
        }

        const display = await css(form, 'display');
        expect(display).not.toBe('none');
      });
    }
  });

  /* ────────────────────────────────────────────────────────────
     4. CSS PROPERTY VALIDATION
     ──────────────────────────────────────────────────────────── */

  test.describe('CSS Property Validation', () => {

    test('TC-CSS01 · Submit button CSS properties', async ({ page }) => {
      const btn = page.locator(SUBMIT);

      const bgColor   = await css(btn, 'background-color');
      const color     = await css(btn, 'color');
      const fontSize  = await css(btn, 'font-size');
      const padding   = await css(btn, 'padding');
      const display   = await css(btn, 'display');

      expect(bgColor).toMatch(/rgb/);
      expect(color).toMatch(/rgb/);
      expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(12);
      expect(padding).toBeDefined();
      expect(display).not.toBe('none');
    });

    test('TC-CSS02 · Input fields CSS properties', async ({ page }) => {
      for (const { selector } of Object.values(FIELDS)) {
        const input = page.locator(selector);

        const bgColor  = await css(input, 'background-color');
        const color    = await css(input, 'color');
        const fontSize = await css(input, 'font-size');
        const padding  = await css(input, 'padding');
        const display  = await css(input, 'display');

        expect(bgColor, `${selector} bg-color`).toMatch(/rgb/);
        expect(color, `${selector} color`).toMatch(/rgb/);
        expect(parseFloat(fontSize), `${selector} font-size`).toBeGreaterThanOrEqual(12);
        expect(padding, `${selector} padding`).toBeDefined();
        expect(display, `${selector} display`).not.toBe('none');
      }
    });

    test('TC-CSS03 · Body and form container CSS properties', async ({ page }) => {
      const bodyBg = await page.evaluate(() =>
        window.getComputedStyle(document.body).backgroundColor,
      );
      const bodyColor = await page.evaluate(() =>
        window.getComputedStyle(document.body).color,
      );

      expect(bodyBg).toMatch(/rgb/);
      expect(bodyColor).toMatch(/rgb/);

      const form = page.locator('form');
      const formBg      = await css(form, 'background-color');
      const formPadding = await css(form, 'padding');
      const formDisplay = await css(form, 'display');

      expect(formBg).toBeDefined();
      expect(formPadding).toBeDefined();
      expect(formDisplay).not.toBe('none');
    });
  });
});
