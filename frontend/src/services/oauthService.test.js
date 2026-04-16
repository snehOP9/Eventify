import {
  buildOAuthLoginUrl,
  consumeOAuthRedirectTarget,
  getOAuthPortalHint,
  setOAuthRedirectTarget
} from "./oauthService";

describe("oauthService helpers", () => {
  beforeEach(() => {
    document.cookie = "eventify_oauth_portal=; Path=/; Max-Age=0";
    window.sessionStorage.clear();
  });

  test("builds browser-friendly OAuth URLs for local development", () => {
    expect(buildOAuthLoginUrl("google")).toBe(
      "http://localhost:8080/api/oauth2/authorization/google"
    );
    expect(buildOAuthLoginUrl("github")).toBe(
      "http://localhost:8080/api/oauth2/authorization/github"
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
});
