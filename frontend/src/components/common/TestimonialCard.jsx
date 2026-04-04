import { Quote } from "lucide-react";
import GlowingCard from "./GlowingCard";

const TestimonialCard = ({ testimonial }) => {
  return (
    <GlowingCard className="h-full px-6 py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="h-14 w-14 rounded-2xl object-cover"
          />
          <div>
            <h3 className="font-display text-lg font-semibold text-white">{testimonial.name}</h3>
            <p className="text-sm text-white/55">{testimonial.role}</p>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[var(--primary)]">
          <Quote size={18} />
        </div>
      </div>
      <p className="mt-5 text-base leading-7 text-white/72">{testimonial.quote}</p>
    </GlowingCard>
  );
};

export default TestimonialCard;
