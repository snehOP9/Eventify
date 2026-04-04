import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import RegistrationPage from "./pages/RegistrationPage";
import LoginPage from "./pages/LoginPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          }
        />
        <Route
          path="/events"
          element={
            <PublicLayout>
              <EventsPage />
            </PublicLayout>
          }
        />
        <Route
          path="/events/:eventId"
          element={
            <PublicLayout>
              <EventDetailsPage />
            </PublicLayout>
          }
        />
        <Route
          path="/register/:eventId"
          element={
            <PublicLayout compact>
              <RegistrationPage />
            </PublicLayout>
          }
        />
        <Route
          path="/login"
          element={
            <PublicLayout compact>
              <LoginPage />
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
            <DashboardLayout variant="attendee">
              <UserDashboardPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/organizer"
          element={
            <DashboardLayout variant="organizer">
              <AdminDashboardPage />
            </DashboardLayout>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
