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
  await page
    .getByRole("button", { name: "Edit " + title, exact: true })
    .click();
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

test("Register, validate forms, manage projects, search, filter, and inspect task detail", async ({
  page,
}) => {
  const stamp = Date.now();
  const email = `student-${stamp}@example.com`;
  const title = `Learn React ${stamp}`;
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign up", exact: true }).click();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByText("Enter your name.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Your name").fill("FER Student");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("Student123!");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Today", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Project name").fill("   ");
  await dialog
    .getByRole("button", { name: "Add project", exact: true })
    .click();
  await expect(dialog.getByText("Enter a project name.")).toBeVisible();
  await dialog.getByLabel("Project name").fill("FER202 project");
  await dialog.getByRole("button", { name: "#45a478", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Add project", exact: true })
    .click();
  await page.getByRole("link", { name: "FER202 project", exact: true }).click();
  await page.locator(".sidebar-add").click();
  await expect(dialog.getByLabel("Project", { exact: true })).toHaveValue(/.+/);
  await dialog.getByLabel("Task title").fill("   ");
  await dialog.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(dialog.getByText("Enter a task title.")).toBeVisible();
  await dialog.getByLabel("Task title").fill(title);
  await dialog
    .getByLabel("Description", { exact: true })
    .fill("Practice Axios CRUD with the backend");
  await dialog.getByLabel("Due date").fill("2030-12-20");
  await dialog.getByLabel("Priority", { exact: true }).selectOption("1");
  await dialog.getByRole("button", { name: "Add task", exact: true }).click();
  await page.getByRole("link", { name: new RegExp(title) }).click();
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await expect(page.getByText("2030-12-20", { exact: true })).toBeVisible();
  await expect(page.getByText("Priority 1", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit task", exact: true }).click();
  await expect(dialog.getByLabel("Task title")).toHaveValue(title);
  await dialog
    .getByLabel("Description", { exact: true })
    .fill("Updated description");
  await dialog
    .getByLabel("Project", { exact: true })
    .selectOption({ label: "Work" });
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page
      .locator(".detail-properties")
      .getByRole("link", { name: "Work", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit task", exact: true }).click();
  await dialog
    .getByLabel("Project", { exact: true })
    .selectOption({ label: "FER202 project" });
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await page.reload();
  await expect(
    page.getByText("Updated description", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "screenshots/task-detail.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "All tasks", exact: true })
    .first()
    .click();
  await page.getByLabel("Sort by", { exact: true }).selectOption("name");
  await expect(page.getByRole("row").nth(1)).toContainText("Buy groceries");
  await page.screenshot({ path: "screenshots/management.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".sidebar")).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, -260, 0)",
  );
  await page.screenshot({
    path: "screenshots/management-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByRole("textbox", { name: "Search tasks" }).fill(title);
  const row = page.getByRole("row").filter({ hasText: title });
  await expect(row).toBeVisible();
  await page.getByLabel("Priority", { exact: true }).selectOption("2");
  await expect(row).toHaveCount(0);
  await page.getByLabel("Priority", { exact: true }).selectOption("1");
  await expect(row).toBeVisible();
  await row
    .getByRole("button", { name: "Complete " + title, exact: true })
    .click();
  await expect(row.getByText("Completed", { exact: true })).toBeVisible();
  await page.getByLabel("Status", { exact: true }).selectOption("active");
  await expect(row).toHaveCount(0);
  await page.getByLabel("Status", { exact: true }).selectOption("completed");
  await expect(row).toBeVisible();
  await page
    .getByRole("button", { name: "Delete project FER202 project", exact: true })
    .click();
  await expect(dialog.getByText("Its tasks will move to Inbox.")).toBeVisible();
  await dialog.getByRole("button", { name: "Delete", exact: true }).click();
  await page.locator('a[href="/completed"]').click();
  await page
    .getByRole("button", { name: "Reopen " + title, exact: true })
    .click();
  await page.locator('a[href="/inbox"]').click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("Student123!");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.locator('a[href="/inbox"]').click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
});

test("Expired sessions return to login and API errors keep form values", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Explore the demo workspace" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Today", exact: true }),
  ).toBeVisible();
  await page.route("**/api/tasks", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 500,
          json: { message: "Unable to save. Try again." },
        })
      : route.continue(),
  );
  await page.locator(".sidebar-add").click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Task title").fill("Unsaved task");
  await dialog.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(dialog.getByRole("alert")).toHaveText(
    "Unable to save. Try again.",
  );
  await expect(dialog.getByLabel("Task title")).toHaveValue("Unsaved task");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.unroute("**/api/tasks");
  await page.evaluate(() =>
    localStorage.setItem("taskflow-token", "expired-token"),
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Welcome back", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("taskflow-token")))
    .toBeNull();
});
