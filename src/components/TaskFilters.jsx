import { useDispatch, useSelector } from "react-redux";
import { Form } from "react-bootstrap";
import { setPriority, setSort, setStatus } from "../store";

// Status (All tasks page only), priority and sort controls, stored in Redux.
export default function TaskFilters({ showStatus = false, idPrefix = "filter" }) {
  const dispatch = useDispatch();
  const { status, priority, sort } = useSelector((s) => s.ui);
  return (
    <div className="task-filters">
      {showStatus && (
        <Form.Group controlId={idPrefix + "-status"}>
          <Form.Label>Status</Form.Label>
          <Form.Select value={status} onChange={(e) => dispatch(setStatus(e.target.value))}>
            <option value="all">All statuses</option>
            <option value="active">To do</option>
            <option value="completed">Completed</option>
          </Form.Select>
        </Form.Group>
      )}
      <Form.Group controlId={idPrefix + "-priority"}>
        <Form.Label>Priority</Form.Label>
        <Form.Select value={priority} onChange={(e) => dispatch(setPriority(e.target.value))}>
          <option value="">All priorities</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              Priority {n}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group controlId={idPrefix + "-sort"}>
        <Form.Label>Sort by</Form.Label>
        <Form.Select value={sort} onChange={(e) => dispatch(setSort(e.target.value))}>
          <option value="date">Due date</option>
          <option value="priority">Priority</option>
          <option value="name">Task name</option>
        </Form.Select>
      </Form.Group>
    </div>
  );
}
