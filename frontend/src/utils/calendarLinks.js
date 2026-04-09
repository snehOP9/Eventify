const GOOGLE_CALENDAR_BASE_URL = "https://calendar.google.com/calendar/render";

const pad = (value) => String(value).padStart(2, "0");

const formatGoogleDate = (date) => {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

const parseTimeLabel = (baseDate, timeLabel) => {
  if (!timeLabel) {
    return null;
  }

  const match = timeLabel.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  const [, hourRaw, minuteRaw, period] = match;
  let hours = Number(hourRaw) % 12;
  if (period.toUpperCase() === "PM") {
    hours += 12;
  }

  const next = new Date(baseDate);
  next.setHours(hours, Number(minuteRaw), 0, 0);
  return next;
};

export const deriveEventWindow = (event) => {
  const start = new Date(event.date);

  let end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const rangeParts = event.time?.split("-").map((part) => part.trim());
  if (rangeParts?.length === 2) {
    const parsedEnd = parseTimeLabel(start, rangeParts[1]);
    if (parsedEnd) {
      end = parsedEnd;
    }
  }

  if (end <= start) {
    end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  }

  return { start, end };
};

export const buildGoogleCalendarUrl = (event) => {
  const { start, end } = deriveEventWindow(event);
  const details = [event.shortDescription, event.description]
    .filter(Boolean)
    .join("\n\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    details,
    location: event.location || event.venue || event.city || ""
  });

  return `${GOOGLE_CALENDAR_BASE_URL}?${params.toString()}`;
};

const escapeIcs = (value = "") =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

export const buildIcsContent = (event) => {
  const { start, end } = deriveEventWindow(event);
  const uid = `${event.id || "eventify"}-${start.getTime()}@eventify.app`;
  const stamp = formatGoogleDate(new Date());
  const description = [event.shortDescription, event.description]
    .filter(Boolean)
    .join("\n\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventify//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${formatGoogleDate(start)}`,
    `DTEND:${formatGoogleDate(end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(event.location || event.venue || event.city || "")}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
};
