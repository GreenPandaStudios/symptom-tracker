import { createSelector } from "@reduxjs/toolkit";
import type { CatalogItem, DayLog } from "../types";
import type { RootState } from "./store";

const emptyDay: DayLog = {
  date: "",
  symptomIds: [],
  foodIds: [],
};

export const selectCatalogItems = (state: RootState) => state.catalog.items;

export const selectCatalogByType = (type: CatalogItem["type"]) =>
  createSelector(selectCatalogItems, (items) =>
    items.filter((item) => item.type === type)
  );

export const selectDayLog =
  (date: string) =>
  (state: RootState): DayLog => {
    return state.dayLogs.byDate[date] ?? { ...emptyDay, date };
  };

export const selectDayItems = (date: string, type: CatalogItem["type"]) =>
  createSelector([selectDayLog(date), selectCatalogItems], (day, items) => {
    const ids = type === "symptom" ? day.symptomIds : day.foodIds;
    const dict = new Map(items.map((item) => [item.id, item]));
    return ids.map((id) => dict.get(id)).filter(Boolean) as CatalogItem[];
  });
