import type { OverallFeeling } from "../types";

export const feelingScale: Record<OverallFeeling, number> = {
  "Very Bad": 1,
  Bad: 2,
  Normal: 3,
  Good: 4,
  "Very Good": 5,
};

export const feelingOptions: OverallFeeling[] = [
  "Very Bad",
  "Bad",
  "Normal",
  "Good",
  "Very Good",
];

export const feelingColor = (feeling?: OverallFeeling) => {
  if (!feeling) return "bg-feeling-none text-slate-700 border border-slate-200";
  switch (feeling) {
    case "Very Bad":
      return "bg-feeling-very-bad text-white";
    case "Bad":
      return "bg-feeling-bad text-white";
    case "Normal":
      return "bg-feeling-normal text-white";
    case "Good":
      return "bg-feeling-good text-white";
    case "Very Good":
      return "bg-feeling-very-good text-white";
    default:
      return "bg-slate-200 text-slate-700";
  }
};

export const toFeelingLabel = (feeling?: OverallFeeling) => feeling ?? "Unset";
