import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router";
import { signedOut } from "./store";
import Auth from "./pages/Auth";
import Workspace from "./pages/Workspace";

export default function App() {
  const token = useSelector((s) => s.app.token),
    dispatch = useDispatch();
  useEffect(() => {
    const expired = () => dispatch(signedOut());
    window.addEventListener("session-expired", expired);
    return () => window.removeEventListener("session-expired", expired);
  }, [dispatch]);
  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/today" replace /> : <Auth />}
      />
      <Route
        path="/*"
        element={token ? <Workspace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
