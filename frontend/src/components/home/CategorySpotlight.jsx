import { Cpu, Headphones, Rocket, Sparkles } from "lucide-react";
import GlowingCard from "../common/GlowingCard";

const iconMap = {
  Sparkles,
  Rocket,
  Cpu,
  Headphones
};

const CategorySpotlight = ({ category }) => {
  const Icon = iconMap[category.icon] || Sparkles;

  return (
    <GlowingCard className={`relative overflow-hidden px-5 py-5`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${category.accent} opacity-70`} />
      <div className="relative z-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-white/10 bg-[rgba(9,14,28,0.8)] text-[var(--primary)]">
          <Icon size={24} />
        </div>
        <h3 className="mt-8 font-display text-2xl font-semibold text-white">{category.label}</h3>
        <p className="mt-3 text-sm leading-7 text-white/66">{category.tagline}</p>
      </div>
    </GlowingCard>
  );
};

export default CategorySpotlight;
