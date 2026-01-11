# Symptom Tracker App

Single-user PWA to log daily symptoms, food/drink, activity level, and overall feeling, then explore trends over time. Built with React, Redux Toolkit + redux-persist, TypeScript, Tailwind, and Vite.

## Features

- **Calendar view** focused on today with quick scrolling into the past (future dates blocked) and color-coded feeling chips.
- **Day view** to set overall feeling and activity level, manage per-day symptoms and food/drink lists, and use fast search/create modals for catalog items.
- **Edit modal** supports case-insensitive prefix/substring search; if nothing matches, create-and-add immediately.
- **Trend view** with line + bar charts (Chart.js) plus a correlation explorer and one-click CSV export of all data.
- **Offline-first PWA** with local persistence via redux-persist and hash routing.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173/ (hash routing). The PWA manifest/icons are included; use “Add to Home Screen” on mobile.

## Testing & quality

```bash
npm run test   # vitest unit tests
npm run lint   # eslint
npm run build  # type-check + production build
```

## CSV format

Exported CSV contains columns: `date`, `overallFeeling`, `activityLevel`, `foods`, `symptoms` (foods/symptoms joined with `; `, blank if none).

## Tech stack

- React 19, React Router (hash), Redux Toolkit, redux-persist
- Tailwind CSS
- Chart.js + react-chartjs-2
- Vite + vite-plugin-pwa
- Vitest + Testing Library
