import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarRange,
  ChartColumnBig,
  Compass,
  Headset,
  Layers3,
  MessageSquareText,
  Settings,
  Sparkles,
  Ticket,
  Users,
  X
} from "lucide-react";
import { Link } from "react-router-dom";

const sidebarConfig = {
  attendee: {
    title: "Attendee Lounge",
    subtitle: "Track passes, upcoming moments, and recommendations",
    items: [
      { label: "Overview", href: "#overview", icon: Layers3 },
      { label: "Bookings", href: "#bookings", icon: Ticket },
      { label: "Recommendations", href: "#recommendations", icon: Compass }
    ]
  },
  organizer: {
    title: "Organizer Studio",
    subtitle: "Analytics, participants, and live event operations",
    items: [
      { label: "Overview", href: "#overview", icon: ChartColumnBig },
      { label: "Manage events", href: "#manage-events", icon: CalendarRange },
      { label: "Intelligence", href: "#intelligence", icon: Sparkles },
      { label: "Participants", href: "#participants", icon: Users },
      { label: "Messages", href: "#participants", icon: MessageSquareText },
      { label: "Settings", href: "#overview", icon: Settings }
    ]
  }
};

const SidebarPanel = ({ variant, onClose }) => {
  const config = sidebarConfig[variant];
  const homePath = variant === "organizer" ? "/organizer" : "/dashboard";

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-[rgba(7,11,25,0.9)] px-5 py-6 backdrop-blur-2xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <Link to={homePath} className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.3rem] border border-white/10 bg-white/[0.04] text-[var(--primary)]">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-white">{config.title}</p>
            <p className="text-sm text-white/42">{config.subtitle}</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white lg:hidden"
          aria-label="Close dashboard navigation"
        >
          <X size={16} />
        </button>
      </div>

      <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/35">Current mode</p>
        <p className="mt-3 font-display text-xl font-semibold text-white">{config.title}</p>
        <p className="mt-2 text-sm leading-7 text-white/58">
          Designed for people who expect dashboards to feel deliberate, not cluttered.
        </p>
      </div>

      <nav className="mt-8 space-y-2">
        {config.items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-[1.2rem] border border-transparent px-4 py-3 text-sm font-medium text-white/60 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
            onClick={onClose}
          >
            <item.icon size={18} className="text-[var(--primary)]" />
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-auto rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(98,240,212,0.08),rgba(123,118,255,0.08))] px-4 py-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/35">Need a public view?</p>
        <Link
          to="/events"
          className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white"
        >
          Browse event catalog
        </Link>
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white"
        >
          <Headset size={14} />
          Support desk
        </button>
      </div>
    </aside>
  );
};

const DashboardSidebar = ({ variant, isOpen, onClose }) => {
  return (
    <>
      <div className="hidden w-80 shrink-0 lg:block">
        <div className="sticky top-[var(--dashboard-shell-top)] h-[calc(100vh-var(--dashboard-shell-top))]">
          <SidebarPanel variant={variant} onClose={onClose} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 bottom-0 top-[var(--dashboard-top-offset)] z-50 bg-[rgba(3,6,18,0.74)] backdrop-blur-xl lg:hidden"
          >
            <motion.div
              initial={{ x: -36 }}
              animate={{ x: 0 }}
              exit={{ x: -36 }}
              className="h-full w-[86vw] max-w-sm"
            >
              <SidebarPanel variant={variant} onClose={onClose} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default DashboardSidebar;
