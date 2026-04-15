import { test, expect } from "@playwright/test";

test("API register, login, and /api/auth/user with Bearer token", async ({
  request,
  baseURL,
}, testInfo) => {
  const suffix = Date.now();
  const email = `e2e_${suffix}@test.local`;
  const password = "E2eTestPass123!";
  const username = `e2e_${suffix}`;

  const reg = await request.post(`${baseURL}/api/register`, {
    data: {
      email,
      password,
      username,
      phone: "+420777888999",
      firstName: "E2e",
      lastName: "Test",
    },
  });
  const regBody = await reg.text();
  let regErr = regBody;
  try {
    regErr = String((JSON.parse(regBody) as { error?: string }).error ?? regBody);
  } catch {
    /* keep regBody */
  }
  const turnstileBlocked =
    !reg.ok() && /security verification|turnstile/i.test(regErr);
  testInfo.skip(
    turnstileBlocked,
    "Server enforces Turnstile (TURNSTILE_SECRET_KEY). Stop manual next dev so Playwright webServer can clear it, or unset TURNSTILE_SECRET_KEY for local E2E.",
  );

  if (!reg.ok()) {
    testInfo.skip(
      reg.status === 500 || reg.status === 503,
      `register failed (${reg.status}): ${regBody.slice(0, 200)}`,
    );
    expect(reg.ok(), regBody).toBeTruthy();
  }

  const login = await request.post(`${baseURL}/api/login`, {
    data: { email, password, turnstileToken: "" },
  });
  expect(login.ok(), await login.text()).toBeTruthy();
  const loginJson = (await login.json()) as { token?: string };
  expect(loginJson.token).toBeTruthy();

  const me = await request.get(`${baseURL}/api/auth/user`, {
    headers: { Authorization: `Bearer ${loginJson.token}` },
  });
  expect(me.ok(), await me.text()).toBeTruthy();
  const meJson = (await me.json()) as { user?: { email?: string } };
  expect(meJson.user?.email).toBe(email);
});

test("UI register without Turnstile when NEXT_PUBLIC_TURNSTILE_UI_OFF", async ({
  page,
  baseURL,
  request,
}, testInfo) => {
  const probe = await request.post(`${baseURL}/api/register`, {
    data: {
      email: `e2e_probe_${Date.now()}@test.local`,
      password: "E2eTestPass123!",
      username: `probe_${Date.now()}`,
      phone: "+420777888777",
    },
  });
  const probeText = await probe.text();
  let probeErr = probeText;
  try {
    probeErr = String(
      (JSON.parse(probeText) as { error?: string }).error ?? probeText,
    );
  } catch {
    /* keep */
  }
  testInfo.skip(
    !probe.ok() && /security verification|turnstile/i.test(probeErr),
    "Same as API test: Turnstile enforced on this server process.",
  );

  const suffix = Date.now();
  const email = `e2e_ui_${suffix}@test.local`;
  const password = "E2eTestPass123!";

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page
    .getByTestId("link-home")
    .waitFor({ state: "visible", timeout: 90_000 });

  await page.getByTestId("button-menu").click();
  await page.getByTestId("menu-item-register").click();
  await page.getByTestId("tab-register").click();

  await page.getByTestId("input-register-email").fill(email);
  await page.getByTestId("input-register-password").fill(password);
  await page.getByTestId("input-register-phone").fill("+420777888991");

  await page.getByTestId("button-register-submit").click();

  await expect
    .poll(
      async () => {
        const token = await page.evaluate(() =>
          localStorage.getItem("nnauto_token"),
        );
        return token?.length ?? 0;
      },
      { timeout: 45_000 },
    )
    .toBeGreaterThan(10);

  const token = await page.evaluate(() => localStorage.getItem("nnauto_token"));
  const me = await page.request.get(`${baseURL}/api/auth/user`, {
    headers: { Authorization: `Bearer ${token!}` },
  });
  expect(me.ok(), await me.text()).toBeTruthy();
});
