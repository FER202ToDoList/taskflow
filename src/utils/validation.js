import * as Yup from "yup";

export const authSchema = (register) =>
  Yup.object({
    name: register
      ? Yup.string().trim().required("Enter your name.").max(80)
      : Yup.string(),
    email: Yup.string()
      .trim()
      .email("Enter a valid email.")
      .required("Enter your email."),
    password: Yup.string()
      .required("Enter your password.")
      .min(8, "Use at least 8 characters."),
  });

export const taskSchema = Yup.object({
  title: Yup.string().trim().required("Enter a task title.").max(200),
  description: Yup.string().max(2000),
  due_date: Yup.string().test("date", "Choose a valid date.", (value) => {
    if (!value) return true;
    const date = new Date(value);
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }),
  priority: Yup.number().integer().min(1).max(4).required(),
});

export const projectSchema = Yup.object({
  name: Yup.string().trim().required("Enter a project name.").max(60),
  color: Yup.string()
    .matches(/^#[0-9a-f]{6}$/i, "Choose a valid color.")
    .required(),
});
