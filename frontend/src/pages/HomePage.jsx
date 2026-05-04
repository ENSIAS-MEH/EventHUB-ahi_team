import { EventGrid } from "../components/EventGrid";
import { FeaturedEvents } from "../components/FeaturedEvents";
import { SecondaryNav } from "../components/SecondaryNav";
import { categories } from "../data/events";

export function HomePage({
  activeCategory,
  filteredEvents,
  filters,
  featuredEvents,
  onItemSelect,
  onToggleSaved,
  savedEvents,
}) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-stroke bg-hero-grid bg-panel/80 px-5 py-8 shadow-glow backdrop-blur sm:px-8 sm:py-10 lg:px-10">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-orange-500/[0.05]" />
      <div className="relative flex flex-col gap-8">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-300">
            Experiences premium
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Votre billetterie moderne pour sortir, voyager et vibrer.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Recherche instantanee, filtres avances, navigation detaillee et acces rapide aux reservations depuis un univers sombre premium.
          </p>
        </div>

        <FeaturedEvents events={featuredEvents} />

        <SecondaryNav
          items={categories}
          activeItem={activeCategory}
          onItemSelect={onItemSelect}
        />

        <div className="flex flex-col gap-3 rounded-[28px] border border-white/8 bg-slate-950/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-white">
              {filteredEvents.length} evenement{filteredEvents.length > 1 ? "s" : ""} disponible
              {filteredEvents.length > 1 ? "s" : ""}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Ville: {filters.city} • Periode:{" "}
              {filters.period === "all"
                ? "Toutes les dates"
                : filters.period === "today"
                  ? "Aujourd'hui"
                  : filters.period === "weekend"
                    ? "Ce week-end"
                    : "Cette semaine"}
            </p>
          </div>
          <p className="text-sm text-orange-300">
            Cliquez sur une carte pour ouvrir sa fiche complete.
          </p>
        </div>

        <EventGrid
          events={filteredEvents}
          savedEvents={savedEvents}
          onToggleSaved={onToggleSaved}
        />
      </div>
    </section>
  );
}
