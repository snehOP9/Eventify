import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import EventsPage from "./pages/EventsPage";
import FreeEventsPage from "./pages/FreeEventsPage";
import PremiumEventsPage from "./pages/PremiumEventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import RegistrationPage from "./pages/RegistrationPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import CommandPalette from "./components/common/CommandPalette";
import {
  canAccessPath,
  getCurrentAuthIdentity,
  resolveDashboardPath
} from "./services/authService";

const RequireAuth = ({ children, loginPath = "/login" }) => {
  const location = useLocation();
  const authIdentity = getCurrentAuthIdentity();
  const fullPath = `${location.pathname}${location.search}${location.hash}`;

  if (!authIdentity.isAuthenticated) {
    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: fullPath }}
      />
    );
  }

  if (!canAccessPath(authIdentity.role, location.pathname)) {
    return <Navigate to={resolveDashboardPath(authIdentity.role)} replace />;
  }

  return children;
};

const RedirectIfAuthenticated = ({ children }) => {
  const authIdentity = getCurrentAuthIdentity();

  if (authIdentity.isAuthenticated) {
    return <Navigate to={resolveDashboardPath(authIdentity.role)} replace />;
  }

  return children;
};

const App = () => {
  const location = useLocation();

  return (
    <>
      <CommandPalette />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <RequireAuth>
                <PublicLayout>
                  <LandingPage />
                </PublicLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/events"
            element={
              <RequireAuth>
                <PublicLayout>
                  <EventsPage />
                </PublicLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/events/free"
            element={
              <RequireAuth>
                <PublicLayout>
                  <FreeEventsPage />
                </PublicLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/events/premium"
            element={
              <RequireAuth>
                <PublicLayout>
                  <PremiumEventsPage />
                </PublicLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/events/:eventId"
            element={
              <RequireAuth>
                <PublicLayout>
                  <EventDetailsPage />
                </PublicLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/register/:eventId"
            element={
              <RequireAuth>
                <PublicLayout compact>
                  <RegistrationPage />
                </PublicLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/login"
            element={
              <RedirectIfAuthenticated>
                <PublicLayout compact>
                  <LoginPage portal="attendee" />
                </PublicLayout>
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/user/login"
            element={
              <RedirectIfAuthenticated>
                <PublicLayout compact>
                  <LoginPage portal="attendee" />
                </PublicLayout>
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/organizer/login"
            element={
              <RedirectIfAuthenticated>
                <PublicLayout compact>
                  <LoginPage portal="organizer" />
                </PublicLayout>
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicLayout compact>
                <ForgotPasswordPage />
              </PublicLayout>
            }
          />
          <Route
            path="/auth/callback"
            element={
              <PublicLayout compact>
                <OAuthCallbackPage />
              </PublicLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth loginPath="/login">
                <DashboardLayout variant="attendee">
                  <UserDashboardPage />
                </DashboardLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/organizer"
            element={
              <RequireAuth loginPath="/organizer/login">
                <DashboardLayout variant="organizer">
                  <AdminDashboardPage />
                </DashboardLayout>
              </RequireAuth>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
};

export default App;
