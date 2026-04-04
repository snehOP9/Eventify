import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import AnimatedButton from "../common/AnimatedButton";

const SuccessModal = ({ open, confirmationCode, eventTitle, onClose }) => {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(5,8,20,0.78)] px-4 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            className="premium-card max-w-xl px-6 py-8 text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-emerald-400/20 bg-emerald-500/12 text-emerald-200">
              <CheckCircle2 size={38} />
            </div>
            <h3 className="mt-6 font-display text-3xl font-semibold text-white">
              Registration confirmed
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/62">
              You are officially registered for <span className="text-white">{eventTitle}</span>.
              Your confirmation code is <span className="text-[var(--primary)]">{confirmationCode}</span>.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <AnimatedButton to="/dashboard">Open my dashboard</AnimatedButton>
              <AnimatedButton onClick={onClose} variant="secondary">
                Stay on this page
              </AnimatedButton>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SuccessModal;
