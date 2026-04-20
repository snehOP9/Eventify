import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const statusStyles = {
  Draft: {
    ring: "border-slate-200/20",
    text: "text-slate-100/85",
    dot: "bg-slate-300"
  },
  Published: {
    ring: "border-cyan-300/35",
    text: "text-cyan-100",
    dot: "bg-cyan-300"
  },
  "Sold Out": {
    ring: "border-amber-300/40",
    text: "text-amber-100",
    dot: "bg-amber-300"
  },
  Live: {
    ring: "border-emerald-300/45",
    text: "text-emerald-100",
    dot: "bg-emerald-300"
  },
  Completed: {
    ring: "border-violet-300/35",
    text: "text-violet-100",
    dot: "bg-violet-300"
  },
  Cancelled: {
    ring: "border-rose-300/35",
    text: "text-rose-100",
    dot: "bg-rose-300"
  }
};

const StatusBadge = ({ status, className }) => {
  const palette = statusStyles[status] || statusStyles.Draft;

  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase",
        "bg-white/6 backdrop-blur-xl",
        palette.ring,
        palette.text,
        className
      )}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <motion.span
        className={cn("h-2 w-2 rounded-full", palette.dot)}
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {status}
    </motion.span>
  );
};

export default StatusBadge;
