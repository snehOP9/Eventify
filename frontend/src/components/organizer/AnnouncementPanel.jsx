import { Megaphone, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate } from "../../utils/formatters";
import PremiumButton from "./PremiumButton";

const AnnouncementPanel = ({ announcements, events, onSend, sending }) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [eventScope, setEventScope] = useState("ALL_EVENTS");

  const eventOptions = useMemo(
    () => [{ id: "ALL_EVENTS", title: "All published events" }, ...events],
    [events]
  );

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      return;
    }

    const targetEvent = eventScope === "ALL_EVENTS" ? null : eventOptions.find((event) => event.id === eventScope);

    await onSend({
      subject: subject.trim(),
      body: body.trim(),
      eventScope,
      eventTitle: targetEvent?.title || "All registered attendees"
    });

    setSubject("");
    setBody("");
    setEventScope("ALL_EVENTS");
  };

  return (
    <section className="rounded-3xl border border-white/12 bg-white/5 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-semibold text-white">Announcements</h3>
          <p className="mt-1 text-sm text-white/58">
            Send updates to all attendees or a specific event audience.
          </p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/35 bg-cyan-300/10 text-cyan-100">
          <Megaphone size={16} />
        </span>
      </div>

      <div className="space-y-3">
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white outline-none"
          placeholder="Announcement subject"
        />

        <select
          value={eventScope}
          onChange={(event) => setEventScope(event.target.value)}
          className="h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white outline-none"
        >
          {eventOptions.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none"
          placeholder="Write update details, schedule changes, or reminders..."
        />

        <PremiumButton
          size="sm"
          onClick={handleSend}
          disabled={sending || !subject.trim() || !body.trim()}
          icon={Send}
        >
          {sending ? "Sending..." : "Send announcement"}
        </PremiumButton>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">Recent updates</p>
        {announcements.length ? (
          announcements.map((announcement) => (
            <article key={announcement.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-white">{announcement.subject}</h4>
                  <p className="mt-1 text-sm text-white/65">{announcement.body}</p>
                </div>
                <span className="text-xs text-white/45">{formatDate(announcement.sentAt, { month: "short", day: "numeric" })}</span>
              </div>
              <p className="mt-2 text-xs text-cyan-100/75">Audience: {announcement.eventTitle}</p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/55">
            No announcements sent yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default AnnouncementPanel;
