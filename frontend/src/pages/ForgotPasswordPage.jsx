import { useState } from "react";
import { ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "../components/common/AnimatedButton";
import GlowingCard from "../components/common/GlowingCard";
import SectionHeading from "../components/common/SectionHeading";
import { useToast } from "../components/common/ToastProvider";
import {
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  verifyPasswordResetOtp
} from "../services/authService";

const fieldClassName =
  "h-13 w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[var(--primary)]/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_6px_rgba(70,246,210,0.08)]";

const initialState = {
  email: "",
  otp: "",
  newPassword: "",
  confirmPassword: ""
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(initialState);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleRequestOtp = async () => {
    if (!form.email.trim()) {
      pushToast({ title: "Email required", description: "Enter your registered email.", tone: "warning" });
      return;
    }

    setBusy(true);
    try {
      const response = await requestPasswordResetOtp(form.email.trim());
      pushToast({ title: "OTP sent", description: response?.message || "Check your inbox for OTP.", tone: "success" });
      setStep(1);
    } catch (error) {
      pushToast({
        title: "Unable to send OTP",
        description: error?.response?.data?.message || "Please try again.",
        tone: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!form.otp.trim()) {
      pushToast({ title: "OTP required", description: "Enter the OTP from your email.", tone: "warning" });
      return;
    }

    setBusy(true);
    try {
      const response = await verifyPasswordResetOtp({ email: form.email.trim(), otp: form.otp.trim() });
      pushToast({ title: "OTP verified", description: response?.message || "Now set a new password.", tone: "success" });
      setStep(2);
    } catch (error) {
      pushToast({
        title: "OTP verification failed",
        description: error?.response?.data?.message || "Please re-check OTP.",
        tone: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    if (!form.newPassword || form.newPassword.length < 8) {
      pushToast({ title: "Weak password", description: "Use at least 8 characters.", tone: "warning" });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      pushToast({ title: "Passwords do not match", description: "Re-enter both passwords.", tone: "warning" });
      return;
    }

    setBusy(true);
    try {
      const response = await resetPasswordWithOtp({
        email: form.email.trim(),
        otp: form.otp.trim(),
        newPassword: form.newPassword
      });
      pushToast({ title: "Password updated", description: response?.message || "Login with your new password.", tone: "success" });
      navigate("/login", { replace: true });
    } catch (error) {
      pushToast({
        title: "Password reset failed",
        description: error?.response?.data?.message || "Please try again.",
        tone: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <GlowingCard hover={false} className="px-6 py-7 sm:px-8">
        <SectionHeading
          eyebrow="Account recovery"
          title="Reset password securely"
          description="Three-step flow: request OTP, verify OTP, set your new password."
        />

        <div className="mt-6 rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/62">
          <div className="flex items-center gap-3">
            <ShieldCheck size={16} className="text-[var(--primary)]" />
            <span>OTP is validated by backend before password update.</span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
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

          {step >= 1 ? (
            <label className="space-y-2">
              <span className="text-sm text-white/55">OTP</span>
              <div className="relative">
                <KeyRound size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  value={form.otp}
                  onChange={updateField("otp")}
                  className={`${fieldClassName} pl-11`}
                  placeholder="6-digit OTP"
                />
              </div>
            </label>
          ) : null}

          {step >= 2 ? (
            <>
              <label className="space-y-2">
                <span className="text-sm text-white/55">New password</span>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={updateField("newPassword")}
                  className={fieldClassName}
                  placeholder="Minimum 8 characters"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-white/55">Confirm password</span>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={updateField("confirmPassword")}
                  className={fieldClassName}
                  placeholder="Re-enter password"
                />
              </label>
            </>
          ) : null}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {step === 0 ? (
            <AnimatedButton onClick={handleRequestOtp} icon={ArrowRight}>
              {busy ? "Sending OTP..." : "Send OTP"}
            </AnimatedButton>
          ) : null}

          {step === 1 ? (
            <AnimatedButton onClick={handleVerifyOtp} icon={ArrowRight}>
              {busy ? "Verifying..." : "Verify OTP"}
            </AnimatedButton>
          ) : null}

          {step === 2 ? (
            <AnimatedButton onClick={handleResetPassword} icon={ArrowRight}>
              {busy ? "Updating..." : "Reset password"}
            </AnimatedButton>
          ) : null}

          <AnimatedButton to="/login" variant="secondary">Back to login</AnimatedButton>
        </div>
      </GlowingCard>
    </div>
  );
};

export default ForgotPasswordPage;
