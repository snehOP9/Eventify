import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownWideNarrow, CalendarRange, LayoutGrid, Sparkles } from "lucide-react";
import FilterPanel from "../components/events/FilterPanel";
import EventCard from "../components/events/EventCard";
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

const EventsPage = () => {
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");
  const [selectedSort, setSelectedSort] = useState("featured");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      const [categoryData, eventData] = await Promise.all([
        fetchCategories(),
        fetchEvents({
          search,
          category: selectedCategory,
          mode: selectedMode,
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
  }, [search, selectedCategory, selectedMode, selectedSort]);

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
    setSelectedSort("featured");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
      <section className="premium-card overflow-hidden px-6 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="glow-pill">Event catalog</div>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Explore a beautifully curated registration marketplace
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/62">
              Search, filter, and sort through live experiences with premium visual feedback, responsive cards, and backend-ready service hooks.
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
                {activeFiltersLabel}
              </p>
              <p className="mt-2 text-sm text-white/55">Search state updates automatically</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[300px_1fr]">
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

          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
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

          <div className="flex flex-wrap gap-3">
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

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="flex items-center gap-3 text-sm text-white/58">
              <CalendarRange size={18} className="text-[var(--primary)]" />
              Showing <span className="font-semibold text-white">{events.length}</span> premium-ready events with responsive loading and empty states.
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton cards={6} />
          ) : events.length === 0 ? (
            <EmptyState onAction={handleReset} />
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
            >
              {events.map((event) => (
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
