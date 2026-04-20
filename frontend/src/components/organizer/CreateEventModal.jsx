import { AnimatePresence, motion } from "framer-motion";
import { CirclePlus, CircleX, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PremiumButton from "./PremiumButton";

const createEmptyTicket = () => ({ name: "General Pass", price: 999, quantity: 50, available: 50 });
const createEmptySpeaker = () => ({ name: "", role: "" });
const createEmptyFaq = () => ({ question: "", answer: "" });
const createEmptyScheduleItem = () => ({ time: "", title: "", detail: "" });

const initialForm = {
  title: "",
  description: "",
  category: "Technology",
  venue: "",
  city: "",
  date: "",
  startTime: "10:00",
  endTime: "18:00",
  seatCapacity: 120,
  banner: "",
  poster: "",
  gallery: [""],
  status: "Draft",
  ticketTypes: [createEmptyTicket()],
  schedule: [createEmptyScheduleItem()],
  speakers: [createEmptySpeaker()],
  faqs: [createEmptyFaq()]
};

const stepLabels = ["Basics", "Ticketing", "Program", "Media & Publish"];

const mapEventToForm = (eventData) => {
  if (!eventData) {
    return initialForm;
  }

  const eventDate = eventData.date ? new Date(eventData.date) : null;

  return {
    title: eventData.title || "",
    description: eventData.description || eventData.shortDescription || "",
    category: eventData.categoryLabel || eventData.category || "Technology",
    venue: eventData.venue || eventData.location || "",
    city: eventData.city || "",
    date:
      eventDate && !Number.isNaN(eventDate.getTime())
        ? eventDate.toISOString().slice(0, 10)
        : "",
    startTime: eventData.startTime || "10:00",
    endTime: eventData.endTime || "18:00",
    seatCapacity: eventData.capacity || 120,
    banner: eventData.banner || eventData.poster || "",
    poster: eventData.poster || "",
    gallery: Array.isArray(eventData.gallery) && eventData.gallery.length ? eventData.gallery : [""],
    status: eventData.status || "Draft",
    ticketTypes:
      Array.isArray(eventData.ticketTiers) && eventData.ticketTiers.length
        ? eventData.ticketTiers.map((ticket) => ({
            name: ticket.title || "General Pass",
            price: Number(ticket.price) || 0,
            quantity: Number(ticket.quantity || ticket.available || 50),
            available: Number(ticket.available || ticket.quantity || 50)
          }))
        : [createEmptyTicket()],
    schedule:
      Array.isArray(eventData.timeline) && eventData.timeline.length
        ? eventData.timeline.map((item) => ({
            time: item.time || "",
            title: item.title || "",
            detail: item.detail || ""
          }))
        : [createEmptyScheduleItem()],
    speakers:
      Array.isArray(eventData.speakers) && eventData.speakers.length
        ? eventData.speakers.map((speaker) => ({
            name: speaker.name || "",
            role: speaker.role || ""
          }))
        : [createEmptySpeaker()],
    faqs:
      Array.isArray(eventData.faqs) && eventData.faqs.length
        ? eventData.faqs.map((faq) => ({
            question: faq.question || "",
            answer: faq.answer || ""
          }))
        : [createEmptyFaq()]
  };
};

const CreateEventModal = ({ open, mode = "create", initialValues, onClose, onSubmit, submitting }) => {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStep(0);
    setErrors({});
    setForm(mapEventToForm(initialValues));
  }, [initialValues, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const modalTitle = useMemo(() => (mode === "edit" ? "Edit event" : "Create event"), [mode]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateArrayField = (field, index, nextValue) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) => (itemIndex === index ? { ...item, ...nextValue } : item))
    }));
  };

  const addArrayField = (field, createValue) => {
    setForm((current) => ({
      ...current,
      [field]: [...current[field], createValue()]
    }));
  };

  const removeArrayField = (field, index) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].length === 1 ? current[field] : current[field].filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const validateCurrentStep = () => {
    const nextErrors = {};

    if (step === 0) {
      if (!form.title.trim()) {
        nextErrors.title = "Event name is required.";
      }

      if (!form.venue.trim()) {
        nextErrors.venue = "Venue is required.";
      }

      if (!form.date) {
        nextErrors.date = "Event date is required.";
      }
    }

    if (step === 1) {
      if (!Number(form.seatCapacity) || Number(form.seatCapacity) <= 0) {
        nextErrors.seatCapacity = "Seat capacity must be greater than 0.";
      }

      const invalidTicket = form.ticketTypes.some(
        (ticket) => !ticket.name.trim() || Number(ticket.price) < 0 || Number(ticket.quantity) <= 0
      );

      if (invalidTicket) {
        nextErrors.ticketTypes = "Each ticket type needs a name, price, and quantity.";
      }
    }

    if (step === 2) {
      const invalidSpeaker = form.speakers.some((speaker) => speaker.name && !speaker.role);
      const invalidFaq = form.faqs.some((faq) => faq.question && !faq.answer);

      if (invalidSpeaker) {
        nextErrors.speakers = "If speaker name is set, speaker role is required.";
      }

      if (invalidFaq) {
        nextErrors.faqs = "FAQ entries need both question and answer.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const normalizeSubmission = () => {
    const capacity = Number(form.seatCapacity) || 0;
    const ticketPrices = form.ticketTypes.map((ticket) => Number(ticket.price) || 0);

    return {
      ...initialValues,
      title: form.title.trim(),
      description: form.description.trim(),
      shortDescription: form.description.trim().slice(0, 140),
      category: form.category.trim().toLowerCase(),
      categoryLabel: form.category.trim(),
      venue: form.venue.trim(),
      location: `${form.venue.trim()}${form.city ? `, ${form.city.trim()}` : ""}`,
      city: form.city.trim() || "Remote",
      date: new Date(`${form.date}T${form.startTime}:00`).toISOString(),
      startTime: form.startTime,
      endTime: form.endTime,
      time: `${form.startTime} - ${form.endTime}`,
      capacity,
      seatsLeft: capacity,
      banner: form.banner.trim(),
      poster: form.poster.trim() || form.banner.trim(),
      gallery: form.gallery.map((image) => image.trim()).filter(Boolean),
      status: form.status,
      priceFrom: ticketPrices.length ? Math.min(...ticketPrices) : 0,
      ticketTiers: form.ticketTypes.map((ticket, index) => ({
        id: `tier-${index + 1}`,
        title: ticket.name.trim(),
        price: Number(ticket.price) || 0,
        quantity: Number(ticket.quantity) || 0,
        available: Number(ticket.available || ticket.quantity) || 0
      })),
      timeline: form.schedule
        .filter((item) => item.time || item.title || item.detail)
        .map((item) => ({
          time: item.time,
          title: item.title,
          detail: item.detail
        })),
      speakers: form.speakers
        .filter((speaker) => speaker.name || speaker.role)
        .map((speaker) => ({
          name: speaker.name,
          role: speaker.role
        })),
      faqs: form.faqs
        .filter((faq) => faq.question || faq.answer)
        .map((faq) => ({
          question: faq.question,
          answer: faq.answer
        }))
    };
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    setStep((current) => Math.min(current + 1, stepLabels.length - 1));
  };

  const handleBack = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    await onSubmit(normalizeSubmission());
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[140] grid place-items-center bg-[rgba(1,8,18,0.78)] px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/12 bg-[rgba(3,11,23,0.92)] p-5 shadow-[0_34px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">{modalTitle}</p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-white">Launch-ready event form</h3>
                <p className="mt-2 text-sm text-white/58">
                  Build event data in structured steps: basics, ticketing, program details, and publication assets.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80"
                aria-label="Close event modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-6 grid gap-2 sm:grid-cols-4">
              {stepLabels.map((label, index) => (
                <div
                  key={label}
                  className={`rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                    index === step
                      ? "border-cyan-300/50 bg-cyan-300/12 text-cyan-100"
                      : "border-white/10 bg-white/5 text-white/48"
                  }`}
                >
                  {index + 1}. {label}
                </div>
              ))}
            </div>

            {step === 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/70">Event name</label>
                  <input
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-white outline-none"
                    placeholder="Neon Builder Summit"
                  />
                  {errors.title ? <p className="mt-2 text-xs text-rose-200">{errors.title}</p> : null}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/70">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-white outline-none"
                    placeholder="Describe the event story, value promise, and key outcomes."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">Category</label>
                  <input
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-white outline-none"
                    placeholder="Technology"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">Venue</label>
                  <input
                    value={form.venue}
                    onChange={(event) => updateField("venue", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-white outline-none"
                    placeholder="Skyline Convention Center"
                  />
                  {errors.venue ? <p className="mt-2 text-xs text-rose-200">{errors.venue}</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">City</label>
                  <input
                    value={form.city}
                    onChange={(event) => updateField("city", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-white outline-none"
                    placeholder="Bangalore"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) => updateField("date", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-white outline-none"
                  />
                  {errors.date ? <p className="mt-2 text-xs text-rose-200">{errors.date}</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">Start and end time</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(event) => updateField("startTime", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-white outline-none"
                    />
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(event) => updateField("endTime", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-white/70">Seat capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={form.seatCapacity}
                    onChange={(event) => updateField("seatCapacity", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-white outline-none"
                  />
                  {errors.seatCapacity ? <p className="mt-2 text-xs text-rose-200">{errors.seatCapacity}</p> : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Ticket types</p>
                    <button
                      type="button"
                      onClick={() => addArrayField("ticketTypes", createEmptyTicket)}
                      className="inline-flex items-center gap-1 rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.ticketTypes.map((ticket, index) => (
                      <div key={`ticket-${index}`} className="grid gap-2 md:grid-cols-4">
                        <input
                          value={ticket.name}
                          onChange={(event) =>
                            updateArrayField("ticketTypes", index, { name: event.target.value })
                          }
                          className="h-11 rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none"
                          placeholder="Pass name"
                        />
                        <input
                          type="number"
                          min="0"
                          value={ticket.price}
                          onChange={(event) =>
                            updateArrayField("ticketTypes", index, { price: Number(event.target.value) || 0 })
                          }
                          className="h-11 rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none"
                          placeholder="Price"
                        />
                        <input
                          type="number"
                          min="1"
                          value={ticket.quantity}
                          onChange={(event) =>
                            updateArrayField("ticketTypes", index, { quantity: Number(event.target.value) || 1 })
                          }
                          className="h-11 rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none"
                          placeholder="Quantity"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            value={ticket.available}
                            onChange={(event) =>
                              updateArrayField("ticketTypes", index, { available: Number(event.target.value) || 1 })
                            }
                            className="h-11 flex-1 rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none"
                            placeholder="Available"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayField("ticketTypes", index)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-300/30 bg-rose-400/10 text-rose-100"
                            aria-label="Remove ticket type"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {errors.ticketTypes ? <p className="mt-3 text-xs text-rose-200">{errors.ticketTypes}</p> : null}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Schedule</p>
                    <button
                      type="button"
                      onClick={() => addArrayField("schedule", createEmptyScheduleItem)}
                      className="inline-flex items-center gap-1 rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"
                    >
                      <CirclePlus size={13} /> Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.schedule.map((item, index) => (
                      <div key={`schedule-${index}`} className="grid gap-2 md:grid-cols-3">
                        <input
                          value={item.time}
                          onChange={(event) => updateArrayField("schedule", index, { time: event.target.value })}
                          className="h-11 rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none"
                          placeholder="14:00"
                        />
                        <input
                          value={item.title}
                          onChange={(event) => updateArrayField("schedule", index, { title: event.target.value })}
                          className="h-11 rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none"
                          placeholder="Session title"
                        />
                        <div className="flex gap-2">
                          <input
                            value={item.detail}
                            onChange={(event) => updateArrayField("schedule", index, { detail: event.target.value })}
                            className="h-11 flex-1 rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none"
                            placeholder="Details"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayField("schedule", index)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-300/30 bg-rose-400/10 text-rose-100"
                            aria-label="Remove schedule item"
                          >
                            <CircleX size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Speakers</p>
                    <button
                      type="button"
                      onClick={() => addArrayField("speakers", createEmptySpeaker)}
                      className="inline-flex items-center gap-1 rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"
                    >
                      <CirclePlus size={13} /> Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.speakers.map((speaker, index) => (
                      <div key={`speaker-${index}`} className="grid gap-2 md:grid-cols-2">
                        <input
                          value={speaker.name}
                          onChange={(event) => updateArrayField("speakers", index, { name: event.target.value })}
                          className="h-11 rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none"
                          placeholder="Speaker name"
                        />
                        <div className="flex gap-2">
                          <input
                            value={speaker.role}
                            onChange={(event) => updateArrayField("speakers", index, { role: event.target.value })}
                            className="h-11 flex-1 rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none"
                            placeholder="Speaker role"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayField("speakers", index)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-300/30 bg-rose-400/10 text-rose-100"
                            aria-label="Remove speaker"
                          >
                            <CircleX size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.speakers ? <p className="mt-2 text-xs text-rose-200">{errors.speakers}</p> : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">FAQs</p>
                    <button
                      type="button"
                      onClick={() => addArrayField("faqs", createEmptyFaq)}
                      className="inline-flex items-center gap-1 rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"
                    >
                      <CirclePlus size={13} /> Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.faqs.map((faq, index) => (
                      <div key={`faq-${index}`} className="space-y-2 rounded-2xl border border-white/8 bg-white/5 p-2.5">
                        <input
                          value={faq.question}
                          onChange={(event) => updateArrayField("faqs", index, { question: event.target.value })}
                          className="h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none"
                          placeholder="Question"
                        />
                        <div className="flex gap-2">
                          <input
                            value={faq.answer}
                            onChange={(event) => updateArrayField("faqs", index, { answer: event.target.value })}
                            className="h-11 flex-1 rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none"
                            placeholder="Answer"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayField("faqs", index)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-300/30 bg-rose-400/10 text-rose-100"
                            aria-label="Remove faq"
                          >
                            <CircleX size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.faqs ? <p className="mt-2 text-xs text-rose-200">{errors.faqs}</p> : null}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Banner image URL</label>
                    <input
                      value={form.banner}
                      onChange={(event) => updateField("banner", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-white outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Poster image URL</label>
                    <input
                      value={form.poster}
                      onChange={(event) => updateField("poster", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-white outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Gallery image URLs</p>
                    <button
                      type="button"
                      onClick={() => addArrayField("gallery", () => "")}
                      className="inline-flex items-center gap-1 rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"
                    >
                      <CirclePlus size={13} /> Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.gallery.map((image, index) => (
                      <div key={`gallery-${index}`} className="flex gap-2">
                        <input
                          value={image}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              gallery: current.gallery.map((entry, entryIndex) =>
                                entryIndex === index ? event.target.value : entry
                              )
                            }))
                          }
                          className="h-11 flex-1 rounded-xl border border-white/12 bg-white/5 px-3 text-white outline-none"
                          placeholder="https://..."
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayField("gallery", index)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-300/30 bg-rose-400/10 text-rose-100"
                          aria-label="Remove gallery image"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">Initial status</label>
                  <select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-white outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Live">Live</option>
                  </select>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/45">
                Step {step + 1} of {stepLabels.length}
              </div>

              <div className="flex flex-wrap gap-2">
                <PremiumButton variant="ghost" onClick={onClose}>
                  Close
                </PremiumButton>

                {step > 0 ? (
                  <PremiumButton variant="secondary" onClick={handleBack}>
                    Back
                  </PremiumButton>
                ) : null}

                {step < stepLabels.length - 1 ? (
                  <PremiumButton onClick={handleNext}>Continue</PremiumButton>
                ) : (
                  <PremiumButton onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Saving..." : mode === "edit" ? "Save changes" : "Create event"}
                  </PremiumButton>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default CreateEventModal;
