import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarRange, LogOut, Menu, Sparkles, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import AnimatedButton from "./AnimatedButton";
import { cn } from "../../utils/cn";
import {
  AUTH_STATE_CHANGED_EVENT,
  clearAuthSession,
  getCurrentAuthIdentity,
  isOrganizerRole,
  resolveDashboardPath
} from "../../services/authService";
import { logoutOAuthSession } from "../../services/oauthService";

const baseLinks = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "Free", to: "/events/free" },
  { label: "Premium", to: "/events/premium" }
];

const navLinkClassName = ({ isActive }) =>
  cn(
    "rounded-full px-4 py-2 text-sm font-medium transition",
    isActive
      ? "bg-white/10 text-white"
      : "text-white/55 hover:bg-white/[0.05] hover:text-white"
  );

const Navbar = ({ compact = false, dashboardVariant = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [authIdentity, setAuthIdentity] = useState(() => getCurrentAuthIdentity());
  const navigate = useNavigate();
  const isDashboardNavbar = Boolean(dashboardVariant);

  useEffect(() => {
    const syncAuthProfile = () => {
      setAuthIdentity(getCurrentAuthIdentity());
    };

    window.addEventListener("storage", syncAuthProfile);
    window.addEventListener("focus", syncAuthProfile);
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, syncAuthProfile);

    return () => {
      window.removeEventListener("storage", syncAuthProfile);
      window.removeEventListener("focus", syncAuthProfile);
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, syncAuthProfile);
    };
  }, []);

  const signedInLabel =
    authIdentity.fullName?.trim() || authIdentity.email?.trim() || "Account";
  const authenticatedDashboardPath = resolveDashboardPath(authIdentity.role);
  const roleAwareLinks = authIdentity.isAuthenticated
    ? [
        ...baseLinks,
        {
          label: isOrganizerRole(authIdentity.role) ? "Organizer" : "Dashboard",
          to: authenticatedDashboardPath
        }
      ]
    : baseLinks;

  const primaryCta =
    dashboardVariant === "organizer"
      ? { to: "/organizer", label: "Organizer studio" }
      : compact || dashboardVariant === "attendee"
        ? { to: "/dashboard", label: "My bookings" }
        : authIdentity.isAuthenticated
          ? {
              to: authenticatedDashboardPath,
              label: isOrganizerRole(authIdentity.role) ? "Organizer studio" : "My bookings"
            }
        : { to: "/register/neo-summit-2026", label: "Reserve now" };

  const handleLogout = async () => {
    try {
      await logoutOAuthSession();
    } catch {
      // Clear local auth state even if remote logout fails.
    } finally {
      clearAuthSession();
      setIsOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header
      className={cn(
        isDashboardNavbar ? "fixed inset-x-0 top-0" : "sticky top-0",
        "z-40 border-b border-white/10 bg-[rgba(6,10,24,0.55)] backdrop-blur-2xl"
      )}
    >
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
          {roleAwareLinks.map((link) => (
            <NavLink key={link.label} to={link.to} className={navLinkClassName} end={link.to === "/"}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {authIdentity.isAuthenticated ? (
            <div className="inline-flex min-w-[140px] items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/90">
              {signedInLabel}
            </div>
          ) : (
            <>
              <AnimatedButton to="/login" variant="secondary" size="sm" className="min-w-[102px]">
                User login
              </AnimatedButton>
              <AnimatedButton to="/organizer/login" variant="ghost" size="sm">
                Organizer login
              </AnimatedButton>
            </>
          )}
          <AnimatedButton to="/events" variant="secondary" size="sm">
            Live catalog
          </AnimatedButton>
          <AnimatedButton to={primaryCta.to} size="sm" icon={CalendarRange}>
            {primaryCta.label}
          </AnimatedButton>
          {authIdentity.isAuthenticated ? (
            <AnimatedButton
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="ml-1 border-rose-400/30 text-rose-100 hover:border-rose-300/60 hover:bg-rose-500/12"
              icon={LogOut}
            >
              Logout
            </AnimatedButton>
          ) : null}
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
                {roleAwareLinks.map((link) => (
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

              {authIdentity.isAuthenticated ? (
                <>
                  <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/90">
                    Signed in as {signedInLabel}
                  </div>
                  <AnimatedButton
                    onClick={handleLogout}
                    variant="ghost"
                    className="mt-4 w-full border-rose-400/30 text-rose-100 hover:border-rose-300/60 hover:bg-rose-500/12"
                    icon={LogOut}
                  >
                    Logout
                  </AnimatedButton>
                </>
              ) : (
                <div className="mt-4 grid gap-3">
                  <AnimatedButton
                    to="/login"
                    className="w-full"
                    variant="secondary"
                    onClick={() => setIsOpen(false)}
                  >
                    User login
                  </AnimatedButton>
                  <AnimatedButton
                    to="/organizer/login"
                    className="w-full"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                  >
                    Organizer login
                  </AnimatedButton>
                </div>
              )}

              <AnimatedButton
                to={primaryCta.to}
                className="mt-6 w-full"
                onClick={() => setIsOpen(false)}
              >
                {primaryCta.label}
              </AnimatedButton>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
