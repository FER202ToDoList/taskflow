import { useState } from "react";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { Check } from "lucide-react";
import { addProject } from "../store";
import { projectSchema } from "../utils/validation";

const colors = [
  "#4073d6",
  "#45a478",
  "#ac73c8",
  "#e09c38",
  "#dc4c3e",
  "#70818e",
];
export default function ProjectEditor({ onClose, onSaved }) {
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const form = useFormik({
    initialValues: { name: "", color: colors[0] },
    validationSchema: projectSchema,
    onSubmit: async (values) => {
      setError("");
      try {
        await dispatch(
          addProject({ ...values, name: values.name.trim() }),
        ).unwrap();
        onSaved("Project added.");
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
    <Modal
      show
      onHide={close}
      centered
      backdrop={form.isSubmitting ? "static" : true}
    >
      <Form
        noValidate
        onSubmit={form.handleSubmit}
        aria-busy={form.isSubmitting}
      >
        <Modal.Header closeButton={!form.isSubmitting}>
          <Modal.Title>A new project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <fieldset disabled={form.isSubmitting}>
            <Form.Label htmlFor="project-name">Project name</Form.Label>
            <Form.Control
              id="project-name"
              name="name"
              autoFocus
              maxLength={60}
              placeholder="e.g. My next big idea"
              value={form.values.name}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              isInvalid={Boolean(form.touched.name && form.errors.name)}
            />
            <Form.Control.Feedback type="invalid">
              {form.errors.name}
            </Form.Control.Feedback>
            <Form.Label className="mt-3">Color</Form.Label>
            <div
              className="color-options"
              role="group"
              aria-label="Project color"
            >
              {colors.map((color) => (
                <button
                  type="button"
                  key={color}
                  aria-label={color}
                  aria-pressed={form.values.color === color}
                  className={form.values.color === color ? "chosen" : ""}
                  style={{ background: color }}
                  onClick={() => form.setFieldValue("color", color)}
                >
                  {form.values.color === color && <Check size={15} />}
                </button>
              ))}
              <input
                type="color"
                aria-label="Custom project color"
                value={form.values.color}
                onChange={(e) => form.setFieldValue("color", e.target.value)}
              />
            </div>
          </fieldset>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" disabled={form.isSubmitting} onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.isSubmitting}>
            {form.isSubmitting ? "Saving…" : "Add project"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
