# Symptom Tracker App — Product Spec

Build a single-user app that helps me track daily symptoms, food/drink, and activity level, and then view trends over time.

This document is written so a developer can implement the app without guessing what “done” means.

## Views

The app has four user-facing views:

1. Calendar View (default)
2. Day View
3. Edit View (within the Day View) — for Symptoms and Food/Drink
4. Trend View

### Common concepts (data model)

These types define the core domain language used throughout the UI.

```typescript
export type OverallFeeling =
  | "Very Bad"
  | "Bad"
  | "Normal"
  | "Good"
  | "Very Good";

export type ActivityLevel = "None" | "Low" | "Average" | "High" | "Very High";

// Stored per day
export type DayLog = {
  /** Local date key, e.g. "2026-01-11" */
  date: string;
  overallFeeling?: OverallFeeling;
  activityLevel?: ActivityLevel;
  symptomIds: string[];
  foodIds: string[];
};

// Reusable, user-created items
export type CatalogItem = {
  id: string;
  name: string;
  createdAt: string;
  type: "symptom" | "food";
};
```

Notes:

- `overallFeeling` and `activityLevel` are optional (a day may be unset).
- Symptoms and Food/Drink are modeled as a user-managed catalog of items, then referenced by ID in a `DayLog`.

### The Calendar View

The Calendar View is the default view shown on app launch.

Requirements:

- The calendar initially focuses on the current day.
- The user can scroll to view days in the past.
- The calendar must not allow selecting or viewing days in the future.

Each day is color-coded by the day’s `OverallFeeling` _if set_.

- `"Very Bad"` maps to red.
- `"Very Good"` maps to deep green.
- Intermediate values map to a gradient between those endpoints.
- If no `overallFeeling` is set for a day, use a neutral/uncolored state.

The idea is to give the user a general overview of how they have felt over time.

Interaction:

- Selecting a day navigates to the Day View for that date.

### The Day View

The day view is where the user will do most of the work.

The Day View lets the user record and edit all data for a single date.

Requirements:

1. Overall feeling

- The user can add, change, or clear the day’s `overallFeeling`.

2. Activity level

- The user can add, change, or clear the day’s `activityLevel`.

3. Daily lists

The user can add/remove items in two per-day lists:

1. Symptoms - a list of the symptoms the user has experienced today.
2. Food/Drink - a list of what the user ate or drank today.

For both lists:

- Items in the list reference catalog items (so the same symptom/food can be reused across days).
- The user can remove an item from the current day without deleting it from the catalog.

### The Edit View (within the day view)

Symptoms and Food/Drink each have their own “Edit” flow inside the Day View.

Primary goal: logging should be seamless and fast.

Required workflow:

1. User opens a day.
2. User presses a “+” button at the bottom of either the Symptoms list or the Food/Drink list.
3. User types to filter/search existing catalog items.
4. If they pick an existing item, it is added to the current day.
5. If no matching results exist, the user can create a new item from their typed text.
6. Creating a new item both:
   - saves it in the catalog (available next time), and
   - adds it to the current day immediately.

Search behavior (to be implemented unless decided otherwise):

- Case-insensitive matching.
- Partial substring matching.
- Results ordered with “best match” first (exact prefix matches before substring matches).

### The Trend View

The Trend View is a reporting view with longitudinal charts.

This view is critical: it helps identify relationships between food/drink, activity level, symptoms, and overall feeling.

Required charts/analysis:

- Overall feeling over time (by day).
- Symptoms over time.
- Breakdowns/filters that help answer:
  - “Do certain foods correlate with certain symptoms?”
  - “Does activity level correlate with symptoms or overall feeling?”

The implementation may use any reasonable chart library, but must be readable and usable on mobile.

CSV export:

- A “Download CSV” button is present in the Trend View.
- The export includes _all stored data_ (see “CSV format” below).

## Technical Requirements

- SPA + PWA.
- No server-side components and no external database.
- Persist all data locally on the device using Redux + `redux-persist`.
- Routing: use hash routing only (path routing must not be required).
- Tech stack: React + Redux + TypeScript.
- Styling: Tailwind CSS.
- Icons: `lucide-react`.
- Code quality: clean, modular, and well-documented.
- Testing: comprehensive unit tests. Components should remain modular enough to be testable.

### CSV format (single file)

The user must be able to export all data into a single CSV file.

Minimum required columns:

- `date` (YYYY-MM-DD)
- `overallFeeling` (one of OverallFeeling values, blank if unset)
- `activityLevel` (one of ActivityLevel values, blank if unset)
- `foods` (all foods/drinks for the day)
- `symptoms` (all symptoms for the day)

Values for `foods` and `symptoms`:

- Store as a single string cell per day, with items separated by `; ` (e.g., `Coffee; Oatmeal; Sushi`).
- Use the catalog item `name`.
- If no items exist, export an empty string.
