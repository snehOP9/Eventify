import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarRange,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "../components/common/AnimatedButton";
import GlowingCard from "../components/common/GlowingCard";
import { useToast } from "../components/common/ToastProvider";
import { loginWithEmail, resolveDashboardPath } from "../services/authService";
import { startGoogleLogin } from "../services/oauthService";

const highlights = [
  {
    icon: CalendarRange,
    title: "Priority event access",
    detail: "Jump back into saved registrations, ticket drops, and private event rooms without friction."
  },
  {
    icon: PanelsTopLeft,
    title: "Role-aware command center",
    detail: "Attendees land in booking control, while organizers move straight into their live ops dashboard."
  },
  {
    icon: Users,
    title: "Built for teams and solo guests",
    detail: "Move from single-ticket browsing to multi-role event management inside the same polished system."
  }
];

const accessLanes = ["Attendee bookings", "Organizer control", "Google SSO ready"];

const fieldClassName =
  "h-13 w-full rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[var(--primary)]/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_6px_rgba(70,246,210,0.08)]";

const initialFormState = {
  email: "",
  password: "",
  remember: true
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (field) => (event) => {
    const value = field === "remember" ? event.target.checked : event.target.value;
    setFormState((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formState.email) {
      nextErrors.email = "Enter the email attached to your Eventify account.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      nextErrors.email = "Use a valid email format.";
    }

    if (!formState.password) {
      nextErrors.password = "Enter your password to continue.";
    } else if (formState.password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      pushToast({
        title: "A few secure details are missing",
        description: "Complete the highlighted fields before continuing.",
        tone: "warning"
      });
      return;
    }

    setSubmitting(true);

    try {
      const authResponse = await loginWithEmail({
        email: formState.email.trim(),
        password: formState.password
      });

      pushToast({
        title: "Access granted",
        description: "Your Eventify workspace is ready.",
        tone: "success"
      });

      navigate(resolveDashboardPath(authResponse?.role), { replace: true });
    } catch (error) {
      const description =
        error?.response?.data?.message ||
        "We could not verify those credentials. Check them and try again.";

      pushToast({
        title: "Unable to complete sign in",
        description,
        tone: "error"
      });
      setErrors((current) => ({
        ...current,
        password: "Re-enter your password and try again."
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="premium-card overflow-hidden px-6 py-7 sm:px-8 sm:py-8">
            <div className="hero-mesh absolute inset-0" />
            <div className="relative">
              <div className="glow-pill">
                <ShieldCheck size={14} />
                Secure access portal
              </div>

              <div className="mt-6 max-w-2xl">
                <p className="text-sm uppercase tracking-[0.32em] text-white/38">Luxury minimal / mission control</p>
                <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Step into the command center for every event you track, manage, and host.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-white/62">
                  Eventify sign-in is designed as a precision access layer: calm, premium, and ready for both secure
                  email login and instant Google continuation.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {accessLanes.map((lane) => (
                  <span
                    key={lane}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/58"
                  >
                    {lane}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">Mode</p>
                  <p className="mt-3 font-display text-2xl font-semibold text-white">Live access</p>
                  <p className="mt-2 text-sm leading-7 text-white/58">Open your workspace in one calm step.</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">Security</p>
                  <p className="mt-3 font-display text-2xl font-semibold text-white">JWT ready</p>
                  <p className="mt-2 text-sm leading-7 text-white/58">Backend integration is already wired for token flows.</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">Routing</p>
                  <p className="mt-3 font-display text-2xl font-semibold text-white">Role aware</p>
                  <p className="mt-2 text-sm leading-7 text-white/58">Organizers and attendees land in the right place automatically.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, detail }) => (
              <GlowingCard key={title} hover={false} className="px-5 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[var(--primary)]">
                  <Icon size={18} />
                </div>
                <p className="mt-5 font-display text-xl font-semibold text-white">{title}</p>
                <p className="mt-3 text-sm leading-7 text-white/58">{detail}</p>
              </GlowingCard>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlowingCard hover={false} className="relative overflow-hidden px-6 py-6 sm:px-7 sm:py-7">
            <div className="hero-mesh absolute inset-x-0 top-0 h-40 opacity-80" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/35">Sign in</p>
                  <h2 className="mt-3 font-display text-3xl font-semibold text-white">Welcome back to Eventify</h2>
                  <p className="mt-3 max-w-md text-sm leading-7 text-white/58">
                    Use Google for the fastest path in, or continue with email and password for your existing workspace.
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.3rem] border border-white/10 bg-white/[0.05] text-[var(--primary)]">
                  <Sparkles size={18} />
                </div>
              </div>

              <div className="mt-7">
                <AnimatedButton
                  onClick={startGoogleLogin}
                  variant="secondary"
                  className="w-full justify-between rounded-[1.15rem] px-4 py-3.5"
                >
                  Continue with Google
                  <ArrowRight size={16} />
                </AnimatedButton>
              </div>

              <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.28em] text-white/28">
                <div className="h-px flex-1 bg-white/10" />
                or sign in with email
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block space-y-2">
                  <span className="text-sm text-white/55">Email address</span>
                  <div className="relative">
                    <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                    <input
                      type="email"
                      value={formState.email}
                      onChange={handleFieldChange("email")}
                      className={`${fieldClassName} pl-11`}
                      placeholder="you@eventify.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email ? <p className="text-xs text-rose-300">{errors.email}</p> : null}
                </label>

                <label className="block space-y-2">
                  <span className="text-sm text-white/55">Password</span>
                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formState.password}
                      onChange={handleFieldChange("password")}
                      className={`${fieldClassName} pl-11 pr-12`}
                      placeholder="Enter your secure password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 text-white/40 transition hover:text-white/70"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.password ? <p className="text-xs text-rose-300">{errors.password}</p> : null}
                </label>

                <div className="flex flex-col gap-3 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formState.remember}
                      onChange={handleFieldChange("remember")}
                      className="h-4 w-4 rounded border-white/15 bg-white/[0.04] text-[var(--primary)] accent-[var(--primary)]"
                    />
                    Remember this device
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      pushToast({
                        title: "Forgot password flow",
                        description: "The reset journey is supported by the backend and can be connected next.",
                        tone: "info"
                      })
                    }
                    className="text-left text-[var(--primary)] transition hover:text-white sm:text-right"
                  >
                    Forgot password?
                  </button>
                </div>

                <AnimatedButton
                  type="submit"
                  className="w-full justify-between rounded-[1.15rem] px-4 py-3.5"
                >
                  {submitting ? "Unlocking your workspace..." : "Enter Eventify"}
                  <ArrowRight size={16} />
                </AnimatedButton>
              </form>

              <div className="mt-6 rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[var(--primary)]">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-white">Secure session handling</p>
                    <p className="mt-1 text-sm text-white/55">
                      Tokens are stored for the current frontend flow and the destination route is chosen from the authenticated role.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlowingCard>
        </motion.div>
      </section>
    </div>
  );
};

export default LoginPage;
