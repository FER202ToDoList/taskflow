import express from "express";
import cors from "cors";
import { DatabaseSync } from "node:sqlite";
import jwt from "jsonwebtoken";
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
// .env.local (not committed) holds server secrets; .env holds VITE_API_URL.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {}
}
const app = express();
let secret = process.env.JWT_SECRET;
if (!secret) {
  if (process.env.NODE_ENV === "production")
    throw new Error("Set JWT_SECRET in .env.local");
  secret = "taskflow-dev-only-secret";
  console.warn("JWT_SECRET not set - using a development-only secret.");
}
const dbPath = resolve(process.env.DB_FILE || "data/tasks.db");
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),name TEXT NOT NULL,color TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',due_date TEXT NOT NULL DEFAULT '',priority INTEGER NOT NULL DEFAULT 4,completed INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL);`);
const hashPassword = (password) => {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
};
const matchesPassword = (password, stored) => {
  const [salt, hash] = stored.split(":");
  return timingSafeEqual(
    scryptSync(password, salt, 64),
    Buffer.from(hash, "hex"),
  );
};
const tokenFor = (user) =>
  jwt.sign({ sub: user.id }, secret, { algorithm: "HS256", expiresIn: "1d" });
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const dayOffset = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
function seed(userId) {
  const work = randomUUID(),
    personal = randomUUID(),
    learning = randomUUID();
  for (const [id, name, color] of [
    [work, "Work", "#4073d6"],
    [personal, "Personal", "#ac73c8"],
    [learning, "Learning", "#45a478"],
  ])
    db.prepare("INSERT INTO projects VALUES(?,?,?,?)").run(
      id,
      userId,
      name,
      color,
    );
  const examples = [
    [
      "Finish the React assignment",
      "One small step closer to your goal.",
      today(),
      1,
      learning,
    ],
    [
      "Plan the week ahead",
      "Choose the three things that matter most.",
      today(),
      2,
      personal,
    ],
    [
      "Review the project wireframes",
      "Check the main customer flow.",
      today(),
      3,
      work,
    ],
    [
      "Read 20 pages",
      "Make a little time for a good book.",
      today(),
      4,
      personal,
    ],
    [
      "Prepare tomorrow’s presentation",
      "Keep it clear and simple.",
      dayOffset(1),
      2,
      work,
    ],
    [
      "Practice Redux and Axios",
      "Connect the frontend to your API.",
      dayOffset(2),
      3,
      learning,
    ],
    ["Buy groceries", "Fruit, milk and coffee.", "", 4, null],
    ["Explore a new project idea", "", "", 4, null],
    ["Set up my workspace", "A fresh start.", today(), 4, work],
  ];
  examples.forEach(([title, description, due, priority, project], index) =>
    db
      .prepare("INSERT INTO tasks VALUES(?,?,?,?,?,?,?,?,?)")
      .run(
        randomUUID(),
        userId,
        project,
        title,
        description,
        due,
        priority,
        index === 8 ? 1 : 0,
        new Date().toISOString(),
      ),
  );
}
if (
  !db.prepare("SELECT id FROM users WHERE email=?").get("demo@taskflow.local")
) {
  const id = randomUUID();
  db.prepare("INSERT INTO users VALUES(?,?,?,?)").run(
    id,
    "Gia Thắng",
    "demo@taskflow.local",
    hashPassword("Demo123!"),
  );
  seed(id);
}
app.use(
  cors({
    origin:
      process.env.CLIENT_ORIGIN || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/,
  }),
);
app.use(express.json({ limit: "32kb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body || {};
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 8
  )
    return res
      .status(400)
      .json({
        message:
          "Enter a name, valid email and password of at least 8 characters.",
      });
  if (db.prepare("SELECT id FROM users WHERE email=?").get(email.toLowerCase()))
    return res
      .status(409)
      .json({ message: "This email is already registered." });
  const user = {
    id: randomUUID(),
    name: name.trim(),
    email: email.toLowerCase(),
  };
  db.prepare("INSERT INTO users VALUES(?,?,?,?)").run(
    user.id,
    user.name,
    user.email,
    hashPassword(password),
  );
  seed(user.id);
  res.status(201).json({ user, token: tokenFor(user) });
});
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string")
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  const user = db
    .prepare("SELECT * FROM users WHERE email=?")
    .get(email.toLowerCase());
  if (!user || !matchesPassword(password, user.password))
    return res.status(401).json({ message: "Incorrect email or password." });
  res.json({ user: publicUser(user), token: tokenFor(user) });
});
// JWT middleware: every /api route registered below requires a valid token.
app.use("/api", (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace(/^Bearer /, "");
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
    if (!db.prepare("SELECT id FROM users WHERE id=?").get(payload.sub))
      throw new Error("User not found");
    req.userId = payload.sub;
    next();
  } catch {
    res
      .status(401)
      .json({ message: "Your session expired. Please log in again." });
  }
});
app.get("/api/auth/me", (req, res) =>
  res.json(
    publicUser(db.prepare("SELECT * FROM users WHERE id=?").get(req.userId)),
  ),
);
const taskDto = (task) => ({ ...task, completed: Boolean(task.completed) });
app.get("/api/tasks", (req, res) =>
  res.json(
    db
      .prepare("SELECT * FROM tasks WHERE user_id=? ORDER BY created_at")
      .all(req.userId)
      .map(taskDto),
  ),
);
function validTask(body, userId) {
  if (
    typeof body.title !== "string" ||
    !body.title.trim() ||
    body.title.length > 200
  )
    return "Task title is required (up to 200 characters).";
  if (typeof body.description !== "string" || body.description.length > 2000)
    return "Description is too long.";
  if (
    !Number.isInteger(body.priority) ||
    body.priority < 1 ||
    body.priority > 4
  )
    return "Choose a valid priority.";
  if (typeof body.completed !== "boolean")
    return "Completed must be a boolean.";
  if (
    typeof body.due_date !== "string" ||
    (body.due_date &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(body.due_date) ||
        Number.isNaN(Date.parse(body.due_date)) ||
        new Date(body.due_date).toISOString().slice(0, 10) !== body.due_date))
  )
    return "Choose a valid date.";
  if (
    body.project_id &&
    !db
      .prepare("SELECT id FROM projects WHERE id=? AND user_id=?")
      .get(body.project_id, userId)
  )
    return "Project not found.";
}
app.post("/api/tasks", (req, res) => {
  const b = {
    description: "",
    due_date: "",
    priority: 4,
    completed: false,
    project_id: null,
    ...req.body,
  };
  const error = validTask(b, req.userId);
  if (error) return res.status(400).json({ message: error });
  const id = randomUUID();
  db.prepare("INSERT INTO tasks VALUES(?,?,?,?,?,?,?,?,?)").run(
    id,
    req.userId,
    b.project_id || null,
    b.title.trim(),
    b.description,
    b.due_date,
    b.priority,
    0,
    new Date().toISOString(),
  );
  res
    .status(201)
    .json(taskDto(db.prepare("SELECT * FROM tasks WHERE id=?").get(id)));
});
app.patch("/api/tasks/:id", (req, res) => {
  const old = db
    .prepare("SELECT * FROM tasks WHERE id=? AND user_id=?")
    .get(req.params.id, req.userId);
  if (!old) return res.status(404).json({ message: "Task not found." });
  const b = { ...taskDto(old), ...req.body };
  const error = validTask(b, req.userId);
  if (error) return res.status(400).json({ message: error });
  db.prepare(
    "UPDATE tasks SET title=?,description=?,due_date=?,priority=?,completed=?,project_id=? WHERE id=? AND user_id=?",
  ).run(
    b.title.trim(),
    b.description,
    b.due_date,
    b.priority,
    Number(b.completed),
    b.project_id || null,
    old.id,
    req.userId,
  );
  res.json(taskDto(db.prepare("SELECT * FROM tasks WHERE id=?").get(old.id)));
});
app.delete("/api/tasks/:id", (req, res) => {
  const r = db
    .prepare("DELETE FROM tasks WHERE id=? AND user_id=?")
    .run(req.params.id, req.userId);
  if (!r.changes) return res.status(404).json({ message: "Task not found." });
  res.sendStatus(204);
});
app.get("/api/projects", (req, res) =>
  res.json(
    db.prepare("SELECT * FROM projects WHERE user_id=?").all(req.userId),
  ),
);
app.post("/api/projects", (req, res) => {
  const { name, color = "#4073d6" } = req.body || {};
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 60 ||
    !/^#[0-9a-f]{6}$/i.test(color)
  )
    return res
      .status(400)
      .json({ message: "Enter a project name and valid color." });
  const id = randomUUID();
  db.prepare("INSERT INTO projects VALUES(?,?,?,?)").run(
    id,
    req.userId,
    name.trim(),
    color,
  );
  res.status(201).json(db.prepare("SELECT * FROM projects WHERE id=?").get(id));
});
app.delete("/api/projects/:id", (req, res) => {
  const r = db
    .prepare("DELETE FROM projects WHERE id=? AND user_id=?")
    .run(req.params.id, req.userId);
  if (!r.changes)
    return res.status(404).json({ message: "Project not found." });
  res.sendStatus(204);
});
app.use((error, _req, res, _next) => {
  console.error(error.message);
  res.status(500).json({ message: "Something went wrong on the server." });
});
app.listen(Number(process.env.PORT) || 3001, () =>
  console.log(
    "Taskflow API ready on http://localhost:" + (process.env.PORT || 3001),
  ),
);
