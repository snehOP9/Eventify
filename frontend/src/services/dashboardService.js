import apiClient from "./apiClient";
import { events, organizerDashboard, userDashboard } from "../data/mockData";

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

const simulateResponse = (data, delay = 420) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(data)), delay);
  });

export const fetchUserDashboard = async () => {
  if (useMockApi) {
    return simulateResponse({
      ...userDashboard,
      registeredEvents: events.slice(0, 3),
      upcomingEvents: events.slice(0, 2),
      recommendedEvents: events.slice(2, 5)
    });
  }

  const { data } = await apiClient.get("/dashboard/attendee");
  return data;
};

export const fetchOrganizerDashboard = async () => {
  if (useMockApi) {
    return simulateResponse({
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
  }

  const { data } = await apiClient.get("/dashboard/organizer");
  return data;
};
