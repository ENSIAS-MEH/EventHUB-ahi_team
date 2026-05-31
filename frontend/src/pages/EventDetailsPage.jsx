import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingsApi } from "../api/api";

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

function BookingModal({ event, onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [places, setPlaces] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-[28px] border border-stroke bg-panel/95 p-8 shadow-glow">
          <h2 className="text-xl font-extrabold text-white">Connexion requise</h2>
          <p className="mt-3 text-sm text-slate-400">Vous devez être connecté pour réserver un billet.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => navigate("/auth")} className="flex-1 rounded-2xl bg-[#FF5722] px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-500">Se connecter</button>
            <button onClick={onClose} className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-300 transition hover:text-white">Annuler</button>
          </div>
        </div>
      </div>
    );
  }

  async function handleBook(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await bookingsApi.create(user.userId, event.id, places);
      setSuccess(true);
      if (onSuccess) onSuccess(places);
    } catch (err) {
      setError(err.message || "Erreur lors de la réservation.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-[28px] border border-green-500/20 bg-panel/95 p-8 shadow-glow text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-3xl">✓</div>
          <h2 className="text-xl font-extrabold text-white">Réservation créée !</h2>
          <p className="mt-3 text-sm text-slate-400">{places} place(s) réservée(s) pour {event.title}.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => navigate("/dashboard")} className="flex-1 rounded-2xl bg-[#FF5722] px-4 py-3 text-sm font-bold text-white">Payer</button>
            <button onClick={onClose} className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-300">Fermer</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[28px] border border-stroke bg-panel/95 p-8 shadow-glow">
        <h2 className="text-xl font-extrabold text-white">Réserver</h2>
        <form onSubmit={handleBook} className="mt-6 space-y-5">
          <input type="number" min="1" max={event.placesDisponibles || 10} value={places} onChange={(e) => setPlaces(Number(e.target.value))} className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white" />
          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-[#FF5722] px-4 py-3 text-sm font-bold text-white">{loading ? "Réservation..." : "Confirmer"}</button>
          <button type="button" onClick={onClose} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-300">Annuler</button>
        </form>
      </div>
    </div>
  );
}

export function EventDetailsPage({ events, onToggleSaved, savedEvents }) {
  const { id } = useParams();
  const [showBooking, setShowBooking] = useState(false);
  const event = events.find((item) => String(item.id) === id);
  const [livePlaces, setLivePlaces] = useState(null);

  useEffect(() => {
    if (event) setLivePlaces(event.placesDisponibles);
  }, [event]);

  if (!events || events.length === 0) {
    return <section className="p-8 text-center text-white"><p>Chargement en cours...</p></section>;
  }

  if (!event) {
    return <section className="p-8 text-white"><p>Événement introuvable.</p><Link to="/">Retour</Link></section>;
  }

  const isSaved = savedEvents.includes(event.id);

  return (
    <>
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
              <Link to="/" className="text-sm text-slate-400 transition hover:text-white">Retour</Link>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white">{event.title}</h1>
              <div className="mt-4 flex items-center gap-2 text-slate-300">
                <MapPinIcon /> <span>{event.location}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{event.date}</p>
              {livePlaces != null && (
                <p className="mt-2 text-sm text-green-400">
                  {livePlaces} place{livePlaces > 1 ? "s" : ""} disponible{livePlaces > 1 ? "s" : ""}
                </p>
              )}
            </div>
            <p className="text-base leading-8 text-slate-300">{event.description}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setShowBooking(true)} className="rounded-2xl bg-[#FF5722] px-6 py-4 text-sm font-bold text-white transition hover:bg-orange-500">
                Réserver maintenant
              </button>
              <button onClick={() => onToggleSaved(event.id)} className="rounded-2xl border border-white/10 bg-slate-950/60 px-6 py-4 text-sm font-semibold text-slate-200 transition hover:border-orange-400/20">
                {isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {showBooking && (
        <BookingModal 
           event={event} 
           onClose={() => setShowBooking(false)} 
           onSuccess={(bookedPlaces) => setLivePlaces(livePlaces - bookedPlaces)} 
        />
      )}
    </>
  );
}