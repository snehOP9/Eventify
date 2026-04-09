import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownWideNarrow, CalendarRange, List, LayoutGrid, Sparkles } from "lucide-react";
import FilterPanel from "../components/events/FilterPanel";
import EventCard from "../components/events/EventCard";
import EventMapView from "../components/events/EventMapView";
import SearchBar from "../components/common/SearchBar";
import SectionHeading from "../components/common/SectionHeading";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import Reveal from "../components/common/Reveal";
import { fetchCategories, fetchEvents } from "../services/eventService";

const sortOptions = [
  { value: "featured", label: "Featured first" },
  { value: "newest", label: "Soonest first" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" }
];

const EventsPage = ({ pricingScope = "all" }) => {
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");
  const [selectedPricing, setSelectedPricing] = useState(pricingScope);
  const [selectedSort, setSelectedSort] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState("all");
  const [selectedMaxPrice, setSelectedMaxPrice] = useState("all");
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedPricing(pricingScope);
  }, [pricingScope]);

  useEffect(() => {
    const loadInitialData = async () => {
      const [categoryData, eventData] = await Promise.all([
        fetchCategories(),
        fetchEvents({
          search,
          category: selectedCategory,
          mode: selectedMode,
          pricing: pricingScope,
          sort: selectedSort
        })
      ]);

      setCategories(categoryData);
      setEvents(eventData);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchEvents({
      search,
      category: selectedCategory,
      mode: selectedMode,
      pricing: selectedPricing,
      sort: selectedSort
    }).then((data) => {
      if (!active) {
        return;
      }

      setEvents(data);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [search, selectedCategory, selectedMode, selectedPricing, selectedSort]);

  const activeFiltersLabel = useMemo(() => {
    if (selectedCategory === "all" && selectedMode === "all") {
      return "All experiences";
    }

    return [selectedCategory !== "all" ? selectedCategory : null, selectedMode !== "all" ? selectedMode : null]
      .filter(Boolean)
      .join(" / ");
  }, [selectedCategory, selectedMode]);

  const handleReset = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedMode("all");
    setSelectedPricing(pricingScope);
    setSelectedSort("featured");
    setSelectedDateFilter("all");
    setSelectedLocationFilter("all");
    setSelectedMaxPrice("all");
  };

  const locationOptions = useMemo(
    () => Array.from(new Set(events.map((event) => event.city))).sort((a, b) => a.localeCompare(b)),
    [events]
  );

  const visibleEvents = useMemo(() => {
    const now = new Date();

    return events.filter((event) => {
      const eventDate = new Date(event.date);
      const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
      const matchesDate =
        selectedDateFilter === "all" ||
        (selectedDateFilter === "this-week" && daysUntilEvent <= 7) ||
        (selectedDateFilter === "this-month" && daysUntilEvent <= 31) ||
        (selectedDateFilter === "future" && daysUntilEvent > 31);

      const matchesLocation =
        selectedLocationFilter === "all" || event.city === selectedLocationFilter;

      const matchesMaxPrice =
        selectedMaxPrice === "all" || Number(event.priceFrom) <= Number(selectedMaxPrice);

      return matchesDate && matchesLocation && matchesMaxPrice;
    });
  }, [events, selectedDateFilter, selectedLocationFilter, selectedMaxPrice]);

  const pageCopy = useMemo(() => {
    if (pricingScope === "free") {
      return {
        eyebrow: "Free events",
        title: "No-cost events with premium production quality",
        description: "High-value talks, workshops, and community sessions with zero ticket price.",
        heroLabel: "Free experiences"
      };
    }

    if (pricingScope === "paid") {
      return {
        eyebrow: "Premium events",
        title: "Paid experiences with deeper curation and higher signal",
        description: "Flagship summits, retreats, and masterclasses designed for serious attendees.",
        heroLabel: "Premium experiences"
      };
    }

    return {
      eyebrow: "Event catalog",
      title: "Explore a beautifully curated registration marketplace",
      description: "Search, filter, and sort through live experiences with premium visual feedback and backend-ready service hooks.",
      heroLabel: "All experiences"
    };
  }, [pricingScope]);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
      <section className="premium-card overflow-hidden px-6 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="glow-pill">{pageCopy.eyebrow}</div>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {pageCopy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/62">
              {pageCopy.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-5 py-5">
              <div className="flex items-center gap-3 text-[var(--primary)]">
                <Sparkles size={18} />
                <span className="text-xs uppercase tracking-[0.3em] text-white/40">Live signal</span>
              </div>
              <p className="mt-4 font-display text-3xl font-semibold text-white">{events.length}</p>
              <p className="mt-2 text-sm text-white/55">Results visible right now</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-5 py-5">
              <div className="flex items-center gap-3 text-[var(--primary)]">
                <LayoutGrid size={18} />
                <span className="text-xs uppercase tracking-[0.3em] text-white/40">Filter mode</span>
              </div>
              <p className="mt-4 font-display text-2xl font-semibold text-white capitalize">
                {pricingScope === "all" ? activeFiltersLabel : pageCopy.heroLabel}
              </p>
              <p className="mt-2 text-sm text-white/55">Search state updates automatically</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[300px_1fr] xl:gap-8">
        <div className="space-y-6">
          <FilterPanel
            categories={categories}
            selectedCategory={selectedCategory}
            selectedMode={selectedMode}
            onCategoryChange={setSelectedCategory}
            onModeChange={setSelectedMode}
            onReset={handleReset}
          />
        </div>

        <div className="space-y-6">
          <SectionHeading
            eyebrow="Search and sorting"
            title="Find the right atmosphere in seconds"
            description="A polished top bar with instant mock-driven search, category chips, and sorting controls."
          />

          <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1fr_220px]">
            <SearchBar value={search} onChange={setSearch} />
            <label className="relative">
              <ArrowDownWideNarrow
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
              />
              <select
                value={selectedSort}
                onChange={(event) => setSelectedSort(event.target.value)}
                className="h-14 w-full appearance-none rounded-[1.35rem] border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm text-white outline-none transition focus:border-[var(--primary)]/40 focus:bg-white/[0.06]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-950">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="relative">
              <select
                value={selectedDateFilter}
                onChange={(event) => setSelectedDateFilter(event.target.value)}
                className="h-12 w-full appearance-none rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-[var(--primary)]/40"
              >
                <option value="all" className="bg-slate-950">Any date</option>
                <option value="this-week" className="bg-slate-950">This week</option>
                <option value="this-month" className="bg-slate-950">This month</option>
                <option value="future" className="bg-slate-950">Later</option>
              </select>
            </label>

            <label className="relative">
              <select
                value={selectedLocationFilter}
                onChange={(event) => setSelectedLocationFilter(event.target.value)}
                className="h-12 w-full appearance-none rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-[var(--primary)]/40"
              >
                <option value="all" className="bg-slate-950">All locations</option>
                {locationOptions.map((city) => (
                  <option key={city} value={city} className="bg-slate-950">{city}</option>
                ))}
              </select>
            </label>

            <label className="relative">
              <select
                value={selectedMaxPrice}
                onChange={(event) => setSelectedMaxPrice(event.target.value)}
                className="h-12 w-full appearance-none rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-[var(--primary)]/40"
              >
                <option value="all" className="bg-slate-950">Any price</option>
                <option value="0" className="bg-slate-950">Free only</option>
                <option value="1500" className="bg-slate-950">Up to INR 1,500</option>
                <option value="3000" className="bg-slate-950">Up to INR 3,000</option>
                <option value="7000" className="bg-slate-950">Up to INR 7,000</option>
              </select>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[1.1rem] border text-sm font-medium transition ${
                  viewMode === "grid"
                    ? "border-[var(--primary)]/45 bg-[var(--primary)]/12 text-white"
                    : "border-white/10 bg-white/[0.04] text-white/66"
                }`}
              >
                <LayoutGrid size={15} /> Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[1.1rem] border text-sm font-medium transition ${
                  viewMode === "list"
                    ? "border-[var(--primary)]/45 bg-[var(--primary)]/12 text-white"
                    : "border-white/10 bg-white/[0.04] text-white/66"
                }`}
              >
                <List size={15} /> List
              </button>
            </div>
          </div>

            <div className="-mx-1 overflow-x-auto px-1 pb-2">
              <div className="flex min-w-max flex-nowrap gap-3 sm:min-w-0 sm:flex-wrap">
              {pricingScope === "all" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedPricing("all")}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      selectedPricing === "all"
                        ? "bg-[var(--primary)] text-slate-950"
                        : "border border-white/10 bg-white/[0.04] text-white/55"
                    }`}
                  >
                    All pricing
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPricing("free")}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      selectedPricing === "free"
                        ? "bg-[var(--primary)] text-slate-950"
                        : "border border-white/10 bg-white/[0.04] text-white/55"
                    }`}
                  >
                    Free
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPricing("paid")}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      selectedPricing === "paid"
                        ? "bg-[var(--primary)] text-slate-950"
                        : "border border-white/10 bg-white/[0.04] text-white/55"
                    }`}
                  >
                    Paid
                  </button>
                </>
              ) : null}
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    selectedCategory === "all"
                      ? "bg-[var(--primary)] text-slate-950"
                      : "border border-white/10 bg-white/[0.04] text-white/55"
                  }`}
                >
                  All categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      selectedCategory === category.id
                        ? "bg-[var(--primary)] text-slate-950"
                        : "border border-white/10 bg-white/[0.04] text-white/55"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>


          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/58 sm:gap-3">
              <CalendarRange size={18} className="text-[var(--primary)]" />
              Showing <span className="font-semibold text-white">{visibleEvents.length}</span> premium-ready events with responsive loading and empty states.
              <button
                type="button"
                onClick={() => setShowMap((current) => !current)}
                className="ml-auto inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/66 transition hover:border-[var(--primary)]/40 hover:text-white"
              >
                {showMap ? "Hide map" : "Show map"}
              </button>
            </div>
          </div>

          {showMap ? <EventMapView events={visibleEvents} /> : null}

          {loading ? (
            <LoadingSkeleton cards={6} />
          ) : visibleEvents.length === 0 ? (
            <EmptyState onAction={handleReset} />
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className={`grid gap-6 ${
                viewMode === "list"
                  ? "grid-cols-1"
                  : "sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
              }`}
            >
              {visibleEvents.map((event) => (
                <Reveal key={event.id}>
                  <EventCard event={event} />
                </Reveal>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
