import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import { Form, Button, Alert } from "react-bootstrap";
import { ArrowRight, Check, CheckCheck } from "lucide-react";
import { useFormik } from "formik";
import { authSchema } from "../utils/validation";
import { login, register as registerUser } from "../store";
import ThemeToggle from "../components/ThemeToggle";

// Small static board shown next to the form.
const preview = [
  ["Today", [["P1", "Finish the React assignment"], ["P2", "Plan the week ahead"]]],
  ["Upcoming", [["P2", "Prepare the presentation"], ["P3", "Practice Redux and Axios"]]],
  ["Done", [["P4", "Set up my workspace"]]],
];

export default function Auth() {
  const [register, setRegister] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function authenticate(values) {
    setError("");
    try {
      const action =
        register
          ? registerUser({ ...values, name: values.name.trim(), email: values.email.trim() })
          : login({ email: values.email.trim(), password: values.password });
      await dispatch(action).unwrap();
      navigate("/board");
    } catch (message) {
      setError(message);
    }
  }

  const form = useFormik({
    initialValues: { name: "", email: "", password: "" },
    validationSchema: authSchema(register),
    onSubmit: (values) => authenticate(values),
  });
  const busy = form.isSubmitting;
  const fieldProps = (name) => ({
    name,
    value: form.values[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    disabled: busy,
    isInvalid: Boolean(form.touched[name] && form.errors[name]),
  });

  return (
    <div className="auth-page">
      <header className="auth-top">
        <span className="brand">
          <span className="brand-mark">
            <CheckCheck size={17} strokeWidth={2.6} />
          </span>
          taskflow
        </span>
        <ThemeToggle />
      </header>

      <div className="auth-grid">
        <section className="auth-intro">
          <div className="eyebrow">Plan · Focus · Finish</div>
          <h1>Your week, on one calm board.</h1>
          <p>
            Drag tasks between Today, Upcoming and Done. Group them into projects and see what
            matters at a glance.
          </p>
          <div className="mini-board" aria-hidden="true">
            {preview.map(([name, items]) => (
              <div key={name} className="mini-column">
                <div className="mini-head">{name}</div>
                {items.map(([prio, title]) => (
                  <div key={title} className={"mini-card" + (name === "Done" ? " done" : "")}>
                    <span className={"priority-chip " + prio.toLowerCase()}>{prio}</span>
                    <span>{title}</span>
                    {name === "Done" && <Check size={14} strokeWidth={3} />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <div className="auth-card">
          <h2>{register ? "Create your account" : "Welcome back"}</h2>
          <p className="text-muted-soft">
            {register ? "It takes less than a minute." : "Log in to open your board."}
          </p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form noValidate onSubmit={form.handleSubmit} className="auth-form">
            {register && (
              <Form.Group controlId="auth-name">
                <Form.Label>Your name</Form.Label>
                <Form.Control maxLength={80} {...fieldProps("name")} />
                <Form.Control.Feedback type="invalid">{form.errors.name}</Form.Control.Feedback>
              </Form.Group>
            )}
            <Form.Group controlId="auth-email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="you@example.com" {...fieldProps("email")} />
              <Form.Control.Feedback type="invalid">{form.errors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="auth-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="At least 8 characters"
                {...fieldProps("password")}
              />
              <Form.Control.Feedback type="invalid">
                {form.errors.password}
              </Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" className="auth-submit" disabled={busy}>
              {busy ? "Please wait…" : register ? "Create account" : "Log in"}
              <ArrowRight size={17} />
            </Button>
          </Form>
          {!register && <Link to="/forgot-password">Forgot password?</Link>}
          <p className="auth-switch">
            {register ? "Already have an account?" : "New to Taskflow?"}{" "}
            <button
              className="link-button"
              disabled={busy}
              onClick={() => {
                form.resetForm();
                setRegister(!register);
                setError("");
              }}
            >
              {register ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
