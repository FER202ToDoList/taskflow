import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

mkdirSync("screenshots", { recursive: true });

test("board: add, edit, drag, complete, reopen and delete a task", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 980 });

  await page.goto("/login");
  await page.screenshot({ path: "screenshots/login.png" });
  await page.getByRole("button", { name: "Explore the demo workspace" }).click();
  await expect(page.getByRole("heading", { name: "Your board" })).toBeVisible();
  const column = (name) => page.getByRole("region", { name, exact: true });
  await expect(column("Today").getByText("Finish the React assignment")).toBeVisible();
  await page.screenshot({ path: "screenshots/board.png", fullPage: true });

  // Add
  const title = "E2E task " + Date.now();
  await page.getByRole("button", { name: "New task" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill(title);
  await dialog.getByLabel("Description").fill("Created by the browser test");
  await dialog.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(column("No date").getByText(title, { exact: true })).toBeVisible();

  // Edit
  await page.getByRole("button", { name: title, exact: true }).click();
  await dialog.getByLabel("Title").fill(title + " edited");
  await dialog.getByText("P1 · High").click();
  await dialog.getByRole("button", { name: "Save changes" }).click();
  const edited = title + " edited";
  await expect(page.getByRole("button", { name: edited, exact: true })).toBeVisible();

  // Drag from "No date" to "Today"
  await page.getByRole("button", { name: edited, exact: true }).dragTo(column("Today"));
  await expect(column("Today").getByText(edited, { exact: true })).toBeVisible();

  // Complete, then reopen from the Completed page
  await page.getByRole("button", { name: "Complete " + edited, exact: true }).click();
  await expect(column("Done").getByText(edited, { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /^Completed/ }).click();
  await page.getByRole("button", { name: "Reopen " + edited, exact: true }).click();
  await expect(page.getByText(edited, { exact: true })).toHaveCount(0);

  // Delete
  await page.getByRole("link", { name: /^Board/ }).click();
  await page.getByRole("button", { name: "Delete " + edited, exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText(edited, { exact: true })).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("projects: create, rename and delete", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Explore the demo workspace" }).click();
  const name = "Exam prep " + Date.now();

  await page.getByRole("button", { name: "Add project" }).click();
  await page.getByRole("dialog").getByLabel("Project name").fill(name);
  await page.getByRole("dialog").getByRole("button", { name: "Create project" }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();

  await page.getByRole("button", { name: "Edit project " + name }).click();
  await page.getByRole("dialog").getByLabel("Project name").fill(name + " v2");
  await page.getByRole("dialog").getByRole("button", { name: "Save project" }).click();
  await expect(page.getByRole("heading", { name: name + " v2" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: name + " v2" })).toBeVisible();

  await page.getByRole("button", { name: "Delete project " + name + " v2" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your board" })).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(name) })).toHaveCount(0);
});

test("dark mode toggle is remembered and works on mobile", async ({ page }) => {
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
  await page.getByRole("link", { name: /^Upcoming/ }).click();
  await expect(page.getByRole("heading", { name: "Upcoming" })).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(html).toHaveAttribute("data-bs-theme", "dark");
});
