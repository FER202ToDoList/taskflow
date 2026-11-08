import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router";
import { Dropdown } from "react-bootstrap";
import { CheckCheck, LogOut, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { setQuery, signedOut } from "../store";
import { localDay } from "../utils/tasks";
import ThemeToggle from "./ThemeToggle";
import TaskFilters from "./TaskFilters";

// Plain button used as a Dropdown toggle, so it does not inherit Bootstrap's .btn padding.
function MenuButton({ className = "", ...props }) {
  return <button type="button" {...props} className={className + " no-caret"} />;
}

export default function TopBar({ onNewTask, onOpenGuide }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const { user, tasks } = useSelector((s) => s.app);
  const { query, priority, sort } = useSelector((s) => s.ui);

  const today = localDay();
  const open = tasks.filter((t) => !t.completed);
  const links = [
    ["/board", "Board", 0],
    ["/tasks", "All tasks", open.length],
    ["/today", "Today", open.filter((t) => t.due_date && t.due_date <= today).length],
    ["/inbox", "Inbox", open.filter((t) => !t.project_id).length],
    ["/upcoming", "Upcoming", open.filter((t) => t.due_date > today).length],
    ["/completed", "Completed", tasks.length - open.length],
  ];

  // Ctrl+K / Cmd+K jumps to the search box.
  useEffect(() => {
    function shortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  // The All tasks page filters its own table; other pages switch to Search.
  function search(value) {
    dispatch(setQuery(value));
    if (!["/search", "/tasks"].includes(location.pathname)) navigate("/search");
  }

  function logout() {
    dispatch(signedOut());
    navigate("/login");
  }

  return (
    <header className="topbar">
      <NavLink to="/board" className="brand" aria-label="Taskflow board">
        <span className="brand-mark">
          <CheckCheck size={17} strokeWidth={2.6} />
        </span>
        taskflow
      </NavLink>

      <nav className="view-tabs" aria-label="Views">
        {links.map(([to, label, count]) => (
          <NavLink key={to} to={to} className="view-tab" data-tour={to === "/tasks" ? "all-tasks" : undefined}>
            {label}
            {count > 0 && <span className="tab-count">{count}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="topbar-right">
        <label className="search-field" data-tour="search">
          <Search size={17} aria-hidden="true" />
          <input
            ref={searchRef}
            placeholder="Search tasks…"
            aria-label="Search tasks"
            value={query}
            onChange={(e) => search(e.target.value)}
          />
          {query ? (
            <button
              className="clear-search"
              aria-label="Clear search"
              onClick={() => dispatch(setQuery(""))}
            >
              <X size={15} />
            </button>
          ) : (
            <kbd>Ctrl K</kbd>
          )}
        </label>

        <div className="topbar-actions">
          <Dropdown align="end" autoClose="outside">
            <Dropdown.Toggle
              as={MenuButton}
              className={"icon-button" + (priority || sort !== "date" ? " active" : "")}
              aria-label="View options"
              title="Filter and sort"
            >
              <SlidersHorizontal size={18} />
            </Dropdown.Toggle>
            <Dropdown.Menu className="view-menu">
              <TaskFilters idPrefix="menu" />
            </Dropdown.Menu>
          </Dropdown>

          <ThemeToggle />

          <button className="accent-button" data-tour="new-task" onClick={onNewTask}>
            <Plus size={17} strokeWidth={2.6} />
            <span>New task</span>
          </button>

          <Dropdown align="end">
            <Dropdown.Toggle as={MenuButton} className="avatar" aria-label="Account menu">
              {user?.name?.slice(0, 1).toUpperCase() || "T"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Header>
                <strong>{user?.name}</strong>
                <div>{user?.email}</div>
              </Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item as="button" onClick={onOpenGuide}>Hướng dẫn sử dụng</Dropdown.Item>
              <Dropdown.Item as="button" onClick={logout}>
                <LogOut size={15} /> Log out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
