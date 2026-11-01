import { Check, Trash2 } from "lucide-react";
import { dueLabel, localDay } from "../utils/tasks";

export default function TaskCard({ task, project, onEdit, onToggle, onDelete }) {
  const overdue = !task.completed && task.due_date && task.due_date < localDay();

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
      <button className="task-card-title" onClick={() => onEdit(task)}>
        {task.title}
      </button>
      {task.description && <p className="task-card-desc">{task.description}</p>}
      <div className="task-card-bottom">
        <span className="project-tag">
          <span className="dot" style={{ background: project?.color || "var(--muted)" }} />
          {project?.name || "Inbox"}
        </span>
        <div className="task-card-actions">
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
            onClick={() => onToggle(task)}
          >
            <Check size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </article>
  );
}
