// Keep the existing view model stable while using the NestJS API contract.
export const userFromApi = (user) => ({ ...user, name: user.fullName });
export const taskFromApi = (task) => ({
  ...task,
  id: String(task.id),
  completed: task.isCompleted,
  due_date: task.dueDate || "",
  project_id: task.projectId || null,
  created_at: task.createdAt,
  description: task.description || "",
});
export function taskToApi(body) {
  const result = {};
  for (const key of ["title", "description", "priority"])
    if (Object.hasOwn(body, key)) result[key] = body[key];
  if (Object.hasOwn(body, "completed")) result.isCompleted = body.completed;
  if (Object.hasOwn(body, "due_date")) result.dueDate = body.due_date || null;
  if (Object.hasOwn(body, "project_id"))
    result.projectId = body.project_id || null;
  return result;
}
