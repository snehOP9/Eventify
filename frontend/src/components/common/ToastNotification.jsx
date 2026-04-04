import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const toneMap = {
  success: {
    icon: CheckCircle2,
    classes: "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
  },
  warning: {
    icon: TriangleAlert,
    classes: "border-amber-400/25 bg-amber-500/10 text-amber-100"
  },
  info: {
    icon: Info,
    classes: "border-sky-400/25 bg-sky-500/10 text-sky-100"
  }
};

const ToastNotification = ({ toasts, onRemove }) => {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[70] mx-auto flex w-full max-w-7xl flex-col items-end gap-3 px-4 sm:px-6">
      <AnimatePresence>
        {toasts.map((toast) => {
          const tone = toneMap[toast.tone] || toneMap.info;
          const Icon = tone.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.96 }}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[1.4rem] border px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl ${tone.classes}`}
            >
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm text-white/70">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onRemove(toast.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotification;
