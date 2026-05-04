import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
    <path
      d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
    <path
      d="M4 7h16M7 12h10M10 17h4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
    <path
      d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function Header({
  searchTerm,
  onSearchChange,
  isFilterOpen,
  onToggleFilters,
  savedCount,
  onDownloadTickets,
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    navigate("/dashboard");
  };

  return (
    <header className="sticky top-0 z-40 flex flex-col gap-4 rounded-[28px] border border-stroke bg-panel/85 px-4 py-4 backdrop-blur-xl sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <Logo showText={true} />
        </Link>
      </div>

      <div className="flex w-full flex-col gap-3 lg:max-w-2xl lg:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-white/5 bg-slate-950/80 px-4 py-3 text-slate-300 shadow-inner shadow-black/20">
          <SearchIcon />
          <input
            type="text"
            placeholder="Rechercher un film, un concert, un voyage..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>
        <button
          type="button"
          onClick={onToggleFilters}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold text-white transition ${
            isFilterOpen
              ? "border-orange-300/30 bg-orange-400"
              : "border-orange-400/20 bg-[#FF5722] hover:bg-orange-500"
          }`}
        >
          <FilterIcon />
          {isFilterOpen ? "Masquer" : "Filtres"}
        </button>
      </div>

      <div className="relative flex items-center justify-between gap-3 lg:justify-end" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleProfileClick}
          className="inline-flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-orange-400/20"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-orange-300">
            <UserIcon />
          </span>
          <span>
            <span className="block font-bold text-white">Anas M.</span>
            <span className="block text-xs text-slate-400">
              Mon espace • {savedCount} favori{savedCount > 1 ? "s" : ""}
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}
