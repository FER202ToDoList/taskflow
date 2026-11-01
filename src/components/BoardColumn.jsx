import { useState } from "react";
import { useSelector } from "react-redux";
import TaskCard from "./TaskCard";

export default function BoardColumn({ column, tasks, actions, onDropTask, onAdd }) {
  const projects = useSelector((s) => s.workspace.projects);
  const [over, setOver] = useState(false);

  function drop(event) {
    event.preventDefault();
    setOver(false);
    const id = event.dataTransfer.getData("text/plain");
    if (id) onDropTask(id, column);
  }

  return (
    <section
      className={"board-column" + (over ? " drag-over" : "")}
      aria-label={column.name}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
    >
      <header className="column-header">
        <span className={"column-dot " + column.id} />
        <h2>{column.name}</h2>
        <span className="count">{tasks.length}</span>
      </header>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          project={projects.find((p) => p.id === task.project_id)}
          {...actions}
        />
      ))}
      {!tasks.length && <p className="column-empty">Drop a task here</p>}
      {onAdd && (
        <button className="column-add" onClick={onAdd}>
          + Add task
        </button>
      )}
    </section>
  );
}
