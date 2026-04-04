import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarRange, Menu, Sparkles, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import AnimatedButton from "./AnimatedButton";
import { cn } from "../../utils/cn";
import { getStoredAuthProfile } from "../../services/authService";
const links = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Organizer", to: "/organizer" }
];

const navLinkClassName = ({ isActive }) =>
  cn(
    "rounded-full px-4 py-2 text-sm font-medium transition",
    isActive
      ? "bg-white/10 text-white"
      : "text-white/55 hover:bg-white/[0.05] hover:text-white"
  );

const Navbar = ({ compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [authProfile, setAuthProfile] = useState(() => getStoredAuthProfile());

  useEffect(() => {
    const syncAuthProfile = () => {
      setAuthProfile(getStoredAuthProfile());
    };

    window.addEventListener("storage", syncAuthProfile);
    window.addEventListener("focus", syncAuthProfile);

    return () => {
      window.removeEventListener("storage", syncAuthProfile);
      window.removeEventListener("focus", syncAuthProfile);
    };
  }, []);

  const signedInLabel = authProfile?.fullName || authProfile?.email || "Sign in";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(6,10,24,0.55)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] border border-white/10 bg-white/[0.04] text-[var(--primary)] shadow-[0_16px_48px_rgba(45,217,210,0.18)]">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-white">Eventify</p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">Online Event Platform</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-2 lg:flex">
          {links.map((link) => (
            <NavLink key={link.label} to={link.to} className={navLinkClassName} end={link.to === "/"}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <AnimatedButton to="/login" variant="secondary" size="sm">
            {signedInLabel}
          </AnimatedButton>
          <AnimatedButton to="/events" variant="secondary" size="sm">
            Live catalog
          </AnimatedButton>
          <AnimatedButton to={compact ? "/dashboard" : "/register/neo-summit-2026"} size="sm" icon={CalendarRange}>
            {compact ? "My bookings" : "Reserve now"}
          </AnimatedButton>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[rgba(5,8,20,0.7)] backdrop-blur-xl lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="mx-4 mt-4 rounded-[2rem] border border-white/10 bg-[rgba(10,15,32,0.96)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[var(--primary)]">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold text-white">Navigate Eventify</p>
                    <p className="text-sm text-white/45">Precision-built event experiences</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white"
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                {links.map((link) => (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    end={link.to === "/"}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex rounded-[1.2rem] border px-4 py-3 text-sm font-medium transition",
                        isActive
                          ? "border-[var(--primary)]/30 bg-[var(--primary)]/10 text-white"
                          : "border-white/10 bg-white/[0.03] text-white/70"
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <AnimatedButton
                to="/login"
                className="mt-4 w-full"
                variant="secondary"
                onClick={() => setIsOpen(false)}
              >
                {signedInLabel}
              </AnimatedButton>

              <AnimatedButton
                to="/register/neo-summit-2026"
                className="mt-6 w-full"
                onClick={() => setIsOpen(false)}
              >
                Reserve featured experience
              </AnimatedButton>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
