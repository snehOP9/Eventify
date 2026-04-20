import { motion } from "framer-motion";
import { Edit3, Eye, Globe, Trash2, XCircle } from "lucide-react";
import { formatDate } from "../../utils/formatters";
import PremiumButton from "./PremiumButton";
import StatusBadge from "./StatusBadge";

const EventManagementCard = ({
  event,
  onEdit,
  onDelete,
  onView,
  onPublishToggle,
  onCancel,
  busy = false
}) => {
  const soldTickets = Math.max((event.capacity || 0) - (event.seatsLeft || 0), 0);
  const published = ["Published", "Live", "Sold Out"].includes(event.status);

  return (
    <motion.article
      className="overflow-hidden rounded-3xl border border-white/12 bg-white/5 shadow-[0_24px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.24 }}
    >
      <div className="relative h-48 overflow-hidden">
        <img src={event.poster} alt={event.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4">
          <StatusBadge status={event.status} />
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">{event.categoryLabel || event.category}</p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-white">{event.title}</h3>
          <p className="mt-2 text-sm text-white/62">
            {formatDate(event.date)} | {event.city} | {event.location || event.venue}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-white/42">Tickets sold</p>
            <p className="mt-1 text-lg font-semibold text-white">{soldTickets.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-white/42">Seats left</p>
            <p className="mt-1 text-lg font-semibold text-white">{(event.seatsLeft || 0).toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <PremiumButton size="xs" variant="ghost" icon={Eye} onClick={() => onView(event)}>
            View
          </PremiumButton>
          <PremiumButton size="xs" variant="secondary" icon={Edit3} onClick={() => onEdit(event)}>
            Edit
          </PremiumButton>
          <PremiumButton
            size="xs"
            variant="ghost"
            icon={Globe}
            disabled={busy}
            onClick={() => onPublishToggle(event)}
          >
            {published ? "Unpublish" : "Publish"}
          </PremiumButton>
          <PremiumButton size="xs" variant="danger" icon={XCircle} disabled={busy} onClick={() => onCancel(event)}>
            Cancel
          </PremiumButton>
          <PremiumButton size="xs" variant="danger" icon={Trash2} disabled={busy} onClick={() => onDelete(event)}>
            Delete
          </PremiumButton>
        </div>
      </div>
    </motion.article>
  );
};

export default EventManagementCard;
