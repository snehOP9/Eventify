import { AlertTriangle, EyeOff, ShieldAlert } from "lucide-react";
import AnimatedButton from "./AnimatedButton";

const ScreenShareBlockedState = ({
  title = "Screen sharing detected",
  description = "This page is protected and cannot be used while screen sharing is active.",
  showBackHome = false
}) => {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="premium-card relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
        <div className="hero-mesh absolute inset-0 opacity-80" />
        <div className="relative z-10">
          <div className="glow-pill">
            <ShieldAlert size={14} />
            Privacy lock enabled
          </div>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
              <p className="mt-4 text-base leading-8 text-white/62">{description}</p>

              <div className="mt-6 rounded-[1.1rem] border border-amber-300/20 bg-amber-500/10 px-4 py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="mt-0.5 text-amber-200" />
                  <p className="text-sm leading-7 text-amber-100/90">
                    Stop screen sharing and refresh this page to continue.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-rose-200">
              <EyeOff size={22} />
            </div>
          </div>

          {showBackHome ? (
            <div className="mt-7">
              <AnimatedButton to="/" variant="secondary">Back to Home</AnimatedButton>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ScreenShareBlockedState;
