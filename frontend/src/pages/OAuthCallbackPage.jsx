import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlowingCard from "../components/common/GlowingCard";
import SectionHeading from "../components/common/SectionHeading";
import {
  clearOAuthPortalHint,
  exchangeOAuthLogin,
  getOAuthPortalHint
} from "../services/oauthService";
import {
  getCurrentAuthIdentity,
  isOrganizerRole,
  persistAuthSession,
  resolvePostLoginPath,
  setPreferredPortal
} from "../services/authService";
import { useToast } from "../components/common/ToastProvider";

const describeOAuthError = (errorCode, fallbackMessage) => {
  if (fallbackMessage) {
    return fallbackMessage;
  }

  switch (errorCode) {
    case "authorization_request_not_found":
      return "Your secure sign-in session expired. Please start sign-in again from the login page.";
    case "access_denied":
      return "Sign-in was canceled with the provider. Please try again when ready.";
    case "invalid_grant":
      return "The provider returned an invalid sign-in code. Please retry the sign-in flow.";
    default:
      return "We could not finish the secure sign-in handoff. Please try again.";
  }
};

const formatProviderLabel = (provider) => {
  if (!provider) {
    return "OAuth";
  }

  if (provider.toLowerCase() === "github") {
    return "GitHub";
  }

  return provider.charAt(0).toUpperCase() + provider.slice(1);
};

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { pushToast } = useToast();

  useEffect(() => {
    const runExchange = async () => {
      const portalHint = getOAuthPortalHint();
      const query = new URLSearchParams(window.location.search);

      if (query.get("oauth") === "error") {
        const errorCode = query.get("error") || "oauth2_authentication_failed";
        const provider = query.get("provider");
        const backendMessage = query.get("message");

        clearOAuthPortalHint();
        pushToast({
          title: `${formatProviderLabel(provider)} sign-in could not be completed`,
          description: describeOAuthError(errorCode, backendMessage),
          tone: "error"
        });
        navigate(portalHint === "organizer" ? "/organizer/login" : "/login", { replace: true });
        return;
      }

      try {
        const payload = await exchangeOAuthLogin();
        persistAuthSession(payload);
        const authIdentity = getCurrentAuthIdentity();
        const effectiveRole = payload?.role ?? authIdentity?.role;
        const organizerAccount = isOrganizerRole(effectiveRole);
        const selectedPortal = portalHint || (organizerAccount ? "organizer" : "attendee");
        const destinationPath = selectedPortal === "organizer" ? "/organizer" : resolvePostLoginPath(effectiveRole, null);

        clearOAuthPortalHint();
        setPreferredPortal(selectedPortal);

        if (portalHint === "organizer" && organizerAccount) {
          pushToast({
            title: "Successfully logged in as Organizer",
            description: "Welcome back to your organizer workspace.",
            tone: "success"
          });
          navigate(destinationPath, { replace: true });
          return;
        }

        if (portalHint === "organizer" && !organizerAccount) {
          pushToast({
            title: "Successfully logged in",
            description: "Organizer workspace opened. This account is currently tagged as attendee in backend data.",
            tone: "success"
          });
        }

        navigate(destinationPath, { replace: true });
      } catch {
        clearOAuthPortalHint();
        pushToast({
          title: "OAuth sign-in could not be completed",
          description: "We could not finish the secure sign-in handoff. Please try again.",
          tone: "error"
        });
        navigate(portalHint === "organizer" ? "/organizer/login" : "/login", { replace: true });
      }
    };

    runExchange();
  }, [navigate, pushToast]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <GlowingCard hover={false} className="auth-form-shell px-6 py-8 text-center sm:px-8 sm:py-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.6rem] border border-white/10 bg-white/[0.05]">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--primary)]/25 border-t-[var(--primary)]" />
        </div>
        <SectionHeading
          align="center"
          className="mb-0 mt-6"
          eyebrow="Secure OAuth handoff"
          title="Finalizing your sign-in"
          description="We are finishing the encrypted login exchange and preparing your workspace."
        />
      </GlowingCard>
    </div>
  );
};

export default OAuthCallbackPage;
