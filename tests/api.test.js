import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
test("JWT, user isolation, tasks CRUD and SQLite persistence", async () => {
  const dir = mkdtempSync(join(tmpdir(), "taskflow-test-"));
  const base = "http://localhost:3099/api";
  let child;
  async function start() {
    child = spawn(process.execPath, ["server/index.js"], {
      env: {
        ...process.env,
        PORT: "3099",
        DB_FILE: join(dir, "test.db"),
        JWT_SECRET: "test-secret",
      },
      stdio: "ignore",
    });
    for (let n = 0; n < 60; n++) {
      try {
        if ((await fetch(base + "/health")).ok) return;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error("Server did not start");
  }
  async function stop() {
    await new Promise((resolve) => {
      child.once("exit", resolve);
      child.kill();
    });
  }
  const request = (path, method = "GET", body, token) =>
    fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  try {
    await start();
    assert.equal((await request("/tasks")).status, 401);
    const register = await request("/auth/register", "POST", {
      name: "Test user",
      email: "test@example.com",
      password: "Test123!",
    });
    assert.equal(register.status, 201);
    const { token } = await register.json();
    const other = await (
      await request("/auth/register", "POST", {
        name: "Other user",
        email: "other@example.com",
        password: "Test123!",
      })
    ).json();
    assert.equal(
      (
        await request("/auth/login", "POST", {
          email: "test@example.com",
          password: "incorrect",
        })
      ).status,
      401,
    );
    assert.equal(
      (await request("/tasks", "GET", null, token.slice(0, -2) + "xx")).status,
      401,
    );
    const project = await (
      await request(
        "/projects",
        "POST",
        { name: "Test project", color: "#4073d6" },
        token,
      )
    ).json();
    const task = await (
      await request(
        "/tasks",
        "POST",
        {
          title: "Persist me",
          description: "API test",
          priority: 1,
          due_date: "2026-10-08",
          project_id: project.id,
        },
        token,
      )
    ).json();
    assert.ok(task.id);
    assert.equal(
      (
        await request(
          "/tasks/" + task.id,
          "PATCH",
          { completed: true },
          other.token,
        )
      ).status,
      404,
    );
    assert.equal(
      (
        await request(
          "/tasks",
          "POST",
          { title: "Bad date", due_date: "2026-02-31" },
          token,
        )
      ).status,
      400,
    );
    const changed = await (
      await request(
        "/tasks/" + task.id,
        "PATCH",
        { completed: true, title: "Edited" },
        token,
      )
    ).json();
    assert.equal(changed.completed, true);
    assert.equal(changed.title, "Edited");
    await stop();
    await start();
    const tasks = await (await request("/tasks", "GET", null, token)).json();
    assert.equal(tasks.find((t) => t.id === task.id).completed, true);
    assert.equal(
      (await request("/projects/" + project.id, "DELETE", null, token)).status,
      204,
    );
    const moved = await (await request("/tasks", "GET", null, token)).json();
    assert.equal(moved.find((t) => t.id === task.id).project_id, null);
    assert.equal(
      (await request("/tasks/" + task.id, "DELETE", null, token)).status,
      204,
    );
  } finally {
    if (child?.exitCode === null) await stop();
    rmSync(dir, { recursive: true, force: true });
  }
});
