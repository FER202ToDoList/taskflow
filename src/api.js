import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("taskflow-token");
  if (token && !config.headers.Authorization)
    config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url.includes("/auth/login")
    )
      window.dispatchEvent(new Event("session-expired"));
    return Promise.reject(error);
  },
);
export const errorText = (error) => {
  const message = error.response?.data?.message;
  return Array.isArray(message)
    ? message.join(" ")
    : message ||
        "Cannot connect to the backend. Check that the NestJS server is running.";
};
