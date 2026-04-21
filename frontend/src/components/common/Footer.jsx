import { ArrowUpRight, Github, Instagram, Linkedin, Sparkles } from "lucide-react";
import AnimatedButton from "./AnimatedButton";

const footerLinks = [
  { label: "Experiences", to: "/events" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Organizer", to: "/organizer" }
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/sneh.raunak/",
    icon: Instagram
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sneh-raunak/",
    icon: Linkedin
  },
  {
    label: "GitHub",
    href: "https://github.com/",
    icon: Github
  }
];

const Footer = () => {
  return (
    <footer className="relative border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="premium-card flex flex-col justify-between gap-8 px-6 py-8 lg:flex-row lg:items-center">
          <div>
            <div className="glow-pill">Built for polished event commerce</div>
            <h3 className="mt-4 font-display text-[clamp(2rem,4vw,2.5rem)] font-semibold text-white">
              Launch experiences that feel as premium as the people attending them.
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
              Eventify helps teams present, sell, and manage modern events with a product-grade attendee experience.
            </p>
          </div>
          <AnimatedButton to="/events" icon={ArrowUpRight} className="w-full sm:w-auto">
            Explore events
          </AnimatedButton>
        </div>

        <div className="flex flex-col justify-between gap-8 border-t border-white/10 pt-8 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[var(--primary)]">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-white">Eventify</p>
                <p className="text-sm text-white/45">Discover. Register. Experience.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-white/55">
            {footerLinks.map((link) => (
              <AnimatedButton key={link.label} to={link.to} variant="ghost" size="sm">
                {link.label}
              </AnimatedButton>
            ))}
          </div>

          <div className="flex items-center gap-3 text-white/45">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-[var(--primary)]/40 hover:text-white"
              >
                <item.icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
