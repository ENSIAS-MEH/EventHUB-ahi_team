import { useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { FilterModal } from "./components/FilterModal";
import { Header } from "./components/Header";
import { AuthProvider } from "./context/AuthContext";
import { eventsApi } from "./api/api";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { EventDetailsPage } from "./pages/EventDetailsPage";
import { HomePage } from "./pages/HomePage";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80";

const defaultFilters = {
  categories: [],
  city: "Toutes les villes",
  period: "all",
};

function mapApiEvent(e) {
  return {
    id: e.id,
    title: e.titre || "Sans titre",
    description: e.description || "",
    category: e.categorie || "Concert",
    city: e.lieu ? e.lieu.split(",")[0].trim() : "Maroc",
    location: e.lieu || "",
    date: e.date || "",
    period: "all",
    price: e.prix != null ? `${e.prix} DH` : "Gratuit",
    image: e.imageUrl && e.imageUrl.trim() !== "" ? e.imageUrl : DEFAULT_IMAGE,
    placesDisponibles: e.placesDisponibles ?? null,
    featured: false,
  };
}

function AppContent() {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [savedEvents, setSavedEvents] = useState([]);
  const [apiEvents, setApiEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  function fetchEvents() {
    setLoadingEvents(true);
    eventsApi.getAll()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setApiEvents(data.map(mapApiEvent));
        } else {
          setApiEvents([]);
        }
      })
      .catch(() => setApiEvents([]))
      .finally(() => setLoadingEvents(false));
  }

  useEffect(() => { fetchEvents(); }, []);

  const events = apiEvents;

  const filteredEvents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return events.filter((ev) => {
      const byNav = activeCategory === "Tout" || ev.category === activeCategory;
      const byCat = filters.categories.length === 0 || filters.categories.includes(ev.category);
      const byCity = filters.city === "Toutes les villes" || ev.city === filters.city;
      // Les événements API ont period="all" → toujours visibles quel que soit le filtre période
      const byPeriod = filters.period === "all" || ev.period === filters.period || ev.period === "all";
      const bySearch = q.length === 0 ||
        [ev.title, ev.location, ev.category, ev.city, ev.description]
          .join(" ").toLowerCase().includes(q);
      return byNav && byCat && byCity && byPeriod && bySearch;
    });
  }, [activeCategory, filters, searchTerm, events]);

  const featuredEvents = useMemo(
    () => events.filter((ev) => ev.featured || ev.city === "Casablanca").slice(0, 8),
    [events],
  );

  function handleToggleSaved(eventId) {
    setSavedEvents((cur) =>
      cur.includes(eventId) ? cur.filter((id) => id !== eventId) : [...cur, eventId],
    );
  }

  const isOnDashboard = location.pathname === "/dashboard" || location.pathname === "/admin";
  const isOnAuth = location.pathname === "/auth";

  return (
    <div className="min-h-screen bg-transparent text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        {!isOnDashboard && !isOnAuth && (
          <Header
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isFilterOpen={isFilterOpen}
            onToggleFilters={() => setIsFilterOpen((v) => !v)}
            savedCount={savedEvents.length}
          />
        )}

        <main className="flex-1 pt-6">
          <Routes>
            <Route path="/" element={
              <HomePage
                activeCategory={activeCategory}
                filteredEvents={filteredEvents}
                filters={filters}
                featuredEvents={featuredEvents}
                onItemSelect={setActiveCategory}
                onToggleSaved={handleToggleSaved}
                savedEvents={savedEvents}
                loadingEvents={loadingEvents}
                searchTerm={searchTerm}
              />
            } />
            <Route path="/event/:id" element={
              <EventDetailsPage
                events={events}
                onToggleSaved={handleToggleSaved}
                savedEvents={savedEvents}
              />
            } />
            <Route path="/dashboard" element={
              <DashboardPage
                events={events}
                savedEvents={savedEvents}
                onEventCreated={fetchEvents}
              />
            } />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </main>

        {!isOnAuth && <Footer />}
      </div>

      <FilterModal
        isOpen={isFilterOpen}
        initialFilters={filters}
        onApply={(f) => { setFilters(f); setIsFilterOpen(false); }}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
