import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus2, CircleDollarSign, Sparkles, UsersRound } from "lucide-react";
import GlowingCard from "../components/common/GlowingCard";
import Reveal from "../components/common/Reveal";
import SectionHeading from "../components/common/SectionHeading";
import OverviewChart from "../components/dashboard/OverviewChart";
import AnimatedButton from "../components/common/AnimatedButton";
import { fetchOrganizerDashboard } from "../services/dashboardService";
import { formatCurrency } from "../utils/formatters";
import { useToast } from "../components/common/ToastProvider";

const modalInitialState = {
  title: "",
  date: "",
  category: ""
};

const AdminDashboardPage = () => {
  const { pushToast } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(modalInitialState);

  useEffect(() => {
    fetchOrganizerDashboard().then(setDashboard);
  }, []);

  if (!dashboard) {
    return <div className="premium-card h-[560px] animate-pulse" />;
  }

  const handleCreateEvent = () => {
    pushToast({
      title: "Mock event draft created",
      description: `${modalData.title || "Untitled Event"} is staged in the organizer queue.`,
      tone: "success"
    });
    setIsModalOpen(false);
    setModalData(modalInitialState);
  };

  return (
    <div className="space-y-8">
      <section id="overview" className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6 sm:grid-cols-2">
          {dashboard.overview.map((stat) => (
            <Reveal key={stat.id}>
              <GlowingCard hover={false} className="px-5 py-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">{stat.label}</p>
                <p className="mt-4 font-display text-4xl font-semibold text-white">
                  {stat.prefix || ""}
                  {stat.prefix ? Number(stat.value).toLocaleString() : stat.value}
                  {stat.suffix || ""}
                </p>
              </GlowingCard>
            </Reveal>
          ))}
        </div>

        <GlowingCard hover={false} className="px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="glow-pill">Launch command</div>
              <h2 className="mt-4 font-display text-4xl font-semibold text-white">
                Operate your event business like a premium product.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/62">
                Monitor revenue, create new experiences, manage attendance, and keep the ecosystem moving from one elegant console.
              </p>
            </div>
            <AnimatedButton onClick={() => setIsModalOpen(true)} icon={CalendarPlus2}>
              Create event
            </AnimatedButton>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <div className="flex items-center gap-3 text-[var(--primary)]">
                <CircleDollarSign size={18} />
                <span className="text-xs uppercase tracking-[0.28em] text-white/35">Revenue quality</span>
              </div>
              <p className="mt-4 font-display text-3xl text-white">{formatCurrency(dashboard.overview[0].value)}</p>
            </div>
            <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <div className="flex items-center gap-3 text-[var(--primary)]">
                <UsersRound size={18} />
                <span className="text-xs uppercase tracking-[0.28em] text-white/35">Audience pulse</span>
              </div>
              <p className="mt-4 font-display text-3xl text-white">{dashboard.participants.length} active</p>
            </div>
          </div>
        </GlowingCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <OverviewChart series={dashboard.chartSeries} />

        <GlowingCard hover={false} className="px-6 py-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/35">Recent activity</p>
          <div className="mt-6 space-y-4">
            {dashboard.recentActivities.map((activity) => (
              <div key={activity} className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[var(--primary)]">
                    <Sparkles size={16} />
                  </div>
                  <p className="text-sm leading-7 text-white/64">{activity}</p>
                </div>
              </div>
            ))}
          </div>
        </GlowingCard>
      </section>

      <section id="manage-events" className="space-y-6">
        <SectionHeading eyebrow="Manage events" title="Cards that make event operations feel visual and high signal" />
        <div className="grid gap-6 xl:grid-cols-2">
          {dashboard.managedEvents.map((event) => (
            <Reveal key={event.id}>
              <GlowingCard hover={false} className="overflow-hidden px-0 py-0">
                <img src={event.poster} alt={event.title} className="h-56 w-full object-cover" />
                <div className="px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-white/35">{event.categoryLabel}</p>
                      <h3 className="mt-2 font-display text-3xl font-semibold text-white">{event.title}</h3>
                      <p className="mt-2 text-sm text-white/58">{event.city} · {event.time}</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white">
                      {event.seatsLeft} seats left
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/62">{event.shortDescription}</p>
                </div>
              </GlowingCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="participants" className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <GlowingCard hover={false} className="px-6 py-6">
          <SectionHeading eyebrow="Registration table" title="Recent registrations" className="mb-6" />
          <div className="overflow-hidden rounded-[1.4rem] border border-white/10">
            <div className="grid grid-cols-[1.1fr_1fr_0.8fr_0.7fr] bg-white/[0.04] px-4 py-3 text-xs uppercase tracking-[0.28em] text-white/35">
              <span>Attendee</span>
              <span>Event</span>
              <span>Ticket</span>
              <span>Status</span>
            </div>
            {dashboard.registrations.map((registration) => (
              <div key={registration.id} className="grid grid-cols-[1.1fr_1fr_0.8fr_0.7fr] border-t border-white/10 px-4 py-4 text-sm text-white/68">
                <span>{registration.attendee}</span>
                <span>{registration.event}</span>
                <span>{registration.ticket}</span>
                <span className={registration.status === "Confirmed" ? "text-emerald-200" : "text-amber-100"}>
                  {registration.status}
                </span>
              </div>
            ))}
          </div>
        </GlowingCard>

        <GlowingCard hover={false} className="px-6 py-6">
          <SectionHeading eyebrow="Participant pulse" title="People currently in the system" className="mb-6" />
          <div className="flex flex-wrap gap-3">
            {dashboard.participants.map((participant) => (
              <span key={participant} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/68">
                {participant}
              </span>
            ))}
          </div>
        </GlowingCard>
      </section>

      <AnimatePresence>
        {isModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(5,8,20,0.78)] px-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              className="premium-card w-full max-w-xl px-6 py-6"
            >
              <SectionHeading
                eyebrow="Create event"
                title="Stage a new experience"
                description="Frontend-only modal designed to slot into future organizer workflows."
                className="mb-6"
              />
              <div className="grid gap-4">
                <input
                  value={modalData.title}
                  onChange={(event) => setModalData((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Signal Nights 2026"
                  className="h-13 rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[var(--primary)]/40"
                />
                <input
                  value={modalData.date}
                  onChange={(event) => setModalData((current) => ({ ...current, date: event.target.value }))}
                  placeholder="2026-08-20"
                  className="h-13 rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[var(--primary)]/40"
                />
                <input
                  value={modalData.category}
                  onChange={(event) => setModalData((current) => ({ ...current, category: event.target.value }))}
                  placeholder="Technology"
                  className="h-13 rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[var(--primary)]/40"
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <AnimatedButton onClick={handleCreateEvent}>Save draft</AnimatedButton>
                <AnimatedButton onClick={() => setIsModalOpen(false)} variant="secondary">Cancel</AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboardPage;
