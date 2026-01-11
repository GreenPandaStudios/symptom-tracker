import dayLogsReducer, {
  addItemToDay,
  removeItemFromDay,
  setActivityLevel,
  setOverallFeeling,
} from "../state/dayLogsSlice";
import type { DayLogsState } from "../state/dayLogsSlice";

describe("dayLogsSlice", () => {
  const base: DayLogsState = { byDate: {} };

  it("sets feelings and activity", () => {
    const state = dayLogsReducer(
      base,
      setOverallFeeling({ date: "2026-01-01", overallFeeling: "Good" })
    );
    const next = dayLogsReducer(
      state,
      setActivityLevel({ date: "2026-01-01", activityLevel: "High" })
    );
    expect(next.byDate["2026-01-01"].overallFeeling).toBe("Good");
    expect(next.byDate["2026-01-01"].activityLevel).toBe("High");
  });

  it("adds and removes daily items without duplicates", () => {
    let state = dayLogsReducer(
      base,
      addItemToDay({ date: "2026-01-02", itemId: "sym1", kind: "symptom" })
    );
    state = dayLogsReducer(
      state,
      addItemToDay({ date: "2026-01-02", itemId: "sym1", kind: "symptom" })
    );
    expect(state.byDate["2026-01-02"].symptomIds).toHaveLength(1);
    state = dayLogsReducer(
      state,
      removeItemFromDay({ date: "2026-01-02", itemId: "sym1", kind: "symptom" })
    );
    expect(state.byDate["2026-01-02"].symptomIds).toHaveLength(0);
  });
});
