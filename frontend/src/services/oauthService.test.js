import {
  buildOAuthLoginUrl,
  consumeOAuthRedirectTarget,
  ensureOAuthBackendReachable,
  getOAuthPortalHint,
  setOAuthRedirectTarget
} from "./oauthService";

describe("oauthService helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    document.cookie = "eventify_oauth_portal=; Path=/; Max-Age=0";
    window.sessionStorage.clear();
  });

  test("builds browser-friendly OAuth URLs for local development", () => {
    expect(buildOAuthLoginUrl("google", "attendee")).toBe(
      "http://localhost:8080/api/auth/oauth2/authorization/google?portal=attendee"
    );
    expect(buildOAuthLoginUrl("github", "organizer")).toBe(
      "http://localhost:8080/api/auth/oauth2/authorization/github?portal=organizer"
    );
  });

  test("stores and consumes safe redirect targets", () => {
    setOAuthRedirectTarget("/organizer");

    expect(consumeOAuthRedirectTarget()).toBe("/organizer");
    expect(consumeOAuthRedirectTarget()).toBeNull();
  });

  test("ignores unsafe redirect targets", () => {
    setOAuthRedirectTarget("https://malicious.example");
    expect(consumeOAuthRedirectTarget()).toBeNull();
  });

  test("normalizes stored portal hint cookie values", () => {
    document.cookie = "eventify_oauth_portal=organizer; Path=/";
    expect(getOAuthPortalHint()).toBe("organizer");

    document.cookie = "eventify_oauth_portal=attendee; Path=/";
    expect(getOAuthPortalHint()).toBe("attendee");
  });

  test("does not block OAuth navigation in remote environments when readiness probe fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(
      ensureOAuthBackendReachable("google", {
        locationObject: { hostname: "eventify.app" }
      })
    ).resolves.toBeUndefined();
  });

  test("keeps local development guard when backend is not reachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(
      ensureOAuthBackendReachable("google", {
        locationObject: { hostname: "localhost" }
      })
    ).rejects.toThrow(
      "Start the backend server before using Google sign in."
    );
  });

  test("blocks OAuth when backend explicitly reports provider disabled", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ googleEnabled: false })
      })
    );

    await expect(
      ensureOAuthBackendReachable("google", {
        locationObject: { hostname: "eventify.app" }
      })
    ).rejects.toThrow("Google sign-in is not configured on the backend right now.");
  });
});
