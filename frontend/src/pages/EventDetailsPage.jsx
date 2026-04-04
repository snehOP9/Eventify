import { useEffect, useMemo, useState } from "react";
import { CalendarRange, Clock3, MapPin, Ticket, Users2 } from "lucide-react";
import { useParams } from "react-router-dom";
import AnimatedButton from "../components/common/AnimatedButton";
import FAQAccordion from "../components/common/FAQAccordion";
import PricingCard from "../components/common/PricingCard";
import Reveal from "../components/common/Reveal";
import SectionHeading from "../components/common/SectionHeading";
import GlowingCard from "../components/common/GlowingCard";
import RelatedEventsCarousel from "../components/events/RelatedEventsCarousel";
import { fetchEventById, fetchRelatedEvents } from "../services/eventService";
import { formatCurrency, formatDate } from "../utils/formatters";

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [eventData, relatedData] = await Promise.all([
        fetchEventById(eventId),
        fetchRelatedEvents(eventId)
      ]);

      setEvent(eventData);
      setRelatedEvents(relatedData);
    };

    loadData();
  }, [eventId]);

  const infoPoints = useMemo(
    () =>
      event
        ? [
            { label: "Date", value: formatDate(event.date), icon: CalendarRange },
            { label: "Time", value: event.time, icon: Clock3 },
            { label: "Venue", value: event.venue, icon: MapPin },
            { label: "Seats left", value: `${event.seatsLeft} remaining`, icon: Users2 }
          ]
        : [],
    [event]
  );

  if (!event) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="premium-card h-[520px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10">
        <div className="relative min-h-[520px] overflow-hidden">
          <img src={event.poster} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(5,8,20,0.95)_0%,rgba(5,8,20,0.68)_45%,rgba(5,8,20,0.82)_100%)]" />
          <div className="relative z-10 grid min-h-[520px] gap-8 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            <div className="flex flex-col justify-end">
              <div className="glow-pill">{event.heroTag}</div>
              <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.8rem,5vw,5rem)] font-semibold leading-[0.94] tracking-[-0.04em] text-white">
                {event.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">{event.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/68"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:flex lg:items-end lg:justify-end">
              <GlowingCard hover={false} className="w-full max-w-md px-6 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/35">Starting from</p>
                    <p className="mt-3 font-display text-4xl font-semibold text-white">
                      {formatCurrency(event.priceFrom)}
                    </p>
                  </div>
                  <div className="rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3 py-2 text-sm font-semibold text-[var(--primary)]">
                    {event.mode}
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {infoPoints.map((point) => (
                    <div
                      key={point.label}
                      className="flex items-center gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[var(--primary)]">
                        <point.icon size={18} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-white/35">{point.label}</p>
                        <p className="mt-1 text-sm text-white">{point.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <AnimatedButton to={`/register/${event.id}`} className="mt-8 w-full">
                  Register now
                </AnimatedButton>
              </GlowingCard>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-14">
          <div>
            <SectionHeading
              eyebrow="About this event"
              title="A cinematic event page that answers the right questions fast"
              description={event.about}
            />

            <div className="grid gap-6 md:grid-cols-2">
              {infoPoints.map((point) => (
                <Reveal key={point.label}>
                  <GlowingCard className="px-5 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/[0.04] text-[var(--primary)]">
                        <point.icon size={20} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-white/35">{point.label}</p>
                        <p className="mt-2 font-display text-xl font-semibold text-white">{point.value}</p>
                      </div>
                    </div>
                  </GlowingCard>
                </Reveal>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Ticket pricing"
              title="Elegant pricing cards with crisp hierarchy and sticky conversion support"
              description="Every tier is framed to feel intentional and easy to compare."
            />
            <div className="grid gap-6 xl:grid-cols-3">
              {event.ticketTiers.map((tier, index) => (
                <Reveal key={tier.id}>
                  <PricingCard tier={tier} highlighted={index === 1 || (event.ticketTiers.length === 1 && index === 0)} />
                </Reveal>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Schedule"
              title="A timeline that feels structured without feeling stiff"
              description="Designed to translate event flow into a rhythm that is easy to understand."
            />
            <div className="space-y-5">
              {event.timeline.map((slot, index) => (
                <Reveal key={`${slot.time}-${slot.title}`}>
                  <div className="grid gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-5 py-5 md:grid-cols-[140px_1fr]">
                    <div className="font-display text-2xl font-semibold text-[var(--primary)]">
                      {slot.time}
                    </div>
                    <div>
                      <p className="font-display text-2xl font-semibold text-white">{slot.title}</p>
                      <p className="mt-2 text-sm leading-7 text-white/62">{slot.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {event.speakers.length > 0 ? (
            <div>
              <SectionHeading
                eyebrow="Speakers and guests"
                title="Featured voices appearing on this experience"
              />
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {event.speakers.map((speaker) => (
                  <Reveal key={speaker.name}>
                    <GlowingCard className="h-full px-5 py-5">
                      <img
                        src={speaker.avatar}
                        alt={speaker.name}
                        className="h-72 w-full rounded-[1.3rem] object-cover"
                      />
                      <h3 className="mt-5 font-display text-2xl font-semibold text-white">
                        {speaker.name}
                      </h3>
                      <p className="mt-2 text-sm text-white/58">{speaker.role}</p>
                    </GlowingCard>
                  </Reveal>
                ))}
              </div>
            </div>
          ) : null}

          {event.faqs.length > 0 ? (
            <div>
              <SectionHeading eyebrow="FAQ" title="Quick answers that reduce hesitation" />
              <FAQAccordion items={event.faqs} />
            </div>
          ) : null}

          <div>
            <SectionHeading
              eyebrow="Related drops"
              title="More events your audience would likely explore next"
            />
            <RelatedEventsCarousel events={relatedEvents} />
          </div>
        </div>

        <div>
          <div className="sticky top-28">
            <GlowingCard hover={false} className="px-6 py-6">
              <p className="text-xs uppercase tracking-[0.3em] text-white/35">Sticky register card</p>
              <h3 className="mt-4 font-display text-3xl font-semibold text-white">
                Reserve your spot before the room closes out.
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Clear pricing, strong event framing, and fast conversion support all sit within easy reach.
              </p>
              <div className="mt-6 rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>Starting at</span>
                  <span className="font-semibold text-white">{formatCurrency(event.priceFrom)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-white/60">
                  <span>Availability</span>
                  <span className="font-semibold text-[var(--primary)]">{event.seatsLeft} seats left</span>
                </div>
              </div>
              <AnimatedButton to={`/register/${event.id}`} className="mt-8 w-full">
                Continue to registration
              </AnimatedButton>
            </GlowingCard>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetailsPage;
