import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeOAuthLogin } from "../services/oauthService";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const runExchange = async () => {
      try {
        await exchangeOAuthLogin();
        navigate("/dashboard", { replace: true });
      } catch {
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
