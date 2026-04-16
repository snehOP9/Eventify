import apiClient from "./apiClient";
import { events, organizerDashboard, userDashboard } from "../data/mockData";

const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true";

const simulateResponse = (data, delay = 420) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(data)), delay);
  });

const attachDashboardMeta = (dashboard, meta) => ({
  ...dashboard,
  meta: {
    source: "live",
    banner: "",
    ...(dashboard?.meta || {}),
    ...(meta || {})
  }
});

const buildDefaultOrganizerDashboard = () => ({
  ...organizerDashboard,
  managedEvents: events.slice(0, 4),
  registrations: [
    { id: 1, attendee: "Aditi Rao", event: "Neo Summit 2026", ticket: "Premium Circle", status: "Confirmed" },
    { id: 2, attendee: "Nikhil Jain", event: "Aurora Design Lab", ticket: "Studio Pass", status: "Waitlisted" },
    { id: 3, attendee: "Sonia Malik", event: "Velocity Founder Mixer", ticket: "Mixer Pass", status: "Confirmed" },
    { id: 4, attendee: "Karthik Menon", event: "Signal AI Builders Retreat", ticket: "Retreat Pass", status: "Confirmed" }
  ],
  participants: [
    "Aditi Rao",
    "Nikhil Jain",
    "Sonia Malik",
    "Karthik Menon",
    "Rita Bose",
    "Aman Gill"
  ]
});

const normalizeOrganizerDashboard = (data) => {
  if (data?.overview && data?.managedEvents) {
    return data;
  }

  if (data && typeof data.totalEvents === "number") {
    const base = buildDefaultOrganizerDashboard();
    return {
      ...base,
      overview: [
        { id: "ev", label: "Total Events", value: data.totalEvents, prefix: "" },
        { id: "rg", label: "Registrations", value: data.totalRegistrations ?? 0, suffix: "" },
        { id: "au", label: "Active Users", value: data.activeUsers ?? 0, suffix: "" },
        { id: "up", label: "Upcoming", value: data.upcomingEvents ?? 0, suffix: "" }
      ]
    };
  }

  return buildDefaultOrganizerDashboard();
};

const buildDefaultUserDashboard = () => ({
  ...userDashboard,
  registeredEvents: events.slice(0, 3),
  upcomingEvents: events.slice(0, 2),
  recommendedEvents: events.slice(2, 5)
});

export const fetchUserDashboard = async () => {
  if (useMockApi) {
    return simulateResponse(
      attachDashboardMeta(buildDefaultUserDashboard(), {
        source: "mock",
        banner: "Mock API mode is enabled, so attendee data is running in preview mode."
      })
    );
  }

  try {
    const { data } = await apiClient.get("/dashboard/attendee");
    return attachDashboardMeta({
      ...buildDefaultUserDashboard(),
      summary: data
    });
  } catch {
    return attachDashboardMeta(buildDefaultUserDashboard(), {
      source: "fallback",
      banner: "Live attendee data is unavailable right now, so you are seeing preview dashboard content."
    });
  }
};

export const fetchOrganizerDashboard = async () => {
  if (useMockApi) {
    return simulateResponse(
      attachDashboardMeta(buildDefaultOrganizerDashboard(), {
        source: "mock",
        banner: "Mock API mode is enabled, so organizer data is running in preview mode."
      })
    );
  }

  try {
    const { data } = await apiClient.get("/dashboard/organizer");
    return attachDashboardMeta(normalizeOrganizerDashboard(data));
  } catch {
    try {
      const { data } = await apiClient.get("/dashboard/summary");
      return attachDashboardMeta(normalizeOrganizerDashboard(data));
    } catch {
      return attachDashboardMeta(buildDefaultOrganizerDashboard(), {
        source: "fallback",
        banner: "Live organizer data is unavailable right now, so you are seeing preview dashboard content."
      });
    }
  }
};
