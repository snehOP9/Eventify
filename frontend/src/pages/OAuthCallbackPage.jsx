import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearOAuthPortalHint, exchangeOAuthLogin, getOAuthPortalHint } from "../services/oauthService";
import { isOrganizerRole, persistAuthSession, resolveDashboardPath, setPreferredPortal } from "../services/authService";
import { useToast } from "../components/common/ToastProvider";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { pushToast } = useToast();

  useEffect(() => {
    const runExchange = async () => {
      try {
        const payload = await exchangeOAuthLogin();
        persistAuthSession(payload);
        const portalHint = getOAuthPortalHint();
        const organizerAccount = isOrganizerRole(payload?.role);

        clearOAuthPortalHint();

        if (portalHint === "organizer") {
          setPreferredPortal("organizer");

          if (organizerAccount) {
            pushToast({
              title: "Successfully logged in as Organiser",
              description: "Welcome back to your organizer workspace.",
              tone: "success"
            });
          } else {
            pushToast({
              title: "Successfully logged in",
              description: "Organizer mode is active for this session.",
              tone: "success"
            });
          }

          navigate("/organizer", { replace: true });
          return;
        }

        setPreferredPortal("attendee");
        navigate(resolveDashboardPath(payload?.role), { replace: true });
      } catch {
        clearOAuthPortalHint();
        navigate("/", { replace: true });
      }
    };

    runExchange();
  }, [navigate]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center text-white/80">
      Finalizing secure sign-in...
    </div>
  );
};

export default OAuthCallbackPage;
