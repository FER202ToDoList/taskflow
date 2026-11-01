import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Alert, Spinner, Toast, ToastContainer } from "react-bootstrap";
import { deleteProject, deleteTask, loadWorkspace, saveTask, toggleTask } from "../store";
import TopBar from "../components/TopBar";
import TaskEditor from "../components/TaskEditor";
import ProjectEditor from "../components/ProjectEditor";
import ConfirmDialog from "../components/ConfirmDialog";

// Layout for every signed-in page: top bar, project chips, dialogs and toasts.
export default function Workspace() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, error } = useSelector((s) => s.workspace);
  const [taskDraft, setTaskDraft] = useState(null);
  const [projectDraft, setProjectDraft] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(loadWorkspace());
  }, [dispatch]);

  async function run(action, success) {
    try {
      await dispatch(action).unwrap();
      if (success) setMessage(success);
      return true;
    } catch (text) {
      setMessage(text);
      return false;
    }
  }

  const taskActions = {
    onEdit: (task) => setTaskDraft(task),
    onToggle: (task) =>
      run(toggleTask(task), task.completed ? "Task reopened" : "Nice work! Task completed."),
    onDelete: (task) => setToDelete({ kind: "task", id: task.id, name: task.title }),
  };

  const context = {
    taskActions,
    newTask: (preset = {}) => setTaskDraft(preset),
    moveTask: (task, changes) => run(saveTask({ id: task.id, ...changes })),
    addProject: () => setProjectDraft({}),
    editProject: (project) => setProjectDraft(project),
    removeProject: (project) => setToDelete({ kind: "project", id: project.id, name: project.name }),
  };

  async function confirmDelete() {
    const project = toDelete.kind === "project";
    const ok = await run(
      project ? deleteProject(toDelete.id) : deleteTask(toDelete.id),
      project ? "Project deleted" : "Task deleted",
    );
    if (ok && project) navigate("/board");
    setToDelete(null);
  }

  const projectId = location.pathname.startsWith("/project/") ? location.pathname.split("/")[2] : "";

  return (
    <div className="app-shell">
      <TopBar onNewTask={() => setTaskDraft(projectId ? { project_id: projectId } : {})} />
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
          // Wait for the first load so pages like /project/:id can find their data.
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
          onSaved={setMessage}
        />
      )}
      {projectDraft && (
        <ProjectEditor
          project={projectDraft.id ? projectDraft : null}
          onClose={() => setProjectDraft(null)}
          onSaved={(saved, text) => {
            setMessage(text);
            navigate("/project/" + saved.id);
          }}
        />
      )}
      <ConfirmDialog item={toDelete} onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />

      <ToastContainer position="bottom-center" className="p-3">
        <Toast show={!!message} onClose={() => setMessage("")} delay={3000} autohide>
          <Toast.Body className="d-flex justify-content-between align-items-center gap-3">
            {message}
            <button className="btn-close" aria-label="Dismiss" onClick={() => setMessage("")} />
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
