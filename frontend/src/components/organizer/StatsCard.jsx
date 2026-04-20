import { animate, motion, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import { formatCompactNumber, formatCurrency } from "../../utils/formatters";

const formatDisplayValue = (value, format) => {
  if (format === "currency") {
    return formatCurrency(value);
  }

  if (format === "percentage") {
    return `${Math.round(value)}%`;
  }

  if (format === "compact") {
    return formatCompactNumber(value);
  }

  return Math.round(value).toLocaleString("en-IN");
};

const StatsCard = ({
  label,
  value,
  format = "number",
  icon: Icon,
  trendText,
  className,
  delay = 0
}) => {
  const numericValue = Number(value) || 0;
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, numericValue, {
      duration: 1.1,
      delay,
      ease: [0.2, 0.9, 0.3, 1]
    });

    const unsubscribe = motionValue.on("change", (latest) => {
      setDisplayValue(latest);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [delay, motionValue, numericValue]);

  return (
    <motion.article
      className={cn(
        "rounded-3xl border border-white/12 bg-[linear-gradient(170deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))] p-5",
        "shadow-[0_24px_45px_rgba(0,0,0,0.28)] backdrop-blur-2xl",
        className
      )}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">{label}</p>
        {Icon ? (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/12 text-cyan-200">
            <Icon size={16} />
          </span>
        ) : null}
      </div>

      <p className="mt-4 font-display text-3xl font-semibold text-white">
        {formatDisplayValue(displayValue, format)}
      </p>

      {trendText ? <p className="mt-2 text-sm text-emerald-200/90">{trendText}</p> : null}
    </motion.article>
  );
};

export default StatsCard;
