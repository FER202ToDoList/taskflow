import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("screenshots", { recursive: true });
test("Demo login and add/edit/complete/reopen/delete task", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto("/login");
  await page.screenshot({ path: "screenshots/login.png", fullPage: true });
  await page
    .getByRole("button", { name: "Explore the demo workspace" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Today", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Finish the React assignment", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "screenshots/desktop.png", fullPage: true });
  await page.locator(".sidebar-add").click();
  const dialog = page.getByRole("dialog");
  const title = "E2E task " + Date.now();
  await dialog.getByPlaceholder("What needs doing?").fill(title);
  await dialog
    .getByPlaceholder("Description", { exact: true })
    .fill("A task created by the browser test");
  await dialog.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await page.getByText(title, { exact: true }).click();
  await dialog.getByPlaceholder("What needs doing?").fill(title + " edited");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByText(title + " edited", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Complete " + title + " edited", exact: true })
    .click();
  await expect(page.getByText(title + " edited", { exact: true })).toHaveCount(
    0,
  );
  await page.locator('a[href="/completed"]').click();
  await expect(
    page.getByText(title + " edited", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Reopen " + title + " edited", exact: true })
    .click();
  await page.locator('a[href="/today"]').click();
  await expect(
    page.getByText(title + " edited", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete " + title + " edited", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.getByText(title + " edited", { exact: true })).toHaveCount(
    0,
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Today", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "screenshots/mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.locator('a[href="/upcoming"]').click();
  await expect(
    page.getByRole("heading", { name: "Upcoming", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Prepare tomorrow’s presentation", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
