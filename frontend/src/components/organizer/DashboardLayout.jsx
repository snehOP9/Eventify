import { useState } from "react";
import OrganizerSidebar from "./OrganizerSidebar";
import OrganizerTopbar from "./OrganizerTopbar";

const DashboardLayout = ({
  children,
  sections,
  activeSection,
  onNavigate,
  organizer,
  onCreateEvent,
  onRefresh,
  refreshing
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020711] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(6,182,212,0.16),transparent_28%),radial-gradient(circle_at_85%_5%,rgba(245,158,11,0.15),transparent_28%),radial-gradient(circle_at_55%_90%,rgba(168,85,247,0.1),transparent_32%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:52px_52px] opacity-40" />

      <OrganizerSidebar
        sections={sections}
        activeSection={activeSection}
        onNavigate={onNavigate}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        organizer={organizer}
      />

      <div className="relative z-10 lg:pl-80">
        <OrganizerTopbar
          organizer={organizer}
          onOpenMenu={() => setMobileOpen(true)}
          onCreateEvent={onCreateEvent}
          onOpenAnnouncements={() => onNavigate("announcements")}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />

        <main className="mx-auto w-full max-w-[1760px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
