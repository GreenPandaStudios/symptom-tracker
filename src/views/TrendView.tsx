import { useMemo, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import type { ChartData } from "chart.js";
import { Download } from "lucide-react";
import { useAppSelector } from "../state/hooks";
import { selectCatalogItems } from "../state/selectors";
import { buildCsv, downloadCsv, feelingScoreSeries } from "../utils/csv";
import { formatDisplayDate } from "../utils/date";
import type { ActivityLevel } from "../types";

ChartJS.register(
  CategoryScale,
  BarElement,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TrendView = () => {
  const dayLogs = useAppSelector((state) => state.dayLogs.byDate);
  const catalog = useAppSelector(selectCatalogItems);
  const [foodFilter, setFoodFilter] = useState("");
  const [symptomFilter, setSymptomFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState<ActivityLevel | "">("");

  const activityLevels: ActivityLevel[] = [
    "None",
    "Low",
    "Average",
    "High",
    "Very High",
  ];

  const days = useMemo(
    () => Object.values(dayLogs).sort((a, b) => a.date.localeCompare(b.date)),
    [dayLogs]
  );

  const filteredDays = useMemo(() => {
    if (!foodFilter && !symptomFilter && !activityFilter) return days;
    return days.filter((day) => {
      const foodMatch = foodFilter ? day.foodIds.includes(foodFilter) : true;
      const symptomMatch = symptomFilter
        ? day.symptomIds.includes(symptomFilter)
        : true;
      const activityMatch = activityFilter
        ? day.activityLevel === activityFilter
        : true;
      return foodMatch && symptomMatch && activityMatch;
    });
  }, [days, foodFilter, symptomFilter, activityFilter]);

  const comboData = useMemo<ChartData<"line", (number | null)[], string>>(
    () => {
    const labels = filteredDays.map((d) => formatDisplayDate(d.date));
    const symptoms = filteredDays.map((d) => d.symptomIds.length);
    const feelings = feelingScoreSeries(filteredDays);
    const feelingByDate = new Map(feelings.map((f) => [f.date, f.score]));

    const feelingSeries = filteredDays.map((d) =>
      feelingByDate.get(d.date) ?? null
    );

    return {
      labels,
      datasets: [
        {
            type: "line",
          label: "Symptoms per day",
          data: symptoms,
            backgroundColor: "#f97316",
            borderColor: "#f97316",
            tension: 0.2,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 5,
          yAxisID: "ySymptoms",
        },
        {
          type: "line",
          label: "Overall feeling (1-5)",
          data: feelingSeries,
          borderColor: "#16a34a",
          backgroundColor: "#16a34a",
          tension: 0.25,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 6,
          spanGaps: true,
          yAxisID: "yFeeling",
        },
      ],
    };
    },
    [filteredDays]
  );

  const hasComboData = (comboData.labels?.length ?? 0) > 0;

  const foodOptions = useMemo(
    () => catalog.filter((c) => c.type === "food"),
    [catalog]
  );
  const symptomOptions = useMemo(
    () => catalog.filter((c) => c.type === "symptom"),
    [catalog]
  );

  const foodLabel = foodFilter
    ? foodOptions.find((f) => f.id === foodFilter)?.name ?? "(food not found)"
    : "All foods";
  const symptomLabel = symptomFilter
    ? symptomOptions.find((s) => s.id === symptomFilter)?.name ?? "(symptom not found)"
    : "All symptoms";
  const activityLabel = activityFilter || "All activity levels";
  const filterSummary = `Food: ${foodLabel} • Symptom: ${symptomLabel} • Activity: ${activityLabel}`;

  const comboQualifiers: string[] = [];
  if (foodFilter) comboQualifiers.push(`with ${foodLabel}`);
  if (symptomFilter) comboQualifiers.push(`when ${symptomLabel} was logged`);
  if (activityFilter)
    comboQualifiers.push(`during ${activityLabel.toLowerCase()} activity`);

  const comboTitle = comboQualifiers.length
    ? `Symptoms + feeling on days ${comboQualifiers.join(" and ")}`
    : "Symptoms + feeling over time";

  const cooccurrenceTitle = foodFilter
    ? `How often ${foodLabel} days also logged each symptom`
    : "Pick a food to see its symptom overlap";

  const cooccurrence = useMemo(() => {
    if (!foodFilter) return null;
    const baseDays = days.filter((d) =>
      activityFilter ? d.activityLevel === activityFilter : true
    );
    const data = symptomOptions.map((symptom) => {
      const count = baseDays.filter(
        (d) =>
          d.foodIds.includes(foodFilter) && d.symptomIds.includes(symptom.id)
      ).length;
      return { name: symptom.name, count };
    });
    return data;
  }, [activityFilter, days, foodFilter, symptomOptions]);

  const cooccurrenceData = useMemo<ChartData<"bar", number[], string> | null>(
    () => {
      if (!cooccurrence) return null;
      return {
        labels: cooccurrence.map((c) => c.name),
        datasets: [
          {
            label: "Days with both",
            data: cooccurrence.map((c) => c.count),
            backgroundColor: "#0ea5e9",
            borderColor: "#0284c7",
          },
        ],
      };
    },
    [cooccurrence]
  );

  const handleDownload = () => {
    downloadCsv("symptom-tracker.csv", buildCsv(days, catalog));
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Trend View</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Longitudinal insights
          </h1>
          <p className="text-sm text-slate-500">
            Charts to correlate food, activity, symptoms, and feelings.
          </p>
        </div>
        <button
          className="pill-button bg-emerald-600 text-white w-full justify-center sm:w-auto"
          onClick={handleDownload}
        >
          <Download size={16} />
          Download CSV
        </button>
      </div>

      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          <span className="text-xs uppercase tracking-wide text-slate-500">
            Affects all charts below
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            <span className="font-semibold text-slate-800">Food/drink filter</span>
            <select
              value={foodFilter}
              onChange={(e) => setFoodFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All foods</option>
              {foodOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            <span className="font-semibold text-slate-800">Symptom filter</span>
            <select
              value={symptomFilter}
              onChange={(e) => setSymptomFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All symptoms</option>
              {symptomOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            <span className="font-semibold text-slate-800">Activity filter</span>
            <select
              value={activityFilter}
              onChange={(e) =>
                setActivityFilter((e.target.value as ActivityLevel) || "")
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All activity levels</option>
              {activityLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{comboTitle}</h2>
            <p className="text-xs text-slate-500">
              Lines: symptoms count (left axis) and feeling (right axis)
            </p>
            <p className="text-xs text-slate-500">{filterSummary}</p>
          </div>
          <span className="text-xs text-slate-500">1-5 feeling scale</span>
        </div>
        {!hasComboData ? (
          <p className="text-sm text-slate-500">
            Add entries and/or feelings to see this chart.
          </p>
        ) : (
          <Line
            data={comboData}
            options={{
              scales: {
                ySymptoms: {
                  type: "linear",
                  position: "left",
                  beginAtZero: true,
                  ticks: { precision: 0 },
                  grid: { color: "#e2e8f0" },
                },
                yFeeling: {
                  type: "linear",
                  position: "right",
                  min: 1,
                  max: 5,
                  ticks: { stepSize: 1 },
                  grid: { drawOnChartArea: false },
                },
              },
            }}
          />
        )}
      </div>

      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {cooccurrenceTitle}
            </h2>
            <p className="text-xs text-slate-500">{filterSummary}</p>
          </div>
        </div>
        {!foodFilter ? (
          <p className="text-sm text-slate-500">
            Select a food to view co-occurrence counts.
          </p>
        ) : cooccurrenceData ? (
          <Bar
            data={cooccurrenceData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0 },
                },
                x: {
                  ticks: { maxRotation: 60, minRotation: 40 },
                },
              },
            }}
          />
        ) : (
          <p className="text-sm text-slate-500">
            No matching days for this food with any symptom.
          </p>
        )}
      </div>
    </section>
  );
};

export default TrendView;
