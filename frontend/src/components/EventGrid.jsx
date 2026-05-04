import { EventCard } from "./EventCard";

export function EventGrid({ events, savedEvents, onToggleSaved }) {
  if (events.length === 0) {
    return (
      <section className="rounded-[28px] border border-dashed border-white/10 bg-slate-950/50 px-6 py-16 text-center">
        <p className="text-lg font-bold text-white">Aucun evenement ne correspond.</p>
        <p className="mt-2 text-sm text-slate-400">
          Essayez une autre categorie ou modifiez votre recherche.
        </p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isSaved={savedEvents.includes(event.id)}
          onToggleSaved={() => onToggleSaved(event.id)}
        />
      ))}
    </section>
  );
}
