import { selectDayItems, selectDayLog } from "../state/selectors";
import type { RootState } from "../state/store";

describe("selectors", () => {
  const mockState: RootState = {
    catalog: {
      items: [
        { id: "a", name: "Coffee", createdAt: "", type: "food" },
        { id: "b", name: "Headache", createdAt: "", type: "symptom" },
      ],
    },
    dayLogs: {
      byDate: {
        "2026-01-01": {
          date: "2026-01-01",
          overallFeeling: "Normal",
          activityLevel: "Average",
          foodIds: ["a"],
          symptomIds: ["b"],
        },
      },
    },
    _persist: { version: 1, rehydrated: true },
  };

  it("returns hydrated day with defaults when missing", () => {
    const selector = selectDayLog("2026-02-02");
    const day = selector(mockState);
    expect(day.date).toBe("2026-02-02");
    expect(day.symptomIds).toEqual([]);
  });

  it("maps day items to catalog items", () => {
    const selector = selectDayItems("2026-01-01", "food");
    const foods = selector(mockState);
    expect(foods).toHaveLength(1);
    expect(foods[0]?.name).toBe("Coffee");
  });
});
