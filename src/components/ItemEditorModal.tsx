import { useMemo, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import type { CatalogItem } from "../types";

const normalize = (value: string) => value.trim().toLowerCase();

const rankItem = (name: string, query: string) => {
  const normalizedName = normalize(name);
  if (!query) return 1;
  if (normalizedName.startsWith(query)) return 0;
  if (normalizedName.includes(query)) return 1;
  return 2;
};

const sortMatches = (items: CatalogItem[], query: string) => {
  if (!query) return [...items].sort((a, b) => a.name.localeCompare(b.name));
  return [...items].sort((a, b) => {
    const q = normalize(query);
    const rankA = rankItem(a.name, q);
    const rankB = rankItem(b.name, q);
    if (rankA !== rankB) return rankA - rankB;
    return a.name.localeCompare(b.name);
  });
};

type Props = {
  type: CatalogItem["type"];
  catalog: CatalogItem[];
  addedIds: string[];
  onSelect: (item: CatalogItem) => void;
  onCreate: (name: string) => void;
  onClose: () => void;
};

const ItemEditorModal = ({
  type,
  catalog,
  addedIds,
  onClose,
  onCreate,
  onSelect,
}: Props) => {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => sortMatches(catalog, query), [catalog, query]);
  const queryNormalized = normalize(query);
  const hasExact = catalog.some(
    (item) => normalize(item.name) === queryNormalized
  );
  const addedSet = useMemo(() => new Set(addedIds), [addedIds]);

  const createEnabled = queryNormalized.length > 0 && !hasExact;

  const handleCreate = () => {
    if (!createEnabled) return;
    onCreate(query.trim());
    setQuery("");
  };

  const handleSelect = (item: CatalogItem) => {
    onSelect(item);
    setQuery("");
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="glass-card w-full max-w-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400">
              Add {type === "food" ? "Food/Drink" : "Symptom"}
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              Search or create
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500">
          <Search size={16} className="text-slate-400" />
          <input
            autoFocus
            placeholder="Type to search or add"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-0 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {matches.length === 0 && (
            <div className="text-sm text-slate-500">
              No saved {type === "food" ? "foods/drinks" : "symptoms"} yet.
            </div>
          )}
          {matches.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              disabled={addedSet.has(item.id)}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                addedSet.has(item.id)
                  ? "cursor-not-allowed border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white hover:border-emerald-500"
              }`}
            >
              <span className="text-sm font-medium text-slate-800">
                {item.name}
              </span>
              {addedSet.has(item.id) ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-xs font-semibold text-emerald-700">
                  <Check size={14} /> Added
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Saved {new Date(item.createdAt).toLocaleDateString()}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="pill-button bg-white text-slate-700 border border-slate-200"
          >
            Cancel
          </button>
          <button
            disabled={!createEnabled}
            onClick={handleCreate}
            className="pill-button bg-emerald-600 text-white disabled:opacity-50"
          >
            <Plus size={16} />
            Create & add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemEditorModal;
