import {
  configureStore,
  createSlice,
  createAsyncThunk,
  isAnyOf,
} from "@reduxjs/toolkit";
import { api, errorText } from "./api";

const TOKEN_KEY = "taskflow-token";
const THEME_KEY = "taskflow-theme";

// Wraps an API call so a failed request rejects with a readable message.
const apiThunk = (type, request) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await request(arg);
    } catch (e) {
      return rejectWithValue(errorText(e));
    }
  });

// ---- Auth ----
export const login = apiThunk("auth/login", async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
});
export const register = apiThunk("auth/register", async (fields) => {
  const { data } = await api.post("/auth/register", fields);
  return data;
});

// ---- Workspace (tasks + projects + current user) ----
export const loadWorkspace = apiThunk("workspace/load", async () => {
  const [tasks, projects, user] = await Promise.all([
    api.get("/tasks"),
    api.get("/projects"),
    api.get("/auth/me"),
  ]);
  return { tasks: tasks.data, projects: projects.data, user: user.data };
});

// ---- Tasks ----
// saveTask creates a task when there is no id, otherwise sends a (partial) PATCH.
export const saveTask = apiThunk("tasks/save", async ({ id, ...body }) => {
  const { data } = id
    ? await api.patch(`/tasks/${id}`, body)
    : await api.post("/tasks", body);
  return data;
});
export const toggleTask = apiThunk("tasks/toggle", async (task) => {
  const { data } = await api.patch(`/tasks/${task.id}`, {
    completed: !task.completed,
  });
  return data;
});
export const deleteTask = apiThunk("tasks/delete", async (id) => {
  await api.delete(`/tasks/${id}`);
  return id;
});

// ---- Projects ----
// saveProject creates a project when there is no id, otherwise renames/recolours it.
export const saveProject = apiThunk("projects/save", async ({ id, ...body }) => {
  const { data } = id
    ? await api.patch(`/projects/${id}`, body)
    : await api.post("/projects", body);
  return data;
});
export const deleteProject = apiThunk("projects/delete", async (id) => {
  await api.delete(`/projects/${id}`);
  return id;
});

const signIn = (state, { payload }) => {
  localStorage.setItem(TOKEN_KEY, payload.token);
  state.token = payload.token;
  state.user = payload.user;
  state.error = "";
};

const upsert = (list, item) => {
  const index = list.findIndex((x) => x.id === item.id);
  if (index === -1) list.push(item);
  else list[index] = item;
};

// Data that comes from the API.
const slice = createSlice({
  name: "app",
  initialState: {
    token: localStorage.getItem(TOKEN_KEY) || "",
    user: null,
    tasks: [],
    projects: [],
    loading: false,
    error: "",
  },
  reducers: {
    signedOut(state) {
      localStorage.removeItem(TOKEN_KEY);
      state.token = "";
      state.user = null;
      state.tasks = [];
      state.projects = [];
      state.error = "";
    },
    clearError(state) {
      state.error = "";
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(login.fulfilled, signIn)
      .addCase(register.fulfilled, signIn)
      .addCase(loadWorkspace.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(loadWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(loadWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, { payload: id }) => {
        state.tasks = state.tasks.filter((t) => t.id !== id);
      })
      .addCase(saveProject.fulfilled, (state, { payload }) => {
        upsert(state.projects, payload);
      })
      .addCase(deleteProject.fulfilled, (state, { payload: id }) => {
        state.projects = state.projects.filter((p) => p.id !== id);
        // Same as the backend: tasks of a deleted project move to Inbox.
        state.tasks.forEach((t) => {
          if (t.project_id === id) t.project_id = null;
        });
      })
      .addMatcher(
        isAnyOf(saveTask.fulfilled, toggleTask.fulfilled),
        (state, { payload }) => upsert(state.tasks, payload),
      ),
});

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
    status: "all",
    priority: "",
    sort: "date",
  },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, state.theme);
      } catch {
        // Storage blocked: the theme still works for this visit.
      }
    },
    setQuery(state, action) {
      state.query = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setPriority(state, action) {
      state.priority = action.payload;
    },
    setSort(state, action) {
      state.sort = action.payload;
    },
  },
});

export const { signedOut, clearError } = slice.actions;
export const { toggleTheme, setQuery, setStatus, setPriority, setSort } =
  uiSlice.actions;
export const store = configureStore({
  reducer: { app: slice.reducer, ui: uiSlice.reducer },
});
