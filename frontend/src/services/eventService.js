import apiClient from "./apiClient";
import { categories, events } from "../data/mockData";

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

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

export const fetchCategories = async () => {
  if (useMockApi) {
    return simulateResponse(categories, 240);
  }

  const { data } = await apiClient.get("/event-categories");
  return data;
};

export const fetchEvents = async ({ search = "", category = "all", mode = "all", pricing = "all", sort = "featured" } = {}) => {
  if (useMockApi) {
    const normalizedSearch = search.trim().toLowerCase();

    const filteredEvents = events
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

    return simulateResponse(filteredEvents);
  }

  const { data } = await apiClient.get("/events", {
    params: { search, category, mode, pricing, sort }
  });
  return data;
};

export const fetchEventById = async (eventId) => {
  if (useMockApi) {
    const event = events.find((entry) => entry.id === eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    return simulateResponse(event, 420);
  }

  const { data } = await apiClient.get(`/events/${eventId}`);
  return data;
};

export const fetchRelatedEvents = async (eventId) => {
  if (useMockApi) {
    const currentEvent = events.find((entry) => entry.id === eventId);
    const related = events.filter(
      (entry) => entry.id !== eventId && entry.category === currentEvent?.category
    );

    return simulateResponse(related.slice(0, 3), 300);
  }

  const { data } = await apiClient.get(`/events/${eventId}/related`);
  return data;
};
