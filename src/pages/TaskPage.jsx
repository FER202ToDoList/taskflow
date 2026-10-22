import { useSelector } from "react-redux";
import { useParams, Link } from "react-router";
import { Table } from "react-bootstrap";
import {
  ChevronRight,
  Sun,
  Leaf,
  CheckCheck,
  Check,
  Hash,
  CalendarDays,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { localDay, readableDate, blankTask } from "../utils/tasks";

export default function TaskPage({
  view,
  onEdit,
  onToggle,
  onDelete,
  query,
  priority,
  sort,
  pendingIds,
  status,
}) {
  const { tasks, projects } = useSelector((s) => s.app);
  const { id } = useParams();
  const today = localDay();
  const project = projects.find((p) => p.id === id);
  const titles = {
    all: "All tasks",
    today: "Today",
    inbox: "Inbox",
    upcoming: "Upcoming",
    completed: "Completed",
    search: "Search",
    project: project?.name || "Project",
  };
  let visible = tasks;
  if (view === "all") {
    if (status === "active")
      visible = visible.filter((task) => !task.completed);
    if (status === "completed")
      visible = visible.filter((task) => task.completed);
  } else {
    visible = visible.filter((task) =>
      view === "completed" ? task.completed : !task.completed,
    );
  }
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
  if (view === "project" && !project)
    return (
      <div className="empty-state">
        <h1>Project not found</h1>
        <p>This project may have been deleted.</p>
        <Link to="/inbox">Back to Inbox</Link>
      </div>
    );
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
        {visible.length} {view === "completed" ? "completed" : "tasks"}
      </div>
      {view === "all" && visible.length > 0 ? (
        <Table
          responsive
          hover
          className="management-table"
          aria-label="All tasks"
        >
          <thead>
            <tr>
              <th>Task</th>
              <th>Due date</th>
              <th>Priority</th>
              <th>Project</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((task) => (
              <tr key={task.id}>
                <td>
                  <Link to={"/task/" + task.id}>{task.title}</Link>
                </td>
                <td>{task.due_date || "—"}</td>
                <td>P{task.priority}</td>
                <td>
                  {projects.find((p) => p.id === task.project_id)?.name ||
                    "Inbox"}
                </td>
                <td>
                  <button
                    className={"status-badge " + (task.completed ? "done" : "")}
                    disabled={pendingIds.includes(task.id)}
                    onClick={() => onToggle(task)}
                    aria-label={
                      (task.completed ? "Reopen " : "Complete ") + task.title
                    }
                  >
                    {task.completed ? "Completed" : "To do"}
                  </button>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      aria-label={"Edit " + task.title}
                      onClick={() => onEdit(task)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      aria-label={"Delete " + task.title}
                      onClick={() => onDelete(task)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        groups.map(
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
                      disabled={pendingIds.includes(task.id)}
                      onClick={() => onToggle(task)}
                    >
                      {task.completed && <Check size={13} />}
                    </button>
                    <Link className="task-content" to={"/task/" + task.id}>
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
                          {projects.find((p) => p.id === task.project_id)
                            ?.name || "Inbox"}
                        </span>
                      </span>
                    </Link>
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
        )
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
            {view === "search" ||
            query ||
            priority ||
            (view === "all" && status !== "all")
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
