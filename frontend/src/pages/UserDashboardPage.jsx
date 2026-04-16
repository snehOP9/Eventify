import { useCallback, useEffect, useState } from "react";
import { Bell, Download, ScanQrCode, Sparkles, XCircle } from "lucide-react";
import GlowingCard from "../components/common/GlowingCard";
import SectionHeading from "../components/common/SectionHeading";
import Reveal from "../components/common/Reveal";
import EventCard from "../components/events/EventCard";
import TicketCard from "../components/common/TicketCard";
import AnimatedButton from "../components/common/AnimatedButton";
import { fetchUserDashboard } from "../services/dashboardService";
import { formatCurrency, formatDate } from "../utils/formatters";
import { useToast } from "../components/common/ToastProvider";

const UserDashboardPage = () => {
  const { pushToast } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [dashboardError, setDashboardError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = useCallback(async ({ manual = false } = {}) => {
    if (manual) {
      setIsRefreshing(true);
    }

    try {
      const nextDashboard = await fetchUserDashboard();
      setDashboard(nextDashboard);
      setDashboardError("");

      if (manual) {
        pushToast({
          title: nextDashboard?.meta?.source === "live" ? "Attendee data refreshed" : "Preview data reloaded",
          description:
            nextDashboard?.meta?.source === "live"
              ? "Your attendee dashboard is connected to live data again."
              : nextDashboard?.meta?.banner || "Live attendee data is still unavailable right now.",
          tone: nextDashboard?.meta?.source === "live" ? "success" : "warning"
        });
      }
    } catch {
      setDashboardError("We could not load the attendee dashboard right now.");
    } finally {
      if (manual) {
        setIsRefreshing(false);
      }
    }
  }, [pushToast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (dashboardError) {
    return (
      <div className="premium-card flex min-h-[320px] items-center justify-center px-6 py-8 text-center text-white/72">
        {dashboardError}
      </div>
    );
  }

  if (!dashboard) {
    return <div className="premium-card h-[560px] animate-pulse" />;
  }

  return (
    <div className="space-y-8">
      {dashboard.meta?.source !== "live" ? (
        <GlowingCard hover={false} className="px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-amber-100/70">Preview mode</p>
              <p className="mt-2 text-sm leading-7 text-white/68">
                {dashboard.meta?.banner}
              </p>
            </div>
            <AnimatedButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => loadDashboard({ manual: true })}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Retrying..." : "Retry live data"}
            </AnimatedButton>
          </div>
        </GlowingCard>
      ) : null}

      <section id="overview" className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <GlowingCard hover={false} className="px-6 py-6">
          <div className="glow-pill">Welcome back</div>
          <h2 className="mt-5 font-display text-4xl font-semibold text-white">
            {dashboard.profile.name}, your premium booking hub is looking sharp.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/62">
            Track upcoming experiences, open passes instantly, and stay current with notifications that matter.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.28em] text-white/35">Plan</p>
              <p className="mt-3 font-display text-2xl text-white">{dashboard.profile.plan}</p>
            </div>
            <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.28em] text-white/35">Member since</p>
              <p className="mt-3 font-display text-2xl text-white">{dashboard.profile.memberSince}</p>
            </div>
            <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.28em] text-white/35">Location</p>
              <p className="mt-3 font-display text-2xl text-white">{dashboard.profile.city}</p>
            </div>
          </div>
        </GlowingCard>

        <div className="grid gap-6">
          <GlowingCard hover={false} className="px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.3rem] border border-white/10 bg-white/[0.04] text-[var(--primary)]">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">Notifications</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-white">Signal only</h3>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {dashboard.notifications.map((notification) => (
                <div key={notification.id} className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="font-medium text-white">{notification.title}</p>
                  <p className="mt-2 text-sm text-white/58">{notification.detail}</p>
                </div>
              ))}
            </div>
          </GlowingCard>
        </div>
      </section>

      <section id="bookings" className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <SectionHeading eyebrow="Registered events" title="Your live passes and confirmed bookings" />
          {dashboard.registeredEvents.map((event) => (
            <Reveal key={event.id}>
              <GlowingCard hover={false} className="px-5 py-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <img src={event.poster} alt={event.title} className="h-20 w-20 rounded-[1.1rem] object-cover sm:h-24 sm:w-24 sm:rounded-[1.3rem]" />
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/35">{event.categoryLabel}</p>
                      <h3 className="mt-2 truncate font-display text-xl font-semibold text-white sm:text-2xl">{event.title}</h3>
                      <p className="mt-2 text-sm text-white/58">{formatDate(event.date)} | {event.city}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        pushToast({
                          title: "Ticket download started",
                          description: `${event.title} pass is preparing for export.`,
                          tone: "success"
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/80"
                    >
                      <Download size={16} />
                      Download ticket
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        pushToast({
                          title: "Cancellation queued",
                          description: `A mock cancel request for ${event.title} has been created.`,
                          tone: "warning"
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100"
                    >
                      <XCircle size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              </GlowingCard>
            </Reveal>
          ))}

          <GlowingCard hover={false} className="px-6 py-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">Booking momentum</p>
            <h3 className="mt-3 font-display text-2xl font-semibold text-white">Keep your schedule active</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
              You have {dashboard.registeredEvents.length} confirmed booking
              {dashboard.registeredEvents.length === 1 ? "" : "s"}. Add one more event to unlock richer recommendations and stronger momentum.
            </p>

            <div className="mt-6 space-y-3">
              {(dashboard.recommendedEvents || []).slice(0, 3).map((event) => (
                <div
                  key={`momentum-${event.id}`}
                  className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{event.title}</p>
                    <span className="text-sm text-[var(--primary)]">{formatCurrency(event.priceFrom)}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/58">
                    {formatDate(event.date)} | {event.city}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <AnimatedButton to="/events" variant="secondary">
                Browse all events
              </AnimatedButton>
              <AnimatedButton to="/events/free" variant="ghost">
                Explore free sessions
              </AnimatedButton>
            </div>
          </GlowingCard>
        </div>

        <div className="space-y-6">
          <SectionHeading eyebrow="Quick access" title="Tickets, activity, and momentum" />
          <GlowingCard hover={false} className="px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.3rem] border border-white/10 bg-white/[0.04] text-[var(--primary)]">
                <ScanQrCode size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">Upcoming events</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-white">Ready for entry</h3>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {dashboard.upcomingEvents.map((event) => (
                <TicketCard
                  key={event.id}
                  event={{
                    ...event,
                    location: event.location || event.venue || event.city
                  }}
                  passCode={`EVT-${event.id}-${String(event.title.length).padStart(3, "0")}`}
                  onDownload={() =>
                    pushToast({
                      title: "Digital pass downloaded",
                      description: `${event.title} pass is now available offline.`,
                      tone: "success"
                    })
                  }
                />
              ))}
            </div>
          </GlowingCard>

          <GlowingCard hover={false} className="px-6 py-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">Activity timeline</p>
            <div className="mt-6 space-y-5">
              {dashboard.activity.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[var(--primary)]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-white/48">{item.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlowingCard>
        </div>
      </section>

      <section id="recommendations" className="space-y-6">
        <SectionHeading eyebrow="Recommended next" title="Premium events that match your current momentum" />
        <div className="grid gap-6 xl:grid-cols-3">
          {dashboard.recommendedEvents.map((event) => (
            <Reveal key={event.id}>
              <EventCard event={event} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserDashboardPage;
