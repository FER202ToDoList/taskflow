import { configureStore } from "@reduxjs/toolkit";
import workspace from "./workspaceSlice";
import ui from "./uiSlice";

export const store = configureStore({ reducer: { workspace, ui } });

export * from "./workspaceSlice";
export * from "./uiSlice";
