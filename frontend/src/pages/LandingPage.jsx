import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import HeroSection from "../components/home/HeroSection";
import CategorySpotlight from "../components/home/CategorySpotlight";
import WhyChooseSection from "../components/home/WhyChooseSection";
import CtaBanner from "../components/home/CtaBanner";
import SectionHeading from "../components/common/SectionHeading";
import EventCard from "../components/events/EventCard";
import Reveal from "../components/common/Reveal";
import TestimonialCard from "../components/common/TestimonialCard";
import AnimatedButton from "../components/common/AnimatedButton";
import { categories, events, testimonials } from "../data/mockData";
import { staggerContainer, fadeUp } from "../utils/motion";

const featureCallouts = [
  {
    title: "Luxuriously fast checkouts",
    description: "Every ticket flow is staged to feel calm, obvious, and conversion-friendly.",
    icon: WalletCards
  },
  {
    title: "Confidence through clarity",
    description: "Event details, schedules, FAQs, and ticket tiers are organized with precision.",
    icon: ShieldCheck
  },
  {
    title: "Startup-grade presentation",
    description: "Every page is polished enough to live comfortably in a serious SaaS portfolio.",
    icon: Sparkles
  }
];

const LandingPage = () => {
  const featuredEvents = useMemo(
    () => events.filter((event) => event.featured).slice(0, 3),
    []
  );

  return (
    <div className="space-y-24 pb-8">
      <HeroSection />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured experiences"
          title="Discover the most magnetic events in the catalog"
          description="Designed to feel more like a premium media property than a basic event listing."
          action={
            <AnimatedButton to="/events" variant="ghost" icon={ArrowRight}>
              See full catalog
            </AnimatedButton>
          }
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 xl:grid-cols-3"
        >
          {featuredEvents.map((event) => (
            <motion.div key={event.id} variants={fadeUp}>
              <EventCard event={event} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Explore by energy"
          title="Event categories with distinct moods and momentum"
          description="Each lane is framed to help attendees find experiences that match both their interests and their vibe."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <Reveal key={category.id}>
              <CategorySpotlight category={category} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why Eventify"
          title="Luxury smoothness, Stripe cleanliness, Tesla energy"
          description="This frontend is intentionally designed to blend elegance, precision, and futuristic depth without slipping into visual noise."
        />
        <WhyChooseSection />
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="premium-card flex flex-col justify-between px-6 py-7">
            <div>
              <div className="glow-pill">Micro-interactions with intent</div>
              <h3 className="mt-5 font-display text-3xl font-semibold text-white">
                Every button, card, and transition is tuned for confidence.
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/62">
                Rather than generic motion for its own sake, the experience uses magnetic hover,
                tilt, reveal, and layered gradients to reinforce hierarchy and emotion.
              </p>
            </div>
            <div className="mt-8 grid gap-4">
              {featureCallouts.map((callout) => (
                <div
                  key={callout.title}
                  className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[var(--primary)]">
                      <callout.icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-display text-xl font-semibold text-white">
                        {callout.title}
                      </h4>
                      <p className="mt-2 text-sm leading-7 text-white/58">
                        {callout.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <Reveal key={testimonial.id}>
                <TestimonialCard testimonial={testimonial} />
              </Reveal>
            ))}
            <Reveal className="premium-card flex flex-col justify-between px-6 py-6 md:col-span-2">
              <div>
                <div className="glow-pill">Trusted by premium communities</div>
                <h3 className="mt-4 font-display text-3xl font-semibold text-white">
                  Built to move beyond "college project" expectations.
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
                  The app structure, mock services, routing, dashboard patterns, and visual
                  language are prepared for real backend integration and polished presentation.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <AnimatedButton to="/dashboard">Open attendee dashboard</AnimatedButton>
                <AnimatedButton to="/organizer" variant="secondary">
                  Open organizer dashboard
                </AnimatedButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CtaBanner />
      </section>
    </div>
  );
};

export default LandingPage;
