import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

mkdirSync("screenshots", { recursive: true });

const demoLogin = async (page) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Explore the demo workspace" }).click();
  await expect(page.getByRole("heading", { name: "Your board" })).toBeVisible();
};

test("Board: add, edit, drag, complete, reopen and delete a task", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto("/login");
  await page.screenshot({ path: "screenshots/login.png" });
  await demoLogin(page);
  const column = (name) => page.getByRole("region", { name, exact: true });
  await expect(column("Today").getByText("Finish the React assignment")).toBeVisible();
  await page.screenshot({ path: "screenshots/board.png", fullPage: true });

  const title = "E2E task " + Date.now();
  const dialog = page.getByRole("dialog");
  await page.getByRole("button", { name: "New task" }).click();
  await dialog.getByLabel("Task title").fill(title);
  await dialog.getByLabel("Description").fill("Created by the browser test");
  await dialog.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(column("No date").getByText(title, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Edit " + title, exact: true }).click();
  await dialog.getByLabel("Task title").fill(title + " edited");
  await dialog.getByText("P1 · High").click();
  await dialog.getByRole("button", { name: "Save changes" }).click();
  const edited = title + " edited";
  const card = page.getByRole("link", { name: edited, exact: true });
  await expect(card).toBeVisible();

  // Drag from "No date" to "Today" sets today's date.
  await card.dragTo(column("Today"));
  await expect(column("Today").getByText(edited, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Complete " + edited, exact: true }).click();
  await expect(column("Done").getByText(edited, { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /^Completed/ }).click();
  await page.getByRole("button", { name: "Reopen " + edited, exact: true }).click();
  await expect(page.getByText(edited, { exact: true })).toHaveCount(0);

  await page.getByRole("link", { name: /^Board/ }).click();
  await page.getByRole("button", { name: "Delete " + edited, exact: true }).click();
  await dialog.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText(edited, { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("Register, validate forms, manage projects, search, filter, and inspect task detail", async ({
  page,
}) => {
  const stamp = Date.now();
  const email = `student-${stamp}@example.com`;
  const title = `Learn React ${stamp}`;
  const dialog = page.getByRole("dialog");

  // Formik + Yup on the sign-up form
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign up", exact: true }).click();
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page.getByText("Enter your name.", { exact: true })).toBeVisible();
  await page.getByLabel("Your name").fill("FER Student");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("Student123!");
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your board" })).toBeVisible();

  // Project: validation, create, rename
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  await dialog.getByLabel("Project name").fill("   ");
  await dialog.getByRole("button", { name: "Add project", exact: true }).click();
  await expect(dialog.getByText("Enter a project name.")).toBeVisible();
  await dialog.getByLabel("Project name").fill("FER202");
  await dialog.getByRole("button", { name: "#45a478", exact: true }).click();
  await dialog.getByRole("button", { name: "Add project", exact: true }).click();
  await expect(page.getByRole("heading", { name: "FER202", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit project FER202", exact: true }).click();
  await expect(dialog.getByLabel("Project name")).toHaveValue("FER202");
  await dialog.getByLabel("Project name").fill("FER202 project");
  await dialog.getByRole("button", { name: "Save project", exact: true }).click();
  await expect(page.getByRole("heading", { name: "FER202 project", exact: true })).toBeVisible();

  // Task inside the project, with validation
  await page.getByRole("button", { name: "New task" }).click();
  await expect(dialog.getByLabel("Project", { exact: true })).toHaveValue(/.+/);
  await dialog.getByLabel("Task title").fill("   ");
  await dialog.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(dialog.getByText("Enter a task title.")).toBeVisible();
  await dialog.getByLabel("Task title").fill(title);
  await dialog.getByLabel("Description", { exact: true }).fill("Practice Axios CRUD with the backend");
  await dialog.getByLabel("Due date").fill("2030-12-20");
  await dialog.getByText("P1 · High").click();
  await dialog.getByRole("button", { name: "Add task", exact: true }).click();

  // Detail page
  await page.getByRole("link", { name: title, exact: true }).click();
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(page.getByText("2030-12-20", { exact: true })).toBeVisible();
  await expect(page.getByText("Priority 1", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit task", exact: true }).click();
  await expect(dialog.getByLabel("Task title")).toHaveValue(title);
  await dialog.getByLabel("Description", { exact: true }).fill("Updated description");
  await dialog.getByLabel("Project", { exact: true }).selectOption({ label: "Work" });
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.locator(".detail-properties").getByRole("link", { name: "Work", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit task", exact: true }).click();
  await dialog.getByLabel("Project", { exact: true }).selectOption({ label: "FER202 project" });
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await page.reload();
  await expect(page.getByText("Updated description", { exact: true })).toBeVisible();
  await page.screenshot({ path: "screenshots/task-detail.png", fullPage: true });

  // All tasks table: sort, search, filter, status
  await page.getByRole("navigation", { name: "Views" }).getByRole("link", { name: /^All tasks/ }).click();
  await page.locator("#page-sort").selectOption("name");
  await expect(page.getByRole("row").nth(1)).toContainText("Buy groceries");
  await page.screenshot({ path: "screenshots/management.png", fullPage: true });
  await page.getByRole("textbox", { name: "Search tasks" }).fill(title);
  const row = page.getByRole("row").filter({ hasText: title });
  await expect(row).toBeVisible();
  await page.locator("#page-priority").selectOption("2");
  await expect(row).toHaveCount(0);
  await page.locator("#page-priority").selectOption("1");
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Complete " + title, exact: true }).click();
  await expect(row.getByText("Completed", { exact: true })).toBeVisible();
  await page.locator("#page-status").selectOption("active");
  await expect(row).toHaveCount(0);
  await page.locator("#page-status").selectOption("completed");
  await expect(row).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "screenshots/management-mobile.png", fullPage: true });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.getByRole("button", { name: "Clear search" }).click();
  await page.locator("#page-status").selectOption("all");
  await page.locator("#page-priority").selectOption("");

  // Deleting the project moves its tasks to Inbox
  await page.getByRole("link", { name: /FER202 project/ }).click();
  await page.getByRole("button", { name: "Delete project FER202 project", exact: true }).click();
  await expect(dialog.getByText("Its tasks will move to Inbox.")).toBeVisible();
  await dialog.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("link", { name: /^Completed/ }).click();
  await page.getByRole("button", { name: "Reopen " + title, exact: true }).click();
  await page.getByRole("link", { name: /^Inbox/ }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(title, { exact: true })).toBeVisible();

  // Log out and back in: data is still there
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("button", { name: "Log out" }).click();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("Student123!");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.getByRole("link", { name: /^Inbox/ }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
});

test("Expired sessions return to login and API errors keep form values", async ({ page }) => {
  await demoLogin(page);
  await page.route("**/api/tasks", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({ status: 500, json: { message: "Unable to save. Try again." } })
      : route.continue(),
  );
  await page.getByRole("button", { name: "New task" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Task title").fill("Unsaved task");
  await dialog.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(dialog.getByRole("alert")).toHaveText("Unable to save. Try again.");
  await expect(dialog.getByLabel("Task title")).toHaveValue("Unsaved task");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.unroute("**/api/tasks");
  await page.evaluate(() => localStorage.setItem("taskflow-token", "expired-token"));
  await page.reload();
  await expect(page.getByRole("heading", { name: "Welcome back", exact: true })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("taskflow-token")))
    .toBeNull();
});

test("Dark mode toggle is remembered and works on mobile", async ({ page }) => {
  await page.goto("/login");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-bs-theme", "dark");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(html).toHaveAttribute("data-bs-theme", "light");
  await page.getByRole("button", { name: "Explore the demo workspace" }).click();
  await expect(page.getByRole("heading", { name: "Your board" })).toBeVisible();
  await page.reload();
  await expect(html).toHaveAttribute("data-bs-theme", "light");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "screenshots/mobile-light.png", fullPage: true });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
  await page.getByRole("link", { name: /^Upcoming/ }).click();
  await expect(page.getByRole("heading", { name: "Upcoming" })).toBeVisible();
  await expect(page.getByText("Prepare tomorrow’s presentation", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(html).toHaveAttribute("data-bs-theme", "dark");
});
