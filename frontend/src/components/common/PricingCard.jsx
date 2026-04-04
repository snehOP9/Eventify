import { CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import AnimatedButton from "./AnimatedButton";
import GlowingCard from "./GlowingCard";

const PricingCard = ({ tier, highlighted = false, onSelect }) => {
  return (
    <GlowingCard
      className={`h-full px-6 py-6 ${highlighted ? "ring-1 ring-[rgba(80,245,215,0.3)]" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-white/40">
            {highlighted ? "Most loved" : "Ticket tier"}
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-white">{tier.title}</h3>
        </div>
        <div className="rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3 py-1 text-sm font-medium text-[var(--primary)]">
          {formatCurrency(tier.price)}
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {tier.perks.map((perk) => (
          <div key={perk} className="flex items-start gap-3 text-sm text-white/70">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--primary)]" />
            <span>{perk}</span>
          </div>
        ))}
      </div>
      {onSelect ? (
        <AnimatedButton
          onClick={() => onSelect(tier)}
          variant={highlighted ? "primary" : "secondary"}
          className="mt-8 w-full"
        >
          Select tier
        </AnimatedButton>
      ) : null}
    </GlowingCard>
  );
};

export default PricingCard;
