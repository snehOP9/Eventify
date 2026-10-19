export const EVENT_TIME_ZONE = "Asia/Kolkata";

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

export const formatDate = (value, options = {}) => {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(value));
  const date = dateOnly
    ? new Date(String(value) + "T00:00:00.000Z")
    : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(dateOnly ? { timeZone: "UTC" } : {}),
    ...options
  }).format(date);
};

export const formatCompactNumber = (value) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);

const getZonedParts = (value, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(value);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
};

const parseEventTime = (value = "23:59") => {
  const normalized = String(value).trim();
  const twelveHour = normalized.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (twelveHour && Number(twelveHour[1]) >= 1 && Number(twelveHour[1]) <= 12 && Number(twelveHour[2]) < 60 && Number(twelveHour[3] || 0) < 60) {
    let hour = Number(twelveHour[1]) % 12;
    if (twelveHour[4].toUpperCase() === "PM") hour += 12;
    return { hour, minute: Number(twelveHour[2]), second: Number(twelveHour[3] || 0) };
  }
  const twentyFourHour = normalized.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (twentyFourHour && Number(twentyFourHour[1]) < 24 && Number(twentyFourHour[2]) < 60 && Number(twentyFourHour[3] || 0) < 60) {
    return { hour: Number(twentyFourHour[1]), minute: Number(twentyFourHour[2]), second: Number(twentyFourHour[3] || 0) };
  }
  return { hour: 23, minute: 59, second: 0 };
};

export const getEventStatus = (date, time = "23:59", now = new Date(), timeZone = EVENT_TIME_ZONE) => {
  const match = String(date || "").match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  if (!match) return "Upcoming";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const validDate = new Date(Date.UTC(year, month - 1, day));
  if (validDate.getUTCFullYear() !== year || validDate.getUTCMonth() !== month - 1 || validDate.getUTCDate() !== day) return "Upcoming";
  const eventTime = parseEventTime(time);
  const current = getZonedParts(now, timeZone);
  const eventWallClock = Date.UTC(year, month - 1, day, eventTime.hour, eventTime.minute, eventTime.second);
  const currentWallClock = Date.UTC(current.year, current.month - 1, current.day, current.hour, current.minute, current.second);
  const difference = eventWallClock - currentWallClock;

  if (difference < 0) return "Completed";
  if (Math.ceil(difference / (1000 * 60 * 60 * 24)) <= 3) return "Almost live";
  return "Upcoming";
};
