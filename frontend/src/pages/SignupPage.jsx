import { useMemo, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "../components/common/AnimatedButton";
import GlowingCard from "../components/common/GlowingCard";
import ScreenShareBlockedState from "../components/common/ScreenShareBlockedState";
import SectionHeading from "../components/common/SectionHeading";
import { useToast } from "../components/common/ToastProvider";
import { useScreenShareLock } from "../hooks/useScreenShareLock";
import {
  isOrganizerRole,
  loginWithEmail,
  resolveDashboardPath,
  setPreferredPortal,
  signupWithEmail,
  verifySignupOtp
} from "../services/authService";

const fieldClassName =
  "h-13 w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[var(--primary)]/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_6px_rgba(70,246,210,0.08)]";

const portalContent = {
  attendee: {
    eyebrow: "Create attendee account",
    title: "Start with your own email and password.",
    description:
      "Create a local account, verify your email with OTP, and continue directly to your attendee dashboard.",
    roleLabel: "Attendee account"
  },
  organizer: {
    eyebrow: "Create organizer account",
    title: "Open your organizer studio credentials.",
    description:
      "Create a local organizer account, verify with OTP, and continue to your organizer control room.",
    roleLabel: "Organizer account"
  }
};

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  otp: ""
};

const SignupPage = ({ portal = "attendee" }) => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState(initialForm);
  const isScreenShareLocked = useScreenShareLock();

  const activePortal = portal === "organizer" ? "organizer" : "attendee";
  const role = useMemo(
    () => (activePortal === "organizer" ? "ORGANIZER" : "ATTENDEE"),
    [activePortal]
  );
  const copy = portalContent[activePortal];

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const validateSignupForm = () => {
    if (!form.fullName.trim()) {
      pushToast({
        title: "Name required",
        description: "Enter your full name to continue.",
        tone: "warning"
      });
      return false;
    }

    if (!form.email.trim()) {
      pushToast({
        title: "Email required",
        description: "Enter the email you want to use for login.",
        tone: "warning"
      });
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      pushToast({
        title: "Invalid email",
        description: "Use a valid email format.",
        tone: "warning"
      });
      return false;
    }

    if (!form.password || form.password.length < 8) {
      pushToast({
        title: "Weak password",
        description: "Use at least 8 characters.",
        tone: "warning"
      });
      return false;
    }

    if (form.password !== form.confirmPassword) {
      pushToast({
        title: "Passwords do not match",
        description: "Re-enter the same password in both fields.",
        tone: "warning"
      });
      return false;
    }

    return true;
  };

  const handleCreateAccount = async () => {
    if (isScreenShareLocked) {
      pushToast({
        title: "Screen sharing active",
        description: "Authentication actions are disabled while screen sharing is detected.",
        tone: "warning"
      });
      return;
    }

    if (!validateSignupForm()) {
      return;
    }

    setBusy(true);
    try {
      const response = await signupWithEmail({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role
      });

      pushToast({
        title: "Account created",
        description: response?.message || "We sent an OTP to your email for verification.",
        tone: "success"
      });
      setStep(1);
    } catch (error) {
      pushToast({
        title: "Signup failed",
        description: error?.response?.data?.message || "Please check your details and try again.",
        tone: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtpAndLogin = async () => {
    if (isScreenShareLocked) {
      pushToast({
        title: "Screen sharing active",
        description: "Authentication actions are disabled while screen sharing is detected.",
        tone: "warning"
      });
      return;
    }

    if (!/^\d{6}$/.test(form.otp.trim())) {
      pushToast({
        title: "Invalid OTP",
        description: "Enter the 6-digit code sent to your email.",
        tone: "warning"
      });
      return;
    }

    setBusy(true);
    try {
      const verification = await verifySignupOtp({
        email: form.email.trim(),
        otp: form.otp.trim()
      });

      const authResponse = await loginWithEmail({
        email: form.email.trim(),
        password: form.password
      });

      const effectiveRole = authResponse?.role || role;
      const organizerAccount = isOrganizerRole(effectiveRole);
      setPreferredPortal(organizerAccount ? "organizer" : "attendee");

      pushToast({
        title: "Email verified",
        description: verification?.message || "Your account is verified and ready.",
        tone: "success"
      });

      navigate(resolveDashboardPath(effectiveRole), { replace: true });
    } catch (error) {
      pushToast({
        title: "Verification failed",
        description: error?.response?.data?.message || "Please check OTP and try again.",
        tone: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      {isScreenShareLocked ? (
        <ScreenShareBlockedState
          title="Signup blocked while screen sharing is active"
          description="For account security, signup and verification are disabled during screen sharing sessions."
          showBackHome
        />
      ) : (
        <GlowingCard hover={false} className="auth-form-shell px-6 py-7 sm:px-8">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />

          <div className="mt-6 rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/62">
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-[var(--primary)]" />
              <span>{copy.roleLabel} uses email + password with OTP verification.</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <AnimatedButton
                to="/signup"
                size="sm"
                variant={activePortal === "attendee" ? "primary" : "secondary"}
              >
                User signup
              </AnimatedButton>
              <AnimatedButton
                to="/organizer/signup"
                size="sm"
                variant={activePortal === "organizer" ? "primary" : "secondary"}
              >
                Organizer signup
              </AnimatedButton>
            </div>

            <label className="space-y-2">
              <span className="text-sm text-white/55">Full name</span>
              <div className="relative">
                <User2 size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  value={form.fullName}
                  onChange={updateField("fullName")}
                  className={`${fieldClassName} pl-11`}
                  placeholder="Your full name"
                  disabled={step > 0}
                />
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-sm text-white/55">Email</span>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  className={`${fieldClassName} pl-11`}
                  placeholder="you@eventify.com"
                  disabled={step > 0}
                />
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-sm text-white/55">Password</span>
              <div className="relative">
                <LockKeyhole
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={updateField("password")}
                  className={`${fieldClassName} pl-11 pr-12`}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  disabled={step > 0}
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
            </label>

            <label className="space-y-2">
              <span className="text-sm text-white/55">Confirm password</span>
              <div className="relative">
                <LockKeyhole
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={updateField("confirmPassword")}
                  className={`${fieldClassName} pl-11 pr-12`}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  disabled={step > 0}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 text-white/40 transition hover:text-white/72"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {step > 0 ? (
              <label className="space-y-2">
                <span className="text-sm text-white/55">Email OTP</span>
                <div className="relative">
                  <KeyRound size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <input
                    value={form.otp}
                    onChange={updateField("otp")}
                    className={`${fieldClassName} pl-11`}
                    placeholder="6-digit OTP"
                    inputMode="numeric"
                    maxLength={6}
                  />
                </div>
              </label>
            ) : null}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {step === 0 ? (
              <AnimatedButton onClick={handleCreateAccount} icon={ArrowRight} disabled={busy}>
                {busy ? "Creating account..." : "Create account"}
              </AnimatedButton>
            ) : (
              <AnimatedButton onClick={handleVerifyOtpAndLogin} icon={ArrowRight} disabled={busy}>
                {busy ? "Verifying..." : "Verify and sign in"}
              </AnimatedButton>
            )}

            <AnimatedButton to={activePortal === "organizer" ? "/organizer/login" : "/login"} variant="secondary">
              Back to login
            </AnimatedButton>
          </div>
        </GlowingCard>
      )}
    </div>
  );
};

export default SignupPage;