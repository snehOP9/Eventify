import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const toneClasses = {
  cyan: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
  emerald: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  amber: "border-amber-300/35 bg-amber-300/10 text-amber-100",
  violet: "border-violet-300/35 bg-violet-300/10 text-violet-100"
};

const AnalyticsCard = ({ title, value, subtext, icon: Icon, tone = "cyan" }) => {
  return (
    <motion.article
      className="rounded-3xl border border-white/12 bg-white/5 px-5 py-5 backdrop-blur-2xl"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22 }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.22em] text-white/45">{title}</p>
        {Icon ? (
          <span
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-2xl border",
              toneClasses[tone] || toneClasses.cyan
            )}
          >
            <Icon size={16} />
          </span>
        ) : null}
      </div>

      <p className="mt-4 font-display text-3xl font-semibold text-white">{value}</p>
      {subtext ? <p className="mt-2 text-sm text-white/60">{subtext}</p> : null}
    </motion.article>
  );
};

export default AnalyticsCard;
