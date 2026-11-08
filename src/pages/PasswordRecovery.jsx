import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Alert, Button, Form } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { api, errorText } from "../api";

export default function PasswordRecovery({ reset = false }) {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const validToken = /^[a-f0-9]{64}$/.test(token);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const form = useFormik({
    initialValues: { email: "", password: "", confirmation: "" },
    validationSchema: reset
      ? Yup.object({
          password: Yup.string().required("Enter a password.").min(8).max(72),
          confirmation: Yup.string()
            .required("Confirm your password.")
            .oneOf([Yup.ref("password")], "Passwords must match."),
        })
      : Yup.object({
          email: Yup.string()
            .trim()
            .email("Enter a valid email.")
            .required("Enter your email.")
            .max(254),
        }),
    onSubmit: async (values) => {
      setError("");
      try {
        const { data } = await api.post(
          reset ? "/auth/reset-password" : "/auth/forgot-password",
          reset
            ? { token, password: values.password }
            : { email: values.email.trim() },
        );
        setMessage(data.message);
        form.resetForm();
      } catch (e) {
        setError(errorText(e));
      }
    },
  });
  return (
    <main className="auth-page">
      <section
        className="auth-card mx-auto"
        style={{ width: "min(100%, 440px)", marginTop: "8vh" }}
      >
        <h1>{reset ? "Choose a new password" : "Forgot your password?"}</h1>
        <p>
          {reset
            ? "Use 8–72 characters. After saving, log in again."
            : "Enter your account email to request a reset link."}
        </p>
        {message && (
          <Alert variant="success" role="status">
            {message}
          </Alert>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
        {reset && !validToken && (
          <Alert variant="danger">
            This reset link is invalid.{" "}
            <Link to="/forgot-password">Request a new link</Link>.
          </Alert>
        )}
        {!message && (!reset || validToken) && (
          <Form noValidate onSubmit={form.handleSubmit} className="auth-form">
            {(reset ? ["password", "confirmation"] : ["email"]).map((name) => (
              <Form.Group key={name} controlId={"recovery-" + name}>
                <Form.Label>
                  {name === "confirmation"
                    ? "Confirm password"
                    : name === "email"
                      ? "Email"
                      : "New password"}
                </Form.Label>
                <Form.Control
                  type={name === "email" ? "email" : "password"}
                  autoComplete={name === "email" ? "email" : "new-password"}
                  name={name}
                  value={form.values[name]}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  disabled={form.isSubmitting}
                  isInvalid={!!(form.touched[name] && form.errors[name])}
                />
                <Form.Control.Feedback type="invalid">
                  {form.errors[name]}
                </Form.Control.Feedback>
              </Form.Group>
            ))}
            <Button type="submit" disabled={form.isSubmitting}>
              {form.isSubmitting
                ? "Please wait…"
                : reset
                  ? "Save password"
                  : "Send reset link"}
            </Button>
          </Form>
        )}
        <p className="mt-3">
          <Link to="/login">Back to log in</Link>
        </p>
        {reset && error && (
          <Link to="/forgot-password">Request a new reset link</Link>
        )}
      </section>
    </main>
  );
}
