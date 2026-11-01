import { useSelector } from "react-redux";
import { Navigate, useOutletContext, useParams } from "react-router";
import { Pencil, Trash2 } from "lucide-react";
import BoardColumn from "../components/BoardColumn";
import PageHeader from "../components/PageHeader";
import { boardColumns, filterAndSort, formatDay, localDay } from "../utils/tasks";

// The main board, also used for a single project's board (/project/:id).
export default function BoardPage() {
  const { id } = useParams();
  const { taskActions, newTask, moveTask, editProject, removeProject } = useOutletContext();
  const { tasks, projects } = useSelector((s) => s.workspace);
  const ui = useSelector((s) => s.ui);
  const project = projects.find((p) => p.id === id);
  if (id && !project) return <Navigate to="/board" replace />;

  const today = localDay();
  const scope = filterAndSort(
    id ? tasks.filter((t) => t.project_id === id) : tasks,
    ui,
  );

  function dropTask(taskId, column) {
    const task = tasks.find((t) => t.id === taskId);
    if (task && !column.match(task, today)) moveTask(task, column.onDrop(task));
  }

  return (
    <>
      <PageHeader
        eyebrow={formatDay(today, { weekday: "long", month: "short", day: "numeric" })}
        title={project ? project.name : "Your board"}
      >
        {project && (
          <div className="title-actions">
            <span className="dot large" style={{ background: project.color }} />
            <button
              className="icon-button"
              aria-label={"Edit project " + project.name}
              onClick={() => editProject(project)}
            >
              <Pencil size={16} />
            </button>
            <button
              className="icon-button danger"
              aria-label={"Delete project " + project.name}
              onClick={() => removeProject(project)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </PageHeader>
      <p className="hint">Tip: drag a card to another column to reschedule or finish it.</p>
      <div className="board">
        {boardColumns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            tasks={scope.filter((t) => column.match(t, today))}
            actions={taskActions}
            onDropTask={dropTask}
            onAdd={
              column.newTask
                ? () => newTask({ ...column.newTask(), project_id: id || "" })
                : null
            }
          />
        ))}
      </div>
    </>
  );
}
