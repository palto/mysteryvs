import { test, expect } from "@playwright/test";

test.describe("Unauthenticated user", () => {
  test("redirects from / to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page loads and shows content", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    // The login page wraps content in ClientSideSuspense (Liveblocks).
    // In environments with a live Liveblocks connection the player selection
    // heading appears; otherwise the loading fallback is shown.
    const heading = page.getByRole("heading", { name: "Valitse pelaajasi!" });
    const loading = page.getByText("Loading");
    await expect(heading.or(loading)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin page", () => {
  test("loads with admin heading", async ({ page }) => {
    await page.goto("/admin");
    await expect(
      page.getByRole("heading", { name: "Hallintapaneeli" }),
    ).toBeVisible();
  });

  test("shows participant table", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("columnheader", { name: "Nimi" })).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Toiminnot" }),
    ).toBeVisible();
  });

  test("shows add participant form", async ({ page }) => {
    await page.goto("/admin");
    await expect(
      page.getByLabel("Syötä uuden pelaajan nimi"),
    ).toBeVisible();
    await expect(
      page.locator("form").getByRole("button", { name: "Tallenna" }),
    ).toBeVisible();
  });

  test("save button is disabled when input is empty", async ({ page }) => {
    await page.goto("/admin");
    const saveButton = page.locator("form").getByRole("button", { name: "Tallenna" });
    await expect(saveButton).toBeDisabled();
  });

  test("save button enables when name is typed", async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel("Syötä uuden pelaajan nimi").fill("TestPlayer");
    const saveButton = page.locator("form").getByRole("button", { name: "Tallenna" });
    await expect(saveButton).toBeEnabled();
  });
});

test.describe("Authenticated user", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "username",
        value: "testuser",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("/ does not redirect to login when authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("/login redirects to / when already logged in", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL("http://localhost:3000/");
  });
});
