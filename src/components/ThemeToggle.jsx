import { useDispatch, useSelector } from "react-redux";
import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "../store";

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((s) => s.ui.theme);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      className="icon-button theme-toggle"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => dispatch(toggleTheme())}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
