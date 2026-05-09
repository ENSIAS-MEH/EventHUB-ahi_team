import { useNavigate } from "react-router-dom";

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
    <path
      d="M12 21s6-5.33 6-11a6 6 0 10-12 0c0 5.67 6 11 6 11z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.5" fill="currentColor" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
    <path
      d="M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 011 1v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a1 1 0 011-1z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path
      d="M12 20.5l-1.2-1.1C5.4 14.4 2 11.3 2 7.5A4.5 4.5 0 016.5 3 4.9 4.9 0 0112 5.8 4.9 4.9 0 0117.5 3 4.5 4.5 0 0122 7.5c0 3.8-3.4 6.9-8.8 11.9L12 20.5z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

export function EventCard({ event, isSaved, onToggleSaved }) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/event/${event.id}`)}
      className="group cursor-pointer overflow-hidden rounded-[28px] border border-white/6 bg-panel-soft/90 shadow-[0_24px_70px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-orange-400/20"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 rounded-full bg-[#FF5722] px-4 py-2 text-sm font-extrabold text-white shadow-lg shadow-orange-950/40">
          {event.price}
        </div>
        <button
          type="button"
          onClick={(eventTarget) => {
            eventTarget.stopPropagation();
            onToggleSaved();
          }}
          className={`absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
            isSaved
              ? "border-orange-300/40 bg-[#FF5722] text-white"
              : "border-white/10 bg-slate-950/70 text-slate-200 hover:border-orange-400/20"
          }`}
          aria-label={isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <HeartIcon filled={isSaved} />
        </button>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
            {event.category}
          </p>
          <h3 className="mt-2 text-xl font-extrabold tracking-tight text-white">{event.title}</h3>
        </div>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-orange-300">
              <MapPinIcon />
            </span>
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-300">
              <CalendarIcon />
            </span>
            <span>{event.date}</span>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={(eventTarget) => {
              eventTarget.stopPropagation();
              navigate(`/event/${event.id}`);
            }}
            className="flex-1 rounded-2xl bg-[#FF5722] px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
          >
            Voir details
          </button>
          <button
            type="button"
            onClick={(eventTarget) => {
              eventTarget.stopPropagation();
              onToggleSaved();
            }}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-orange-400/20 hover:text-white"
          >
            {isSaved ? "Sauve" : "Favori"}
          </button>
        </div>
      </div>
    </article>
  );
}
