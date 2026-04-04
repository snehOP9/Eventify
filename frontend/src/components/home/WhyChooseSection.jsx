import { Grid2x2, Radar, TicketCheck, WalletCards } from "lucide-react";
import GlowingCard from "../common/GlowingCard";

const benefits = [
  {
    title: "Cinematic discovery",
    description: "Premium event exploration with rich context, instant clarity, and immersive presentation.",
    icon: Grid2x2
  },
  {
    title: "Frictionless registration",
    description: "Multi-step registration designed for confidence, not cognitive load.",
    icon: TicketCheck
  },
  {
    title: "Operational visibility",
    description: "Dashboards that make revenue, attendance, and momentum feel easy to grasp.",
    icon: Radar
  },
  {
    title: "Backend-ready architecture",
    description: "Mock API services and Axios clients prepared for smooth Spring Boot integration.",
    icon: WalletCards
  }
];

const WhyChooseSection = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {benefits.map((benefit) => (
        <GlowingCard key={benefit.title} className="h-full px-5 py-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-white/10 bg-white/[0.04] text-[var(--primary)]">
            <benefit.icon size={24} />
          </div>
          <h3 className="mt-7 font-display text-2xl font-semibold text-white">{benefit.title}</h3>
          <p className="mt-3 text-sm leading-7 text-white/64">{benefit.description}</p>
        </GlowingCard>
      ))}
    </div>
  );
};

export default WhyChooseSection;
