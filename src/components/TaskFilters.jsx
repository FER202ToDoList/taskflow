export default function TaskFilters({
  allTasks,
  status,
  setStatus,
  priority,
  setPriority,
  sort,
  setSort,
}) {
  return (
    <div className="view-options">
      {allTasks && (
        <div className="filter-field">
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="active">To do</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}
      <div className="filter-field">
        <label htmlFor="filter-priority">Priority</label>
        <select
          id="filter-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">All priorities</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              Priority {n}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="filter-sort">Sort by</label>
        <select
          id="filter-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="date">Due date</option>
          <option value="priority">Priority</option>
          <option value="name">Task name</option>
        </select>
      </div>
    </div>
  );
}
