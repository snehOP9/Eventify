import { vi } from "vitest";

vi.mock("./apiClient", () => ({
  default: {
    get: vi.fn()
  }
}));

import apiClient from "./apiClient";
import { fetchOrganizerDashboard, fetchUserDashboard } from "./dashboardService";

describe("dashboardService fallbacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("marks attendee dashboard preview mode when live data fails", async () => {
    apiClient.get.mockRejectedValue(new Error("offline"));

    const dashboard = await fetchUserDashboard();

    expect(dashboard.meta.source).toBe("fallback");
    expect(dashboard.meta.banner).toMatch(/preview dashboard content/i);
    expect(dashboard.registeredEvents.length).toBeGreaterThan(0);
  });

  test("marks organizer dashboard preview mode when both live endpoints fail", async () => {
    apiClient.get.mockRejectedValue(new Error("offline"));

    const dashboard = await fetchOrganizerDashboard();

    expect(dashboard.meta.source).toBe("fallback");
    expect(dashboard.meta.banner).toMatch(/preview dashboard content/i);
    expect(dashboard.managedEvents.length).toBeGreaterThan(0);
  });
});
