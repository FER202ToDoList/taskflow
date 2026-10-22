import Sidebar from "../components/Sidebar";
import TaskFilters from "../components/TaskFilters";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router";
import { Modal, Button, Alert, Spinner } from "react-bootstrap";
import {
  Search,
  Inbox,
  CalendarDays,
  CalendarCheck,
  CheckCheck,
  Check,
  SlidersHorizontal,
  X,
  Menu,
} from "lucide-react";
import {
  loadWorkspace,
  toggleTask,
  deleteTask,
  deleteProject,
  signedOut,
} from "../store";
import { localDay, blankTask } from "../utils/tasks";
import TaskEditor from "../components/TaskEditor";
import ProjectEditor from "../components/ProjectEditor";
import TaskPage from "./TaskPage";
import TaskDetail from "./TaskDetail";

export default function Workspace() {
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
    [confirm, setConfirm] = useState(null),
    [deleting, setDeleting] = useState(false),
    [deleteError, setDeleteError] = useState(""),
    [pendingIds, setPendingIds] = useState([]),
    [status, setStatus] = useState("all"),
    [messageError, setMessageError] = useState(false);
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
    if (pendingIds.includes(task.id)) return;
    setPendingIds((ids) => [...ids, task.id]);
    setMessageError(false);
    try {
      await dispatch(toggleTask(task)).unwrap();
      setMessage(
        task.completed ? "Task reopened" : "Nice work! Task completed.",
      );
    } catch (message) {
      setMessageError(true);
      setMessage(message);
    } finally {
      setPendingIds((ids) => ids.filter((id) => id !== task.id));
    }
  }
  async function remove() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      if (confirm.kind === "projects") {
        await dispatch(deleteProject(confirm.id)).unwrap();
        navigate("/inbox");
      } else await dispatch(deleteTask(confirm.id)).unwrap();
      if (location.pathname === "/task/" + confirm.id) navigate("/tasks");
      setConfirm(null);
      setMessageError(false);
      setMessage(
        confirm.kind === "projects"
          ? "Project deleted. Its tasks moved to Inbox."
          : "Task deleted.",
      );
    } catch (message) {
      setDeleteError(message);
    } finally {
      setDeleting(false);
    }
  }
  function requestDelete(item) {
    setDeleteError("");
    setConfirm(item);
  }
  function saved(message) {
    setMessageError(false);
    setMessage(message);
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
    ["/tasks", "All tasks", CheckCheck, active.length],
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
    onDelete: (t) => requestDelete({ kind: "tasks", id: t.id, name: t.title }),
    query: ["/search", "/tasks"].includes(location.pathname) ? query : "",
    pendingIds,
    status,
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
      <Sidebar
        user={user}
        projects={projects}
        active={active}
        links={links}
        mobile={mobile}
        onClose={() => setMobile(false)}
        onAddProject={() => setProjectEditor(true)}
        onDeleteProject={requestDelete}
        onLogout={logout}
        onAddTask={() =>
          setEditor({
            ...blankTask,
            due_date: location.pathname === "/today" ? today : "",
            project_id: location.pathname.startsWith("/project/")
              ? location.pathname.split("/")[2]
              : "",
          })
        }
      />
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
          {location.pathname === "/tasks" && (
            <div className="workspace-summary" aria-label="Task overview">
              <div>
                <strong>{active.length}</strong>
                <span>To do</span>
              </div>
              <div>
                <strong>
                  {
                    active.filter((t) => t.due_date && t.due_date < today)
                      .length
                  }
                </strong>
                <span>Overdue</span>
              </div>
              <div>
                <strong>{tasks.length - active.length}</strong>
                <span>Completed</span>
              </div>
            </div>
          )}
          {(filters || location.pathname === "/tasks") && (
            <TaskFilters
              allTasks={location.pathname === "/tasks"}
              status={status}
              setStatus={setStatus}
              priority={priority}
              setPriority={setPriority}
              sort={sort}
              setSort={setSort}
            />
          )}
          {["/search", "/tasks"].includes(location.pathname) && (
            <div className="search-box">
              <Search size={20} />
              <input
                aria-label="Search tasks"
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
          {loading ? (
            <div className="loading">
              <Spinner animation="border" size="sm" />
              Loading your workspace…
            </div>
          ) : (
            <Routes>
              <Route
                path="/tasks"
                element={<TaskPage view="all" {...pageProps} />}
              />
              <Route path="/task/:id" element={<TaskDetail {...pageProps} />} />
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
          onSaved={saved}
          onClose={() => setEditor(null)}
        />
      )}
      {projectEditor && (
        <ProjectEditor
          onSaved={saved}
          onClose={() => setProjectEditor(false)}
        />
      )}
      <Modal
        show={!!confirm}
        onHide={() => !deleting && setConfirm(null)}
        centered
        backdrop={deleting ? "static" : true}
      >
        <Modal.Header closeButton={!deleting}>
          <Modal.Title>
            Delete {confirm?.kind === "projects" ? "project" : "task"}?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          <p>“{confirm?.name}”</p>
          {confirm?.kind === "projects" && (
            <p className="muted">Its tasks will move to Inbox.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            disabled={deleting}
            onClick={() => setConfirm(null)}
          >
            Cancel
          </Button>
          <Button variant="danger" disabled={deleting} onClick={remove}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
      {message && (
        <div
          className={"toast-message " + (messageError ? "toast-error" : "")}
          role={messageError ? "alert" : "status"}
        >
          {messageError ? <X size={17} /> : <Check size={17} />}
          {message}
          <button aria-label="Dismiss" onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
