import { useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { FilterModal } from "./components/FilterModal";
import { Header } from "./components/Header";
import { events } from "./data/events";
import { DashboardPage } from "./pages/DashboardPage";
import { EventDetailsPage } from "./pages/EventDetailsPage";
import { HomePage } from "./pages/HomePage";

const defaultFilters = {
  categories: [],
  city: "Toutes les villes",
  period: "all",
};

function downloadTickets() {
  const blob = new Blob(
    [
      "Billets Guichet Dark\n\nReservation: Concert Premium\nCode: GDT-2026-041\nAcces: 2 places\n",
    ],
    { type: "text/plain;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "mes-tickets-guichet-dark.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function App() {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [savedEvents, setSavedEvents] = useState([]);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return events.filter((event) => {
      const matchesNavCategory =
        activeCategory === "Tout" || event.category === activeCategory;
      const matchesModalCategory =
        filters.categories.length === 0 || filters.categories.includes(event.category);
      const matchesCity =
        filters.city === "Toutes les villes" || event.city === filters.city;
      const matchesPeriod = filters.period === "all" || event.period === filters.period;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [event.title, event.location, event.category, event.city, event.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return (
        matchesNavCategory &&
        matchesModalCategory &&
        matchesCity &&
        matchesPeriod &&
        matchesSearch
      );
    });
  }, [activeCategory, filters, searchTerm]);

  const featuredEvents = useMemo(
    () => events.filter((event) => event.featured || event.city === "Casablanca"),
    [],
  );

  function handleToggleSaved(eventId) {
    setSavedEvents((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId],
    );
  }

  const isOnDashboard = location.pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-transparent text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        {!isOnDashboard && (
          <Header
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isFilterOpen={isFilterOpen}
            onToggleFilters={() => setIsFilterOpen((current) => !current)}
            savedCount={savedEvents.length}
            onDownloadTickets={downloadTickets}
          />
        )}

        <main className="flex-1 pt-6">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  activeCategory={activeCategory}
                  filteredEvents={filteredEvents}
                  filters={filters}
                  featuredEvents={featuredEvents}
                  onItemSelect={setActiveCategory}
                  onToggleSaved={handleToggleSaved}
                  savedEvents={savedEvents}
                />
              }
            />
            <Route
              path="/event/:id"
              element={
                <EventDetailsPage
                  events={events}
                  onToggleSaved={handleToggleSaved}
                  savedEvents={savedEvents}
                />
              }
            />
            <Route
              path="/dashboard"
              element={<DashboardPage events={events} savedEvents={savedEvents} />}
            />
          </Routes>
        </main>

        <Footer />
      </div>

      <FilterModal
        isOpen={isFilterOpen}
        initialFilters={filters}
        onApply={(nextFilters) => {
          setFilters(nextFilters);
          setIsFilterOpen(false);
        }}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
}
