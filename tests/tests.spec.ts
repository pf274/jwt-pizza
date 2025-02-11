import { test, expect } from 'playwright-test-coverage';
import { randomId } from '../src/testHelpers';
import { Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/');
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
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email, name: fullName, password };
    const loginRes = { user: { id: 3, name: fullName, email, roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill(fullName);
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Logout');
}

async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Logout');
}

test("Run all tests", async ({page}) => {
  // TODO: Mock out all endpoints
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route('*/**/api/franchise', async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: 'LotaPizza',
        stores: [
          { id: 4, name: 'Lehi' },
          { id: 5, name: 'Springville' },
          { id: 6, name: 'American Fork' },
        ],
      },
      { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
      { id: 4, name: 'topSpot', stores: [] },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
      storeId: '4',
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
        id: 23,
      },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });
  // Test 1: Invalid login
  console.log('Starting test 1: Invalid login');
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'u@jwt.com', password: 'a' };
    const loginRes = { message: 'unknown user'};
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ status: 404, body: JSON.stringify(loginRes) });
  });
  await page.goto('/');
  expect(await page.title()).toBe('JWT Pizza');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(`u@jwt.com`);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForSelector('text=unknown user', {timeout: 5000});
  const component = await page.getByText('{"code":404,"message":"unknown');
  expect(await component.innerText()).toBe('{\"code\":404,\"message\":\"unknown user\"}');
  console.log('Passed test 1: Invalid login');
  // Test 2: Register
  console.log('Starting test 2: Register');
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'nd@jwt.com', password: 'a' };
    const loginRes = { user: { id: 4, name: 'Kaisen Chen', email: 'nd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });
  await registerUser(page, `Kaisen Chen`, `nd@jwt.com`, 'a');
  console.log('Passed test 2: Register');
  // Test 3: Order a pizza
  console.log('Starting test 3: Order a pizza');
  // register user
  const myId = randomId();
  const fullName = `test User ${myId}`;
  const email = `testUser${myId}@jwt.com`;
  const password = randomId();
  await registerUser(page, fullName, email, password);
  await logout(page);
  await loginAsUser(page, email, password);
  expect(await page.title()).toBe('JWT Pizza');
  // order pizza
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
  console.log('Passed test 3: Order a pizza');
  // Test 4: go to invalid page
  console.log('Starting test 4: go to invalid page');
  await page.goto('/invalid');
  await expect(page.getByRole('heading')).toContainText('Oops');
  await expect(page.getByRole('main')).toContainText('It looks like we have dropped a pizza on the floor. Please try another page.');
  console.log('Passed test 4: go to invalid page');
  // Test 5: create and delete stores and franchises
  console.log('Starting test 5: create and delete stores and franchises');
  // create franchisee
  const franchiseeId = randomId();
  const franchiseeName = `test User ${franchiseeId}`;
  const franchiseeEmail = `testUser${franchiseeId}@jwt.com`;
  const franchiseePassword = randomId();
  const franchiseName = `Bacon Pizza Operatives ${randomId()}`;
  const storeName = `New Store ${randomId()}`;
  await registerUser(page, franchiseeName, franchiseeEmail, franchiseePassword);
  await logout(page);
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
  await page.waitForURL('/admin-dashboard');
  await expect(page.getByRole('cell', { name: franchiseName })).toBeVisible();
  await logout(page);
  // create store
  await loginAsUser(page, franchiseeEmail, franchiseePassword);
  await page.goto('/diner-dashboard');
  await expect(page.getByRole('main')).toContainText('Franchisee on');
  await page.goto('/');
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('heading')).toContainText(franchiseName);
  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByRole('textbox', { name: 'store name' }).fill(storeName);
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('tbody')).toContainText(storeName);
  // close store
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('main')).toContainText(`Are you sure you want to close the ${franchiseName} store ${storeName} ? This cannot be restored. All outstanding revenue will not be refunded.`);
  await page.getByRole('button', { name: 'Close' }).click();
  await logout(page);
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
  console.log('Passed test 5: create and delete stores and franchises');
  // Test 6: redirect to login page
  console.log('Starting test 6: redirect to login page');
  await page.goto('/payment');
  await page.waitForURL('/payment/login');
  console.log('Passed test 6: redirect to login page');
  // Test 7: Visit about page
  console.log('Starting test 7: Visit about page');
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page.getByText('The secret sauce')).toBeVisible();
  await expect(page.getByText('The secret sauce')).toBeVisible();
  console.log('Passed test 7: Visit about page');
  // Test 8: Visit history page
  console.log('Starting test 8: Visit history page');
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'History' })).toBeVisible();
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByText('Mama Rucci, my my')).toBeVisible();
  console.log('Passed test 8: Visit history page');
  // Test 9: Visit API docs
  console.log('Starting test 9: Visit API docs');
  await page.goto('/docs');
  await expect(page.getByRole('main')).toContainText('JWT Pizza API');
  console.log('Passed test 9: Visit API docs');
  // Test 10: View Diner Dashboard
  console.log('Starting test 10: View Diner Dashboard');
  const acronym = `t${String(myId)[0]}`;
  await loginAsUser(page, email, password);
  await page.getByRole('link', { name: acronym, exact: true }).click();
  await expect(page.getByRole('main')).toContainText(fullName);
  await expect(page.getByRole('main')).toContainText(email);
  await page.getByRole('link', { name: 'Buy one' }).click();
  await page.waitForURL('/menu');
  console.log('Passed test 10: View Diner Dashboard');
})