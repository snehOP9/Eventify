import { useMemo, useState } from "react";
import { BellRing, Menu, Sparkles } from "lucide-react";
import BackgroundScene from "../components/common/BackgroundScene";
import PageTransition from "../components/common/PageTransition";
import AnimatedButton from "../components/common/AnimatedButton";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";

const DashboardLayout = ({ children, variant = "attendee" }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const headerCopy = useMemo(
    () =>
      variant === "organizer"
        ? {
            title: "Control tower for high-conversion event operations",
            subtitle:
              "Track revenue, registrations, engagement, and launch new experiences with confidence."
          }
        : {
            title: "Your event universe, curated beautifully",
            subtitle:
              "Stay ahead of what is booked, what is next, and what deserves your attention."
          },
    [variant]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-white">
      <BackgroundScene density="medium" />
      <div className="relative z-10 flex min-h-screen">
        <DashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant={variant}
        />

        <div className="flex min-h-screen flex-1 flex-col lg:pl-80">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(6,10,24,0.55)] backdrop-blur-2xl">
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
                  aria-label="Open dashboard navigation"
                >
                  <Menu size={18} />
                </button>
                <div>
                  <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/60">
                    <Sparkles size={14} className="text-[var(--primary)]" />
                    {variant === "organizer" ? "Organizer Studio" : "Attendee Lounge"}
                  </div>
                  <h1 className="font-display text-lg font-semibold text-white sm:text-2xl">
                    {headerCopy.title}
                  </h1>
                  <p className="mt-1 hidden max-w-2xl text-sm text-white/55 sm:block">
                    {headerCopy.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:border-[var(--primary)]/40 hover:bg-white/10 hover:text-white"
                  aria-label="Notifications"
                >
                  <BellRing size={18} />
                </button>
                <AnimatedButton
                  to={variant === "organizer" ? "/events" : "/organizer"}
                  size="sm"
                  variant="ghost"
                  className="hidden sm:inline-flex"
                >
                  {variant === "organizer" ? "Preview storefront" : "Open organizer view"}
                </AnimatedButton>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
