import { useState } from "react";
import { useDispatch } from "react-redux";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { Check } from "lucide-react";
import { saveProject } from "../store";

const COLORS = ["#4073d6", "#45a478", "#ac73c8", "#e09c38", "#dc4c3e", "#70818e"];

// Used for both "new project" and "edit project" (when a project is passed in).
export default function ProjectEditor({ project, onClose, onSaved }) {
  const dispatch = useDispatch();
  const [name, setName] = useState(project?.name || "");
  const [color, setColor] = useState(project?.color || COLORS[0]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const saved = await dispatch(saveProject({ id: project?.id, name, color })).unwrap();
      onSaved?.(saved, project ? "Project updated" : "Project created");
      onClose();
    } catch (message) {
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal show onHide={onClose} centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title>{project ? "Edit project" : "New project"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="editor-body">
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group controlId="project-name">
            <Form.Label>Project name</Form.Label>
            <Form.Control
              autoFocus
              required
              maxLength={60}
              placeholder="e.g. Final exam prep"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <div>
            <div className="form-label">Color</div>
            <div className="color-options">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  aria-label={"Color " + c}
                  aria-pressed={color === c}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                >
                  {color === c && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {project ? "Save project" : "Create project"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
