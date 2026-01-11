import { Link, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { CalendarDays, LineChart, Plus } from "lucide-react";
import type { ComponentType } from "react";
import CalendarView from "./views/CalendarView";
import DayView from "./views/DayView";
import TrendView from "./views/TrendView";
import { todayKey } from "./utils/date";

type IconType = ComponentType<{ size?: number; className?: string }>;

const NavButton = ({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: IconType;
  label: string;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `pill-button ${
        isActive
          ? "bg-emerald-600 text-white"
          : "bg-white text-slate-800 border border-slate-200"
      }
      `
    }
  >
    <Icon size={16} />
    <span>{label}</span>
  </NavLink>
);

function App() {
  const today = todayKey();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-emerald-700"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Plus size={18} />
            </div>
            <div className="leading-tight">
              <div>Symptom Tracker</div>
              <div className="text-xs font-normal text-slate-500">
                Daily health journal
              </div>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm sm:justify-end">
            <NavButton to="/" icon={CalendarDays} label="Calendar" />
            <NavButton to={`/day/${today}`} icon={Plus} label="Today" />
            <NavButton to="/trends" icon={LineChart} label="Trends" />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-3 py-5 sm:px-4 sm:py-6">
        <Routes>
          <Route path="/" element={<CalendarView />} />
          <Route path="/day/:date" element={<DayView />} />
          <Route path="/trends" element={<TrendView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
