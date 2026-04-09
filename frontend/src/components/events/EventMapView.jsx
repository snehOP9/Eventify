import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { formatDate } from "../../utils/formatters";

const markerPositions = [
  { top: "18%", left: "26%" },
  { top: "34%", left: "61%" },
  { top: "58%", left: "40%" },
  { top: "70%", left: "73%" },
  { top: "46%", left: "18%" },
  { top: "24%", left: "78%" }
];

const EventMapView = ({ events = [] }) => {
  const [activeId, setActiveId] = useState(events[0]?.id || null);

  const activeEvent = useMemo(
    () => events.find((event) => event.id === activeId) || events[0],
    [events, activeId]
  );

  if (!events.length) {
    return null;
  }

  return (
    <div className="premium-card overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/35">Interactive map view</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-white">Explore events by location</h3>
        </div>
      </div>

      <div className="relative h-[340px] overflow-hidden rounded-[1.4rem] border border-white/10 bg-[radial-gradient(circle_at_20%_18%,rgba(98,240,212,0.18),transparent_35%),radial-gradient(circle_at_78%_20%,rgba(123,118,255,0.17),transparent_33%),linear-gradient(180deg,rgba(11,16,36,0.9),rgba(8,12,26,0.9))]">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:36px_36px]" />

        {events.slice(0, 6).map((event, index) => {
          const marker = markerPositions[index % markerPositions.length];
          const isActive = activeEvent?.id === event.id;

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => setActiveId(event.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? "border-[var(--primary)]/50 bg-[var(--primary)]/20 text-white"
                  : "border-white/12 bg-[rgba(8,13,30,0.7)] text-white/72"
              }`}
              style={{ top: marker.top, left: marker.left }}
            >
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} className={isActive ? "text-[var(--primary)]" : "text-white/50"} />
                {event.city}
              </span>
            </button>
          );
        })}

        {activeEvent ? (
          <div className="absolute bottom-4 left-4 right-4 rounded-[1.2rem] border border-white/10 bg-[rgba(6,10,24,0.85)] px-4 py-4 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-white/35">Location preview</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl font-semibold text-white">{activeEvent.title}</p>
                <p className="mt-1 text-sm text-white/60">{activeEvent.city} · {formatDate(activeEvent.date)}</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/75">
                {activeEvent.seatsLeft} seats left
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default EventMapView;
