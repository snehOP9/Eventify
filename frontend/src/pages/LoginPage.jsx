import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Chrome,
  Eye,
  EyeOff,
  Github,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthExperienceShowcase from "../components/auth/AuthExperienceShowcase";
import AnimatedButton from "../components/common/AnimatedButton";
import GlowingCard from "../components/common/GlowingCard";
import ScreenShareBlockedState from "../components/common/ScreenShareBlockedState";
import { useToast } from "../components/common/ToastProvider";
import { useScreenShareLock } from "../hooks/useScreenShareLock";
import {
  getCurrentAuthIdentity,
  getStoredAuthProfile,
  isOrganizerRole,
  loginWithEmail,
  resolvePostLoginPath,
  setPreferredPortal
} from "../services/authService";
import {
  startGitHubLogin,
  startGoogleLogin
} from "../services/oauthService";

const portalContent = {
  attendee: {
    secureLabel: "Attendee secure login",
    microLabel: "User portal",
    eyebrow: "Access attendee space",
    title: "Welcome back to your event booking desk.",
    description:
      "Use your attendee account to reopen bookings, tickets, and recommendations without stepping into organizer tools.",
    sessionLabel: "Recent attendee identity detected",
    trustBadges: ["User access", "Email + password", "Google & GitHub SSO"],
    formHighlights: [
      {
        title: "Fast re-entry",
        detail: "Land in your attendee dashboard and jump straight into bookings, tickets, and upcoming events."
      },
      {
        title: "Clean role routing",
        detail: "If this account is actually an organizer account, we redirect you to the organizer studio automatically."
      }
    ],
    successDescription: "Your attendee workspace is ready.",
    alternateRoute: "/organizer/login",
    alternateCta: "Organizer login",
    alternatePrompt: "Need organizer access instead?"
  },
  organizer: {
    secureLabel: "Organizer secure login",
    microLabel: "Organizer portal",
    eyebrow: "Access organizer space",
    title: "Welcome back to your organizer control room.",
    description:
      "Use your organizer account to manage events, track registrations, and create new launches from a separate entry point.",
    sessionLabel: "Recent organizer identity detected",
    trustBadges: ["Organizer access", "Email + password", "Google & GitHub SSO"],
    formHighlights: [
      {
        title: "Studio-first access",
        detail: "Open the organizer dashboard directly so event operations, analytics, and launch tools stay in one place."
      },
      {
        title: "Role-safe handling",
        detail: "If the account belongs to a normal attendee, we send it to the attendee dashboard instead of trapping it here."
      }
    ],
    successDescription: "Your organizer studio is ready.",
    alternateRoute: "/login",
    alternateCta: "User login",
    alternatePrompt: "Need normal user access instead?"
  }
};

const fieldClassName =
  "h-13 w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[var(--primary)]/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_6px_rgba(70,246,210,0.08)]";

const initialFormState = {
  email: "",
  password: "",
  remember: true
};

const LoginPage = ({ portal = "attendee" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pushToast } = useToast();
  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthProvider, setOAuthProvider] = useState("");
  const isScreenShareLocked = useScreenShareLock();
  const activePortal = portal === "organizer" ? "organizer" : "attendee";
  const portalCopy = portalContent[activePortal];
  const signupRoute = activePortal === "organizer" ? "/organizer/signup" : "/signup";

  const previousProfile = useMemo(() => getStoredAuthProfile(), []);

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

    if (isScreenShareLocked) {
      pushToast({
        title: "Screen sharing active",
        description: "Login is blocked while screen sharing is detected.",
        tone: "warning"
      });
      return;
    }

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

      const authIdentity = getCurrentAuthIdentity();
      const effectiveRole = authResponse?.role ?? authIdentity?.role;
      const organizerAccount = isOrganizerRole(effectiveRole);
      setPreferredPortal(activePortal);

      const requestedPath = location.state?.from;
      const destinationPath =
        activePortal === "organizer" ? "/organizer" : resolvePostLoginPath(effectiveRole, requestedPath);

      const successDescription =
        activePortal === "organizer" && !organizerAccount
          ? "Organizer workspace opened. This account is currently tagged as attendee in backend data."
          : activePortal === "attendee" && organizerAccount
            ? "This account is set up as an organizer, so we opened the organizer studio."
            : portalCopy.successDescription;

      pushToast({
        title: "Access granted",
        description: successDescription,
        tone: "success"
      });

      navigate(destinationPath, { replace: true });
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

  const handleGoogleStart = async () => {
    if (isScreenShareLocked) {
      pushToast({
        title: "Screen sharing active",
        description: "Login is blocked while screen sharing is detected.",
        tone: "warning"
      });
      return;
    }

    setOAuthProvider("google");

    try {
      await startGoogleLogin(activePortal);
    } catch (error) {
      pushToast({
        title: "Google sign-in unavailable",
        description:
          error?.message ||
          "We could not start the secure sign-in flow. Please try again in a moment.",
        tone: "error"
      });
      setOAuthProvider("");
    }
  };

  const handleGitHubStart = async () => {
    if (isScreenShareLocked) {
      pushToast({
        title: "Screen sharing active",
        description: "Login is blocked while screen sharing is detected.",
        tone: "warning"
      });
      return;
    }

    setOAuthProvider("github");

    try {
      await startGitHubLogin(activePortal);
    } catch (error) {
      pushToast({
        title: "GitHub sign-in unavailable",
        description:
          error?.message ||
          "We could not start the secure sign-in flow. Please try again in a moment.",
        tone: "error"
      });
      setOAuthProvider("");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {isScreenShareLocked ? (
        <ScreenShareBlockedState
          title="Login blocked while screen sharing is active"
          description="For account security, authentication is disabled during screen sharing sessions."
          showBackHome
        />
      ) : (
        <section className="grid gap-5 md:gap-7 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="hidden xl:block">
            <AuthExperienceShowcase />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="xl:pt-10"
          >
            <GlowingCard hover={false} className="auth-form-shell px-4 py-5 sm:px-7 sm:py-7">
              <div className="hero-mesh absolute inset-x-0 top-0 h-44 opacity-85" />
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="glow-pill">
                    <ShieldCheck size={14} />
                    {portalCopy.secureLabel}
                  </div>
                  <div className="auth-micro-pill">
                    <Sparkles size={13} />
                    {portalCopy.microLabel}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <AnimatedButton
                    to="/login"
                    size="sm"
                    variant={activePortal === "attendee" ? "primary" : "secondary"}
                  >
                    User login
                  </AnimatedButton>
                  <AnimatedButton
                    to="/organizer/login"
                    size="sm"
                    variant={activePortal === "organizer" ? "primary" : "secondary"}
                  >
                    Organizer login
                  </AnimatedButton>
                </div>

                <div className="mt-6 flex items-start justify-between gap-4">
                  <div className="max-w-lg">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/34">{portalCopy.eyebrow}</p>
                    <h2 className="mt-3 font-display text-[clamp(2rem,6vw,2.45rem)] font-semibold leading-tight text-white">
                      {portalCopy.title}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-white/58">
                      {portalCopy.description}
                    </p>
                  </div>

                  <div className="hidden h-12 w-12 items-center justify-center rounded-[1.2rem] border border-white/10 bg-white/[0.05] text-[var(--primary)] sm:flex">
                    <ShieldCheck size={18} />
                  </div>
                </div>

                {previousProfile ? (
                  <div className="mt-6 rounded-[1.35rem] border border-emerald-400/15 bg-emerald-500/10 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.06] text-emerald-200">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{portalCopy.sessionLabel}</p>
                        <p className="mt-1 text-sm text-white/62">
                          Last secure session was opened for {previousProfile.fullName || previousProfile.email}.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {portalCopy.trustBadges.map((badge) => (
                    <span key={badge} className="auth-micro-pill">
                      {badge}
                    </span>
                  ))}
                </div>

                <motion.button
                  type="button"
                  onClick={handleGoogleStart}
                  whileTap={{ scale: 0.985 }}
                  disabled={Boolean(oauthProvider) || submitting}
                  className="mt-7 flex w-full items-start justify-between rounded-[1.2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] px-3.5 py-3.5 text-left text-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] sm:items-center sm:rounded-[1.45rem] sm:px-4 sm:py-4"
                >
                  <span className="flex min-w-0 items-center gap-3.5 sm:gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.08] text-[var(--primary)] sm:h-12 sm:w-12 sm:rounded-[1.15rem]">
                      <Chrome size={18} />
                    </span>
                    <span className="block min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/44 sm:text-sm sm:tracking-[0.24em]">
                        Fast lane
                      </span>
                      <span className="mt-1 block font-display text-lg font-semibold leading-tight text-white sm:text-2xl">
                        {oauthProvider === "google" ? "Checking Google sign-in..." : "Continue with Google"}
                      </span>
                    </span>
                  </span>
                  <ArrowRight size={18} className="mt-1 shrink-0 text-white/55 sm:mt-0" />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleGitHubStart}
                  whileTap={{ scale: 0.985 }}
                  disabled={Boolean(oauthProvider) || submitting}
                  className="mt-3 flex w-full items-start justify-between rounded-[1.2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] px-3.5 py-3.5 text-left text-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] sm:items-center sm:rounded-[1.45rem] sm:px-4 sm:py-4"
                >
                  <span className="flex min-w-0 items-center gap-3.5 sm:gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.08] text-[var(--primary)] sm:h-12 sm:w-12 sm:rounded-[1.15rem]">
                      <Github size={18} />
                    </span>
                    <span className="block min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/44 sm:text-sm sm:tracking-[0.24em]">
                        Fast lane
                      </span>
                      <span className="mt-1 block font-display text-lg font-semibold leading-tight text-white sm:text-2xl">
                        {oauthProvider === "github" ? "Checking GitHub sign-in..." : "Continue with GitHub"}
                      </span>
                    </span>
                  </span>
                  <ArrowRight size={18} className="mt-1 shrink-0 text-white/55 sm:mt-0" />
                </motion.button>

                <div className="my-7 flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-white/24">
                  <div className="h-px flex-1 bg-white/10" />
                  or continue with email
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <label className="block space-y-2.5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-white/56">Email address</span>
                      <span className="text-xs uppercase tracking-[0.24em] text-white/28">Primary identity</span>
                    </div>
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

                  <label className="block space-y-2.5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-white/56">Password</span>
                      <span className="text-xs uppercase tracking-[0.24em] text-white/28">8+ characters</span>
                    </div>
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
                        className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 text-white/40 transition hover:text-white/72"
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
                      onClick={() => navigate("/forgot-password")}
                      className="text-left text-[var(--primary)] transition hover:text-white sm:text-right"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <AnimatedButton
                    type="submit"
                    disabled={Boolean(oauthProvider) || submitting}
                    className="w-full justify-between rounded-[1.2rem] px-5 py-3.5"
                  >
                    {submitting ? "Unlocking your workspace..." : "Enter Eventify"}
                    <ArrowRight size={16} />
                  </AnimatedButton>
                </form>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {portalCopy.formHighlights.map((highlight) => (
                    <div key={highlight.title} className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                      <p className="text-sm font-semibold text-white">{highlight.title}</p>
                      <p className="mt-2 text-sm leading-7 text-white/56">{highlight.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-white/46">
                    {portalCopy.alternatePrompt}
                  </p>
                  <AnimatedButton to={portalCopy.alternateRoute} variant="ghost" size="sm">
                    {portalCopy.alternateCta}
                  </AnimatedButton>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-white/46">New here? Create a local email/password account.</p>
                  <AnimatedButton to={signupRoute} variant="secondary" size="sm">
                    Create account
                  </AnimatedButton>
                </div>
              </div>
            </GlowingCard>
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default LoginPage;
