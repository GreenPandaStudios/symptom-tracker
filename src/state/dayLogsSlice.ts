import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ActivityLevel, DayLog, OverallFeeling } from "../types";

type ItemListKind = "symptom" | "food";

export type DayLogsState = {
  byDate: Record<string, DayLog>;
};

const initialState: DayLogsState = {
  byDate: {},
};

const ensureDay = (state: DayLogsState, date: string): DayLog => {
  if (!state.byDate[date]) {
    state.byDate[date] = {
      date,
      symptomIds: [],
      foodIds: [],
    };
  }
  return state.byDate[date];
};

const dayLogsSlice = createSlice({
  name: "dayLogs",
  initialState,
  reducers: {
    setOverallFeeling: (
      state,
      action: PayloadAction<{ date: string; overallFeeling?: OverallFeeling }>
    ) => {
      const day = ensureDay(state, action.payload.date);
      day.overallFeeling = action.payload.overallFeeling;
    },
    setActivityLevel: (
      state,
      action: PayloadAction<{ date: string; activityLevel?: ActivityLevel }>
    ) => {
      const day = ensureDay(state, action.payload.date);
      day.activityLevel = action.payload.activityLevel;
    },
    addItemToDay: (
      state,
      action: PayloadAction<{
        date: string;
        itemId: string;
        kind: ItemListKind;
      }>
    ) => {
      const day = ensureDay(state, action.payload.date);
      const key = action.payload.kind === "symptom" ? "symptomIds" : "foodIds";
      const list = day[key];
      if (!list.includes(action.payload.itemId)) {
        list.push(action.payload.itemId);
      }
    },
    removeItemFromDay: (
      state,
      action: PayloadAction<{
        date: string;
        itemId: string;
        kind: ItemListKind;
      }>
    ) => {
      const day = ensureDay(state, action.payload.date);
      const key = action.payload.kind === "symptom" ? "symptomIds" : "foodIds";
      const list = day[key];
      const idx = list.indexOf(action.payload.itemId);
      if (idx >= 0) list.splice(idx, 1);
    },
  },
});

export const {
  setOverallFeeling,
  setActivityLevel,
  addItemToDay,
  removeItemFromDay,
} = dayLogsSlice.actions;

export default dayLogsSlice.reducer;
