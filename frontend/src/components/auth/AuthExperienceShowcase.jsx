import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  CalendarRange,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users
} from "lucide-react";
import GlowingCard from "../common/GlowingCard";

const laneChips = ["Private access layer", "Role-routed workspace", "Live event memory"];

const metrics = [
  { label: "Access mode", value: "Realtime", detail: "Secure jump back into your active event world." },
  { label: "Session model", value: "JWT + SSO", detail: "Email login and Google continuation live in one flow." },
  { label: "Routing engine", value: "Role aware", detail: "Attendees and organizers land in the right control room." }
];

const signals = [
  {
    icon: CalendarRange,
    title: "Priority event access",
    detail: "Resume bookings, view upcoming confirmations, and step back into live registration flows instantly."
  },
  {
    icon: RadioTower,
    title: "Operational clarity",
    detail: "A polished entry surface creates trust before users ever reach the dashboard."
  },
  {
    icon: Users,
    title: "Multi-role readiness",
    detail: "One identity layer supports attendees, organizers, and team operators without visual clutter."
  }
];

const passChips = ["Neo Summit 2026", "Backstage ready", "Live confirmations", "Encrypted session"];

const AuthExperienceShowcase = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <GlowingCard hover={false} className="auth-command-stage px-6 py-7 sm:px-8 sm:py-8">
        <div className="auth-grid-noise absolute inset-0 opacity-80" />
        <div className="auth-accent-beam absolute right-[-8rem] top-[-6rem] h-72 w-72 rounded-full" />
        <div className="hero-mesh absolute inset-x-0 top-0 h-48 opacity-90" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <div className="glow-pill">
              <ShieldCheck size={14} />
              Secure access portal
            </div>
            <div className="auth-micro-pill">
              <Activity size={13} />
              Luxury mission control / cinematic boarding pass
            </div>
          </div>

          <div className="mt-7 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.34em] text-white/34">Distinctive access interface</p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl xl:text-[4.2rem] xl:leading-[1.02]">
              Unlock the live layer behind every Eventify experience.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              This screen is designed to feel like opening a high-value event dossier: calm, controlled, and precise,
              with enough atmosphere to be memorable without slowing the user down.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {laneChips.map((chip) => (
              <span key={chip} className="auth-micro-pill">
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-[1.45rem] border border-white/10 bg-white/[0.05] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/32">{metric.label}</p>
                <p className="mt-3 font-display text-2xl font-semibold text-white">{metric.value}</p>
                <p className="mt-2 text-sm leading-7 text-white/56">{metric.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
            <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(6,10,24,0.48)] p-4 sm:p-5">
              <motion.div
                className="auth-orbit-ring absolute left-1/2 top-1/2 h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2"
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
              <motion.div
                className="auth-orbit-ring absolute left-1/2 top-1/2 h-[11.5rem] w-[11.5rem] -translate-x-1/2 -translate-y-1/2"
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />

              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -8 }}
                animate={{ opacity: 1, y: 0, rotate: -8 }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="auth-dossier absolute left-3 top-8 w-[min(100%,29rem)] px-5 py-5 sm:left-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/32">Access dossier</p>
                    <h3 className="mt-3 font-display text-3xl font-semibold text-white">Eventify Control Pass</h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-white/10 bg-white/[0.06] text-[var(--primary)]">
                    <Sparkles size={17} />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/34">Identity</p>
                    <p className="mt-2 text-lg font-semibold text-white">Attendee / Organizer</p>
                    <p className="mt-2 text-sm text-white/56">The route after login adapts automatically to role context.</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/34">State</p>
                    <p className="mt-2 text-lg font-semibold text-white">Session armed</p>
                    <p className="mt-2 text-sm text-white/56">Token-based navigation is prepared for backend handoff.</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {passChips.map((chip) => (
                    <span key={chip} className="rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/54">
                      {chip}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24, rotate: 8 }}
                animate={{ opacity: 1, y: 0, rotate: 8 }}
                transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="auth-dossier absolute bottom-4 right-2 w-[13rem] px-4 py-4 sm:right-5"
              >
                <div className="flex items-center justify-between text-white/72">
                  <Ticket size={16} />
                  <ArrowUpRight size={15} />
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.24em] text-white/34">Tonight's lane</p>
                <p className="mt-2 font-display text-2xl font-semibold text-white">Live Catalog</p>
                <p className="mt-2 text-sm leading-7 text-white/56">
                  Browse featured drops, confirm seats, and slide straight into registrations.
                </p>
              </motion.div>
            </div>

            <div className="grid gap-4">
              {signals.map(({ icon: Icon, title, detail }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.16 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="auth-signal-card rounded-[1.45rem] px-5 py-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1.05rem] border border-white/10 bg-white/[0.05] text-[var(--primary)]">
                    <Icon size={18} />
                  </div>
                  <p className="mt-5 font-display text-xl font-semibold text-white">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-white/57">{detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </GlowingCard>
    </motion.div>
  );
};

export default AuthExperienceShowcase;
