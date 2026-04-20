import { AnimatePresence, motion } from "framer-motion";
import { Building2, Megaphone, Sparkles, X } from "lucide-react";
import { cn } from "../../utils/cn";

const SidebarContent = ({ sections, activeSection, onNavigate, onClose, organizer }) => {
  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-[rgba(4,11,24,0.84)] px-4 py-5 backdrop-blur-2xl">
      <div className="mb-7 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Building2 size={18} />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-white">Organizer HQ</p>
            <p className="text-xs uppercase tracking-[0.18em] text-white/38">{organizer.organizationName}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 lg:hidden"
          aria-label="Close organizer navigation"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => {
              onNavigate(section.id);
              onClose();
            }}
            className={cn(
              "group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
              activeSection === section.id
                ? "border-cyan-300/50 bg-cyan-300/12 text-white"
                : "border-transparent bg-white/[0.03] text-white/68 hover:border-white/12 hover:bg-white/[0.06] hover:text-white"
            )}
          >
            <span
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition",
                activeSection === section.id
                  ? "border-cyan-300/50 bg-cyan-300/12 text-cyan-100"
                  : "border-white/12 bg-white/5 text-white/65 group-hover:text-cyan-100"
              )}
            >
              <section.icon size={15} />
            </span>
            <span className="text-sm font-semibold tracking-wide">{section.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-[linear-gradient(155deg,rgba(34,211,238,0.18),rgba(6,10,22,0.4))] px-4 py-4">
        <div className="flex items-center gap-2 text-cyan-100">
          <Sparkles size={14} />
          <p className="text-xs uppercase tracking-[0.18em]">Organizer insight</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/70">
          Keep events in Published state to unlock announcement boosts and registration trend snapshots.
        </p>
        <button
          type="button"
          onClick={() => {
            onNavigate("announcements");
            onClose();
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100"
        >
          <Megaphone size={14} />
          Open announcements
        </button>
      </div>
    </aside>
  );
};

const OrganizerSidebar = ({
  sections,
  activeSection,
  onNavigate,
  mobileOpen,
  onClose,
  organizer
}) => {
  return (
    <>
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-80">
        <SidebarContent
          sections={sections}
          activeSection={activeSection}
          onNavigate={onNavigate}
          onClose={() => undefined}
          organizer={organizer}
        />
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-[rgba(1,8,18,0.76)] backdrop-blur-xl lg:hidden"
          >
            <motion.div
              initial={{ x: -28 }}
              animate={{ x: 0 }}
              exit={{ x: -28 }}
              className="h-full w-[86vw] max-w-sm"
            >
              <SidebarContent
                sections={sections}
                activeSection={activeSection}
                onNavigate={onNavigate}
                onClose={onClose}
                organizer={organizer}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default OrganizerSidebar;
