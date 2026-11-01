import { useSelector } from "react-redux";
import { Link, useOutletContext, useParams } from "react-router";
import { Button } from "react-bootstrap";
import { ArrowLeft, CalendarDays, CheckCheck, Clock, Flag, Hash, Pencil, Trash2 } from "lucide-react";

// Detail page for one task (/task/:id). The data comes from the list already in Redux.
export default function TaskDetail() {
  const { id } = useParams();
  const { taskActions, pendingIds } = useOutletContext();
  const { tasks, projects } = useSelector((s) => s.app);
  const task = tasks.find((item) => item.id === id);

  if (!task)
    return (
      <div className="empty-state">
        <h1>Task not found</h1>
        <p>The task may have been deleted.</p>
        <Link to="/tasks" className="link-button">
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
      <div className="detail-card">
        <div className="detail-head">
          <span className={"priority-chip p" + task.priority}>P{task.priority}</span>
          <span className={"status-badge" + (task.completed ? " done" : "")}>
            {task.completed ? "Completed" : "To do"}
          </span>
        </div>
        <h1>{task.title}</h1>
        <p className="detail-description">{task.description || "No description added."}</p>
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
                <Link to={"/project/" + project.id}>
                  <span className="dot" style={{ background: project.color }} /> {project.name}
                </Link>
              ) : (
                <Link to="/inbox">Inbox</Link>
              )}
            </dd>
          </div>
          <div>
            <dt>
              <Clock size={16} />
              Created
            </dt>
            <dd>{new Date(task.created_at).toLocaleString()}</dd>
          </div>
        </dl>
        <div className="detail-actions">
          <Button disabled={pendingIds.includes(task.id)} onClick={() => taskActions.onToggle(task)}>
            <CheckCheck size={16} />
            {task.completed ? "Reopen task" : "Complete task"}
          </Button>
          <Button variant="outline-secondary" onClick={() => taskActions.onEdit(task)}>
            <Pencil size={16} />
            Edit task
          </Button>
          <Button variant="outline-danger" onClick={() => taskActions.onDelete(task)}>
            <Trash2 size={16} />
            Delete task
          </Button>
        </div>
      </div>
    </article>
  );
}
