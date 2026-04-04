import { useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import AnimatedButton from "../common/AnimatedButton";
import { formatCurrency, formatDate, getEventStatus } from "../../utils/formatters";

const EventCard = ({ event }) => {
  const [isHovered, setIsHovered] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springX = useSpring(rotateX, { stiffness: 170, damping: 18 });
  const springY = useSpring(rotateY, { stiffness: 170, damping: 18 });
  const glareX = useTransform(springY, [-10, 10], ["20%", "80%"]);
  const glareY = useTransform(springX, [-10, 10], ["20%", "80%"]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 40%)`;

  const handleMove = (eventDom) => {
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
      <div className="absolute inset-0 rounded-[1.8rem]" style={{ background: glare, opacity: isHovered ? 1 : 0 }} />
      <div className="relative">
        <div className="relative overflow-hidden">
          <img
            src={event.poster}
            alt={event.title}
            className="h-60 w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(5,8,20,0.08)_55%,rgba(5,8,20,0.85)_100%)]" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-[rgba(8,12,26,0.72)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/72">
              {event.categoryLabel}
            </span>
            <span className="rounded-full border border-[var(--primary)]/25 bg-[var(--primary)]/12 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--primary)]">
              {getEventStatus(event.date)}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-white/60">{event.heroTag}</p>
              <h3 className="mt-1 font-display text-2xl font-semibold text-white">
                {event.title}
              </h3>
            </div>
            <div className="rounded-full border border-white/10 bg-[rgba(8,12,26,0.72)] px-3 py-2 text-sm font-semibold text-white">
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
