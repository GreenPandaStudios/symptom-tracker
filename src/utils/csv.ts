import type { CatalogItem, DayLog } from "../types";
import { feelingScale } from "./feelings";

const csvEscape = (value: string) => {
  if (/[",\n]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
};

export const buildCsv = (days: DayLog[], catalog: CatalogItem[]): string => {
  const catalogMap = new Map(catalog.map((item) => [item.id, item]));
  const header = [
    "date",
    "overallFeeling",
    "activityLevel",
    "foods",
    "symptoms",
  ];
  const rows = days
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => {
      const foods = (day.foodIds ?? [])
        .map((id) => catalogMap.get(id)?.name)
        .filter(Boolean)
        .join("; ");
      const symptoms = (day.symptomIds ?? [])
        .map((id) => catalogMap.get(id)?.name)
        .filter(Boolean)
        .join("; ");
      return [
        day.date,
        day.overallFeeling ?? "",
        day.activityLevel ?? "",
        foods,
        symptoms,
      ].map((cell) => csvEscape(String(cell)));
    });

  return [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
};

export const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const feelingScoreSeries = (days: DayLog[]) =>
  days
    .filter((day) => day.overallFeeling)
    .map((day) => ({
      date: day.date,
      score: feelingScale[day.overallFeeling!],
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
