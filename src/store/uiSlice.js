import { createSlice } from "@reduxjs/toolkit";

const THEME_KEY = "taskflow-theme";

function savedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

// Interface state shared by several components: theme, search and view options.
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    theme: savedTheme(),
    query: "",
    priority: "",
    sort: "date",
  },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, state.theme);
      } catch {
        // Private mode: the theme still works for this visit.
      }
    },
    setQuery(state, action) {
      state.query = action.payload;
    },
    setPriority(state, action) {
      state.priority = action.payload;
    },
    setSort(state, action) {
      state.sort = action.payload;
    },
  },
});

export const { toggleTheme, setQuery, setPriority, setSort } = uiSlice.actions;
export default uiSlice.reducer;
