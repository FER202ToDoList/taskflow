import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
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
import { taskSchema } from "../utils/validation";

export default function TaskEditor({ task, onClose, onSaved }) {
  const dispatch = useDispatch();
  const projects = useSelector((s) => s.app.projects);
  const [error, setError] = useState("");
  const form = useFormik({
    initialValues: { ...blankTask, ...task },
    validationSchema: taskSchema,
    onSubmit: async (values) => {
      setError("");
      try {
        const { title, description, due_date, priority, project_id, completed } = values;
        await dispatch(
          saveTask({
            id: task.id,
            title: title.trim(),
            description,
            due_date,
            completed,
            priority: Number(priority),
            project_id: project_id || null,
          }),
        ).unwrap();
        onSaved(task.id ? "Task updated." : "Task added.");
        onClose();
      } catch (message) {
        // Keep the form open with the user's input so they can retry.
        setError(message);
      }
    },
  });
  const fieldProps = (name) => ({
    name,
    value: form.values[name] || "",
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    isInvalid: Boolean(form.touched[name] && form.errors[name]),
  });
  const close = () => {
    if (!form.isSubmitting) onClose();
  };

  return (
    <Modal show onHide={close} centered backdrop={form.isSubmitting ? "static" : true}>
      <Form noValidate onSubmit={form.handleSubmit} aria-busy={form.isSubmitting}>
        <Modal.Header closeButton={!form.isSubmitting}>
          <Modal.Title>{task.id ? "Edit task" : "New task"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <fieldset disabled={form.isSubmitting} className="editor-body">
            <Form.Group controlId="task-title">
              <Form.Label>Task title</Form.Label>
              <Form.Control
                {...fieldProps("title")}
                autoFocus
                maxLength={200}
                placeholder="What needs doing?"
              />
              <Form.Control.Feedback type="invalid">{form.errors.title}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="task-description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                {...fieldProps("description")}
                as="textarea"
                rows={3}
                maxLength={2000}
                placeholder="Add a few details (optional)"
              />
              <Form.Control.Feedback type="invalid">
                {form.errors.description}
              </Form.Control.Feedback>
            </Form.Group>
            <div className="editor-row">
              <Form.Group controlId="task-due_date">
                <Form.Label>Due date</Form.Label>
                <Form.Control {...fieldProps("due_date")} type="date" />
                <Form.Control.Feedback type="invalid">
                  {form.errors.due_date}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="task-project_id">
                <Form.Label>Project</Form.Label>
                <Form.Select {...fieldProps("project_id")}>
                  <option value="">Inbox</option>
                  {projects.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div role="group" aria-labelledby="priority-label">
              <div className="form-label" id="priority-label">
                Priority
              </div>
              <ToggleButtonGroup
                type="radio"
                name="priority"
                className="priority-picker"
                value={Number(form.values.priority)}
                onChange={(value) => form.setFieldValue("priority", value)}
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
          </fieldset>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" type="button" disabled={form.isSubmitting} onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.isSubmitting}>
            {form.isSubmitting ? "Saving…" : task.id ? "Save changes" : "Add task"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
