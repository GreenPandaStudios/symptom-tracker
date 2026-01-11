import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppSelector } from "../state/hooks";
import type { OverallFeeling } from "../types";
import { feelingColor } from "../utils/feelings";

type DayCell = {
  key: string;
  date: dayjs.Dayjs;
  inMonth: boolean;
  isFuture: boolean;
  feeling?: OverallFeeling;
  activity?: string;
};

const buildMonthGrid = (
  monthStart: dayjs.Dayjs,
  dayLogs: Record<
    string,
    { overallFeeling?: OverallFeeling; activityLevel?: string }
  >
) => {
  const start = monthStart.startOf("month").startOf("week");
  const end = monthStart.endOf("month").endOf("week");
  const today = dayjs();
  const days: DayCell[] = [];
  let cursor = start;
  while (cursor.isBefore(end) || cursor.isSame(end, "day")) {
    const key = cursor.format("YYYY-MM-DD");
    const log = dayLogs[key];
    days.push({
      key,
      date: cursor,
      inMonth: cursor.isSame(monthStart, "month"),
      isFuture: cursor.isAfter(today, "day"),
      feeling: log?.overallFeeling,
      activity: log?.activityLevel,
    });
    cursor = cursor.add(1, "day");
  }
  return days;
};

const CalendarView = () => {
  const navigate = useNavigate();
  const dayLogs = useAppSelector((state) => state.dayLogs.byDate);
  const [month, setMonth] = useState(() => dayjs().startOf("month"));

  const days = useMemo(() => buildMonthGrid(month, dayLogs), [month, dayLogs]);
  const today = dayjs();

  const canGoNext = !month.add(1, "month").isAfter(today, "month");

  const handleOpen = (dateKey: string, isFuture: boolean) => {
    if (isFuture) return;
    navigate(`/day/${dateKey}`);
  };

  const monthLabel = month.format("MMMM YYYY");

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Calendar</p>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            {monthLabel}
          </h1>
          <p className="text-sm text-slate-500">Tap a day to view or edit.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="pill-button bg-white text-slate-700 border border-slate-200"
            onClick={() => setMonth((m) => m.subtract(1, "month"))}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <button
            className="pill-button bg-white text-slate-700 border border-slate-200 disabled:opacity-40"
            onClick={() => canGoNext && setMonth((m) => m.add(1, "month"))}
            disabled={!canGoNext}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day) => {
          const isToday = day.date.isSame(today, "day");
          const disabled = day.isFuture;
          const hasFeeling = Boolean(day.feeling);
          const feelingClass = hasFeeling
            ? feelingColor(day.feeling)
            : "bg-white text-slate-800 border border-slate-200";
          return (
            <button
              key={day.key}
              onClick={() => handleOpen(day.key, disabled)}
              disabled={disabled}
              className={`flex flex-col items-center gap-1.5 rounded-lg p-2 text-center transition hover:-translate-y-[1px] ${
                !day.inMonth ? "opacity-60" : ""
              } ${
                disabled ? "cursor-not-allowed opacity-50" : ""
              } ${feelingClass}`}
            >
              <div className="flex w-full items-center justify-center text-[11px] sm:text-sm font-semibold">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm ${
                    hasFeeling
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-slate-300 bg-slate-50 text-slate-800"
                  } ${
                    isToday
                      ? "ring-2 ring-offset-2 ring-offset-white/30 ring-emerald-400"
                      : ""
                  }`}
                >
                  {day.date.date()}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CalendarView;
