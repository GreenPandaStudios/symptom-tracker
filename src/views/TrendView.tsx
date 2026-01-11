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
import { Download } from "lucide-react";
import { useAppSelector } from "../state/hooks";
import { selectCatalogItems } from "../state/selectors";
import { buildCsv, downloadCsv, feelingScoreSeries } from "../utils/csv";
import { feelingScale } from "../utils/feelings";
import { formatDisplayDate } from "../utils/date";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TrendView = () => {
  const dayLogs = useAppSelector((state) => state.dayLogs.byDate);
  const catalog = useAppSelector(selectCatalogItems);
  const [foodFilter, setFoodFilter] = useState("");
  const [symptomFilter, setSymptomFilter] = useState("");

  const days = useMemo(
    () => Object.values(dayLogs).sort((a, b) => a.date.localeCompare(b.date)),
    [dayLogs]
  );

  const feelingData = useMemo(() => {
    const series = feelingScoreSeries(days);
    return {
      labels: series.map((s) => formatDisplayDate(s.date)),
      datasets: [
        {
          label: "Overall feeling (1-5)",
          data: series.map((s) => s.score),
          fill: false,
          borderColor: "#16a34a",
          backgroundColor: "#16a34a",
          tension: 0.3,
        },
      ],
    };
  }, [days]);

  const symptomsData = useMemo(() => {
    return {
      labels: days.map((d) => formatDisplayDate(d.date)),
      datasets: [
        {
          label: "Symptoms per day",
          data: days.map((d) => d.symptomIds.length),
          backgroundColor: "#f97316",
        },
        {
          label: "Foods logged per day",
          data: days.map((d) => d.foodIds.length),
          backgroundColor: "#0ea5e9",
        },
      ],
    };
  }, [days]);

  const foodOptions = catalog.filter((c) => c.type === "food");
  const symptomOptions = catalog.filter((c) => c.type === "symptom");

  const correlation = useMemo(() => {
    if (!foodFilter && !symptomFilter) return null;
    const daysMatched = days.filter((day) => {
      const foodMatch = foodFilter ? day.foodIds.includes(foodFilter) : true;
      const symptomMatch = symptomFilter
        ? day.symptomIds.includes(symptomFilter)
        : true;
      return foodMatch && symptomMatch;
    });
    const totalWithFood = foodFilter
      ? days.filter((d) => d.foodIds.includes(foodFilter)).length
      : null;
    const totalWithSymptom = symptomFilter
      ? days.filter((d) => d.symptomIds.includes(symptomFilter)).length
      : null;
    const avgFeeling =
      daysMatched.reduce(
        (sum, d) =>
          sum + (d.overallFeeling ? feelingScale[d.overallFeeling] : 0),
        0
      ) / (daysMatched.length || 1);

    return {
      matches: daysMatched.length,
      totalWithFood,
      totalWithSymptom,
      avgFeeling: Number.isFinite(avgFeeling) ? avgFeeling.toFixed(2) : null,
    };
  }, [days, foodFilter, symptomFilter]);

  const handleDownload = () => {
    downloadCsv("symptom-tracker.csv", buildCsv(days, catalog));
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
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

      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Overall feeling over time
          </h2>
          <span className="text-xs text-slate-500">
            1 = Very Bad, 5 = Very Good
          </span>
        </div>
        {feelingData.labels.length === 0 ? (
          <p className="text-sm text-slate-500">
            Log some feelings to see this chart.
          </p>
        ) : (
          <Line
            data={feelingData}
            options={{
              scales: { y: { min: 1, max: 5, ticks: { stepSize: 1 } } },
            }}
          />
        )}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Symptoms and foods over time
          </h2>
          <span className="text-xs text-slate-500">Counts by day</span>
        </div>
        {symptomsData.labels.length === 0 ? (
          <p className="text-sm text-slate-500">
            Add daily entries to populate this chart.
          </p>
        ) : (
          <Bar data={symptomsData} />
        )}
      </div>

      <div className="glass-card p-4 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Correlation explorer
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Food/drink filter
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
            Symptom filter
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
        </div>

        {correlation ? (
          <div className="grid gap-3 md:grid-cols-4 text-sm text-slate-700">
            <div className="rounded-lg bg-emerald-50 p-3">
              <div className="text-xs uppercase text-emerald-600">
                Co-occurring days
              </div>
              <div className="text-2xl font-semibold text-emerald-800">
                {correlation.matches}
              </div>
            </div>
            {correlation.totalWithFood !== null && (
              <div className="rounded-lg bg-sky-50 p-3">
                <div className="text-xs uppercase text-sky-600">
                  Days with food
                </div>
                <div className="text-2xl font-semibold text-sky-800">
                  {correlation.totalWithFood}
                </div>
              </div>
            )}
            {correlation.totalWithSymptom !== null && (
              <div className="rounded-lg bg-orange-50 p-3">
                <div className="text-xs uppercase text-orange-600">
                  Days with symptom
                </div>
                <div className="text-2xl font-semibold text-orange-800">
                  {correlation.totalWithSymptom}
                </div>
              </div>
            )}
            {correlation.avgFeeling && (
              <div className="rounded-lg bg-amber-50 p-3">
                <div className="text-xs uppercase text-amber-600">
                  Avg feeling (1-5)
                </div>
                <div className="text-2xl font-semibold text-amber-800">
                  {correlation.avgFeeling}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Choose a food and/or symptom to explore co-occurrence.
          </p>
        )}
      </div>
    </section>
  );
};

export default TrendView;
