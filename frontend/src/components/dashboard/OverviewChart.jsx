import GlowingCard from "../common/GlowingCard";

const OverviewChart = ({ series = [] }) => {
  return (
    <GlowingCard hover={false} className="h-full px-6 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-white/35">Demand signal</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-white">
            Registrations over time
          </h3>
        </div>
        <div className="rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3 py-2 text-sm font-semibold text-[var(--primary)]">
          +18.4%
        </div>
      </div>
      <div className="mt-10 flex h-64 items-end gap-4">
        {series.map((value, index) => (
          <div key={`bar-${index + 1}`} className="flex flex-1 flex-col items-center gap-3">
            <div
              className="chart-bar w-full rounded-t-[1.2rem]"
              style={{ height: `${Math.max(value, 24)}%` }}
            />
            <span className="text-xs uppercase tracking-[0.22em] text-white/30">
              W{index + 1}
            </span>
          </div>
        ))}
      </div>
    </GlowingCard>
  );
};

export default OverviewChart;
