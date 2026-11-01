import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Alert, Button, Form } from "react-bootstrap";
import { ArrowRight, Check, CheckCheck } from "lucide-react";
import { login, register } from "../store";
import ThemeToggle from "../components/ThemeToggle";

const DEMO = { email: "demo@taskflow.local", password: "Demo123!" };

const preview = [
  ["Today", [["P1", "Finish the React assignment"], ["P2", "Plan the week ahead"]]],
  ["Upcoming", [["P2", "Prepare the presentation"], ["P3", "Practice Redux and Axios"]]],
  ["Done", [["P4", "Set up my workspace"]]],
];

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [fields, setFields] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key) => (e) => setFields({ ...fields, [key]: e.target.value });

  async function submit(event, demo = false) {
    event?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const action = demo
        ? login(DEMO)
        : isRegister
          ? register(fields)
          : login({ email: fields.email, password: fields.password });
      await dispatch(action).unwrap();
      navigate("/board");
    } catch (message) {
      setError(message);
    } finally {
      setBusy(false);
    }
  }

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
            Drag tasks between Today, Upcoming and Done. Group them into projects and
            see what matters at a glance.
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
          <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
          <p className="text-muted-soft">
            {isRegister ? "It takes less than a minute." : "Log in to open your board."}
          </p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={submit} className="auth-form">
            {isRegister && (
              <Form.Group controlId="auth-name">
                <Form.Label>Your name</Form.Label>
                <Form.Control required maxLength={80} value={fields.name} onChange={set("name")} />
              </Form.Group>
            )}
            <Form.Group controlId="auth-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                placeholder="you@example.com"
                value={fields.email}
                onChange={set("email")}
              />
            </Form.Group>
            <Form.Group controlId="auth-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={fields.password}
                onChange={set("password")}
              />
            </Form.Group>
            <Button type="submit" className="w-100 auth-submit" disabled={busy}>
              {busy ? "Please wait…" : isRegister ? "Create account" : "Log in"}
              <ArrowRight size={17} />
            </Button>
          </Form>
          <button className="demo-button" disabled={busy} onClick={() => submit(null, true)}>
            Explore the demo workspace
          </button>
          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to Taskflow?"}{" "}
            <button
              className="link-button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
            >
              {isRegister ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
