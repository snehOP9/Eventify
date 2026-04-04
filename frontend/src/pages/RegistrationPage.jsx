import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CreditCard,
  Mail,
  Phone,
  ShieldCheck,
  Ticket,
  User
} from "lucide-react";
import { useParams } from "react-router-dom";
import AnimatedButton from "../components/common/AnimatedButton";
import GlowingCard from "../components/common/GlowingCard";
import SectionHeading from "../components/common/SectionHeading";
import RegistrationStepper from "../components/registration/RegistrationStepper";
import SuccessModal from "../components/registration/SuccessModal";
import { fetchEventById } from "../services/eventService";
import { submitRegistration } from "../services/registrationService";
import { formatCurrency, formatDate } from "../utils/formatters";
import { useToast } from "../components/common/ToastProvider";

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  ticketId: "",
  quantity: 1,
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvv: ""
};

const fieldClassName =
  "h-13 rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[var(--primary)]/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_6px_rgba(70,246,210,0.08)]";

const RegistrationPage = () => {
  const { eventId } = useParams();
  const { pushToast } = useToast();
  const [event, setEvent] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successState, setSuccessState] = useState({
    open: false,
    confirmationCode: ""
  });

  useEffect(() => {
    fetchEventById(eventId).then((eventData) => {
      setEvent(eventData);
      setFormData((current) => ({
        ...current,
        ticketId: eventData.ticketTiers[0]?.id || ""
      }));
    });
  }, [eventId]);

  const selectedTicket = useMemo(
    () => event?.ticketTiers.find((tier) => tier.id === formData.ticketId),
    [event, formData.ticketId]
  );

  const totalAmount = useMemo(() => {
    if (!selectedTicket) {
      return 0;
    }

    return selectedTicket.price * Number(formData.quantity);
  }, [formData.quantity, selectedTicket]);

  const handleFieldChange = (field) => (eventDom) => {
    const value = eventDom.target.value;
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateStep = () => {
    const nextErrors = {};

    if (currentStep === 0) {
      ["firstName", "lastName", "email", "phone"].forEach((field) => {
        if (!formData[field]) {
          nextErrors[field] = "This field is required.";
        }
      });
    }

    if (currentStep === 1 && !formData.ticketId) {
      nextErrors.ticketId = "Select a ticket tier.";
    }

    if (currentStep === 2) {
      ["cardName", "cardNumber", "expiry", "cvv"].forEach((field) => {
        if (!formData[field]) {
          nextErrors[field] = "This field is required.";
        }
      });
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      pushToast({
        title: "A few details are still missing",
        description: "Complete the highlighted fields before continuing.",
        tone: "warning"
      });
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    setSubmitting(true);

    const response = await submitRegistration({
      attendee: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company
      },
      ticketId: formData.ticketId,
      quantity: Number(formData.quantity),
      eventId: event.id
    });

    setSubmitting(false);
    setSuccessState({
      open: true,
      confirmationCode: response.confirmationCode
    });

    pushToast({
      title: "Registration locked in",
      description: `Confirmation ${response.confirmationCode} has been generated successfully.`,
      tone: "success"
    });
  };

  if (!event) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="premium-card h-[520px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
      <section className="premium-card px-6 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="glow-pill">Registration flow</div>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Secure your place with a polished multi-step registration journey
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/62">
              This stepper is designed for future Spring Boot integration, with Axios-ready services, validation states, and a refined confirmation experience.
            </p>
          </div>
          <GlowingCard hover={false} className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">You are registering for</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-white">{event.title}</h2>
            <p className="mt-2 text-sm text-white/58">{formatDate(event.date)} · {event.location}</p>
            <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/62">
              Premium fields, glowing focus states, and confident review patterns help this form feel product-grade.
            </div>
          </GlowingCard>
        </div>
      </section>

      <RegistrationStepper currentStep={currentStep} />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {currentStep === 0 ? (
            <GlowingCard hover={false} className="space-y-6 px-6 py-6">
              <SectionHeading
                eyebrow="Personal info"
                title="Tell us who is attending"
                description="Fields include elevated focus states, icon framing, and clear visual grouping."
              />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-white/55">First name</span>
                  <div className="relative flex items-center">
                    <User size={17} className="absolute left-4 text-white/35" />
                    <input value={formData.firstName} onChange={handleFieldChange("firstName")} className={`${fieldClassName} w-full pl-11`} placeholder="Arjun" />
                  </div>
                  {errors.firstName ? <p className="text-xs text-rose-300">{errors.firstName}</p> : null}
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/55">Last name</span>
                  <div className="relative flex items-center">
                    <User size={17} className="absolute left-4 text-white/35" />
                    <input value={formData.lastName} onChange={handleFieldChange("lastName")} className={`${fieldClassName} w-full pl-11`} placeholder="Kapoor" />
                  </div>
                  {errors.lastName ? <p className="text-xs text-rose-300">{errors.lastName}</p> : null}
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/55">Email</span>
                  <div className="relative flex items-center">
                    <Mail size={17} className="absolute left-4 text-white/35" />
                    <input value={formData.email} onChange={handleFieldChange("email")} className={`${fieldClassName} w-full pl-11`} placeholder="you@example.com" />
                  </div>
                  {errors.email ? <p className="text-xs text-rose-300">{errors.email}</p> : null}
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/55">Phone</span>
                  <div className="relative flex items-center">
                    <Phone size={17} className="absolute left-4 text-white/35" />
                    <input value={formData.phone} onChange={handleFieldChange("phone")} className={`${fieldClassName} w-full pl-11`} placeholder="+91 98765 43210" />
                  </div>
                  {errors.phone ? <p className="text-xs text-rose-300">{errors.phone}</p> : null}
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-white/55">Company or institution</span>
                  <div className="relative flex items-center">
                    <Building2 size={17} className="absolute left-4 text-white/35" />
                    <input value={formData.company} onChange={handleFieldChange("company")} className={`${fieldClassName} w-full pl-11`} placeholder="Hyperlane" />
                  </div>
                </label>
              </div>
            </GlowingCard>
          ) : null}

          {currentStep === 1 ? (
            <GlowingCard hover={false} className="space-y-6 px-6 py-6">
              <SectionHeading eyebrow="Ticket selection" title="Choose the tier that matches the experience you want" description="Clear options, quantity control, and subtle visual emphasis help the step feel premium." />
              <div className="grid gap-4">
                {event.ticketTiers.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setFormData((current) => ({ ...current, ticketId: tier.id }))}
                    className={`rounded-[1.4rem] border px-5 py-5 text-left transition ${
                      formData.ticketId === tier.id ? "border-[var(--primary)]/40 bg-[var(--primary)]/10" : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-display text-2xl font-semibold text-white">{tier.title}</p>
                        <p className="mt-2 text-sm leading-7 text-white/60">{tier.perks.join(" · ")}</p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white">
                        {formatCurrency(tier.price)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="max-w-xs space-y-2">
                <span className="text-sm text-white/55">Quantity</span>
                <input type="number" min="1" max="6" value={formData.quantity} onChange={handleFieldChange("quantity")} className={`${fieldClassName} w-full`} />
              </div>
              {errors.ticketId ? <p className="text-xs text-rose-300">{errors.ticketId}</p> : null}
            </GlowingCard>
          ) : null}

          {currentStep === 2 ? (
            <GlowingCard hover={false} className="space-y-6 px-6 py-6">
              <SectionHeading eyebrow="Payment preview" title="A luxury-grade payment mockup, ready for gateway integration" description="This is frontend-only, but the structure is prepared for future payment provider hooks." />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-white/55">Cardholder name</span>
                  <div className="relative flex items-center">
                    <User size={17} className="absolute left-4 text-white/35" />
                    <input value={formData.cardName} onChange={handleFieldChange("cardName")} className={`${fieldClassName} w-full pl-11`} placeholder="Arjun Kapoor" />
                  </div>
                  {errors.cardName ? <p className="text-xs text-rose-300">{errors.cardName}</p> : null}
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-white/55">Card number</span>
                  <div className="relative flex items-center">
                    <CreditCard size={17} className="absolute left-4 text-white/35" />
                    <input value={formData.cardNumber} onChange={handleFieldChange("cardNumber")} className={`${fieldClassName} w-full pl-11`} placeholder="4242 4242 4242 4242" />
                  </div>
                  {errors.cardNumber ? <p className="text-xs text-rose-300">{errors.cardNumber}</p> : null}
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/55">Expiry</span>
                  <input value={formData.expiry} onChange={handleFieldChange("expiry")} className={`${fieldClassName} w-full`} placeholder="08 / 27" />
                  {errors.expiry ? <p className="text-xs text-rose-300">{errors.expiry}</p> : null}
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/55">CVV</span>
                  <input value={formData.cvv} onChange={handleFieldChange("cvv")} className={`${fieldClassName} w-full`} placeholder="123" />
                  {errors.cvv ? <p className="text-xs text-rose-300">{errors.cvv}</p> : null}
                </label>
              </div>
              <div className="rounded-[1.4rem] border border-emerald-400/15 bg-emerald-500/10 px-4 py-4 text-sm leading-7 text-emerald-100/90">
                Secure checkout note: in a real integration, this panel would hand off tokenized card data to a payment gateway instead of storing card input locally.
              </div>
            </GlowingCard>
          ) : null}

          {currentStep === 3 ? (
            <GlowingCard hover={false} className="space-y-6 px-6 py-6">
              <SectionHeading eyebrow="Review" title="Give attendees one final moment of confidence before confirmation" />
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/35">Attendee</p>
                  <p className="mt-3 text-lg font-semibold text-white">{formData.firstName} {formData.lastName}</p>
                  <p className="mt-2 text-sm text-white/58">{formData.email}</p>
                  <p className="mt-1 text-sm text-white/58">{formData.phone}</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/35">Ticket</p>
                  <p className="mt-3 text-lg font-semibold text-white">{selectedTicket?.title}</p>
                  <p className="mt-2 text-sm text-white/58">{formData.quantity} x {formatCurrency(selectedTicket?.price || 0)}</p>
                  <p className="mt-1 text-sm text-white/58">{event.title}</p>
                </div>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-5 py-5">
                <div className="flex items-center justify-between text-sm text-white/58">
                  <span>Total payable</span>
                  <span className="font-display text-2xl font-semibold text-white">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="mt-4 flex items-center gap-3 text-sm text-white/60">
                  <ShieldCheck size={16} className="text-[var(--primary)]" />
                  Confirmation and ticket release are simulated for this frontend-only experience.
                </div>
              </div>
            </GlowingCard>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {currentStep > 0 ? <AnimatedButton onClick={handleBack} variant="secondary">Back</AnimatedButton> : null}
            {currentStep < 3 ? (
              <AnimatedButton onClick={handleNext}>Continue</AnimatedButton>
            ) : (
              <AnimatedButton onClick={handleSubmit}>{submitting ? "Confirming..." : "Confirm registration"}</AnimatedButton>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-28 space-y-6">
            <GlowingCard hover={false} className="px-6 py-6">
              <p className="text-xs uppercase tracking-[0.3em] text-white/35">Order summary</p>
              <h3 className="mt-4 font-display text-3xl font-semibold text-white">{event.title}</h3>
              <p className="mt-3 text-sm text-white/55">{formatDate(event.date)} · {event.location}</p>

              <div className="mt-6 rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                <div className="flex items-center justify-between text-sm text-white/58">
                  <span className="flex items-center gap-2">
                    <Ticket size={16} className="text-[var(--primary)]" />
                    Selected tier
                  </span>
                  <span className="font-semibold text-white">{selectedTicket?.title || "Choose a ticket"}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-white/58">
                  <span>Quantity</span>
                  <span className="font-semibold text-white">{formData.quantity}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm text-white/58">
                  <span>Total</span>
                  <span className="font-display text-2xl font-semibold text-white">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </GlowingCard>

            <GlowingCard hover={false} className="px-6 py-6">
              <p className="text-xs uppercase tracking-[0.3em] text-white/35">Why this flow works</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/60">
                <p>Clear progression reduces perceived effort.</p>
                <p>Premium surfaces and gentle glow increase trust.</p>
                <p>Review step gives confidence before confirmation.</p>
              </div>
            </GlowingCard>
          </div>
        </div>
      </div>

      <SuccessModal
        open={successState.open}
        confirmationCode={successState.confirmationCode}
        eventTitle={event.title}
        onClose={() => setSuccessState({ open: false, confirmationCode: "" })}
      />
    </div>
  );
};

export default RegistrationPage;
