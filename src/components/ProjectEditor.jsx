import { useState } from "react";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { Check } from "lucide-react";
import { saveProject } from "../store";
import { projectSchema } from "../utils/validation";

const colors = ["#4073d6", "#45a478", "#ac73c8", "#e09c38", "#dc4c3e", "#70818e"];

// Used for both "new project" and "edit project" (when a project is passed in).
export default function ProjectEditor({ project, onClose, onSaved }) {
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const form = useFormik({
    initialValues: { name: project?.name || "", color: project?.color || colors[0] },
    validationSchema: projectSchema,
    onSubmit: async (values) => {
      setError("");
      try {
        const saved = await dispatch(
          saveProject({ id: project?.id, ...values, name: values.name.trim() }),
        ).unwrap();
        onSaved(saved, project ? "Project updated." : "Project added.");
        onClose();
      } catch (message) {
        setError(message);
      }
    },
  });
  const close = () => {
    if (!form.isSubmitting) onClose();
  };

  return (
    <Modal show onHide={close} centered backdrop={form.isSubmitting ? "static" : true}>
      <Form noValidate onSubmit={form.handleSubmit} aria-busy={form.isSubmitting}>
        <Modal.Header closeButton={!form.isSubmitting}>
          <Modal.Title>{project ? "Edit project" : "New project"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <fieldset disabled={form.isSubmitting} className="editor-body">
            <Form.Group controlId="project-name">
              <Form.Label>Project name</Form.Label>
              <Form.Control
                name="name"
                autoFocus
                maxLength={60}
                placeholder="e.g. Final exam prep"
                value={form.values.name}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                isInvalid={Boolean(form.touched.name && form.errors.name)}
              />
              <Form.Control.Feedback type="invalid">{form.errors.name}</Form.Control.Feedback>
            </Form.Group>
            <div>
              <div className="form-label">Color</div>
              <div className="color-options" role="group" aria-label="Project color">
                {colors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    aria-label={color}
                    aria-pressed={form.values.color === color}
                    style={{ background: color }}
                    onClick={() => form.setFieldValue("color", color)}
                  >
                    {form.values.color === color && <Check size={16} />}
                  </button>
                ))}
                <input
                  type="color"
                  aria-label="Custom project color"
                  value={form.values.color}
                  onChange={(e) => form.setFieldValue("color", e.target.value)}
                />
              </div>
            </div>
          </fieldset>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" disabled={form.isSubmitting} onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.isSubmitting}>
            {form.isSubmitting ? "Saving…" : project ? "Save project" : "Add project"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
