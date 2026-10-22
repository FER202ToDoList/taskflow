export const localDay = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const readableDate = (date) =>
  date
    ? new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";
export const blankTask = {
  title: "",
  description: "",
  due_date: "",
  priority: 4,
  project_id: "",
  completed: false,
};
