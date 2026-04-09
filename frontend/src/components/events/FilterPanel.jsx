import { ListFilter } from "lucide-react";
import AnimatedButton from "../common/AnimatedButton";
import GlowingCard from "../common/GlowingCard";

const modeOptions = [
  { value: "all", label: "All formats" },
  { value: "in person", label: "In person" },
  { value: "hybrid", label: "Hybrid" }
];

const FilterPanel = ({
  categories,
  selectedCategory,
  selectedMode,
  onCategoryChange,
  onModeChange,
  onReset
}) => {
  return (
    <GlowingCard hover={false} className="space-y-6 px-5 py-5 xl:sticky xl:top-28">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-white/35">Filters</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-white">Refine your feed</h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[var(--primary)]">
          <ListFilter size={18} />
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-white/60">Event category</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={`rounded-full px-4 py-2 text-sm transition ${
              selectedCategory === "all"
                ? "bg-[var(--primary)] text-slate-950"
                : "border border-white/10 bg-white/[0.04] text-white/60"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                selectedCategory === category.id
                  ? "bg-[var(--primary)] text-slate-950"
                  : "border border-white/10 bg-white/[0.04] text-white/60"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-white/60">Format</p>
        <div className="space-y-2">
          {modeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onModeChange(option.value)}
              className={`flex w-full items-center justify-between rounded-[1.1rem] border px-4 py-3 text-sm transition ${
                selectedMode === option.value
                  ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-white"
                  : "border-white/10 bg-white/[0.04] text-white/60"
              }`}
            >
              <span>{option.label}</span>
              <span className="text-xs uppercase tracking-[0.25em] text-white/35">Mode</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatedButton onClick={onReset} variant="ghost" className="w-full">
        Reset filters
      </AnimatedButton>
    </GlowingCard>
  );
};

export default FilterPanel;
