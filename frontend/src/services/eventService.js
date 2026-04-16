import apiClient from "./apiClient";
import { categories, events } from "../data/mockData";

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

const fallbackPoster =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80";

const simulateResponse = (data, delay = 550) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(data)), delay);
  });

const sorters = {
  featured: (a, b) => Number(b.featured) - Number(a.featured),
  newest: (a, b) => new Date(a.date) - new Date(b.date),
  "price-low": (a, b) => a.priceFrom - b.priceFrom,
  "price-high": (a, b) => b.priceFrom - a.priceFrom
};

const toReadableLabel = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeBackendEvent = (event) => {
  const cityFromVenue = event?.venue?.split(",").at(-1)?.trim();
  const categoryValue = String(event?.category || "technology").toLowerCase();
  const modeValue = String(event?.mode || "hybrid").toLowerCase();
  const id = String(event?.id || crypto.randomUUID());

  return {
    id,
    title: event?.title || "Untitled event",
    category: categoryValue,
    categoryLabel: toReadableLabel(event?.category || "technology"),
    city: cityFromVenue || (modeValue === "online" ? "Online" : "TBA"),
    location: event?.venue || "Venue to be announced",
    venue: event?.venue || "Venue to be announced",
    organizer: event?.organizerName || "Eventify",
    date: event?.eventDate || new Date().toISOString(),
    time: event?.eventTime || "TBA",
    seatsLeft: Number(event?.seatsLeft ?? 0),
    capacity: Number(event?.totalSeats ?? event?.seatsLeft ?? 0),
    priceFrom: Number(event?.ticketPrice ?? 0),
    mode: toReadableLabel(modeValue),
    featured: false,
    heroTag: "Live event",
    poster: event?.bannerImage || fallbackPoster,
    shortDescription: event?.description || "Event details will be updated shortly.",
    description: event?.description || "Event details will be updated shortly.",
    tags: [toReadableLabel(event?.category || "technology")]
  };
};

const ensureDetailedEventShape = (event) => {
  const base = {
    ...event,
    tags: Array.isArray(event?.tags) ? event.tags : [],
    timeline: Array.isArray(event?.timeline) ? event.timeline : [],
    speakers: Array.isArray(event?.speakers) ? event.speakers : [],
    faqs: Array.isArray(event?.faqs) ? event.faqs : []
  };

  const fallbackPrice = Number(base.priceFrom ?? 0);
  const fallbackTierId = `${String(base.id)}-standard`;

  if (!Array.isArray(base.ticketTiers) || base.ticketTiers.length === 0) {
    base.ticketTiers = [
      {
        id: fallbackTierId,
        title: fallbackPrice > 0 ? "General Access" : "Free Access",
        price: fallbackPrice,
        perks: ["Event access", "Session recordings", "Community access"]
      }
    ];
  }

  if (!base.about) {
    base.about =
      base.description ||
      "Event details will be available soon. You can proceed with registration right now.";
  }

  return base;
};

const findMockEventById = (eventId) => {
  const normalizedId = String(eventId);
  return (
    events.find((entry) => String(entry.id) === normalizedId) ||
    events.find((entry) => String(entry.id).toLowerCase() === normalizedId.toLowerCase()) ||
    null
  );
};

const filterMockEvents = ({ search = "", category = "all", mode = "all", pricing = "all", sort = "featured" } = {}) => {
  const normalizedSearch = search.trim().toLowerCase();

  return events
    .filter((event) => {
      const matchesCategory = category === "all" || event.category === category;
      const matchesMode = mode === "all" || event.mode.toLowerCase() === mode.toLowerCase();
      const matchesPricing =
        pricing === "all" ||
        (pricing === "free" && Number(event.priceFrom) === 0) ||
        (pricing === "paid" && Number(event.priceFrom) > 0);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [event.title, event.location, event.city, event.categoryLabel, ...event.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesMode && matchesPricing && matchesSearch;
    })
    .sort(sorters[sort] || sorters.featured);
};

export const fetchCategories = async () => {
  if (useMockApi) {
    return simulateResponse(categories, 240);
  }

  try {
    const { data } = await apiClient.get("/event-categories");
    return Array.isArray(data) && data.length ? data : categories;
  } catch {
    return categories;
  }
};

export const fetchEvents = async ({ search = "", category = "all", mode = "all", pricing = "all", sort = "featured" } = {}) => {
  if (useMockApi) {
    return simulateResponse(filterMockEvents({ search, category, mode, pricing, sort }));
  }

  const params = {};
  if (search.trim()) params.search = search.trim();
  if (category !== "all") params.category = category;
  if (mode !== "all") params.mode = mode;
  if (pricing !== "all") params.pricing = pricing;
  if (sort !== "featured") params.sort = sort;

  try {
    const { data } = await apiClient.get("/events", { params });
    if (!Array.isArray(data)) {
      return filterMockEvents({ search, category, mode, pricing, sort });
    }

    if (data.length === 0) {
      return filterMockEvents({ search, category, mode, pricing, sort });
    }

    return data.map(normalizeBackendEvent);
  } catch {
    return filterMockEvents({ search, category, mode, pricing, sort });
  }
};

export const fetchEventById = async (eventId) => {
  const mockEvent = findMockEventById(eventId);

  if (useMockApi) {
    if (!mockEvent) {
      throw new Error("Event not found");
    }

    return simulateResponse(ensureDetailedEventShape(mockEvent), 420);
  }

  if (mockEvent) {
    return ensureDetailedEventShape(mockEvent);
  }

  const eventIdAsNumber = Number(eventId);
  if (Number.isNaN(eventIdAsNumber)) {
    throw new Error("Event not found");
  }

  try {
    const { data } = await apiClient.get(`/events/${eventIdAsNumber}`);
    return ensureDetailedEventShape(normalizeBackendEvent(data));
  } catch {
    throw new Error("Event not found");
  }
};

export const fetchRelatedEvents = async (eventId) => {
  const mockEvent = findMockEventById(eventId);

  if (useMockApi) {
    const currentEvent = mockEvent;
    const related = events.filter(
      (entry) => String(entry.id) !== String(eventId) && entry.category === currentEvent?.category
    );

    return simulateResponse(related.slice(0, 3), 300);
  }

  try {
    const eventIdAsNumber = Number(eventId);
    if (Number.isNaN(eventIdAsNumber)) {
      if (mockEvent) {
        return events
          .filter((entry) => String(entry.id) !== String(eventId) && entry.category === mockEvent.category)
          .slice(0, 3);
      }
      return [];
    }

    const { data } = await apiClient.get(`/events/${eventIdAsNumber}/related`);
    if (!Array.isArray(data) || data.length === 0) {
      if (mockEvent) {
        return events
          .filter((entry) => String(entry.id) !== String(eventId) && entry.category === mockEvent.category)
          .slice(0, 3);
      }
      return [];
    }

    return data.map(normalizeBackendEvent);
  } catch {
    if (mockEvent) {
      return events
        .filter((entry) => String(entry.id) !== String(eventId) && entry.category === mockEvent.category)
        .slice(0, 3);
    }
    return [];
  }
};
