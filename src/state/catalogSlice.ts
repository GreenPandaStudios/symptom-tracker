import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CatalogItem } from "../types";
import { capitalizeWords } from "../utils/text";

export type CatalogState = {
  items: CatalogItem[];
};

const initialState: CatalogState = {
  items: [],
};

const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CatalogItem>) => {
      const normalized = {
        ...action.payload,
        name: capitalizeWords(action.payload.name),
      };
      const exists = state.items.some((item) => item.id === normalized.id);
      if (!exists) {
        state.items.push(normalized);
      }
    },
    upsertItem: (state, action: PayloadAction<CatalogItem>) => {
      const normalized = {
        ...action.payload,
        name: capitalizeWords(action.payload.name),
      };
      const idx = state.items.findIndex((item) => item.id === normalized.id);
      if (idx >= 0) {
        state.items[idx] = normalized;
      } else {
        state.items.push(normalized);
      }
    },
  },
});

export const { addItem, upsertItem } = catalogSlice.actions;
export default catalogSlice.reducer;
