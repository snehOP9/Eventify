import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const StatsCounter = ({ label, value, prefix = "", suffix = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return undefined;
    }

    let startValue = 0;
    const duration = 1200;
    const start = performance.now();

    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      startValue = Math.round(value * eased);
      setDisplayValue(startValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
    return undefined;
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="premium-card min-h-[146px] px-6 py-6"
    >
      <p className="text-sm uppercase tracking-[0.32em] text-white/35">{label}</p>
      <p className="mt-6 font-display text-4xl font-semibold text-white">
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </p>
    </motion.div>
  );
};

export default StatsCounter;
