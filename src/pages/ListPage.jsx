import { useSelector } from "react-redux";
import { useOutletContext } from "react-router";
import PageHeader from "../components/PageHeader";
import TaskGrid from "../components/TaskGrid";
import { addDays, filterAndSort, formatDay, localDay } from "../utils/tasks";

const VIEWS = {
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
    empty: ["No finished tasks yet", "Tick off a task and it will show up here."],
  },
  search: {
    title: "Search",
    eyebrow: "Results update as you type",
    pick: () => true,
    empty: ["No matching tasks", "Try another word or clear the filters."],
  },
};

export default function ListPage({ view }) {
  const { taskActions, newTask } = useOutletContext();
  const tasks = useSelector((s) => s.workspace.tasks);
  const ui = useSelector((s) => s.ui);
  const config = VIEWS[view];
  const today = localDay();
  const visible = filterAndSort(
    tasks.filter((t) => config.pick(t, today)),
    view === "search" ? ui : { ...ui, query: "" },
  );
  const [emptyTitle, emptyText] = config.empty;

  // Upcoming tasks are grouped by their due date.
  const groups =
    view === "upcoming"
      ? [...new Set(visible.map((t) => t.due_date))].map((day) => ({
          day,
          tasks: visible.filter((t) => t.due_date === day),
        }))
      : null;

  return (
    <>
      <PageHeader eyebrow={config.eyebrow} title={config.title}>
        <span className="title-count">{visible.length}</span>
      </PageHeader>
      {view === "search" && !ui.query && (
        <p className="hint">Type in the search box above (Ctrl K) to find a task.</p>
      )}
      {groups && groups.length ? (
        groups.map((group) => (
          <section key={group.day} className="date-group">
            <h2>
              {formatDay(group.day, { weekday: "long", month: "long", day: "numeric" })}
              <span className="count">{group.tasks.length}</span>
            </h2>
            <TaskGrid tasks={group.tasks} actions={taskActions} />
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
