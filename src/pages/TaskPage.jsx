import { useSelector } from "react-redux";
import { Link, useOutletContext } from "react-router";
import { Table } from "react-bootstrap";
import { Pencil, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import TaskGrid from "../components/TaskGrid";
import TaskFilters from "../components/TaskFilters";
import { addDays, filterAndSort, localDay, readableDate } from "../utils/tasks";

const VIEWS = {
  all: {
    title: "All tasks",
    eyebrow: "Manage everything in one table",
    pick: () => true,
    empty: ["No tasks match", "Try another search or filter."],
    preset: () => ({}),
  },
  today: {
    title: "Today",
    eyebrow: "Due today and overdue",
    pick: (t, today) => !t.completed && t.due_date && t.due_date <= today,
    empty: ["A little breathing room", "Nothing is due today."],
    preset: () => ({ due_date: localDay() }),
  },
  inbox: {
    title: "Inbox",
    eyebrow: "Tasks without a project",
    pick: (t) => !t.completed && !t.project_id,
    empty: ["Inbox zero", "New tasks without a project land here."],
    preset: () => ({}),
  },
  upcoming: {
    title: "Upcoming",
    eyebrow: "Planned for later",
    pick: (t, today) => !t.completed && t.due_date > today,
    empty: ["Nothing planned yet", "Give a task a future date to see it here."],
    preset: () => ({ due_date: addDays(1) }),
  },
  completed: {
    title: "Completed",
    eyebrow: "Small wins, real progress",
    pick: (t) => t.completed,
    empty: ["Your wins will show up here", "Tick off a task and it will appear here."],
  },
  search: {
    title: "Search",
    eyebrow: "Open tasks · use All tasks to include finished ones",
    pick: (t) => !t.completed,
    empty: ["No matching tasks", "Try another word or clear the filters."],
  },
};

// Groups a list into titled sections for the Today and Upcoming pages.
function groupTasks(view, list, today) {
  if (view === "today")
    return [
      ["Overdue", list.filter((t) => t.due_date < today)],
      ["Today", list.filter((t) => t.due_date === today)],
    ].filter(([, items]) => items.length);
  if (view === "upcoming")
    return [...new Set(list.map((t) => t.due_date))].map((day) => [
      readableDate(day, { weekday: "long", month: "long", day: "numeric" }),
      list.filter((t) => t.due_date === day),
    ]);
  return null;
}

export default function TaskPage({ view }) {
  const { taskActions, newTask, pendingIds } = useOutletContext();
  const { tasks, projects } = useSelector((s) => s.app);
  const ui = useSelector((s) => s.ui);
  const config = VIEWS[view];
  const today = localDay();
  const searchable = view === "search" || view === "all";

  let visible = tasks.filter((t) => config.pick(t, today));
  if (view === "all" && ui.status !== "all")
    visible = visible.filter((t) => (ui.status === "completed" ? t.completed : !t.completed));
  visible = filterAndSort(visible, searchable ? ui : { ...ui, query: "" });

  const open = tasks.filter((t) => !t.completed);
  const groups = groupTasks(view, visible, today);
  const [emptyTitle, emptyText] = config.empty;
  const projectName = (task) => projects.find((p) => p.id === task.project_id)?.name || "Inbox";

  return (
    <>
      <PageHeader eyebrow={config.eyebrow} title={config.title}>
        <span className="title-count">{visible.length}</span>
      </PageHeader>

      {view === "all" && (
        <>
          <div className="summary" aria-label="Task overview">
            <div>
              <strong>{open.length}</strong>
              <span>To do</span>
            </div>
            <div>
              <strong>{open.filter((t) => t.due_date && t.due_date < today).length}</strong>
              <span>Overdue</span>
            </div>
            <div>
              <strong>{tasks.length - open.length}</strong>
              <span>Completed</span>
            </div>
          </div>
          <TaskFilters showStatus idPrefix="page" />
        </>
      )}

      {view === "search" && !ui.query && (
        <p className="hint">Type in the search box at the top (Ctrl K) to find a task.</p>
      )}

      {view === "all" && visible.length > 0 ? (
        <div className="table-card">
          <Table responsive hover className="management-table" aria-label="All tasks">
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
                  <td>
                    <span className={"priority-chip p" + task.priority}>P{task.priority}</span>
                  </td>
                  <td>{projectName(task)}</td>
                  <td>
                    <button
                      className={"status-badge" + (task.completed ? " done" : "")}
                      disabled={pendingIds.includes(task.id)}
                      onClick={() => taskActions.onToggle(task)}
                      aria-label={(task.completed ? "Reopen " : "Complete ") + task.title}
                    >
                      {task.completed ? "Completed" : "To do"}
                    </button>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-button small"
                        aria-label={"Edit " + task.title}
                        onClick={() => taskActions.onEdit(task)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-button small"
                        aria-label={"Delete " + task.title}
                        onClick={() => taskActions.onDelete(task)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : groups && groups.length ? (
        groups.map(([title, list]) => (
          <section key={title} className="date-group">
            <h2 className={title === "Overdue" ? "overdue" : ""}>
              {title}
              <span className="count">{list.length}</span>
            </h2>
            <TaskGrid tasks={list} actions={taskActions} />
          </section>
        ))
      ) : (
        <TaskGrid
          tasks={visible}
          actions={taskActions}
          emptyTitle={emptyTitle}
          emptyText={emptyText}
        />
      )}

      {config.preset && (
        <button className="column-add wide" onClick={() => newTask(config.preset())}>
          + Add task
        </button>
      )}
    </>
  );
}
