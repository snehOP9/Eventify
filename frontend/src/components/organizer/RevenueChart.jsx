import { motion } from "framer-motion";
import { useId, useMemo } from "react";
import { formatCompactNumber } from "../../utils/formatters";

const toneConfig = {
  cyan: {
    stopA: "#22d3ee",
    stopB: "#34d399",
    stroke: "#67e8f9"
  },
  amber: {
    stopA: "#f59e0b",
    stopB: "#fb7185",
    stroke: "#fcd34d"
  },
  violet: {
    stopA: "#a78bfa",
    stopB: "#22d3ee",
    stroke: "#c4b5fd"
  }
};

const RevenueChart = ({ title, subtitle, data = [], type = "line", tone = "cyan" }) => {
  const gradientSeed = useId().replace(/:/g, "");
  const gradientId = `org-chart-${gradientSeed}`;
  const palette = toneConfig[tone] || toneConfig.cyan;

  const normalizedData = useMemo(
    () =>
      data.map((item, index) => ({
        label: item.label || `P${index + 1}`,
        value: Number(item.value) || 0
      })),
    [data]
  );

  const maxValue = useMemo(
    () => Math.max(...normalizedData.map((point) => point.value), 1),
    [normalizedData]
  );

  const chartPoints = useMemo(() => {
    if (!normalizedData.length) {
      return [];
    }

    const step = normalizedData.length > 1 ? 100 / (normalizedData.length - 1) : 100;

    return normalizedData.map((point, index) => ({
      ...point,
      x: index * step,
      y: 100 - (point.value / maxValue) * 100
    }));
  }, [maxValue, normalizedData]);

  const linePath = useMemo(() => {
    if (!chartPoints.length) {
      return "";
    }

    return chartPoints
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
      .join(" ");
  }, [chartPoints]);

  const areaPath = useMemo(() => {
    if (!linePath) {
      return "";
    }

    return `${linePath} L 100,100 L 0,100 Z`;
  }, [linePath]);

  return (
    <article className="rounded-3xl border border-white/12 bg-white/5 px-5 py-5 shadow-[0_24px_45px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-white/58">{subtitle}</p>
        </div>
      </div>

      {!normalizedData.length ? (
        <div className="flex h-52 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-white/55">
          No chart data available.
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[rgba(3,10,20,0.55)] p-4">
          <div className="relative h-52">
            {type === "bars" ? (
              <div className="flex h-full items-end justify-between gap-2">
                {normalizedData.map((point, index) => {
                  const height = (point.value / maxValue) * 100;

                  return (
                    <div key={`${point.label}-${index}`} className="flex h-full flex-1 flex-col justify-end gap-2">
                      <motion.div
                        className="w-full rounded-xl"
                        style={{
                          background: `linear-gradient(180deg, ${palette.stopA}, ${palette.stopB})`
                        }}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: `${Math.max(height, 4)}%`, opacity: 1 }}
                        transition={{ duration: 0.55, delay: index * 0.05 }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.stopA} stopOpacity="0.75" />
                    <stop offset="100%" stopColor={palette.stopB} stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                <motion.path
                  d={areaPath}
                  fill={`url(#${gradientId})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7 }}
                />

                <motion.path
                  d={linePath}
                  fill="none"
                  stroke={palette.stroke}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </svg>
            )}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-white/55 sm:grid-cols-7">
            {normalizedData.map((point) => (
              <div key={point.label} className="space-y-1 rounded-lg border border-white/8 bg-white/5 px-2 py-2">
                <p className="truncate text-[0.66rem] uppercase tracking-[0.12em]">{point.label}</p>
                <p className="text-sm font-semibold text-white/80">{formatCompactNumber(point.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default RevenueChart;
