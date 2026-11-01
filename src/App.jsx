import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router";
import { signedOut } from "./store";
import Auth from "./pages/Auth";
import Workspace from "./pages/Workspace";
import BoardPage from "./pages/BoardPage";
import TaskPage from "./pages/TaskPage";
import TaskDetail from "./pages/TaskDetail";

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.app.token);
  const theme = useSelector((s) => s.ui.theme);

  // Bootstrap 5.3 colour modes: every Bootstrap component follows this attribute.
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  // The Axios interceptor fires this event when the API answers 401.
  useEffect(() => {
    const expired = () => dispatch(signedOut());
    window.addEventListener("session-expired", expired);
    return () => window.removeEventListener("session-expired", expired);
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/board" replace /> : <Auth />} />
      <Route element={token ? <Workspace /> : <Navigate to="/login" replace />}>
        <Route path="/board" element={<BoardPage />} />
        <Route path="/project/:id" element={<BoardPage />} />
        <Route path="/tasks" element={<TaskPage view="all" />} />
        <Route path="/today" element={<TaskPage view="today" />} />
        <Route path="/inbox" element={<TaskPage view="inbox" />} />
        <Route path="/upcoming" element={<TaskPage view="upcoming" />} />
        <Route path="/completed" element={<TaskPage view="completed" />} />
        <Route path="/search" element={<TaskPage view="search" />} />
        <Route path="/task/:id" element={<TaskDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/board" replace />} />
    </Routes>
  );
}
