// Dates are stored as "YYYY-MM-DD" strings in the user's local time.
export function localDay(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(n) {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return localDay(date);
}

export function formatDay(day, options = { month: "short", day: "numeric" }) {
  return day ? new Date(day + "T12:00:00").toLocaleDateString("en-US", options) : "";
}

export function dueLabel(day) {
  const today = localDay();
  if (!day) return "No date";
  if (day === today) return "Today";
  if (day === addDays(1)) return "Tomorrow";
  if (day < today) return "Overdue · " + formatDay(day);
  return formatDay(day, { weekday: "short", month: "short", day: "numeric" });
}

export const blankTask = {
  title: "",
  description: "",
  due_date: "",
  priority: 4,
  project_id: "",
  completed: false,
};

// Applies the search text, priority filter and sort order from the ui slice.
export function filterAndSort(tasks, { query = "", priority = "", sort = "date" }) {
  const text = query.trim().toLowerCase();
  const visible = tasks.filter(
    (t) =>
      (!text || `${t.title} ${t.description}`.toLowerCase().includes(text)) &&
      (!priority || t.priority === Number(priority)),
  );
  const compare = {
    priority: (a, b) => a.priority - b.priority,
    name: (a, b) => a.title.localeCompare(b.title),
    date: (a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"),
  };
  return [...visible].sort(compare[sort] || compare.date);
}

// The four board columns and what dropping a task into each one changes.
export const boardColumns = [
  {
    id: "today",
    name: "Today",
    match: (t, today) => !t.completed && t.due_date && t.due_date <= today,
    onDrop: () => ({ completed: false, due_date: localDay() }),
    newTask: () => ({ due_date: localDay() }),
  },
  {
    id: "upcoming",
    name: "Upcoming",
    match: (t, today) => !t.completed && t.due_date > today,
    onDrop: (t) => ({
      completed: false,
      due_date: t.due_date > localDay() ? t.due_date : addDays(1),
    }),
    newTask: () => ({ due_date: addDays(1) }),
  },
  {
    id: "someday",
    name: "No date",
    match: (t) => !t.completed && !t.due_date,
    onDrop: () => ({ completed: false, due_date: "" }),
    newTask: () => ({ due_date: "" }),
  },
  {
    id: "done",
    name: "Done",
    match: (t) => t.completed,
    onDrop: () => ({ completed: true }),
  },
];
