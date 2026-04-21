import { useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import AnimatedButton from "../common/AnimatedButton";
import { formatCurrency, formatDate, getEventStatus } from "../../utils/formatters";

const EventCard = ({ event }) => {
  const [isHovered, setIsHovered] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const tiltEnabled =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const springX = useSpring(rotateX, { stiffness: 170, damping: 18 });
  const springY = useSpring(rotateY, { stiffness: 170, damping: 18 });
  const glareX = useTransform(springY, [-10, 10], ["20%", "80%"]);
  const glareY = useTransform(springX, [-10, 10], ["20%", "80%"]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 40%)`;
  const recentRegistrations = (event.id.length * 3) % 17 + 5;
  const seatsUrgency = event.seatsLeft <= 12;

  const handleMove = (eventDom) => {
    if (!tiltEnabled) {
      return;
    }

    const rect = eventDom.currentTarget.getBoundingClientRect();
    const x = eventDom.clientX - rect.left;
    const y = eventDom.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    rotateX.set(((y - centerY) / centerY) * -8);
    rotateY.set(((x - centerX) / centerX) * 8);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.article
      onMouseMove={handleMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={resetTilt}
      style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
      className="group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[rgba(10,14,30,0.72)] shadow-[0_24px_72px_rgba(0,0,0,0.28)]"
    >
      <div
        className="absolute inset-0 rounded-[1.8rem]"
        style={{ background: glare, opacity: isHovered ? 1 : 0 }}
      />
      <div className="relative">
        <div className="relative overflow-hidden">
          <img
            src={event.poster}
            alt={event.title}
            className="h-52 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-60"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(5,8,20,0.08)_55%,rgba(5,8,20,0.85)_100%)]" />
          <div className="absolute left-3 right-3 top-3 flex flex-wrap items-center gap-2 sm:left-4 sm:right-auto sm:top-4">
            <span className="rounded-full border border-white/10 bg-[rgba(8,12,26,0.72)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/72">
              {event.categoryLabel}
            </span>
            <span className="rounded-full border border-[var(--primary)]/25 bg-[var(--primary)]/12 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--primary)]">
              {getEventStatus(event.date)}
            </span>
          </div>
          <div className="absolute right-3 top-14 flex max-w-[calc(100%-1.5rem)] flex-col items-end gap-2 sm:right-4 sm:top-16">
            <motion.div
              initial={{ opacity: 0.7, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-full border border-rose-300/25 bg-rose-500/12 px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-rose-100"
            >
              Hot: {recentRegistrations} registered recently
            </motion.div>
            <motion.div
              animate={seatsUrgency ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{
                duration: 1.6,
                repeat: seatsUrgency ? Number.POSITIVE_INFINITY : 0
              }}
              className={`rounded-full border px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.15em] ${
                seatsUrgency
                  ? "border-amber-300/30 bg-amber-500/15 text-amber-100"
                  : "border-white/12 bg-[rgba(8,12,26,0.72)] text-white/70"
              }`}
            >
              Only {event.seatsLeft} seats left
            </motion.div>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex flex-col items-start gap-3 sm:bottom-4 sm:left-4 sm:right-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="text-sm text-white/60">{event.heroTag}</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">
                {event.title}
              </h3>
            </div>
            <div className="self-start rounded-full border border-white/10 bg-[rgba(8,12,26,0.72)] px-3 py-2 text-sm font-semibold text-white sm:self-auto">
              {formatCurrency(event.priceFrom)}
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <p className="text-sm leading-7 text-white/63">{event.shortDescription}</p>

          <div className="grid gap-3 text-sm text-white/60 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <CalendarDays size={16} className="text-[var(--primary)]" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-[var(--primary)]" />
              <span>{event.city}</span>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Ticket size={16} className="text-[var(--primary)]" />
              <span>{event.seatsLeft} seats left for this drop</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <AnimatedButton to={`/events/${event.id}`} variant="secondary" className="flex-1">
              View details
            </AnimatedButton>
            <AnimatedButton to={`/register/${event.id}`} className="flex-1">
              Register
            </AnimatedButton>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default EventCard;
