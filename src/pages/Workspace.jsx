import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Alert, Spinner, Toast, ToastContainer } from "react-bootstrap";
import { Check, X } from "lucide-react";
import { deleteProject, deleteTask, loadWorkspace, saveTask, toggleTask } from "../store";
import { blankTask, localDay } from "../utils/tasks";
import TopBar from "../components/TopBar";
import TaskEditor from "../components/TaskEditor";
import ProjectEditor from "../components/ProjectEditor";
import ConfirmDialog from "../components/ConfirmDialog";

// Shared layout for every signed-in page: top bar, dialogs and notifications.
// Child pages receive the actions through <Outlet context>.
export default function Workspace() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, error } = useSelector((s) => s.app);
  const [taskDraft, setTaskDraft] = useState(null);
  const [projectDraft, setProjectDraft] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [pendingIds, setPendingIds] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(loadWorkspace());
  }, [dispatch]);

  const notify = (text, isError = false) => setToast({ text, isError });

  // Toggling and moving are blocked per task while a request is running.
  async function updateTask(task, action, success) {
    if (pendingIds.includes(task.id)) return;
    setPendingIds((ids) => [...ids, task.id]);
    try {
      await dispatch(action).unwrap();
      if (success) notify(success);
    } catch (message) {
      notify(message, true);
    } finally {
      setPendingIds((ids) => ids.filter((id) => id !== task.id));
    }
  }

  async function remove() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const isProject = confirm.kind === "projects";
      await dispatch(isProject ? deleteProject(confirm.id) : deleteTask(confirm.id)).unwrap();
      if (isProject) navigate("/board");
      else if (location.pathname === "/task/" + confirm.id) navigate("/tasks");
      setConfirm(null);
      notify(isProject ? "Project deleted. Its tasks moved to Inbox." : "Task deleted.");
    } catch (message) {
      setDeleteError(message);
    } finally {
      setDeleting(false);
    }
  }

  const requestDelete = (item) => {
    setDeleteError("");
    setConfirm(item);
  };

  const projectId = location.pathname.startsWith("/project/")
    ? location.pathname.split("/")[2]
    : "";

  const context = {
    pendingIds,
    taskActions: {
      pendingIds,
      onEdit: (task) => setTaskDraft(task),
      onToggle: (task) =>
        updateTask(
          task,
          toggleTask(task),
          task.completed ? "Task reopened." : "Nice work! Task completed.",
        ),
      onDelete: (task) => requestDelete({ kind: "tasks", id: task.id, name: task.title }),
    },
    newTask: (preset = {}) => setTaskDraft({ ...blankTask, ...preset }),
    moveTask: (task, changes) => updateTask(task, saveTask({ id: task.id, ...changes })),
    addProject: () => setProjectDraft({}),
    editProject: (project) => setProjectDraft(project),
    removeProject: (project) =>
      requestDelete({ kind: "projects", id: project.id, name: project.name }),
  };

  function newTaskFromTopBar() {
    context.newTask({
      due_date: location.pathname === "/today" ? localDay() : "",
      project_id: projectId,
    });
  }

  return (
    <div className="app-shell">
      <TopBar onNewTask={newTaskFromTopBar} />
      <main className="page">
        {error && (
          <Alert variant="danger" className="d-flex align-items-center gap-3">
            {error}
            <button className="link-button" onClick={() => dispatch(loadWorkspace())}>
              Try again
            </button>
          </Alert>
        )}
        {!user ? (
          // Wait for the first load so pages such as /task/:id can find their data.
          !error && (
            <div className="loading">
              <Spinner animation="border" size="sm" /> Loading your workspace…
            </div>
          )
        ) : (
          <Outlet context={context} />
        )}
      </main>

      {taskDraft && (
        <TaskEditor
          key={taskDraft.id || "new"}
          task={taskDraft}
          onClose={() => setTaskDraft(null)}
          onSaved={(text) => notify(text)}
        />
      )}
      {projectDraft && (
        <ProjectEditor
          project={projectDraft.id ? projectDraft : null}
          onClose={() => setProjectDraft(null)}
          onSaved={(saved, text) => {
            notify(text);
            navigate("/project/" + saved.id);
          }}
        />
      )}
      <ConfirmDialog
        item={confirm}
        busy={deleting}
        error={deleteError}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />

      <ToastContainer position="bottom-center" className="p-3 position-fixed">
        <Toast
          show={!!toast}
          onClose={() => setToast(null)}
          delay={3500}
          autohide
          className={toast?.isError ? "toast-error" : ""}
        >
          <Toast.Body role={toast?.isError ? "alert" : "status"}>
            {toast?.isError ? <X size={17} /> : <Check size={17} />}
            <span>{toast?.text}</span>
            <button className="toast-close" aria-label="Dismiss" onClick={() => setToast(null)}>
              <X size={15} />
            </button>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
