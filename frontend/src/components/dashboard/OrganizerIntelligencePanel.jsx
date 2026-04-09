import { useMemo, useState } from "react";
import { AlertTriangle, BrainCircuit, Sparkles, TrendingUp } from "lucide-react";
import GlowingCard from "../common/GlowingCard";
import SectionHeading from "../common/SectionHeading";
import { deriveEventWindow } from "../../utils/calendarLinks";
import { formatCurrency, formatDate } from "../../utils/formatters";

const getLaunchReadiness = (event) => {
  let score = 35;

  if (event.shortDescription && event.shortDescription.length > 45) score += 10;
  if (event.description && event.description.length > 120) score += 12;
  if (event.timeline?.length >= 2) score += 10;
  if (event.ticketTiers?.length >= 2) score += 10;
  if (event.speakers?.length > 0) score += 8;
  if (event.faqs?.length > 0) score += 8;
  if (event.capacity && event.seatsLeft / event.capacity < 0.65) score += 7;

  return Math.min(100, score);
};

const findConflicts = (events) => {
  const conflicts = [];

  for (let i = 0; i < events.length; i += 1) {
    for (let j = i + 1; j < events.length; j += 1) {
      const first = events[i];
      const second = events[j];
      const firstWindow = deriveEventWindow(first);
      const secondWindow = deriveEventWindow(second);

      const sameDay = firstWindow.start.toDateString() === secondWindow.start.toDateString();
      const overlap = firstWindow.start < secondWindow.end && secondWindow.start < firstWindow.end;

      if (sameDay && overlap) {
        conflicts.push({
          id: `${first.id}-${second.id}`,
          first,
          second,
          window: `${formatDate(firstWindow.start)} ${first.time}`
        });
      }
    }
  }

  return conflicts;
};

const OrganizerIntelligencePanel = ({ events = [] }) => {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "");
  const [fillTarget, setFillTarget] = useState(78);
  const [priceShift, setPriceShift] = useState(0);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) || events[0],
    [events, selectedEventId]
  );

  const conflicts = useMemo(() => findConflicts(events), [events]);

  const readinessRows = useMemo(
    () =>
      events
        .map((event) => ({
          id: event.id,
          title: event.title,
          score: getLaunchReadiness(event)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4),
    [events]
  );

  const simulation = useMemo(() => {
    if (!selectedEvent) {
      return null;
    }

    const basePrice = selectedEvent.priceFrom;
    const targetPrice = Math.round(basePrice * (1 + priceShift / 100));
    const expectedAttendees = Math.round((selectedEvent.capacity || 200) * (fillTarget / 100));
    const projectedRevenue = targetPrice * expectedAttendees;

    return {
      basePrice,
      targetPrice,
      expectedAttendees,
      projectedRevenue
    };
  }, [selectedEvent, fillTarget, priceShift]);

  if (!events.length) {
    return null;
  }

  return (
    <section id="intelligence" className="space-y-6">
      <SectionHeading
        eyebrow="Organizer analytics"
        title="Launch operations for conflicts, readiness, and revenue scenarios"
        description="Run instant operational simulations before publishing your next event live."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlowingCard hover={false} className="px-6 py-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/35">Revenue simulator</p>
              <h3 className="mt-3 font-display text-3xl font-semibold text-white">Scenario Lab</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[var(--primary)]">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm text-white/55">Event focus</span>
              <select
                value={selectedEventId}
                onChange={(event) => setSelectedEventId(event.target.value)}
                className="h-13 w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-[var(--primary)]/40"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id} className="bg-slate-950">
                    {event.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm text-white/55">Fill target: {fillTarget}%</span>
              <input
                type="range"
                min="35"
                max="100"
                value={fillTarget}
                onChange={(event) => setFillTarget(Number(event.target.value))}
                className="w-full accent-[var(--primary)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-white/55">Price shift: {priceShift > 0 ? "+" : ""}{priceShift}%</span>
              <input
                type="range"
                min="-20"
                max="35"
                value={priceShift}
                onChange={(event) => setPriceShift(Number(event.target.value))}
                className="w-full accent-[var(--primary)]"
              />
            </label>
          </div>

          {simulation ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/35">Base price</p>
                <p className="mt-2 font-display text-2xl text-white">{formatCurrency(simulation.basePrice)}</p>
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/35">Adjusted price</p>
                <p className="mt-2 font-display text-2xl text-[var(--primary)]">{formatCurrency(simulation.targetPrice)}</p>
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/35">Expected attendees</p>
                <p className="mt-2 font-display text-2xl text-white">{simulation.expectedAttendees}</p>
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/35">Projected revenue</p>
                <p className="mt-2 font-display text-2xl text-emerald-300">{formatCurrency(simulation.projectedRevenue)}</p>
              </div>
            </div>
          ) : null}
        </GlowingCard>

        <div className="space-y-6">
          <GlowingCard hover={false} className="px-6 py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/35">Conflict radar</p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-white">Schedule collisions</h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-amber-300">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {conflicts.length === 0 ? (
                <div className="rounded-[1rem] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  No active overlaps detected in current event windows.
                </div>
              ) : (
                conflicts.map((conflict) => (
                  <div key={conflict.id} className="rounded-[1rem] border border-amber-300/25 bg-amber-500/10 px-4 py-3">
                    <p className="text-sm font-semibold text-white">{conflict.first.title} vs {conflict.second.title}</p>
                    <p className="mt-1 text-xs text-white/65">{conflict.window}</p>
                  </div>
                ))
              )}
            </div>
          </GlowingCard>

          <GlowingCard hover={false} className="px-6 py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/35">Launch readiness</p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-white">Top event scores</h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[var(--primary)]">
                <BrainCircuit size={18} />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {readinessRows.map((row) => (
                <div key={row.id} className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-white">{row.title}</p>
                    <span className="text-sm font-semibold text-[var(--primary)]">{row.score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#62f0d4,#7b76ff)]" style={{ width: `${row.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-xs leading-6 text-white/62">
              <Sparkles size={14} className="mb-2 text-[var(--primary)]" />
              Scores consider event details, schedule richness, multi-tier ticket structure, and launch completeness signals.
            </div>
          </GlowingCard>
        </div>
      </div>
    </section>
  );
};

export default OrganizerIntelligencePanel;
