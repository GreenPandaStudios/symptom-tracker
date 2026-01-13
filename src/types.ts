export type OverallFeeling =
  | "Very Bad"
  | "Bad"
  | "Normal"
  | "Good"
  | "Very Good";

export type ActivityLevel = "None" | "Low" | "Average" | "High" | "Very High";

export type DayLog = {
  /** Local date key, e.g. "2026-01-11" */
  date: string;
  overallFeeling?: OverallFeeling;
  activityLevel?: ActivityLevel;
  symptomIds: string[];
  foodIds: string[];
  notes?: string;
};

export type CatalogItem = {
  id: string;
  name: string;
  createdAt: string;
  type: "symptom" | "food";
};
