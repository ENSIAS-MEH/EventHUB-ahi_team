import { Link, useParams } from "react-router-dom";

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
    <path
      d="M12 21s6-5.33 6-11a6 6 0 10-12 0c0 5.67 6 11 6 11z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.5" fill="currentColor" />
  </svg>
);

export function EventDetailsPage({ events, onToggleSaved, savedEvents }) {
  const { id } = useParams();
  const event = events.find((item) => String(item.id) === id);

  if (!event) {
    return (
      <section className="rounded-[32px] border border-white/8 bg-panel/80 p-8">
        <p className="text-xl font-bold text-white">Evenement introuvable.</p>
        <Link
          to="/"
          className="mt-4 inline-flex rounded-2xl bg-[#FF5722] px-5 py-3 text-sm font-bold text-white"
        >
          Retour a l'accueil
        </Link>
      </section>
    );
  }

  const isSaved = savedEvents.includes(event.id);

  return (
    <section className="overflow-hidden rounded-[32px] border border-stroke bg-panel/80 shadow-glow">
      <div className="grid lg:grid-cols-[1.2fr,0.8fr]">
        <div className="relative min-h-[340px]">
          <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
          <div className="absolute bottom-6 left-6 rounded-full bg-[#FF5722] px-5 py-2 text-sm font-extrabold text-white">
            {event.price}
          </div>
        </div>
        <div className="space-y-6 px-6 py-8 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
              {event.category}
            </span>
            <Link to="/" className="text-sm text-slate-400 transition hover:text-white">
              Retour
            </Link>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">{event.title}</h1>
            <div className="mt-4 flex items-center gap-2 text-slate-300">
              <span className="text-orange-300">
                <MapPinIcon />
              </span>
              <span>{event.location}</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{event.date}</p>
          </div>
          <p className="text-base leading-8 text-slate-300">{event.description}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="rounded-2xl bg-[#FF5722] px-6 py-4 text-sm font-bold text-white transition hover:bg-orange-500">
              Reserver maintenant
            </button>
            <button
              type="button"
              onClick={() => onToggleSaved(event.id)}
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-6 py-4 text-sm font-semibold text-slate-200 transition hover:border-orange-400/20"
            >
              {isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
