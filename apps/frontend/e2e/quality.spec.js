const { test, expect } = require('@playwright/test');

function collectBrowserFailures(page) {
  const failures = [];
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => failures.push(`page: ${error.message}`));
  page.on('requestfailed', (request) =>
    failures.push(`request: ${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`),
  );
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(`response: ${response.status()} ${response.url()}`);
  });
  return failures;
}

async function expectHealthyLayout(page) {
  await expect
    .poll(() =>
      page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      })),
    )
    .toEqual(expect.objectContaining({ viewport: expect.any(Number), content: expect.any(Number) }));

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);

  const brokenImages = await page.locator('img').evaluateAll((images) =>
    images
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
  );
  expect(brokenImages).toEqual([]);
}

test('desktop navigation, metadata, assets and keyboard dialog are healthy', async ({ page, request }) => {
  const failures = collectBrowserFailures(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  const response = await page.goto('/', { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('WishList');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  expect((await request.get('/svg/fire_blue.svg')).status()).toBe(200);

  for (const label of ['Вишлист', 'Настолки', 'Книги', 'Прочее', 'Главная']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expectHealthyLayout(page);
  }

  const loginButton = page.getByRole('button', { name: 'Войти' });
  await loginButton.click();
  await expect(page.getByRole('dialog', { name: 'Вход в аккаунт' })).toBeVisible();
  await expect(page.getByPlaceholder('Email')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Вход в аккаунт' })).toBeHidden();
  await expect(loginButton).toBeFocused();

  expect(failures).toEqual([]);
});

test('mobile navigation has no overflow or broken local assets', async ({ page }) => {
  const failures = collectBrowserFailures(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });

  for (const label of ['Вишлист', 'Настолки', 'Книги', 'Прочее', 'Главная']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expectHealthyLayout(page);
  }

  expect(failures).toEqual([]);
});
