import { Link } from "react-router";
import { Check, Pencil, Trash2 } from "lucide-react";
import { dueLabel, localDay } from "../utils/tasks";

export default function TaskCard({ task, project, onEdit, onToggle, onDelete, pendingIds = [] }) {
  const overdue = !task.completed && task.due_date && task.due_date < localDay();
  const pending = pendingIds.includes(task.id);

  function startDrag(event) {
    event.dataTransfer.setData("text/plain", task.id);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <article
      className={"task-card" + (task.completed ? " is-done" : "")}
      draggable
      onDragStart={startDrag}
    >
      <div className="task-card-top">
        <span className={"priority-chip p" + task.priority}>P{task.priority}</span>
        <span className={"due-label" + (overdue ? " overdue" : "")}>
          {dueLabel(task.due_date)}
        </span>
      </div>
      <Link className="task-card-title" to={"/task/" + task.id} draggable={false}>
        {task.title}
      </Link>
      {task.description && <p className="task-card-desc">{task.description}</p>}
      <div className="task-card-bottom">
        <span className="project-tag">
          <span className="dot" style={{ background: project?.color || "var(--muted)" }} />
          {project?.name || "Inbox"}
        </span>
        <div className="task-card-actions">
          <button
            className="icon-button small"
            aria-label={"Edit " + task.title}
            onClick={() => onEdit(task)}
          >
            <Pencil size={15} />
          </button>
          <button
            className="icon-button small"
            aria-label={"Delete " + task.title}
            onClick={() => onDelete(task)}
          >
            <Trash2 size={15} />
          </button>
          <button
            className={"check-button" + (task.completed ? " checked" : "")}
            aria-label={(task.completed ? "Reopen " : "Complete ") + task.title}
            disabled={pending}
            onClick={() => onToggle(task)}
          >
            <Check size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </article>
  );
}
