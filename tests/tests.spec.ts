import { test, expect } from 'playwright-test-coverage';
import { randomId } from '../src/testHelpers';
import { Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('http://localhost:5173/');
  expect(await page.title()).toBe('JWT Pizza');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(`a@jwt.com`);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Logout');
}

async function logout(page: Page) {
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Login');
}

async function registerUser(page: Page, fullName: string, email: string, password: string) {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill(fullName);
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Logout');
}

async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Logout');
}

test('Invalid Login', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  expect(await page.title()).toBe('JWT Pizza');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(`${randomId()}@gmail.com`);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(randomId());
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForSelector('text=unknown user', {timeout: 5000});
  const component = await page.getByText('{"code":404,"message":"unknown');
  expect(await component.innerText()).toBe('{\"code\":404,\"message\":\"unknown user\"}');
});

test('Register', async ({ page }) => {
  await registerUser(page, `test User ${randomId()}`, `testUser${randomId()}@jwt.com`, randomId());
});

test('Order a pizza', async ({ page }) => {
  const myId = randomId();
  const fullName = `test User ${myId}`;
  const email = `testUser${myId}@jwt.com`;
  const password = randomId();
  await registerUser(page, fullName, email, password);
  await logout(page);
  await loginAsUser(page, email, password);
  expect(await page.title()).toBe('JWT Pizza');
  await page.getByRole('button', { name: 'Order now' }).click();
  await page.getByRole('combobox').click();
  await new Promise((r) => setTimeout(r, 500));
  const optionsHtml = await page.getByRole('combobox').innerHTML();
  const valueRegex = /value="([^"]+)"/g;
  const storeValues = Array.from(optionsHtml.matchAll(valueRegex)).map((match) => match[1]).filter((value) => value.length > 0);
  expect(storeValues.length).toBeGreaterThan(0);
  const firstOption = storeValues[0];
  await page.getByRole('combobox').selectOption(firstOption); // select store
  await page.getByRole('link', { name: 'Image Description Veggie' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 1');
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.locator('tbody')).toContainText('0.004 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();
  // verify order
  await expect(page.getByText('Here is your JWT Pizza!')).toBeVisible();
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.locator('pre')).toContainText('"vendor": { "id": "pf274", "name": "Peter Fullmer" }');
});

test('Go to invalid page', async ({ page }) => {
  await page.goto('http://localhost:5173/invalid');
  await expect(page.getByRole('heading')).toContainText('Oops');
  await expect(page.getByRole('main')).toContainText('It looks like we have dropped a pizza on the floor. Please try another page.');
});

test('Create and delete a franchise and store', async ({ page }) => {
  // create franchisee
  const franchiseeId = randomId();
  const franchiseeName = `test User ${franchiseeId}`;
  const franchiseeEmail = `testUser${franchiseeId}@jwt.com`;
  const franchiseePassword = randomId();
  const franchiseName = `Bacon Pizza Operatives ${randomId()}`;
  const storeName = `New Store ${randomId()}`;
  await registerUser(page, franchiseeName, franchiseeEmail, franchiseePassword);
  await logout(page);
  console.log('franchisee created');
  // create franchise
  await loginAsAdmin(page);
  await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.waitForSelector('text=Franchise', {timeout: 5000});
  await expect(page.getByRole('columnheader', { name: 'Franchise', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill(franchiseName);
  await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill(franchiseeEmail);
  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForURL('http://localhost:5173/admin-dashboard');
  await expect(page.getByRole('cell', { name: franchiseName })).toBeVisible();
  await logout(page);
  console.log('franchise created');
  // create store
  await loginAsUser(page, franchiseeEmail, franchiseePassword);
  await page.goto('http://localhost:5173/diner-dashboard');
  await expect(page.getByRole('main')).toContainText('Franchisee on');
  await page.goto('http://localhost:5173/');
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('heading')).toContainText(franchiseName);
  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByRole('textbox', { name: 'store name' }).fill(storeName);
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('tbody')).toContainText(storeName);
  console.log('store created');
  // close store
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('main')).toContainText(`Are you sure you want to close the ${franchiseName} store ${storeName} ? This cannot be restored. All outstanding revenue will not be refunded.`);
  await page.getByRole('button', { name: 'Close' }).click();
  await logout(page);
  console.log('store closed');
  // close franchise
  await loginAsAdmin(page);
  await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('table')).toContainText(franchiseName);
  await page.getByRole('row', { name: franchiseName }).getByRole('button').click();
  await expect(page.getByRole('main')).toContainText(`Are you sure you want to close the ${franchiseName} franchise? This will close all associated stores and cannot be restored. All outstanding revenue will not be refunded.`);
  await page.getByRole('button', { name: 'Close' }).click();
  expect(await page.getByRole('table').innerText()).not.toContain(franchiseName);
  await logout(page);
  console.log('franchise closed');
});

test('Redirect to login page', async ({ page }) => {
  await page.goto('http://localhost:5173/payment');
  await page.waitForURL('http://localhost:5173/payment/login');
});

test('Visit about page', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page.getByText('The secret sauce')).toBeVisible();
  await expect(page.getByText('The secret sauce')).toBeVisible();
});

test('Visit history page', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('link', { name: 'History' })).toBeVisible();
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByText('Mama Rucci, my my')).toBeVisible();
});

test('Visit API docs', async ({ page }) => {
  await page.goto('http://localhost:5173/docs');
  await expect(page.getByRole('main')).toContainText('JWT Pizza API');
});

test("View Diner Dashboard", async ({ page }) => {
  const myId = randomId();
  const fullName = `test User ${myId}`;
  const acronym = `t${String(myId)[0]}`;
  const email = `testUser${myId}@jwt.com`;
  const password = randomId();
  await registerUser(page, fullName, email, password);
  await page.getByRole('link', { name: acronym, exact: true }).click();
  await expect(page.getByRole('main')).toContainText(fullName);
  await expect(page.getByRole('main')).toContainText(email);
  await page.getByRole('link', { name: 'Buy one' }).click();
  await page.waitForURL('http://localhost:5173/menu');
});