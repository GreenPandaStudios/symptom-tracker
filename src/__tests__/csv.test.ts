import { buildCsv } from "../utils/csv";
import type { CatalogItem, DayLog } from "../types";

describe("buildCsv", () => {
  const catalog: CatalogItem[] = [
    { id: "f1", name: "Coffee", createdAt: "", type: "food" },
    { id: "s1", name: "Headache", createdAt: "", type: "symptom" },
  ];

  const days: DayLog[] = [
    {
      date: "2026-01-01",
      activityLevel: "Low",
      overallFeeling: "Bad",
      foodIds: ["f1"],
      symptomIds: ["s1"],
    },
  ];

  it("exports all required columns with joined items", () => {
    const csv = buildCsv(days, catalog);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("date,overallFeeling,activityLevel,foods,symptoms");
    expect(lines[1]).toBe("2026-01-01,Bad,Low,Coffee,Headache");
  });
});
