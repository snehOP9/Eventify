import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";
import {
  canAccessPath,
  getCurrentAuthIdentity,
  resolveDashboardPath
} from "./services/authService";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const FreeEventsPage = lazy(() => import("./pages/FreeEventsPage"));
const PremiumEventsPage = lazy(() => import("./pages/PremiumEventsPage"));
const EventDetailsPage = lazy(() => import("./pages/EventDetailsPage"));
const RegistrationPage = lazy(() => import("./pages/RegistrationPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const UserDashboardPage = lazy(() => import("./pages/UserDashboardPage"));
const OrganizerDashboardPage = lazy(() => import("./pages/OrganizerDashboardPage"));
const OAuthCallbackPage = lazy(() => import("./pages/OAuthCallbackPage"));
const CommandPalette = lazy(() => import("./components/common/CommandPalette"));

const RouteFallback = () => (
  <div className="flex min-h-[42vh] items-center justify-center px-6 text-sm text-white/65">
    Loading experience...
  </div>
);

const RequireAuth = ({ children, loginPath = "/login", enforcePathAccess = true }) => {
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

  if (enforcePathAccess && !canAccessPath(authIdentity.role, location.pathname)) {
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
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>
      <AnimatePresence mode="wait" initial={false}>
        <Suspense fallback={<RouteFallback />}>
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
              path="/signup"
              element={
                <RedirectIfAuthenticated>
                  <PublicLayout compact>
                    <SignupPage portal="attendee" />
                  </PublicLayout>
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/organizer/signup"
              element={
                <RedirectIfAuthenticated>
                  <PublicLayout compact>
                    <SignupPage portal="organizer" />
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
                <RoleProtectedRoute
                  loginPath="/login"
                  allowedRoles={["ATTENDEE", "USER"]}
                >
                  <DashboardLayout variant="attendee">
                    <UserDashboardPage />
                  </DashboardLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/organizer"
              element={
                <RequireAuth loginPath="/organizer/login" enforcePathAccess={false}>
                  <OrganizerDashboardPage />
                </RequireAuth>
              }
            />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
};

export default App;
