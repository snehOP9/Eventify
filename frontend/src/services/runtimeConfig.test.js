import {
  deriveBackendOriginFromApiBaseUrl,
  resolveApiBaseUrl,
  sanitizeApiBaseUrl,
  sanitizeBackendOrigin
} from "./runtimeConfig";

describe("runtimeConfig helpers", () => {
  test("ignores the deprecated hosted api base url", () => {
    expect(sanitizeApiBaseUrl("https://deprecated-backend.example.com/api")).toBe("/api");
  });

  test("ignores the deprecated hosted browser backend origin", () => {
    expect(sanitizeBackendOrigin("https://deprecated-backend.example.com")).toBe("");
  });

  test("keeps the active hosted backend url for direct browser auth flows", () => {
    expect(sanitizeApiBaseUrl("https://event-platform-backend.onrender.com/api")).toBe(
      "https://event-platform-backend.onrender.com/api"
    );
    expect(sanitizeBackendOrigin("https://event-platform-backend.onrender.com")).toBe(
      "https://event-platform-backend.onrender.com"
    );
  });

  test("derives browser backend origin from an absolute api base url", () => {
    expect(deriveBackendOriginFromApiBaseUrl("https://api.eventify.dev/api")).toBe(
      "https://api.eventify.dev"
    );
  });

  test("falls back to same-origin api paths for browser navigation when no remote backend origin is configured", () => {
    expect(
      resolveApiBaseUrl({
        browserNavigation: true,
        apiBaseUrl: "/api",
        browserBackendOrigin: "",
        locationObject: { hostname: "eventify.app" }
      })
    ).toBe("/api");
  });
});
