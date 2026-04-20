import { motion } from "framer-motion";
import { Bell, Menu, Megaphone, Plus, RefreshCcw } from "lucide-react";
import PremiumButton from "./PremiumButton";

const OrganizerTopbar = ({
  organizer,
  onOpenMenu,
  onCreateEvent,
  onOpenAnnouncements,
  onRefresh,
  refreshing
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(2,9,20,0.72)] backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-[1760px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden"
            aria-label="Open organizer navigation"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">Organizer control center</p>
            <h1 className="truncate font-display text-xl font-semibold text-white sm:text-2xl">
              Welcome back, {organizer.fullName}
            </h1>
            <p className="truncate text-sm text-white/58">{organizer.organizationName}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenAnnouncements}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85"
            aria-label="Organizer notifications"
          >
            <Bell size={17} />
          </button>

          <PremiumButton
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            icon={RefreshCcw}
            className="hidden md:inline-flex"
          >
            {refreshing ? "Refreshing" : "Refresh"}
          </PremiumButton>

          <PremiumButton
            variant="secondary"
            size="sm"
            onClick={onOpenAnnouncements}
            icon={Megaphone}
            className="hidden sm:inline-flex"
          >
            Announce
          </PremiumButton>

          <PremiumButton size="sm" onClick={onCreateEvent} icon={Plus}>
            Create Event
          </PremiumButton>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-t border-cyan-300/15 bg-[linear-gradient(95deg,rgba(34,211,238,0.12),rgba(245,158,11,0.08),rgba(34,211,238,0.08))] px-4 py-2 text-xs text-white/70 sm:px-6 lg:px-8"
      >
        Keep draft events polished, then publish when banner, schedule, and ticket inventory are finalized.
      </motion.div>
    </header>
  );
};

export default OrganizerTopbar;
