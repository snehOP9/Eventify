import { AnimatePresence, motion } from "framer-motion";
import { Download, Eye, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate } from "../../utils/formatters";
import PremiumButton from "./PremiumButton";

const RegistrationTable = ({ registrations, onExport }) => {
  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [ticketFilter, setTicketFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((registration) => {
      const matchesQuery =
        registration.attendee.toLowerCase().includes(query.toLowerCase()) ||
        registration.email.toLowerCase().includes(query.toLowerCase()) ||
        registration.event.toLowerCase().includes(query.toLowerCase());

      const matchesPayment =
        paymentFilter === "ALL" || registration.paymentStatus.toUpperCase() === paymentFilter;

      const matchesTicket =
        ticketFilter === "ALL" || registration.ticketStatus.toUpperCase() === ticketFilter;

      return matchesQuery && matchesPayment && matchesTicket;
    });
  }, [paymentFilter, query, registrations, ticketFilter]);

  return (
    <section className="rounded-3xl border border-white/12 bg-white/5 p-5 shadow-[0_22px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-semibold text-white">Registrations</h3>
          <p className="mt-1 text-sm text-white/58">
            Search attendees, inspect payment status, and export filtered rows.
          </p>
        </div>

        <PremiumButton size="sm" variant="secondary" icon={Download} onClick={() => onExport(filteredRegistrations)}>
          Export attendees
        </PremiumButton>
      </div>

      <div className="mb-4 grid gap-2 md:grid-cols-[1fr,auto,auto]">
        <label className="relative block">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-xl border border-white/12 bg-white/5 pl-10 pr-3 text-sm text-white outline-none"
            placeholder="Search attendee, email, or event"
          />
        </label>

        <select
          value={paymentFilter}
          onChange={(event) => setPaymentFilter(event.target.value)}
          className="h-11 rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white outline-none"
        >
          <option value="ALL">All payment states</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>

        <select
          value={ticketFilter}
          onChange={(event) => setTicketFilter(event.target.value)}
          className="h-11 rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white outline-none"
        >
          <option value="ALL">All ticket states</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="WAITLISTED">Waitlisted</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead className="bg-white/6 text-xs uppercase tracking-[0.18em] text-white/45">
              <tr>
                <th className="px-3 py-3">Attendee</th>
                <th className="px-3 py-3">Event</th>
                <th className="px-3 py-3">Ticket</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3">Ticket status</th>
                <th className="px-3 py-3">Registered</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.length ? (
                filteredRegistrations.map((registration) => (
                  <motion.tr
                    key={registration.id}
                    className="border-t border-white/10 text-white/76"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                  >
                    <td className="px-3 py-3">
                      <p className="font-semibold text-white">{registration.attendee}</p>
                      <p className="text-xs text-white/48">{registration.email}</p>
                    </td>
                    <td className="px-3 py-3">{registration.event}</td>
                    <td className="px-3 py-3">{registration.ticket}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                          registration.paymentStatus === "Paid"
                            ? "border-emerald-300/40 bg-emerald-300/12 text-emerald-100"
                            : registration.paymentStatus === "Pending"
                              ? "border-amber-300/40 bg-amber-300/12 text-amber-100"
                              : "border-rose-300/40 bg-rose-300/12 text-rose-100"
                        }`}
                      >
                        {registration.paymentStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3">{registration.ticketStatus}</td>
                    <td className="px-3 py-3">{formatDate(registration.registeredAt)}</td>
                    <td className="px-3 py-3">
                      <PremiumButton
                        size="xs"
                        variant="ghost"
                        icon={Eye}
                        onClick={() => setSelected(registration)}
                      >
                        View
                      </PremiumButton>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-white/55">
                    No registrations match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] grid place-items-center bg-[rgba(1,8,18,0.7)] px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-lg rounded-3xl border border-white/12 bg-[rgba(3,11,23,0.95)] p-5 shadow-[0_32px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Attendee details</p>
                  <h4 className="mt-2 font-display text-2xl font-semibold text-white">{selected.attendee}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/5 text-white"
                  aria-label="Close attendee modal"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-sm text-white/72">
                <p><span className="text-white/48">Email:</span> {selected.email}</p>
                <p><span className="text-white/48">Phone:</span> {selected.phone}</p>
                <p><span className="text-white/48">Event:</span> {selected.event}</p>
                <p><span className="text-white/48">Ticket:</span> {selected.ticket}</p>
                <p><span className="text-white/48">Payment status:</span> {selected.paymentStatus}</p>
                <p><span className="text-white/48">Ticket status:</span> {selected.ticketStatus}</p>
                <p><span className="text-white/48">Notes:</span> {selected.notes || "No additional notes."}</p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
};

export default RegistrationTable;
