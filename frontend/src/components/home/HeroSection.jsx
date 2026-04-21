import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import AnimatedButton from "../common/AnimatedButton";
import { featuredStats } from "../../data/mockData";
import StatsCounter from "../common/StatsCounter";
import Reveal from "../common/Reveal";

const HeroSection = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 pt-4 sm:gap-12 sm:pt-6 lg:grid-cols-[1.08fr_0.92fr] lg:pt-10">
        <Reveal className="max-w-2xl">
          <div className="glow-pill">Aurora Glass / DFII 13 / Luxury futurism</div>
          <h1 className="mt-6 font-display text-[clamp(2.7rem,9vw,6rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-white">
            Discover.
            <br />
            Register.
            <br />
            <span className="text-gradient">Experience.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/66 sm:text-lg">
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
          <div className="hero-illustration relative overflow-hidden rounded-[2rem] border border-white/12 bg-[rgba(11,16,34,0.75)] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-5">
            <div className="hero-mesh absolute inset-0 opacity-80" />
            <div className="relative z-10 mx-auto grid min-h-[360px] max-w-lg place-items-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5 sm:min-h-[480px] sm:p-8">
              <div className="aurora-ring absolute" />
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="absolute right-4 top-6 hidden w-40 rounded-[1.5rem] border border-white/10 bg-[rgba(8,12,24,0.88)] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.35)] sm:right-12 sm:top-24 sm:block sm:w-44"
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

              <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-[rgba(8,13,26,0.78)] px-4 py-2 text-sm text-white/68 backdrop-blur-xl sm:bottom-10 sm:left-10">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[var(--primary)]" />
                  Instant confirmation
                </div>
              </div>
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
