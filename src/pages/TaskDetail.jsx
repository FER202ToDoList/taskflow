import { useSelector } from "react-redux";
import { Link, useParams } from "react-router";
import { Button } from "react-bootstrap";
import {
  ArrowLeft,
  CalendarDays,
  Flag,
  Hash,
  Pencil,
  Trash2,
  CheckCheck,
} from "lucide-react";

export default function TaskDetail({ onEdit, onToggle, onDelete, pendingIds }) {
  const { id } = useParams();
  const { tasks, projects } = useSelector((state) => state.app);
  const task = tasks.find((item) => item.id === id);
  if (!task)
    return (
      <div className="empty-state">
        <h1>Task not found</h1>
        <p>The task may have been deleted.</p>
        <Link to="/tasks" className="btn btn-light">
          Back to all tasks
        </Link>
      </div>
    );
  const project = projects.find((item) => item.id === task.project_id);
  return (
    <article className="task-detail">
      <Link to="/tasks" className="back-link">
        <ArrowLeft size={16} />
        All tasks
      </Link>
      <div className="breadcrumb">My workspace / Task detail</div>
      <h1>{task.title}</h1>
      <span className={"status-badge " + (task.completed ? "done" : "")}>
        {task.completed ? "Completed" : "To do"}
      </span>
      <p className="detail-description">
        {task.description || "No description added."}
      </p>
      <dl className="detail-properties">
        <div>
          <dt>
            <CalendarDays size={16} />
            Due date
          </dt>
          <dd>{task.due_date || "No due date"}</dd>
        </div>
        <div>
          <dt>
            <Flag size={16} />
            Priority
          </dt>
          <dd>Priority {task.priority}</dd>
        </div>
        <div>
          <dt>
            <Hash size={16} />
            Project
          </dt>
          <dd>
            {project ? (
              <Link to={"/project/" + project.id}>{project.name}</Link>
            ) : (
              <Link to="/inbox">Inbox</Link>
            )}
          </dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{new Date(task.created_at).toLocaleString()}</dd>
        </div>
      </dl>
      <div className="detail-actions">
        <Button
          disabled={pendingIds.includes(task.id)}
          onClick={() => onToggle(task)}
        >
          <CheckCheck size={16} />
          {task.completed ? "Reopen task" : "Complete task"}
        </Button>
        <Button variant="light" onClick={() => onEdit(task)}>
          <Pencil size={16} />
          Edit task
        </Button>
        <Button variant="outline-danger" onClick={() => onDelete(task)}>
          <Trash2 size={16} />
          Delete task
        </Button>
      </div>
    </article>
  );
}
