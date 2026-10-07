import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
  useLocation,
  useParams,
} from "react-router";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import {
  Plus,
  Search,
  Inbox,
  CalendarDays,
  CalendarCheck,
  CheckCheck,
  Hash,
  ChevronDown,
  ChevronRight,
  PanelLeft,
  LogOut,
  Check,
  Flag,
  Trash2,
  Pencil,
  ArrowRight,
  SlidersHorizontal,
  Sun,
  Leaf,
  X,
  Menu,
} from "lucide-react";
import {
  loadWorkspace,
  login,
  register as registerUser,
  saveTask,
  toggleTask,
  deleteTask,
  addProject,
  deleteProject,
  signedOut,
} from "./store";
const localDay = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const readableDate = (date) =>
  date
    ? new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";
const blankTask = {
  title: "",
  description: "",
  due_date: "",
  priority: 4,
  project_id: "",
  completed: false,
};

function Auth() {
  const [register, setRegister] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [fields, setFields] = useState({ name: "", email: "", password: "" });
  const dispatch = useDispatch(),
    navigate = useNavigate();
  async function submit(event, demo = false) {
    event?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const action = demo
        ? login({ email: "demo@taskflow.local", password: "Demo123!" })
        : register
          ? registerUser(fields)
          : login({ email: fields.email, password: fields.password });
      await dispatch(action).unwrap();
      navigate("/today");
    } catch (message) {
      setError(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="brand-mark">
          <CheckCheck size={23} />
        </span>
        taskflow
      </div>
      <div className="auth-grid">
        <section>
          <div className="auth-eyebrow">MAKE ROOM FOR WHAT MATTERS</div>
          <h1>
            A little focus.
            <br />A lighter day.
          </h1>
          <p>
            Bring your tasks, plans and ideas together.
            <br />
            One clear list. One small step at a time.
          </p>
          <div className="auth-preview">
            <div>
              <span className="mini-dot" />
              Your day, simplified<span className="mini-date">Today</span>
            </div>
            <p>
              <span className="mini-check">✓</span>Finish that one important
              thing
            </p>
            <p>
              <span className="mini-circle" />
              Make time for yourself
            </p>
            <p>
              <span className="mini-circle" />
              Start something new
            </p>
            <span className="mini-progress">
              A good day starts with a little clarity.
            </span>
          </div>
        </section>
        <div className="auth-card">
          <h2>{register ? "Create your account" : "Welcome back"}</h2>
          <p>
            {register
              ? "Your fresh start is right here."
              : "Let’s make today a good one."}
          </p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={submit}>
            {register && (
              <Form.Group className="mb-3" controlId="auth-name">
                <Form.Label>Your name</Form.Label>
                <Form.Control
                  required
                  maxLength={80}
                  value={fields.name}
                  onChange={(e) =>
                    setFields({ ...fields, name: e.target.value })
                  }
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="auth-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                value={fields.email}
                placeholder="you@example.com"
                onChange={(e) =>
                  setFields({ ...fields, email: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="auth-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                required
                minLength={8}
                value={fields.password}
                placeholder="At least 8 characters"
                onChange={(e) =>
                  setFields({ ...fields, password: e.target.value })
                }
              />
            </Form.Group>
            <Button className="auth-submit" type="submit" disabled={busy}>
              {busy ? "Please wait…" : register ? "Create account" : "Log in"}
              <ArrowRight size={17} />
            </Button>
          </Form>
          <button
            className="demo-button"
            disabled={busy}
            onClick={() => submit(null, true)}
          >
            Explore the demo workspace
          </button>
          <p className="auth-switch">
            {register ? "Already have an account?" : "New to Taskflow?"}{" "}
            <button
              onClick={() => {
                setRegister(!register);
                setError("");
              }}
            >
              {register ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
      <footer className="auth-footer">
        A personal productivity app · Built for your everyday
      </footer>
    </div>
  );
}

function TaskEditor({ task, onClose, projects }) {
  const dispatch = useDispatch();
  const [fields, setFields] = useState({ ...blankTask, ...task });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { title, description, due_date, priority, project_id, completed } =
        fields;
      await dispatch(
        saveTask({
          id: task.id,
          title,
          description,
          due_date,
          completed,
          priority: Number(priority),
          project_id: project_id || null,
        }),
      ).unwrap();
      onClose();
    } catch (message) {
      setError(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal show onHide={onClose} centered>
      <Form onSubmit={save}>
        <Modal.Header closeButton>
          <Modal.Title>{task.id ? "Edit task" : "Add a task"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Control
            className="task-name-input"
            autoFocus
            required
            maxLength={200}
            placeholder="What needs doing?"
            value={fields.title}
            onChange={(e) => setFields({ ...fields, title: e.target.value })}
          />
          <Form.Control
            as="textarea"
            rows={3}
            maxLength={2000}
            className="task-description-input"
            placeholder="Description"
            value={fields.description}
            onChange={(e) =>
              setFields({ ...fields, description: e.target.value })
            }
          />
          <div className="editor-options">
            <Form.Group controlId="task-due">
              <Form.Label>Due date</Form.Label>
              <Form.Control
                type="date"
                value={fields.due_date}
                onChange={(e) =>
                  setFields({ ...fields, due_date: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="task-priority">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={fields.priority}
                onChange={(e) =>
                  setFields({ ...fields, priority: e.target.value })
                }
              >
                {[1, 2, 3, 4].map((n) => (
                  <option value={n} key={n}>
                    Priority {n}
                    {n === 1 ? " · High" : n === 4 ? " · Normal" : ""}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          <Form.Group className="mt-3" controlId="task-project">
            <Form.Label>Project</Form.Label>
            <Form.Select
              value={fields.project_id || ""}
              onChange={(e) =>
                setFields({ ...fields, project_id: e.target.value })
              }
            >
              <option value="">Inbox</option>
              {projects.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : task.id ? "Save changes" : "Add task"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

function ProjectEditor({ onClose }) {
  const dispatch = useDispatch();
  const [name, setName] = useState(""),
    [color, setColor] = useState("#4073d6"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await dispatch(addProject({ name, color })).unwrap();
      onClose();
    } catch (message) {
      setError(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal show onHide={onClose} centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title>A new project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Label htmlFor="project-name">Project name</Form.Label>
          <Form.Control
            id="project-name"
            autoFocus
            required
            maxLength={60}
            placeholder="e.g. My next big idea"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Form.Label className="mt-3">Color</Form.Label>
          <div className="color-options">
            {[
              "#4073d6",
              "#45a478",
              "#ac73c8",
              "#e09c38",
              "#dc4c3e",
              "#70818e",
            ].map((c) => (
              <button
                type="button"
                aria-label={c}
                className={color === c ? "chosen" : ""}
                key={c}
                style={{ background: c }}
                onClick={() => setColor(c)}
              >
                {color === c && <Check size={16} />}
              </button>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            Add project
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

function TaskPage({ view, onEdit, onToggle, onDelete, query, priority, sort }) {
  const { tasks, projects } = useSelector((s) => s.app);
  const { id } = useParams();
  const today = localDay();
  const project = projects.find((p) => p.id === id);
  const titles = {
    today: "Today",
    inbox: "Inbox",
    upcoming: "Upcoming",
    completed: "Completed",
    search: "Search",
    project: project?.name || "Project",
  };
  let visible = tasks.filter((t) =>
    view === "completed" ? t.completed : !t.completed,
  );
  if (view === "today")
    visible = visible.filter((t) => t.due_date && t.due_date <= today);
  if (view === "inbox") visible = visible.filter((t) => !t.project_id);
  if (view === "upcoming")
    visible = visible.filter((t) => t.due_date && t.due_date > today);
  if (view === "project") visible = visible.filter((t) => t.project_id === id);
  if (query)
    visible = visible.filter((t) =>
      (t.title + " " + t.description)
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  if (priority)
    visible = visible.filter((t) => t.priority === Number(priority));
  visible = [...visible].sort((a, b) =>
    sort === "priority"
      ? a.priority - b.priority
      : sort === "name"
        ? a.title.localeCompare(b.title)
        : (a.due_date || "9999").localeCompare(b.due_date || "9999"),
  );
  const overdue = visible.filter((t) => t.due_date && t.due_date < today),
    rest = visible.filter((t) => !overdue.includes(t));
  const groups =
    view === "today"
      ? [
          ["Overdue", overdue],
          ["Today", rest],
        ]
      : view === "upcoming"
        ? [...new Set(visible.map((t) => t.due_date))].map((date) => [
            new Date(date + "T12:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }),
            visible.filter((t) => t.due_date === date),
          ])
        : [["", visible]];
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">
            My workspace <ChevronRight size={12} />
            {titles[view]}
          </div>
          <h1>{titles[view]}</h1>
          <p className="page-subtitle">
            {view === "today"
              ? new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
              : view === "upcoming"
                ? "A little planning goes a long way."
                : view === "completed"
                  ? "Small wins. Real progress."
                  : view === "inbox"
                    ? "A home for your thoughts and to-dos."
                    : view === "search"
                      ? `Find what you’re looking for.`
                      : "Keep moving, one task at a time."}
          </p>
        </div>
        <div className="heading-symbol">
          {view === "today" ? (
            <Sun size={27} />
          ) : view === "completed" ? (
            <CheckCheck size={27} />
          ) : (
            <Leaf size={27} />
          )}
        </div>
      </div>
      {view === "today" && (
        <div className="daily-note">
          <span>✧</span>
          <div>
            <strong>You don’t have to do it all today.</strong>
            <p>Start with what matters. The rest can wait.</p>
          </div>
        </div>
      )}
      <div className="task-count">
        {visible.length} {view === "completed" ? "completed" : "tasks to do"}
      </div>
      {groups.map(
        ([title, list]) =>
          list.length > 0 && (
            <section className="task-group" key={title}>
              {title && (
                <div
                  className={
                    "group-title " + (title === "Overdue" ? "overdue" : "")
                  }
                >
                  {title}
                  <span>{list.length}</span>
                </div>
              )}
              {list.map((task) => (
                <div
                  className={"task-row " + (task.completed ? "is-done" : "")}
                  key={task.id}
                >
                  <button
                    className={"task-circle p" + task.priority}
                    aria-label={
                      (task.completed ? "Reopen " : "Complete ") + task.title
                    }
                    onClick={() => onToggle(task)}
                  >
                    {task.completed && <Check size={13} />}
                  </button>
                  <button className="task-content" onClick={() => onEdit(task)}>
                    <span className="task-title">{task.title}</span>
                    {task.description && (
                      <span className="task-description">
                        {task.description}
                      </span>
                    )}
                    <span className="task-meta">
                      {task.due_date && (
                        <span
                          className={
                            task.due_date < today
                              ? "overdue"
                              : task.due_date === today
                                ? "today-tag"
                                : ""
                          }
                        >
                          <CalendarDays size={12} />
                          {task.due_date === today
                            ? "Today"
                            : readableDate(task.due_date)}
                        </span>
                      )}
                      <span>
                        <Hash size={12} />
                        {projects.find((p) => p.id === task.project_id)?.name ||
                          "Inbox"}
                      </span>
                    </span>
                  </button>
                  <div className="task-actions">
                    <button
                      aria-label={"Edit " + task.title}
                      onClick={() => onEdit(task)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      aria-label={"Delete " + task.title}
                      onClick={() => onDelete(task)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </section>
          ),
      )}
      {!visible.length && (
        <div className="empty-state">
          <div className="empty-art">
            <CheckCheck size={45} />
          </div>
          <h3>
            {view === "completed"
              ? "Your wins will show up here"
              : "A little breathing room"}
          </h3>
          <p>
            {view === "search"
              ? "Try another search or filter."
              : "Add a task when you’re ready. You’ve got this."}
          </p>
        </div>
      )}
      {view !== "completed" && (
        <button
          className="inline-add"
          onClick={() =>
            onEdit({
              ...blankTask,
              due_date: view === "today" ? today : "",
              project_id: view === "project" ? id : "",
            })
          }
        >
          <Plus size={18} />
          Add task
        </button>
      )}
    </>
  );
}

function Workspace() {
  const dispatch = useDispatch(),
    navigate = useNavigate(),
    location = useLocation();
  const { user, tasks, projects, loading, error } = useSelector((s) => s.app);
  const [editor, setEditor] = useState(null),
    [projectEditor, setProjectEditor] = useState(false),
    [query, setQuery] = useState(""),
    [priority, setPriority] = useState(""),
    [sort, setSort] = useState("date"),
    [filters, setFilters] = useState(false),
    [mobile, setMobile] = useState(false),
    [message, setMessage] = useState(""),
    [confirm, setConfirm] = useState(null);
  useEffect(() => {
    dispatch(loadWorkspace());
  }, [dispatch]);
  useEffect(() => {
    setPriority("");
    setMobile(false);
  }, [location.pathname]);
  useEffect(() => {
    function shortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        navigate("/search");
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [navigate]);
  const refresh = () => dispatch(loadWorkspace());
  async function toggle(task) {
    try {
      await dispatch(toggleTask(task)).unwrap();
      setMessage(
        task.completed ? "Task reopened" : "Nice work! Task completed.",
      );
    } catch (message) {
      setMessage(message);
    }
  }
  async function remove() {
    try {
      if (confirm.kind === "projects") {
        await dispatch(deleteProject(confirm.id)).unwrap();
        navigate("/inbox");
      } else await dispatch(deleteTask(confirm.id)).unwrap();
      setConfirm(null);
    } catch (message) {
      setMessage(message);
    }
  }
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [message]);
  const active = tasks.filter((t) => !t.completed),
    today = localDay();
  const links = [
    ["/inbox", "Inbox", Inbox, active.filter((t) => !t.project_id).length],
    [
      "/today",
      "Today",
      CalendarCheck,
      active.filter((t) => t.due_date && t.due_date <= today).length,
    ],
    [
      "/upcoming",
      "Upcoming",
      CalendarDays,
      active.filter((t) => t.due_date && t.due_date > today).length,
    ],
    [
      "/completed",
      "Completed",
      CheckCheck,
      tasks.filter((t) => t.completed).length,
    ],
  ];
  function logout() {
    dispatch(signedOut());
    navigate("/login");
  }
  const pageProps = {
    onEdit: setEditor,
    onToggle: toggle,
    onDelete: (t) => setConfirm({ kind: "tasks", id: t.id, name: t.title }),
    query: location.pathname === "/search" ? query : "",
    priority,
    sort,
  };
  return (
    <div className="workspace">
      {mobile && (
        <button
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={"sidebar " + (mobile ? "mobile-open" : "")}>
        <div className="user-heading">
          <span className="avatar">{user?.name?.slice(0, 1) || "T"}</span>
          <strong>{user?.name || "My workspace"}</strong>
          <ChevronDown size={14} />
          <button
            className="collapse-button"
            aria-label="Close sidebar"
            onClick={() => setMobile(false)}
          >
            <PanelLeft size={17} />
          </button>
        </div>
        <button
          className="sidebar-add"
          onClick={() =>
            setEditor({
              ...blankTask,
              due_date: location.pathname === "/today" ? today : "",
            })
          }
        >
          <span>
            <Plus size={17} />
          </span>
          Add task
        </button>
        <button className="search-link" onClick={() => navigate("/search")}>
          <Search size={19} />
          Search<span>⌘ K</span>
        </button>
        <nav>
          {links.map(([path, label, Icon, count]) => (
            <NavLink
              to={path}
              key={path}
              className={({ isActive }) =>
                "sidebar-link " + (isActive ? "active" : "")
              }
            >
              <Icon size={20} />
              <span>{label}</span>
              <small>{count || ""}</small>
            </NavLink>
          ))}
        </nav>
        <div className="projects-heading">
          <span>My projects</span>
          <button
            aria-label="Add project"
            onClick={() => setProjectEditor(true)}
          >
            <Plus size={17} />
          </button>
        </div>
        {projects.map((p) => (
          <div className="project-nav-row" key={p.id}>
            <NavLink
              className={({ isActive }) =>
                "sidebar-link project-link " + (isActive ? "active" : "")
              }
              to={"/project/" + p.id}
            >
              <Hash size={19} color={p.color} />
              <span>{p.name}</span>
              <small>
                {active.filter((t) => t.project_id === p.id).length || ""}
              </small>
            </NavLink>
            <button
              className="project-delete"
              aria-label={"Delete project " + p.name}
              onClick={() =>
                setConfirm({ kind: "projects", id: p.id, name: p.name })
              }
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <div className="sidebar-bottom">
          <div className="sidebar-brand">
            <CheckCheck size={19} />
            taskflow<span>personal</span>
          </div>
          <button onClick={logout}>
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>
      <main className="main-pane">
        <div className="topbar">
          <button
            className="mobile-toggle"
            aria-label="Open menu"
            onClick={() => setMobile(true)}
          >
            <Menu size={21} />
          </button>
          <span className="topbar-note">A little focus, every day.</span>
          <button
            className={"view-button " + (filters ? "selected" : "")}
            onClick={() => setFilters(!filters)}
          >
            <SlidersHorizontal size={16} />
            View
          </button>
        </div>
        <div className="page-content">
          {filters && (
            <div className="view-options">
              <label>
                Priority
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="">All priorities</option>
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      Priority {n}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Sort by
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="date">Due date</option>
                  <option value="priority">Priority</option>
                  <option value="name">Task name</option>
                </select>
              </label>
            </div>
          )}
          {location.pathname === "/search" && (
            <div className="search-box">
              <Search size={20} />
              <input
                autoFocus
                placeholder="Search your tasks…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <X size={17} />
                </button>
              )}
            </div>
          )}
          {error && (
            <Alert variant="danger">
              {error}
              <button className="retry" onClick={refresh}>
                Try again
              </button>
            </Alert>
          )}
          {loading && !user ? (
            <div className="loading">
              <Spinner animation="border" size="sm" />
              Loading your workspace…
            </div>
          ) : (
            <Routes>
              <Route
                path="/today"
                element={<TaskPage view="today" {...pageProps} />}
              />
              <Route
                path="/inbox"
                element={<TaskPage view="inbox" {...pageProps} />}
              />
              <Route
                path="/upcoming"
                element={<TaskPage view="upcoming" {...pageProps} />}
              />
              <Route
                path="/completed"
                element={<TaskPage view="completed" {...pageProps} />}
              />
              <Route
                path="/search"
                element={<TaskPage view="search" {...pageProps} />}
              />
              <Route
                path="/project/:id"
                element={<TaskPage view="project" {...pageProps} />}
              />
              <Route path="*" element={<Navigate to="/today" replace />} />
            </Routes>
          )}
        </div>
        <footer className="workspace-footer">
          <span className="footer-dot" />
          Your tasks are saved automatically.
        </footer>
      </main>
      {editor && (
        <TaskEditor
          key={editor.id || "new"}
          task={editor}
          projects={projects}
          onClose={() => setEditor(null)}
        />
      )}
      {projectEditor && (
        <ProjectEditor
          onClose={() => setProjectEditor(false)}
        />
      )}
      <Modal show={!!confirm} onHide={() => setConfirm(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Delete {confirm?.kind === "projects" ? "project" : "task"}?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>“{confirm?.name}”</p>
          {confirm?.kind === "projects" && (
            <p className="muted">Its tasks will move to Inbox.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={remove}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      {message && (
        <div className="toast-message">
          <Check size={17} />
          {message}
          <button aria-label="Dismiss" onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const token = useSelector((s) => s.app.token),
    dispatch = useDispatch();
  useEffect(() => {
    const expired = () => dispatch(signedOut());
    window.addEventListener("session-expired", expired);
    return () => window.removeEventListener("session-expired", expired);
  }, [dispatch]);
  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/today" replace /> : <Auth />}
      />
      <Route
        path="/*"
        element={token ? <Workspace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
