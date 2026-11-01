import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Button,
  Form,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap";
import { saveTask } from "../store";
import { blankTask } from "../utils/tasks";

export default function TaskEditor({ task, onClose, onSaved }) {
  const dispatch = useDispatch();
  const projects = useSelector((s) => s.workspace.projects);
  const [fields, setFields] = useState({ ...blankTask, ...task });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key) => (e) => setFields({ ...fields, [key]: e.target.value });

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { title, description, due_date, priority, project_id, completed } = fields;
      await dispatch(
        saveTask({
          id: task.id,
          title,
          description,
          due_date,
          completed,
          priority: Number(priority),
          project_id: project_id || null,
        }),
      ).unwrap();
      onSaved?.(task.id ? "Task updated" : "Task added");
      onClose();
    } catch (message) {
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal show onHide={onClose} centered>
      <Form onSubmit={save}>
        <Modal.Header closeButton>
          <Modal.Title>{task.id ? "Edit task" : "New task"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="editor-body">
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group controlId="task-title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              autoFocus
              required
              maxLength={200}
              placeholder="What needs doing?"
              value={fields.title}
              onChange={set("title")}
            />
          </Form.Group>
          <Form.Group controlId="task-description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              maxLength={2000}
              placeholder="Add a few details (optional)"
              value={fields.description}
              onChange={set("description")}
            />
          </Form.Group>
          <div className="editor-row">
            <Form.Group controlId="task-due">
              <Form.Label>Due date</Form.Label>
              <Form.Control type="date" value={fields.due_date} onChange={set("due_date")} />
            </Form.Group>
            <Form.Group controlId="task-project">
              <Form.Label>Project</Form.Label>
              <Form.Select value={fields.project_id || ""} onChange={set("project_id")}>
                <option value="">Inbox</option>
                {projects.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          <div>
            <div className="form-label" id="priority-label">
              Priority
            </div>
            <ToggleButtonGroup
              type="radio"
              name="priority"
              className="priority-picker"
              aria-labelledby="priority-label"
              value={Number(fields.priority)}
              onChange={(value) => setFields({ ...fields, priority: value })}
            >
              {[1, 2, 3, 4].map((n) => (
                <ToggleButton
                  key={n}
                  id={"priority-" + n}
                  value={n}
                  variant="outline-secondary"
                  className={"p" + n}
                >
                  P{n}
                  {n === 1 ? " · High" : ""}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : task.id ? "Save changes" : "Add task"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
