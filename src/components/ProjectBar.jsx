import { useSelector } from "react-redux";
import { NavLink } from "react-router";
import { Plus } from "lucide-react";

// Row of project chips under the page title; each chip opens that project's board.
export default function ProjectBar({ onAddProject }) {
  const { projects, tasks } = useSelector((s) => s.app);
  return (
    <nav className="project-bar" aria-label="Projects">
      {projects.map((p) => (
        <NavLink key={p.id} to={"/project/" + p.id} className="project-chip">
          <span className="dot" style={{ background: p.color }} />
          {p.name}
          <span className="chip-count">
            {tasks.filter((t) => t.project_id === p.id && !t.completed).length}
          </span>
        </NavLink>
      ))}
      <button className="project-chip add" aria-label="Add project" onClick={onAddProject}>
        <Plus size={15} />
      </button>
    </nav>
  );
}
