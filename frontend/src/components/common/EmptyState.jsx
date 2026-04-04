import { Compass } from "lucide-react";
import AnimatedButton from "./AnimatedButton";

const EmptyState = ({
  title = "No events matched your filters",
  description = "Adjust your search or category selection to surface more experiences.",
  actionLabel = "Reset filters",
  onAction
}) => {
  return (
    <div className="premium-card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.04] text-[var(--primary)]">
        <Compass size={34} />
      </div>
      <h3 className="mt-6 font-display text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-white/60">{description}</p>
      {onAction ? (
        <AnimatedButton onClick={onAction} variant="secondary" className="mt-8">
          {actionLabel}
        </AnimatedButton>
      ) : null}
    </div>
  );
};

export default EmptyState;
