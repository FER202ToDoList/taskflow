import { useSelector } from "react-redux";
import { CheckCheck } from "lucide-react";
import TaskCard from "./TaskCard";

// Shows tasks as a responsive grid of cards, or a friendly empty state.
export default function TaskGrid({ tasks, actions, emptyTitle, emptyText }) {
  const projects = useSelector((s) => s.app.projects);
  if (!tasks.length)
    return (
      <div className="empty-state">
        <CheckCheck size={40} />
        <h3>{emptyTitle}</h3>
        <p>{emptyText}</p>
      </div>
    );
  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          project={projects.find((p) => p.id === task.project_id)}
          {...actions}
        />
      ))}
    </div>
  );
}
