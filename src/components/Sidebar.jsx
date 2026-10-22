import { NavLink, useNavigate } from "react-router";
import {
  Plus,
  Search,
  CheckCheck,
  Hash,
  PanelLeft,
  LogOut,
  Trash2,
} from "lucide-react";

export default function Sidebar({
  user,
  projects,
  active,
  links,
  mobile,
  onClose,
  onAddTask,
  onAddProject,
  onDeleteProject,
  onLogout,
}) {
  const navigate = useNavigate();
  return (
    <aside className={"sidebar " + (mobile ? "mobile-open" : "")}>
      <div className="user-heading">
        <span className="avatar">{user?.name?.slice(0, 1) || "T"}</span>
        <strong>{user?.name || "My workspace"}</strong>
        <button
          className="collapse-button mobile-close"
          aria-label="Close sidebar"
          onClick={() => onClose()}
        >
          <PanelLeft size={17} />
        </button>
      </div>
      <button className="sidebar-add" onClick={onAddTask}>
        <span>
          <Plus size={17} />
        </span>
        Add task
      </button>
      <button className="search-link" onClick={() => navigate("/search")}>
        <Search size={19} />
        Search<span>⌘ K</span>
      </button>
      <nav>
        {links.map(([path, label, Icon, count]) => (
          <NavLink
            to={path}
            key={path}
            className={({ isActive }) =>
              "sidebar-link " + (isActive ? "active" : "")
            }
          >
            <Icon size={20} />
            <span>{label}</span>
            <small>{count || ""}</small>
          </NavLink>
        ))}
      </nav>
      <div className="projects-heading">
        <span>My projects</span>
        <button aria-label="Add project" onClick={() => onAddProject()}>
          <Plus size={17} />
        </button>
      </div>
      {projects.map((p) => (
        <div className="project-nav-row" key={p.id}>
          <NavLink
            className={({ isActive }) =>
              "sidebar-link project-link " + (isActive ? "active" : "")
            }
            to={"/project/" + p.id}
          >
            <Hash size={19} color={p.color} />
            <span>{p.name}</span>
            <small>
              {active.filter((t) => t.project_id === p.id).length || ""}
            </small>
          </NavLink>
          <button
            className="project-delete"
            aria-label={"Delete project " + p.name}
            onClick={() =>
              onDeleteProject({ kind: "projects", id: p.id, name: p.name })
            }
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <div className="sidebar-bottom">
        <div className="sidebar-brand">
          <CheckCheck size={19} />
          taskflow<span>personal</span>
        </div>
        <button onClick={onLogout}>
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
