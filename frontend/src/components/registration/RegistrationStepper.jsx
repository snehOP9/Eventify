const steps = [
  "Personal info",
  "Ticket selection",
  "Razorpay checkout",
  "Review"
];

const RegistrationStepper = ({ currentStep = 0 }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div
            key={step}
            className={`rounded-[1.35rem] border px-4 py-4 transition ${
              isCurrent
                ? "border-[var(--primary)]/40 bg-[var(--primary)]/10"
                : isComplete
                  ? "border-emerald-400/25 bg-emerald-500/10"
                  : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  isCurrent
                    ? "bg-[var(--primary)] text-slate-950"
                    : isComplete
                      ? "bg-emerald-400 text-slate-950"
                      : "bg-white/10 text-white/50"
                }`}
              >
                {index + 1}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">Step {index + 1}</p>
                <p className="mt-1 font-medium text-white">{step}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RegistrationStepper;
