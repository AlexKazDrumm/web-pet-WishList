const { test, expect } = require('@playwright/test');

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

test('register, build a list, manage items and upload a cover', async ({ page }) => {
  const email = `e2e_${Date.now()}@example.com`;

  await page.goto('/');

  // Register through the header modal.
  await page.getByRole('button', { name: 'Войти' }).click();
  await page.getByRole('button', { name: 'Регистрация' }).click();
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder(/Пароль/).fill('playwright-secret');
  await page.getByRole('button', { name: 'Создать аккаунт' }).click();

  // Lands on the personal lists tab.
  await expect(page.getByRole('button', { name: email })).toBeVisible();
  await expect(page.getByText('Список не выбран')).toBeVisible();

  // Create a list.
  await page.getByPlaceholder('Название списка').fill('E2E список');
  await page.getByRole('button', { name: /Новый список|Создаём/ }).click();
  await expect(page.getByRole('heading', { name: 'E2E список' })).toBeVisible();

  // Add an item with a cover image.
  await page.getByPlaceholder('Что добавить?').fill('E2E предмет');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'cover.png',
    mimeType: 'application/octet-stream',
    buffer: PNG,
  });
  await page.getByRole('button', { name: /Добавить|Сохраняем/ }).click();

  const row = page.getByTestId('list-item');
  await expect(row).toHaveCount(1);
  await expect(row.locator('img')).toBeVisible();

  const itemTitle = page.getByTestId('item-title');
  await expect(itemTitle).toHaveValue('E2E предмет');

  // Mark it done (the change round-trips to the API, so assert on the result).
  await page.getByLabel('Отметить выполненным').click();
  await expect(page.getByLabel('Отметить выполненным')).toBeChecked();

  // Rename it.
  await itemTitle.fill('E2E предмет обновлён');
  await itemTitle.blur();
  await expect(page.getByText('Элемент обновлён')).toBeVisible();

  // Delete it.
  await page.getByRole('button', { name: 'Удалить E2E предмет обновлён' }).click();
  await expect(page.getByTestId('list-item')).toHaveCount(0);
  await expect(page.getByText('Список пуст')).toBeVisible();
});

test('shows the seeded catalog on the wishlist tab', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Вишлист', exact: true }).click();
  await expect(page.getByText(/Все \(\d+\)/)).toBeVisible();
});
