import { Download, QrCode } from "lucide-react";
import { formatDate } from "../../utils/formatters";

const TicketCard = ({ event, passCode, onDownload }) => {
  const qrValue = `${window.location.origin}/tickets/${event.id}/${passCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrValue)}`;

  return (
    <div className="premium-card overflow-hidden px-5 py-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/35">Digital pass</p>
          <h4 className="mt-2 font-display text-2xl font-semibold text-white">{event.title}</h4>
        </div>
        <div className="rounded-full border border-[var(--primary)]/25 bg-[var(--primary)]/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
          Active
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-2">
          <p className="text-sm text-white/58">{formatDate(event.date)} · {event.city}</p>
          <p className="text-sm text-white/58">Venue: {event.location}</p>
          <p className="text-xs uppercase tracking-[0.22em] text-white/40">Pass code: {passCode}</p>
        </div>

        <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-3">
          <img src={qrUrl} alt={`${event.title} QR`} className="h-[120px] w-[120px] rounded-lg" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/84 transition hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/12"
        >
          <Download size={16} />
          Download pass
        </button>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs uppercase tracking-[0.18em] text-white/55">
          <QrCode size={15} />
          Gate-ready QR
        </span>
      </div>
    </div>
  );
};

export default TicketCard;
