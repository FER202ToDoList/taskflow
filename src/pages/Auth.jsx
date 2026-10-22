import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Form, Button, Alert } from "react-bootstrap";
import { CheckCheck, ArrowRight } from "lucide-react";
import { useFormik } from "formik";
import { authSchema } from "../utils/validation";
import { login, register as registerUser } from "../store";

export default function Auth() {
  const [register, setRegister] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch(),
    navigate = useNavigate();
  async function authenticate(values, demo = false) {
    setError("");
    try {
      const action =
        register && !demo
          ? registerUser({
              ...values,
              name: values.name.trim(),
              email: values.email.trim(),
            })
          : login({ email: values.email.trim(), password: values.password });
      await dispatch(action).unwrap();
      navigate("/today");
    } catch (message) {
      setError(message);
    }
  }
  const form = useFormik({
    initialValues: { name: "", email: "", password: "" },
    validationSchema: authSchema(register),
    onSubmit: (values) => authenticate(values),
  });
  const busy = demoBusy || form.isSubmitting;
  const fieldProps = (name) => ({
    name,
    value: form.values[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    disabled: busy,
    isInvalid: Boolean(form.touched[name] && form.errors[name]),
  });
  async function demoLogin() {
    setDemoBusy(true);
    try {
      await authenticate(
        { email: "demo@taskflow.local", password: "Demo123!" },
        true,
      );
    } finally {
      setDemoBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="brand-mark">
          <CheckCheck size={23} />
        </span>
        taskflow
      </div>
      <div className="auth-grid">
        <section>
          <div className="auth-eyebrow">MAKE ROOM FOR WHAT MATTERS</div>
          <h1>
            A little focus.
            <br />A lighter day.
          </h1>
          <p>
            Bring your tasks, plans and ideas together.
            <br />
            One clear list. One small step at a time.
          </p>
          <div className="auth-preview">
            <div>
              <span className="mini-dot" />
              Your day, simplified<span className="mini-date">Today</span>
            </div>
            <p>
              <span className="mini-check">✓</span>Finish that one important
              thing
            </p>
            <p>
              <span className="mini-circle" />
              Make time for yourself
            </p>
            <p>
              <span className="mini-circle" />
              Start something new
            </p>
            <span className="mini-progress">
              A good day starts with a little clarity.
            </span>
          </div>
        </section>
        <div className="auth-card">
          <h2>{register ? "Create your account" : "Welcome back"}</h2>
          <p>
            {register
              ? "Your fresh start is right here."
              : "Let’s make today a good one."}
          </p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form noValidate onSubmit={form.handleSubmit}>
            {register && (
              <Form.Group className="mb-3" controlId="auth-name">
                <Form.Label>Your name</Form.Label>
                <Form.Control required maxLength={80} {...fieldProps("name")} />
                <Form.Control.Feedback type="invalid">
                  {form.errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="auth-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                placeholder="you@example.com"
                {...fieldProps("email")}
              />
              <Form.Control.Feedback type="invalid">
                {form.errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-4" controlId="auth-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                {...fieldProps("password")}
              />
              <Form.Control.Feedback type="invalid">
                {form.errors.password}
              </Form.Control.Feedback>
            </Form.Group>
            <Button className="auth-submit" type="submit" disabled={busy}>
              {busy ? "Please wait…" : register ? "Create account" : "Log in"}
              <ArrowRight size={17} />
            </Button>
          </Form>
          <button className="demo-button" disabled={busy} onClick={demoLogin}>
            Explore the demo workspace
          </button>
          <p className="auth-switch">
            {register ? "Already have an account?" : "New to Taskflow?"}{" "}
            <button
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
      <footer className="auth-footer">
        A personal productivity app · Built for your everyday
      </footer>
    </div>
  );
}
