import apiClient from "./apiClient";

const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true";

const simulateResponse = (data, delay = 320) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(data)), delay);
  });

const withFallback = async (request, fallbackData) => {
  if (useMockApi) {
    return simulateResponse(fallbackData);
  }

  try {
    return await request();
  } catch {
    return simulateResponse(fallbackData);
  }
};

export const createOrganizerEvent = async (payload) => {
  const fallbackData = {
    ...payload,
    id: payload.id || `local-event-${Date.now()}`
  };

  return withFallback(async () => {
    const { data } = await apiClient.post("/events", payload);
    return data;
  }, fallbackData);
};

export const updateOrganizerEvent = async (eventId, payload) => {
  const fallbackData = {
    ...payload,
    id: eventId
  };

  return withFallback(async () => {
    const { data } = await apiClient.put(`/events/${eventId}`, payload);
    return data;
  }, fallbackData);
};

export const deleteOrganizerEvent = async (eventId) => {
  const fallbackData = { success: true, id: eventId };

  return withFallback(async () => {
    await apiClient.delete(`/events/${eventId}`);
    return fallbackData;
  }, fallbackData);
};

export const setOrganizerEventPublishing = async (eventId, shouldPublish) => {
  const fallbackData = {
    success: true,
    id: eventId,
    published: shouldPublish
  };

  return withFallback(async () => {
    const { data } = await apiClient.patch(`/events/${eventId}/status`, {
      published: shouldPublish
    });
    return data;
  }, fallbackData);
};

export const cancelOrganizerEvent = async (eventId) => {
  const fallbackData = { success: true, id: eventId, status: "Cancelled" };

  return withFallback(async () => {
    const { data } = await apiClient.patch(`/events/${eventId}/status`, {
      status: "CANCELLED"
    });
    return data;
  }, fallbackData);
};

export const sendOrganizerAnnouncement = async (payload) => {
  const fallbackData = {
    id: `notice-${Date.now()}`,
    ...payload,
    sentAt: new Date().toISOString()
  };

  return withFallback(async () => {
    const { data } = await apiClient.post("/dashboard/organizer/announcements", payload);
    return data;
  }, fallbackData);
};

export const exportOrganizerAttendees = (rows) => {
  const headers = [
    "Attendee",
    "Email",
    "Phone",
    "Event",
    "Ticket",
    "Payment Status",
    "Ticket Status",
    "Registered At"
  ];

  const contentRows = rows.map((row) => [
    row.attendee,
    row.email,
    row.phone,
    row.event,
    row.ticket,
    row.paymentStatus,
    row.ticketStatus,
    row.registeredAt
  ]);

  const csv = [headers, ...contentRows]
    .map((columns) =>
      columns
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  return csv;
};
