import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  LayoutDashboard,
  Megaphone,
  TrendingUp,
  UserRound,
  Users2
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AnnouncementPanel from "../components/organizer/AnnouncementPanel";
import AnalyticsCard from "../components/organizer/AnalyticsCard";
import CreateEventModal from "../components/organizer/CreateEventModal";
import DashboardLayout from "../components/organizer/DashboardLayout";
import EventManagementCard from "../components/organizer/EventManagementCard";
import OrganizerProfileCard from "../components/organizer/OrganizerProfileCard";
import PremiumButton from "../components/organizer/PremiumButton";
import RegistrationTable from "../components/organizer/RegistrationTable";
import RevenueChart from "../components/organizer/RevenueChart";
import StatsCard from "../components/organizer/StatsCard";
import { useToast } from "../components/common/ToastProvider";
import { fetchOrganizerDashboard } from "../services/dashboardService";
import {
  cancelOrganizerEvent,
  createOrganizerEvent,
  deleteOrganizerEvent,
  exportOrganizerAttendees,
  sendOrganizerAnnouncement,
  setOrganizerEventPublishing,
  updateOrganizerEvent
} from "../services/organizerService";
import { formatCompactNumber, formatCurrency } from "../utils/formatters";

const sectionConfig = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "my-events", label: "My events", icon: CalendarDays },
  { id: "registrations", label: "Registrations", icon: Users2 },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "profile", label: "Profile", icon: UserRound }
];

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const defaultProfile = {
  fullName: "Sneh Raunak",
  organizationName: "Eventify Originals",
  email: "organizer@eventify.app",
  phone: "+91 98765 43210",
  website: "https://eventify.app",
  linkedin: "https://linkedin.com/company/eventify",
  about:
    "We craft high-signal event experiences for founders, product teams, and operator communities across India.",
  logoUrl:
    "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=200&q=80"
};

const defaultAnnouncements = [
  {
    id: "notice-1",
    subject: "Speaker lineup unlocked",
    body: "New keynote speakers have been added. Updated agenda is now available in your attendee dashboard.",
    eventTitle: "All registered attendees",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString()
  },
  {
    id: "notice-2",
    subject: "Venue access timing",
    body: "Check-in opens 45 minutes before the first session. Keep your QR pass ready at gate entry.",
    eventTitle: "Neo Summit 2026",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString()
  }
];

const toTitleCase = (value) =>
  String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const deriveEventStatus = (eventData) => {
  if (eventData.status) {
    return eventData.status;
  }

  const eventDate = new Date(eventData.date);
  const now = new Date();

  if (eventData.cancelled) {
    return "Cancelled";
  }

  if ((eventData.seatsLeft || 0) <= 0) {
    return "Sold Out";
  }

  if (!Number.isNaN(eventDate.getTime())) {
    if (eventDate.getTime() < now.getTime()) {
      return "Completed";
    }

    if (Math.abs(eventDate.getTime() - now.getTime()) < 1000 * 60 * 60 * 6) {
      return "Live";
    }
  }

  return "Published";
};

const normalizeEvents = (events) => {
  return (events || []).map((event, index) => {
    const ticketCapacity =
      event.ticketTiers?.reduce((total, ticket) => total + (Number(ticket.quantity || ticket.available) || 0), 0) || 0;

    const capacity = Math.max(Number(event.capacity) || ticketCapacity || 120, 1);
    const seatsLeft = Math.max(
      Number.isFinite(Number(event.seatsLeft)) ? Number(event.seatsLeft) : capacity,
      0
    );

    const normalizedCategoryLabel = event.categoryLabel || toTitleCase(event.category) || "General";

    return {
      ...event,
      id: event.id || `event-${index + 1}`,
      categoryLabel: normalizedCategoryLabel,
      category: String(event.category || normalizedCategoryLabel).toLowerCase(),
      city: event.city || "Remote",
      venue: event.venue || event.location || "Venue pending",
      location: event.location || event.venue || "Venue pending",
      capacity,
      seatsLeft,
      status: deriveEventStatus({ ...event, seatsLeft }),
      poster:
        event.poster ||
        event.banner ||
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      banner:
        event.banner ||
        event.poster ||
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      shortDescription:
        event.shortDescription ||
        event.description ||
        "No short description has been added yet.",
      ticketTiers: Array.isArray(event.ticketTiers) && event.ticketTiers.length
        ? event.ticketTiers
        : [
            {
              id: `tier-default-${index + 1}`,
              title: "General Pass",
              price: Number(event.priceFrom) || 999,
              quantity: Math.max(Math.round(capacity * 0.8), 30),
              available: Math.max(Math.round(capacity * 0.8), 30)
            }
          ]
    };
  });
};

const normalizeRegistrations = (registrations, events) => {
  const fallbackRows = events.slice(0, 4).map((event, index) => ({
    id: `reg-fallback-${index + 1}`,
    attendee: ["Aditi Rao", "Karan Mehta", "Leah Dsouza", "Ritvik Jain"][index] || `Attendee ${index + 1}`,
    email: ["aditi@example.com", "karan@example.com", "leah@example.com", "ritvik@example.com"][index] || `attendee${index + 1}@example.com`,
    phone: ["+91 90000 11111", "+91 90000 22222", "+91 90000 33333", "+91 90000 44444"][index] || "+91 90000 00000",
    event: event.title,
    ticket: event.ticketTiers?.[0]?.title || "General Pass",
    paymentStatus: index % 3 === 0 ? "Pending" : "Paid",
    ticketStatus: index % 2 === 0 ? "Confirmed" : "Waitlisted",
    registeredAt: new Date(Date.now() - index * 1000 * 60 * 60 * 26).toISOString(),
    notes: "Generated preview attendee row."
  }));

  const sourceRows = registrations?.length ? registrations : fallbackRows;

  return sourceRows.map((row, index) => ({
    id: row.id || `reg-${index + 1}`,
    attendee: row.attendee || row.name || `Attendee ${index + 1}`,
    email: row.email || `guest${index + 1}@eventify.app`,
    phone: row.phone || "+91 90000 00000",
    event: row.event || events[index % Math.max(events.length, 1)]?.title || "Event",
    ticket: row.ticket || "General Pass",
    paymentStatus: row.paymentStatus || (index % 3 === 0 ? "Pending" : "Paid"),
    ticketStatus: row.ticketStatus || row.status || "Confirmed",
    registeredAt: row.registeredAt || new Date(Date.now() - index * 1000 * 60 * 60 * 24).toISOString(),
    notes: row.notes || "No additional notes."
  }));
};

const buildChartSeries = (seedSeries) => {
  const nowMonth = new Date().getMonth();
  const labels = Array.from({ length: 7 }, (_, index) => monthLabels[(nowMonth - 6 + index + 12) % 12]);
  const seed = seedSeries?.length ? seedSeries : [48, 62, 71, 64, 88, 104, 126];

  return {
    revenue: labels.map((label, index) => ({ label, value: (seed[index % seed.length] || 40) * 12000 })),
    tickets: labels.map((label, index) => ({ label, value: Math.round((seed[index % seed.length] || 40) * 1.8) })),
    registrations: labels.map((label, index) => ({ label, value: Math.round((seed[index % seed.length] || 40) * 1.45) }))
  };
};

const OrganizerDashboardPage = () => {
  const { pushToast } = useToast();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [announcements, setAnnouncements] = useState(defaultAnnouncements);
  const [profile, setProfile] = useState(defaultProfile);
  const [chartData, setChartData] = useState(buildChartSeries());
  const [activeSection, setActiveSection] = useState("overview");
  const [meta, setMeta] = useState({ source: "live", banner: "" });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [eventModal, setEventModal] = useState({ open: false, mode: "create", initialValues: null });
  const [savingEvent, setSavingEvent] = useState(false);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [actionBusyId, setActionBusyId] = useState("");

  const loadDashboard = useCallback(
    async ({ manual = false } = {}) => {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const dashboard = await fetchOrganizerDashboard();
        const normalizedEvents = normalizeEvents(dashboard.managedEvents || []);
        const normalizedRegistrations = normalizeRegistrations(dashboard.registrations, normalizedEvents);

        setEvents(normalizedEvents);
        setRegistrations(normalizedRegistrations);
        setChartData(buildChartSeries(dashboard.chartSeries));
        setMeta({ source: dashboard.meta?.source || "live", banner: dashboard.meta?.banner || "" });

        if (manual) {
          pushToast({
            title: dashboard.meta?.source === "live" ? "Organizer data refreshed" : "Preview data loaded",
            description:
              dashboard.meta?.source === "live"
                ? "Your organizer dashboard is synced with live metrics."
                : dashboard.meta?.banner || "Fallback preview data is active.",
            tone: dashboard.meta?.source === "live" ? "success" : "warning"
          });
        }
      } catch {
        pushToast({
          title: "Organizer dashboard unavailable",
          description: "Could not load organizer metrics right now.",
          tone: "error"
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pushToast]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        threshold: [0.2, 0.35, 0.6],
        rootMargin: "-22% 0px -58% 0px"
      }
    );

    sectionConfig.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [events.length, registrations.length]);

  const openCreateModal = () => {
    setEventModal({ open: true, mode: "create", initialValues: null });
  };

  const openEditModal = (event) => {
    setEventModal({ open: true, mode: "edit", initialValues: event });
  };

  const closeEventModal = () => {
    setEventModal({ open: false, mode: "create", initialValues: null });
  };

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalRegistrations = registrations.length;
    const upcomingEvents = events.filter((event) => ["Draft", "Published", "Live", "Sold Out"].includes(event.status)).length;

    const totalRevenue = events.reduce((total, event) => {
      const soldTickets = Math.max((event.capacity || 0) - (event.seatsLeft || 0), 0);
      const averageTicket = Number(event.priceFrom || event.ticketTiers?.[0]?.price || 0);
      return total + soldTickets * averageTicket;
    }, 0);

    return {
      totalEvents,
      totalRegistrations,
      totalRevenue,
      upcomingEvents
    };
  }, [events, registrations]);

  const analytics = useMemo(() => {
    const completionCount = events.filter((event) => event.status === "Completed").length;
    const completionRatio = events.length ? Math.round((completionCount / events.length) * 100) : 0;

    const sortedByDemand = [...events].sort((a, b) => {
      const aSold = Math.max((a.capacity || 0) - (a.seatsLeft || 0), 0);
      const bSold = Math.max((b.capacity || 0) - (b.seatsLeft || 0), 0);
      return bSold - aSold;
    });

    const popularEvent = sortedByDemand[0];

    return {
      completionRatio,
      popularEvent,
      announcementCount: announcements.length,
      activeEvents: events.filter((event) => ["Published", "Live", "Sold Out"].includes(event.status)).length
    };
  }, [announcements.length, events]);

  const handleSubmitEvent = async (eventPayload) => {
    setSavingEvent(true);

    try {
      if (eventModal.mode === "edit" && eventPayload.id) {
        const updated = await updateOrganizerEvent(eventPayload.id, eventPayload);
        const normalizedUpdated = normalizeEvents([{ ...eventPayload, ...updated }])[0];

        setEvents((currentEvents) =>
          currentEvents.map((event) => (event.id === eventPayload.id ? normalizedUpdated : event))
        );

        pushToast({
          title: "Event updated",
          description: `${eventPayload.title} changes were saved successfully.`,
          tone: "success"
        });
      } else {
        const created = await createOrganizerEvent(eventPayload);
        const normalizedCreated = normalizeEvents([
          {
            ...eventPayload,
            ...created,
            id: created.id || `event-${Date.now()}`
          }
        ])[0];

        setEvents((currentEvents) => [normalizedCreated, ...currentEvents]);

        pushToast({
          title: "Event created",
          description: `${normalizedCreated.title} is now available in your organizer event list.`,
          tone: "success"
        });
      }

      closeEventModal();
    } catch {
      pushToast({
        title: "Unable to save event",
        description: "Try again in a moment.",
        tone: "error"
      });
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    const shouldDelete = window.confirm(`Delete ${event.title}? This action cannot be undone.`);
    if (!shouldDelete) {
      return;
    }

    setActionBusyId(event.id);

    try {
      await deleteOrganizerEvent(event.id);
      setEvents((currentEvents) => currentEvents.filter((currentEvent) => currentEvent.id !== event.id));
      setRegistrations((currentRows) => currentRows.filter((row) => row.event !== event.title));

      pushToast({
        title: "Event removed",
        description: `${event.title} has been deleted.`,
        tone: "success"
      });
    } catch {
      pushToast({
        title: "Delete failed",
        description: "Could not delete this event.",
        tone: "error"
      });
    } finally {
      setActionBusyId("");
    }
  };

  const handleCancelEvent = async (event) => {
    setActionBusyId(event.id);

    try {
      await cancelOrganizerEvent(event.id);
      setEvents((currentEvents) =>
        currentEvents.map((currentEvent) =>
          currentEvent.id === event.id ? { ...currentEvent, status: "Cancelled" } : currentEvent
        )
      );

      pushToast({
        title: "Event cancelled",
        description: `${event.title} status changed to Cancelled.`,
        tone: "warning"
      });
    } catch {
      pushToast({
        title: "Cancel failed",
        description: "Could not cancel this event.",
        tone: "error"
      });
    } finally {
      setActionBusyId("");
    }
  };

  const handlePublishToggle = async (event) => {
    const shouldPublish = !["Published", "Live", "Sold Out"].includes(event.status);
    setActionBusyId(event.id);

    try {
      await setOrganizerEventPublishing(event.id, shouldPublish);

      setEvents((currentEvents) =>
        currentEvents.map((currentEvent) => {
          if (currentEvent.id !== event.id) {
            return currentEvent;
          }

          if (!shouldPublish) {
            return { ...currentEvent, status: "Draft" };
          }

          return {
            ...currentEvent,
            status: currentEvent.seatsLeft <= 0 ? "Sold Out" : "Published"
          };
        })
      );

      pushToast({
        title: shouldPublish ? "Event published" : "Event unpublished",
        description: `${event.title} is now ${shouldPublish ? "visible" : "in draft mode"} for attendees.`,
        tone: "success"
      });
    } catch {
      pushToast({
        title: "Publish action failed",
        description: "Could not update event visibility.",
        tone: "error"
      });
    } finally {
      setActionBusyId("");
    }
  };

  const handleViewEvent = (event) => {
    const analyticsSection = document.getElementById("analytics");
    analyticsSection?.scrollIntoView({ behavior: "smooth", block: "start" });

    pushToast({
      title: `${event.title} selected`,
      description: "Jumped to analytics for a deeper performance view.",
      tone: "info"
    });
  };

  const handleSendAnnouncement = async (announcement) => {
    setSendingAnnouncement(true);

    try {
      await sendOrganizerAnnouncement(announcement);
      setAnnouncements((current) => [
        {
          id: `announcement-${Date.now()}`,
          ...announcement,
          sentAt: new Date().toISOString()
        },
        ...current
      ]);

      pushToast({
        title: "Announcement sent",
        description: `Update delivered to ${announcement.eventTitle}.`,
        tone: "success"
      });
    } catch {
      pushToast({
        title: "Send failed",
        description: "Could not send announcement.",
        tone: "error"
      });
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const handleExportRows = (rows) => {
    const csv = exportOrganizerAttendees(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = href;
    link.download = `organizer-attendees-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(href);

    pushToast({
      title: "Attendee export ready",
      description: `${rows.length.toLocaleString("en-IN")} rows downloaded.`,
      tone: "success"
    });
  };

  const handleSaveProfile = async (nextProfile) => {
    setProfile(nextProfile);

    pushToast({
      title: "Organizer profile updated",
      description: "Organization details are now saved in your local dashboard session.",
      tone: "success"
    });
  };

  const navigateToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(sectionId);
  };

  if (loading) {
    return (
      <DashboardLayout
        sections={sectionConfig}
        activeSection={activeSection}
        onNavigate={navigateToSection}
        organizer={profile}
        onCreateEvent={openCreateModal}
        onRefresh={() => loadDashboard({ manual: true })}
        refreshing={refreshing}
      >
        <div className="h-[72vh] animate-pulse rounded-3xl border border-white/10 bg-white/5" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sections={sectionConfig}
      activeSection={activeSection}
      onNavigate={navigateToSection}
      organizer={profile}
      onCreateEvent={openCreateModal}
      onRefresh={() => loadDashboard({ manual: true })}
      refreshing={refreshing}
    >
      <div className="space-y-8">
        {meta.source !== "live" ? (
          <div className="rounded-3xl border border-amber-300/30 bg-amber-300/10 px-5 py-4 text-sm text-amber-100">
            {meta.banner || "Preview data mode is active for organizer insights."}
          </div>
        ) : null}

        <motion.section
          id="overview"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42 }}
          className="space-y-5"
        >
          <article className="rounded-3xl border border-white/12 bg-[linear-gradient(160deg,rgba(34,211,238,0.16),rgba(245,158,11,0.08),rgba(2,9,20,0.72))] px-6 py-6 shadow-[0_26px_60px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/78">Dashboard overview</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">
              Professional event command center for organizers.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/66">
              Create events, publish experiences, monitor sales, manage attendees, and operate all event workflows from one premium control panel.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <PremiumButton onClick={openCreateModal}>Create Event</PremiumButton>
              <PremiumButton variant="secondary" onClick={() => navigateToSection("registrations")}>
                View Registrations
              </PremiumButton>
              <PremiumButton variant="ghost" onClick={() => navigateToSection("analytics")}>
                Open Analytics
              </PremiumButton>
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard label="Total events" value={stats.totalEvents} icon={CalendarDays} trendText="Across draft, live, and completed" />
            <StatsCard
              label="Total registrations"
              value={stats.totalRegistrations}
              format="compact"
              icon={Users2}
              trendText="Combined attendee count"
              delay={0.05}
            />
            <StatsCard
              label="Revenue"
              value={stats.totalRevenue}
              format="currency"
              icon={CircleDollarSign}
              trendText="Projected from sold tickets"
              delay={0.1}
            />
            <StatsCard
              label="Upcoming events"
              value={stats.upcomingEvents}
              icon={TrendingUp}
              trendText="Draft + published pipeline"
              delay={0.15}
            />
          </div>
        </motion.section>

        <motion.section
          id="my-events"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/46">My events</p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-white">Event management studio</h3>
              <p className="mt-1 text-sm text-white/58">
                Edit details, publish/unpublish, cancel or remove events, and monitor ticket inventory.
              </p>
            </div>
            <PremiumButton onClick={openCreateModal}>New event</PremiumButton>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {events.map((event) => (
              <EventManagementCard
                key={event.id}
                event={event}
                onEdit={openEditModal}
                onDelete={handleDeleteEvent}
                onView={handleViewEvent}
                onPublishToggle={handlePublishToggle}
                onCancel={handleCancelEvent}
                busy={actionBusyId === event.id}
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          id="registrations"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <RegistrationTable registrations={registrations} onExport={handleExportRows} />
        </motion.section>

        <motion.section
          id="analytics"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/46">Analytics</p>
            <h3 className="mt-2 font-display text-3xl font-semibold text-white">Revenue, tickets, and trend signals</h3>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <RevenueChart
              title="Revenue chart"
              subtitle="Projected revenue trend"
              data={chartData.revenue}
              type="line"
              tone="cyan"
            />
            <RevenueChart
              title="Ticket sales chart"
              subtitle="Ticket volume trend"
              data={chartData.tickets}
              type="bars"
              tone="amber"
            />
            <RevenueChart
              title="Registration trend chart"
              subtitle="Registration momentum"
              data={chartData.registrations}
              type="line"
              tone="violet"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AnalyticsCard
              title="Most popular event"
              value={analytics.popularEvent?.title || "No event data"}
              subtext={
                analytics.popularEvent
                  ? `${formatCompactNumber(
                      Math.max((analytics.popularEvent.capacity || 0) - (analytics.popularEvent.seatsLeft || 0), 0)
                    )} tickets sold`
                  : "Create events to calculate demand"
              }
              tone="cyan"
              icon={TrendingUp}
            />
            <AnalyticsCard
              title="Completion ratio"
              value={`${analytics.completionRatio}%`}
              subtext="Completed events over total events"
              tone="violet"
              icon={BarChart3}
            />
            <AnalyticsCard
              title="Active events"
              value={analytics.activeEvents}
              subtext="Published / live / sold out"
              tone="emerald"
              icon={CalendarDays}
            />
            <AnalyticsCard
              title="Announcements sent"
              value={analytics.announcementCount}
              subtext="Organizer notices delivered"
              tone="amber"
              icon={Megaphone}
            />
          </div>
        </motion.section>

        <motion.section
          id="announcements"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <AnnouncementPanel
            announcements={announcements}
            events={events}
            onSend={handleSendAnnouncement}
            sending={sendingAnnouncement}
          />
        </motion.section>

        <motion.section
          id="profile"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <OrganizerProfileCard profile={profile} onSave={handleSaveProfile} />
        </motion.section>
      </div>

      <CreateEventModal
        open={eventModal.open}
        mode={eventModal.mode}
        initialValues={eventModal.initialValues}
        onClose={closeEventModal}
        onSubmit={handleSubmitEvent}
        submitting={savingEvent}
      />
    </DashboardLayout>
  );
};

export default OrganizerDashboardPage;
