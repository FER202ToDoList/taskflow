import {
  configureStore,
  createSlice,
  createAsyncThunk,
  isAnyOf,
} from "@reduxjs/toolkit";
import { api, errorText } from "./api";

const TOKEN_KEY = "taskflow-token";

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
export const addProject = apiThunk("projects/add", async (project) => {
  const { data } = await api.post("/projects", project);
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
      .addCase(addProject.fulfilled, (state, { payload }) => {
        state.projects.push(payload);
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
        (state, { payload }) => {
          const index = state.tasks.findIndex((t) => t.id === payload.id);
          if (index === -1) state.tasks.push(payload);
          else state.tasks[index] = payload;
        },
      ),
});

export const { signedOut, clearError } = slice.actions;
export const store = configureStore({ reducer: { app: slice.reducer } });
