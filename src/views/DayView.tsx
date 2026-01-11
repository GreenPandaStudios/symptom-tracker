import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MinusCircle, Plus, Trash2 } from "lucide-react";
import ItemEditorModal from "../components/ItemEditorModal";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { addItem } from "../state/catalogSlice";
import {
  addItemToDay,
  removeItemFromDay,
  setActivityLevel,
  setOverallFeeling,
} from "../state/dayLogsSlice";
import {
  selectCatalogByType,
  selectDayItems,
  selectDayLog,
} from "../state/selectors";
import type { ActivityLevel, CatalogItem, OverallFeeling } from "../types";
import { formatDisplayDate, isFutureDate, todayKey } from "../utils/date";
import { capitalizeWords } from "../utils/text";
import { feelingOptions } from "../utils/feelings";

const activityLevels: ActivityLevel[] = [
  "None",
  "Low",
  "Average",
  "High",
  "Very High",
];

const newId = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : Math.random().toString(36).slice(2);

type ListKind = "symptom" | "food";

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="glass-card space-y-3 p-4 sm:p-5">
    <div className="text-sm font-semibold text-slate-800">{title}</div>
    {children}
  </div>
);

const ItemPill = ({
  name,
  onRemove,
}: {
  name: string;
  onRemove: () => void;
}) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
    {name}
    <button
      aria-label={`Remove ${name}`}
      onClick={onRemove}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-red-500 hover:border-red-200"
    >
      <MinusCircle size={18} />
    </button>
  </span>
);

const DayView = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dateKey = params.date ?? todayKey();
  const dispatch = useAppDispatch();
  const day = useAppSelector(selectDayLog(dateKey));
  const symptoms = useAppSelector(selectDayItems(dateKey, "symptom"));
  const foods = useAppSelector(selectDayItems(dateKey, "food"));
  const symptomSelector = useMemo(() => selectCatalogByType("symptom"), []);
  const foodSelector = useMemo(() => selectCatalogByType("food"), []);
  const symptomCatalog = useAppSelector(symptomSelector);
  const foodCatalog = useAppSelector(foodSelector);

  const [editing, setEditing] = useState<ListKind | null>(null);

  const future = isFutureDate(dateKey);
  const title = formatDisplayDate(dateKey);

  const handleCreate = (name: string, kind: ListKind) => {
    const newItem: CatalogItem = {
      id: newId(),
      name: capitalizeWords(name),
      createdAt: new Date().toISOString(),
      type: kind,
    };
    dispatch(addItem(newItem));
    dispatch(addItemToDay({ date: dateKey, itemId: newItem.id, kind }));
    setEditing(null);
  };

  const handleSelect = (item: CatalogItem, kind: ListKind) => {
    dispatch(addItemToDay({ date: dateKey, itemId: item.id, kind }));
    setEditing(null);
  };

  const handleFeeling = (feeling?: OverallFeeling) => {
    dispatch(setOverallFeeling({ date: dateKey, overallFeeling: feeling }));
  };

  const handleActivity = (activity?: ActivityLevel) => {
    dispatch(setActivityLevel({ date: dateKey, activityLevel: activity }));
  };

  const symptomList = useMemo(() => symptoms, [symptoms]);
  const foodList = useMemo(() => foods, [foods]);

  if (future) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-lg font-semibold text-slate-800">
          Future dates are disabled.
        </p>
        <p className="text-sm text-slate-500">Select today or a past date.</p>
        <button
          className="pill-button mt-4 bg-emerald-600 text-white"
          onClick={() => navigate(`/day/${todayKey()}`)}
        >
          Go to today
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Day View</p>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            {title}
          </h1>
        </div>
        <button
          className="pill-button w-full bg-white text-slate-700 border border-slate-200 sm:w-auto"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Overall feeling">
          <div className="flex flex-wrap gap-2">
            {feelingOptions.map((feeling) => (
              <button
                key={feeling}
                onClick={() => handleFeeling(feeling)}
                className={`pill-button border ${
                  day.overallFeeling === feeling
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {feeling}
              </button>
            ))}
            <button
              onClick={() => handleFeeling(undefined)}
              className="pill-button border border-slate-200 bg-white text-slate-700"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Activity level">
          <div className="flex flex-wrap gap-2">
            {activityLevels.map((level) => (
              <button
                key={level}
                onClick={() => handleActivity(level)}
                className={`pill-button border ${
                  day.activityLevel === level
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {level}
              </button>
            ))}
            <button
              onClick={() => handleActivity(undefined)}
              className="pill-button border border-slate-200 bg-white text-slate-700"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Symptoms">
        <div className="flex flex-wrap gap-2">
          {symptomList.length === 0 && (
            <span className="text-sm text-slate-500">No symptoms logged.</span>
          )}
          {symptomList.map((item) => (
            <ItemPill
              key={item.id}
              name={item.name}
              onRemove={() =>
                dispatch(
                  removeItemFromDay({
                    date: dateKey,
                    itemId: item.id,
                    kind: "symptom",
                  })
                )
              }
            />
          ))}
        </div>
        <button
          onClick={() => setEditing("symptom")}
          className="pill-button mt-3 w-full justify-center bg-emerald-600 text-white sm:w-auto"
        >
          <Plus size={16} />
          Add symptom
        </button>
      </SectionCard>

      <SectionCard title="Food / Drink">
        <div className="flex flex-wrap gap-2">
          {foodList.length === 0 && (
            <span className="text-sm text-slate-500">No items logged.</span>
          )}
          {foodList.map((item) => (
            <ItemPill
              key={item.id}
              name={item.name}
              onRemove={() =>
                dispatch(
                  removeItemFromDay({
                    date: dateKey,
                    itemId: item.id,
                    kind: "food",
                  })
                )
              }
            />
          ))}
        </div>
        <button
          onClick={() => setEditing("food")}
          className="pill-button mt-3 w-full justify-center bg-emerald-600 text-white sm:w-auto"
        >
          <Plus size={16} />
          Add food / drink
        </button>
      </SectionCard>

      {editing && (
        <ItemEditorModal
          type={editing}
          catalog={editing === "symptom" ? symptomCatalog : foodCatalog}
          onClose={() => setEditing(null)}
          onCreate={(name) => handleCreate(name, editing)}
          onSelect={(item) => handleSelect(item, editing)}
        />
      )}
    </section>
  );
};

export default DayView;
