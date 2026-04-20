import { Globe, Linkedin, Mail, Phone, Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import PremiumButton from "./PremiumButton";

const OrganizerProfileCard = ({ profile, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    await onSave(draft);
    setEditing(false);
  };

  return (
    <section className="rounded-3xl border border-white/12 bg-white/5 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-semibold text-white">Organizer profile</h3>
          <p className="mt-1 text-sm text-white/58">Manage your organization identity and contact links.</p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/35 bg-cyan-300/10 text-cyan-100">
          <UserRound size={16} />
        </span>
      </div>

      <div className="mb-4 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
        <img
          src={draft.logoUrl}
          alt={`${draft.organizationName} logo`}
          className="h-16 w-16 rounded-2xl border border-white/15 object-cover"
        />
        <div>
          <p className="font-semibold text-white">{draft.organizationName}</p>
          <p className="text-sm text-white/55">{draft.fullName}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2 text-sm text-white/70">
          Organization name
          <input
            value={draft.organizationName}
            disabled={!editing}
            onChange={(event) => updateDraft("organizationName", event.target.value)}
            className="h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none disabled:opacity-70"
          />
        </label>

        <label className="space-y-2 text-sm text-white/70">
          Organizer name
          <input
            value={draft.fullName}
            disabled={!editing}
            onChange={(event) => updateDraft("fullName", event.target.value)}
            className="h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none disabled:opacity-70"
          />
        </label>

        <label className="space-y-2 text-sm text-white/70">
          Contact email
          <div className="relative">
            <Mail size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
            <input
              value={draft.email}
              disabled={!editing}
              onChange={(event) => updateDraft("email", event.target.value)}
              className="h-11 w-full rounded-xl border border-white/12 bg-white/5 pl-9 pr-3 text-white outline-none disabled:opacity-70"
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-white/70">
          Contact phone
          <div className="relative">
            <Phone size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
            <input
              value={draft.phone}
              disabled={!editing}
              onChange={(event) => updateDraft("phone", event.target.value)}
              className="h-11 w-full rounded-xl border border-white/12 bg-white/5 pl-9 pr-3 text-white outline-none disabled:opacity-70"
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-white/70">
          Website
          <div className="relative">
            <Globe size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
            <input
              value={draft.website}
              disabled={!editing}
              onChange={(event) => updateDraft("website", event.target.value)}
              className="h-11 w-full rounded-xl border border-white/12 bg-white/5 pl-9 pr-3 text-white outline-none disabled:opacity-70"
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-white/70">
          LinkedIn
          <div className="relative">
            <Linkedin size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
            <input
              value={draft.linkedin}
              disabled={!editing}
              onChange={(event) => updateDraft("linkedin", event.target.value)}
              className="h-11 w-full rounded-xl border border-white/12 bg-white/5 pl-9 pr-3 text-white outline-none disabled:opacity-70"
            />
          </div>
        </label>
      </div>

      <label className="mt-3 block space-y-2 text-sm text-white/70">
        About organizer
        <textarea
          value={draft.about}
          disabled={!editing}
          onChange={(event) => updateDraft("about", event.target.value)}
          rows={4}
          className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-white outline-none disabled:opacity-70"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        {editing ? (
          <>
            <PremiumButton size="sm" icon={Save} onClick={handleSave}>
              Save profile
            </PremiumButton>
            <PremiumButton
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft(profile);
                setEditing(false);
              }}
            >
              Cancel
            </PremiumButton>
          </>
        ) : (
          <PremiumButton size="sm" variant="secondary" onClick={() => setEditing(true)}>
            Edit profile
          </PremiumButton>
        )}
      </div>
    </section>
  );
};

export default OrganizerProfileCard;
