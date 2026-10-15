import { describe, expect, it } from "vitest";
import { EVENT_TIME_ZONE, formatDate, getEventStatus } from "./formatters";

describe("event timezone formatting", () => {
  it("uses the configured event timezone at midnight boundaries", () => {
    expect(EVENT_TIME_ZONE).toBe("Asia/Kolkata");
    expect(getEventStatus("2026-10-15", "00:15", new Date("2026-10-14T18:40:00.000Z"))).toBe("Almost live");
    expect(getEventStatus("2026-10-15", "00:15", new Date("2026-10-14T18:50:00.000Z"))).toBe("Completed");
  });

  it("supports 12-hour and 24-hour event times", () => {
    const now = new Date("2026-10-15T04:00:00.000Z");
    expect(getEventStatus("2026-10-15", "10:00 AM", now)).toBe("Almost live");
    expect(getEventStatus("2026-10-15", "10:00", now)).toBe("Almost live");
  });

  it("formats date-only values without shifting to the previous browser day", () => {
    expect(formatDate("2026-10-15")).toBe("Oct 15, 2026");
  });

  it("returns a safe fallback for invalid event dates", () => {
    expect(getEventStatus("not-a-date", "10:00", new Date("2026-10-15T00:00:00.000Z"))).toBe("Upcoming");
  });
});
