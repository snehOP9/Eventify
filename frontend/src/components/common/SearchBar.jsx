import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search events, cities, or topics..." }) => {
  return (
    <label className="relative flex w-full items-center">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-[1.35rem] border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[var(--primary)]/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_6px_rgba(70,246,210,0.08)]"
      />
    </label>
  );
};

export default SearchBar;
