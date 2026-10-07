import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("taskflow-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
export const errorText = (error) =>
  error.response?.data?.message ||
  "Cannot connect to the server. Make sure npm run dev is running.";
