import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck2, RadioTower, ShieldCheck } from "lucide-react";
import AnimatedButton from "../common/AnimatedButton";
import { featuredStats } from "../../data/mockData";
import StatsCounter from "../common/StatsCounter";
import Reveal from "../common/Reveal";

const floatingBadges = [
  { label: "Live Events", icon: RadioTower, top: "10%", left: "8%" },
  { label: "Easy Registration", icon: CalendarCheck2, top: "18%", right: "8%" },
  { label: "Instant Confirmation", icon: ShieldCheck, bottom: "16%", left: "16%" }
];

const HeroSection = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 pt-6 lg:grid-cols-[1.08fr_0.92fr] lg:pt-10">
        <Reveal className="max-w-2xl">
          <div className="glow-pill">Aurora Glass / DFII 13 / Luxury futurism</div>
          <h1 className="mt-6 font-display text-[clamp(3rem,6vw,6rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-white">
            Discover.
            <br />
            Register.
            <br />
            <span className="text-gradient">Experience.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/66">
            The smartest way to manage events online with cinematic discovery, frictionless registration, and dashboards designed like premium software.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <AnimatedButton to="/events" icon={ArrowRight}>
              Explore events
            </AnimatedButton>
            <AnimatedButton to="/organizer" variant="secondary">
              Organizer studio
            </AnimatedButton>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["Concierge-level flow", "Glowing event cards", "Backend-ready API layer"].map((pill) => (
              <div
                key={pill}
                className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/65 backdrop-blur-xl"
              >
                {pill}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="hero-illustration relative overflow-hidden rounded-[2rem] border border-white/12 bg-[rgba(11,16,34,0.75)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
            <div className="hero-mesh absolute inset-0 opacity-80" />
            <div className="relative z-10 mx-auto grid min-h-[480px] max-w-lg place-items-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-8">
              <div className="aurora-ring absolute" />
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="absolute left-10 top-16 rounded-[1.6rem] border border-white/10 bg-[rgba(8,12,24,0.85)] px-4 py-4 shadow-[0_22px_70px_rgba(0,0,0,0.35)]"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">Live pulse</p>
                <p className="mt-2 font-display text-2xl text-white">124 events</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 14, 0], rotate: [0, -4, 0] }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="absolute right-12 top-28 w-40 rounded-[1.5rem] border border-white/10 bg-[rgba(8,12,24,0.88)] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.35)]"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">Conversion</p>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-full w-[82%] rounded-full bg-[linear-gradient(90deg,#62f0d4,#7b76ff)]" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">82%</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
                transition={{ duration: 7.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="relative z-10 w-full max-w-sm rounded-[1.9rem] border border-white/12 bg-[rgba(8,13,26,0.88)] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.42)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/35">Featured pass</p>
                    <p className="mt-2 font-display text-2xl text-white">Neo Summit 2026</p>
                  </div>
                  <div className="rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3 py-2 text-sm font-semibold text-[var(--primary)]">
                    VIP
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {[
                    "Curated keynote lineup",
                    "Fast-check ticket validation",
                    "Smart attendee timeline"
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/65"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>

              {floatingBadges.map((badge) => (
                <motion.div
                  key={badge.label}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5 + badge.label.length * 0.12, repeat: Number.POSITIVE_INFINITY }}
                  className="absolute rounded-full border border-white/10 bg-[rgba(8,13,26,0.78)] px-4 py-2 text-sm text-white/68 backdrop-blur-xl"
                  style={badge}
                >
                  <div className="flex items-center gap-2">
                    <badge.icon size={14} className="text-[var(--primary)]" />
                    {badge.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {featuredStats.map((stat) => (
          <StatsCounter key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
