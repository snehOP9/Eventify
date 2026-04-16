import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearOAuthPortalHint,
  exchangeOAuthLogin,
  getOAuthPortalHint
} from "../services/oauthService";
import {
  isOrganizerRole,
  persistAuthSession,
  resolveDashboardPath,
  setPreferredPortal
} from "../services/authService";
import { useToast } from "../components/common/ToastProvider";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { pushToast } = useToast();

  useEffect(() => {
    const runExchange = async () => {
      const portalHint = getOAuthPortalHint();

      try {
        const payload = await exchangeOAuthLogin();
        persistAuthSession(payload);
        const organizerAccount = isOrganizerRole(payload?.role);
        const destinationPath = resolveDashboardPath(payload?.role);

        clearOAuthPortalHint();
        setPreferredPortal(organizerAccount ? "organizer" : "attendee");

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
            description: "This account uses attendee access, so we opened your attendee dashboard.",
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
    <div className="mx-auto max-w-xl px-4 py-20 text-center text-white/80">
      Finalizing secure sign-in...
    </div>
  );
};

export default OAuthCallbackPage;
