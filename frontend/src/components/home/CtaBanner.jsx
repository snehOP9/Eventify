import { ArrowUpRight } from "lucide-react";
import AnimatedButton from "../common/AnimatedButton";

const CtaBanner = () => {
  return (
    <div className="premium-card relative overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(98,240,212,0.14),rgba(123,118,255,0.08),transparent)]" />
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="glow-pill">Ready to launch something unforgettable?</div>
          <h3 className="mt-4 max-w-3xl font-display text-3xl font-semibold text-white sm:text-4xl">
            Give your attendees the kind of registration experience they instantly trust.
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/64">
            Browse the live catalog as an attendee or switch into organizer mode to preview the analytics and event management flow.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <AnimatedButton to="/events" icon={ArrowUpRight}>
            Explore now
          </AnimatedButton>
          <AnimatedButton to="/organizer" variant="secondary">
            Open organizer studio
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
};

export default CtaBanner;
