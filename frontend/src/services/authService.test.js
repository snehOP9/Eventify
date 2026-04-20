import {
  canAccessPath,
  isOrganizerRole,
  normalizeAuthRole,
  resolveDashboardPath,
  resolvePostLoginPath
} from "./authService";

describe("authService helpers", () => {
  test("normalizes role aliases and prefixes", () => {
    expect(normalizeAuthRole("ROLE_ADMIN")).toBe("ADMIN");
    expect(normalizeAuthRole("organiser")).toBe("ORGANIZER");
    expect(normalizeAuthRole(undefined)).toBe("ATTENDEE");
  });

  test("identifies organizer-capable roles", () => {
    expect(isOrganizerRole("ORGANIZER")).toBe(true);
    expect(isOrganizerRole("ROLE_ADMIN")).toBe(true);
    expect(isOrganizerRole("ATTENDEE")).toBe(false);
  });

  test("limits dashboard access by role", () => {
    expect(canAccessPath("ATTENDEE", "/dashboard")).toBe(true);
    expect(canAccessPath("ATTENDEE", "/organizer")).toBe(false);
    expect(canAccessPath("ORGANIZER", "/organizer")).toBe(true);
    expect(canAccessPath("ORGANIZER", "/dashboard")).toBe(false);
  });

  test("resolves role-specific home dashboards", () => {
    expect(resolveDashboardPath("ATTENDEE")).toBe("/dashboard");
    expect(resolveDashboardPath("ORGANIZER")).toBe("/organizer");
    expect(resolveDashboardPath("ADMIN")).toBe("/organizer");
  });

  test("keeps valid requested paths and falls back when role cannot access them", () => {
    expect(resolvePostLoginPath("ATTENDEE", "/events")).toBe("/events");
    expect(resolvePostLoginPath("ATTENDEE", "/organizer")).toBe("/dashboard");
    expect(resolvePostLoginPath("ORGANIZER", "/dashboard")).toBe("/organizer");
    expect(resolvePostLoginPath("ORGANIZER", "/")).toBe("/organizer");
    expect(resolvePostLoginPath("ORGANIZER", "/login")).toBe("/organizer");
    expect(resolvePostLoginPath("ORGANIZER", "/events?type=tech")).toBe("/events?type=tech");
    expect(resolvePostLoginPath("ORGANIZER", null)).toBe("/organizer");
  });
});
