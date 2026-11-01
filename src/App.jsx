import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router";
import { signedOut } from "./store";
import LoginPage from "./pages/LoginPage";
import Workspace from "./pages/Workspace";
import BoardPage from "./pages/BoardPage";
import ListPage from "./pages/ListPage";

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.workspace.token);
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
      <Route path="/login" element={token ? <Navigate to="/board" replace /> : <LoginPage />} />
      <Route element={token ? <Workspace /> : <Navigate to="/login" replace />}>
        <Route path="/board" element={<BoardPage />} />
        <Route path="/project/:id" element={<BoardPage />} />
        <Route path="/inbox" element={<ListPage view="inbox" />} />
        <Route path="/upcoming" element={<ListPage view="upcoming" />} />
        <Route path="/completed" element={<ListPage view="completed" />} />
        <Route path="/search" element={<ListPage view="search" />} />
      </Route>
      <Route path="*" element={<Navigate to="/board" replace />} />
    </Routes>
  );
}
