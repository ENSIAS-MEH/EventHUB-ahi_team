import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingsApi, eventsApi } from "../api/api";
import { Logo } from "../components/Logo";

const PDFIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const STATUT_STYLE = {
  CONFIRMEE: "bg-green-500/20 text-green-300",
  ANNULEE: "bg-red-500/20 text-red-400",
  EN_ATTENTE: "bg-orange-500/20 text-orange-300",
};

function downloadTicket(booking, eventTitle) {
  const code = `EVH-${String(booking.id).padStart(6, "0")}`;
  const content = [
    "TICKET EVENTHUB",
    "==========================================",
    "",
    `Événement : ${eventTitle || `#${booking.eventId}`}`,
    `Date réservation : ${new Date(booking.dateReservation).toLocaleDateString("fr-FR")}`,
    `Nombre de places : ${booking.nombrePlaces}`,
    `Statut : ${booking.statut}`,
    `Code : ${code}`,
    "",
    "Ce billet doit être présenté à l'entrée.",
    "==========================================",
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ticket-${code}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const EMPTY_CATEGORY = { nom: "", description: "", prix: "", placesDisponibles: "" };

const EMPTY_FORM = {
  titre: "", type: "Concert", description: "", lieu: "", date: "",
};

const inputCls = "w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400";

export function DashboardPage({ events, savedEvents, onEventCreated }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Vue globale");

  // Réservations
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [eventMap, setEventMap] = useState({});

  // Mes annonces
  const [myEvents, setMyEvents] = useState([]);
  const [myEventsLoading, setMyEventsLoading] = useState(false);
  const [myEventsStats, setMyEventsStats] = useState({});

  // Création d'événement
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([{ ...EMPTY_CATEGORY }]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

  const tabs = [
    "Vue globale",
    "Mes reservations",
    "Mes favoris",
    "Mes annonces",
    "➕ Ajouter un événement",
    "⚙️ Paramètres",
  ];

  useEffect(() => {
    eventsApi.getAll()
      .then((list) => {
        if (Array.isArray(list)) {
          const map = {};
          list.forEach((e) => { map[e.id] = e.titre; });
          setEventMap(map);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    setBookingsLoading(true);
    bookingsApi.getByUser(user.userId)
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setBookingsLoading(false));
  }, [user]);

  // Charge les annonces de l'annonceur
  useEffect(() => {
    if (!user || activeTab !== "Mes annonces") return;
    setMyEventsLoading(true);
    eventsApi.getByAnnonceur(user.userId)
      .then(async (list) => {
        const eventsList = Array.isArray(list) ? list : [];
        setMyEvents(eventsList);
        // Charge les stats de réservation pour chaque événement
        const statsMap = {};
        await Promise.allSettled(
          eventsList.map(async (ev) => {
            try {
              const bks = await bookingsApi.getByEvent(ev.id);
              const bookingsList = Array.isArray(bks) ? bks : [];
              const totalVendus = bookingsList.reduce((s, b) => s + (b.nombrePlaces || 0), 0);
              statsMap[ev.id] = { totalVendus, bookings: bookingsList };
            } catch {
              statsMap[ev.id] = { totalVendus: 0, bookings: [] };
            }
          })
        );
        setMyEventsStats(statsMap);
      })
      .catch(() => setMyEvents([]))
      .finally(() => setMyEventsLoading(false));
  }, [user, activeTab]);

  // Gestion image
  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  }

  // Gestion des catégories
  function addCategory() {
    setCategories((c) => [...c, { ...EMPTY_CATEGORY }]);
  }

  function removeCategory(idx) {
    setCategories((c) => c.filter((_, i) => i !== idx));
  }

  function handleCategoryChange(idx, field, value) {
    setCategories((c) => c.map((cat, i) => i === idx ? { ...cat, [field]: value } : cat));
  }

  function resetForm() {
    setFormData(EMPTY_FORM);
    setCategories([{ ...EMPTY_CATEGORY }]);
    removeImage();
    setFormError("");
    setFormSuccess("");
  }

  async function handleSubmitEvent(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const invalidCat = categories.find((c) => !c.nom.trim() || !c.prix || !c.placesDisponibles);
    if (invalidCat) {
      setFormError("Veuillez remplir le nom, le prix et les places de chaque catégorie.");
      return;
    }

    setFormLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        setUploading(true);
        const result = await eventsApi.uploadImage(imageFile);
        imageUrl = result.url || "";
        setUploading(false);
      }

      const totalPlaces = categories.reduce((s, c) => s + (parseInt(c.placesDisponibles) || 0), 0);
      const firstPrix = parseFloat(categories[0]?.prix) || 0;

      await eventsApi.create({
        annonceurId: user.userId,
        titre: formData.titre,
        categorie: formData.type,
        description: formData.description,
        lieu: formData.lieu,
        date: formData.date,
        prix: firstPrix,
        placesDisponibles: totalPlaces,
        imageUrl,
        categories: categories.map((c) => ({
          nom: c.nom,
          description: c.description,
          prix: parseFloat(c.prix) || 0,
          placesDisponibles: parseInt(c.placesDisponibles) || 0,
        })),
      });

      setFormSuccess("Événement publié avec succès !");
      resetForm();
      onEventCreated?.();
    } catch (err) {
      setUploading(false);
      setFormError(err.message || "Erreur lors de la création.");
    } finally {
      setFormLoading(false);
    }
  }

  const savedEventObjects = events.filter((e) => savedEvents.includes(e.id));
  const initials = user?.nom
    ? user.nom.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (!user) {
    return (
      <section className="flex flex-col items-center justify-center rounded-[32px] border border-stroke bg-panel/80 p-16 text-center shadow-glow">
        <p className="text-xl font-bold text-white">Vous n'êtes pas connecté.</p>
        <button onClick={() => navigate("/auth")} className="mt-6 rounded-2xl bg-[#FF5722] px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-500">
          Se connecter
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-[32px] border border-stroke bg-panel/80 p-6 shadow-glow sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">

        {/* Sidebar */}
        <aside className="sticky top-20 h-fit rounded-[28px] border border-white/8 bg-slate-950/70 p-5">

          {/* Logo retour accueil */}
          <Link to="/" className="mb-5 flex items-center gap-2 hover:opacity-80 transition">
            <Logo showText={true} />
          </Link>

          <div className="mb-5 flex items-center gap-3 border-t border-white/8 pt-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5722] to-orange-700 text-sm font-extrabold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-white text-sm">{user.nom}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">Dashboard</p>
          <div className="mt-4 space-y-2">
            {tabs.map((item) => (
              <button key={item} type="button" onClick={() => setActiveTab(item)}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === item ? "bg-[#FF5722] text-white" : "bg-panel-soft text-slate-300 hover:text-white"}`}>
                {item}
              </button>
            ))}
            <button type="button" onClick={() => { logout(); navigate("/"); }}
              className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10">
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Contenu principal */}
        <div className="space-y-6">

          {/* ── Vue globale ── */}
          {activeTab === "Vue globale" && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "Réservations", value: bookings.length },
                  { label: "Favoris", value: savedEvents.length },
                  { label: "Rôle", value: user.role === "ROLE_CLIENT" ? "Client" : user.role },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-[24px] border border-white/8 bg-slate-950/60 p-5">
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-3 text-3xl font-extrabold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-6">
                <h2 className="text-2xl font-extrabold text-white">Bienvenue, {user.nom} !</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Retrouvez ici vos réservations, favoris, annonces et créez vos propres événements.
                </p>
              </div>
            </>
          )}

          {/* ── Mes réservations ── */}
          {activeTab === "Mes reservations" && (
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-6">
                <h2 className="text-2xl font-extrabold text-white">Mes réservations</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {bookingsLoading ? "Chargement..." : `${bookings.length} réservation${bookings.length !== 1 ? "s" : ""}`}
                </p>
              </div>

              {!bookingsLoading && bookings.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-slate-950/50 p-10 text-center">
                  <p className="text-slate-400">Aucune réservation pour le moment.</p>
                  <button onClick={() => navigate("/")} className="mt-4 rounded-2xl bg-[#FF5722] px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500">
                    Explorer les événements
                  </button>
                </div>
              )}

              {bookings.map((b) => {
                const eventTitle = eventMap[b.eventId];
                return (
                  <div key={b.id} className="rounded-[24px] border border-white/8 bg-slate-950/60 p-5 transition hover:border-orange-400/30">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {eventTitle || `Événement #${b.eventId}`}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                          <span>📅 {new Date(b.dateReservation).toLocaleDateString("fr-FR")}</span>
                          <span>🎫 {b.nombrePlaces} place{b.nombrePlaces > 1 ? "s" : ""}</span>
                        </div>
                        <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUT_STYLE[b.statut] ?? "bg-slate-700 text-slate-300"}`}>
                          {b.statut}
                        </span>
                      </div>
                      <button onClick={() => downloadTicket(b, eventTitle)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#FF5722] px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500">
                        <PDFIcon /> Télécharger
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Mes favoris ── */}
          {activeTab === "Mes favoris" && (
            <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-6">
              <h2 className="text-2xl font-extrabold text-white">Mes favoris</h2>
              {savedEventObjects.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">Aucun favori enregistré.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {savedEventObjects.map((ev) => (
                    <button key={ev.id} onClick={() => navigate(`/event/${ev.id}`)}
                      className="flex w-full items-center gap-4 rounded-2xl border border-white/8 bg-slate-900/50 p-4 text-left transition hover:border-orange-400/30">
                      <img src={ev.image} alt={ev.title} className="h-14 w-14 shrink-0 rounded-xl object-cover"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=200"; }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">{ev.title}</p>
                        <p className="truncate text-xs text-slate-400">{ev.location} • {ev.date}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-orange-300">{ev.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Mes annonces ── */}
          {activeTab === "Mes annonces" && (
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-6">
                <h2 className="text-2xl font-extrabold text-white">Mes annonces</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {myEventsLoading
                    ? "Chargement..."
                    : `${myEvents.length} événement${myEvents.length !== 1 ? "s" : ""} publié${myEvents.length !== 1 ? "s" : ""}`}
                </p>
              </div>

              {!myEventsLoading && myEvents.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-slate-950/50 p-10 text-center">
                  <p className="text-slate-400">Vous n'avez pas encore publié d'événement.</p>
                  <button onClick={() => setActiveTab("➕ Ajouter un événement")}
                    className="mt-4 rounded-2xl bg-[#FF5722] px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500">
                    Créer mon premier événement
                  </button>
                </div>
              )}

              {myEvents.map((ev) => {
                const stats = myEventsStats[ev.id] || { totalVendus: 0, bookings: [] };
                const placesRestantes = (ev.placesDisponibles || 0) ;
                const tauxRemplissage = ev.placesDisponibles
                  ? Math.round((stats.totalVendus / ev.placesDisponibles) * 100)
                  : 0;

                return (
                  <div key={ev.id} className="rounded-[24px] border border-white/8 bg-slate-950/60 p-6 transition hover:border-orange-400/30">
                    {/* En-tête événement */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      {ev.imageUrl && (
                        <img src={ev.imageUrl} alt={ev.titre}
                          className="h-20 w-32 shrink-0 rounded-2xl object-cover"
                          onError={(e) => { e.target.style.display = "none"; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">{ev.titre}</h3>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                          {ev.lieu && <span>📍 {ev.lieu}</span>}
                          {ev.date && <span>📅 {new Date(ev.date).toLocaleDateString("fr-FR")}</span>}
                          {ev.categorie && (
                            <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-300">
                              {ev.categorie}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Statistiques globales */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-4 text-center">
                        <p className="text-xs text-slate-400 mb-1">Tickets vendus</p>
                        <p className="text-2xl font-extrabold text-white">{stats.totalVendus}</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-4 text-center">
                        <p className="text-xs text-slate-400 mb-1">Places restantes</p>
                        <p className={`text-2xl font-extrabold ${placesRestantes <= 5 ? "text-red-400" : "text-white"}`}>
                          {placesRestantes < 0 ? 0 : placesRestantes}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-4 text-center">
                        <p className="text-xs text-slate-400 mb-1">Taux de remplissage</p>
                        <p className="text-2xl font-extrabold text-orange-300">{tauxRemplissage}%</p>
                      </div>
                    </div>

                    {/* Barre de remplissage */}
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>0</span>
                        <span>{ev.placesDisponibles} places total</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF5722] to-orange-400 transition-all"
                          style={{ width: `${Math.min(tauxRemplissage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Catégories de billets (si présentes) */}
                    {Array.isArray(ev.categories) && ev.categories.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-3 text-sm font-semibold text-slate-300">Catégories de billets</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {ev.categories.map((cat, i) => {
                            const vendusCat = stats.bookings
                              .filter((b) => b.categorieId === cat.id || b.categorie === cat.nom)
                              .reduce((s, b) => s + (b.nombrePlaces || 0), 0);
                            const restesCat = (cat.placesDisponibles || 0) - vendusCat;
                            return (
                              <div key={i} className="rounded-2xl border border-white/8 bg-slate-900/40 p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-white text-sm">{cat.nom}</span>
                                  <span className="text-sm font-bold text-orange-300">{cat.prix} DH</span>
                                </div>
                                {cat.description && (
                                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">{cat.description}</p>
                                )}
                                <div className="flex justify-between text-xs text-slate-400">
                                  <span>🎫 {vendusCat} vendus</span>
                                  <span className={restesCat <= 3 ? "text-red-400 font-semibold" : ""}>
                                    {restesCat < 0 ? 0 : restesCat} restants
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Ajouter un événement ── */}
          {activeTab === "➕ Ajouter un événement" && (
            <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-6">
              <h2 className="text-2xl font-extrabold text-white">Créer un événement</h2>

              <form onSubmit={handleSubmitEvent} className="mt-6 space-y-6">

                {/* Titre */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">Titre *</label>
                  <input type="text" name="titre" value={formData.titre} onChange={handleFormChange} required
                    placeholder="Concert Premium..." className={inputCls} />
                </div>

                {/* Type d'événement */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">Type d'événement *</label>
                  <select name="type" value={formData.type} onChange={handleFormChange}
                    className={inputCls}>
                    {["Concert", "Cinema", "Theatre", "Voyage", "Sport", "Conférence", "Festival", "Autre"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleFormChange} required rows="3"
                    placeholder="Décrivez l'événement..." className={inputCls} />
                </div>

                {/* Lieu + Date */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">Lieu *</label>
                    <input type="text" name="lieu" value={formData.lieu} onChange={handleFormChange} required
                      placeholder="Casablanca, Morocco Mall" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">Date *</label>
                    <input type="date" name="date" value={formData.date} onChange={handleFormChange} required
                      className={inputCls} />
                  </div>
                </div>

                {/* ── Catégories de billets ── */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <label className="text-sm font-semibold text-white">
                      Catégories de billets *
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        ({categories.length} catégorie{categories.length > 1 ? "s" : ""})
                      </span>
                    </label>
                    <button type="button" onClick={addCategory}
                      className="inline-flex items-center gap-2 rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/20">
                      <PlusIcon /> Ajouter une catégorie
                    </button>
                  </div>

                  <div className="space-y-4">
                    {categories.map((cat, idx) => (
                      <div key={idx} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-sm font-bold text-orange-300">
                            Catégorie {idx + 1}
                          </span>
                          {categories.length > 1 && (
                            <button type="button" onClick={() => removeCategory(idx)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-500/20 hover:text-red-400 text-lg leading-none">
                              ×
                            </button>
                          )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          {/* Nom */}
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Nom *</label>
                            <input type="text" value={cat.nom}
                              onChange={(e) => handleCategoryChange(idx, "nom", e.target.value)}
                              required placeholder="Ex : VIP, Standard, Early Bird..."
                              className={inputCls} />
                          </div>

                          {/* Prix */}
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Prix (DH) *</label>
                            <input type="number" value={cat.prix} min="0" step="0.5"
                              onChange={(e) => handleCategoryChange(idx, "prix", e.target.value)}
                              required placeholder="150"
                              className={inputCls} />
                          </div>

                          {/* Places */}
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Places disponibles *</label>
                            <input type="number" value={cat.placesDisponibles} min="1"
                              onChange={(e) => handleCategoryChange(idx, "placesDisponibles", e.target.value)}
                              required placeholder="100"
                              className={inputCls} />
                          </div>

                          {/* Description catégorie */}
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Description</label>
                            <input type="text" value={cat.description}
                              onChange={(e) => handleCategoryChange(idx, "description", e.target.value)}
                              placeholder="Accès lounge, repas inclus..."
                              className={inputCls} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload image */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">Image de l'événement</label>
                  {imagePreview ? (
                    <div className="relative overflow-hidden rounded-2xl border border-white/10">
                      <img src={imagePreview} alt="Aperçu" className="h-48 w-full object-cover" />
                      <button type="button" onClick={removeImage}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/90 text-slate-200 transition hover:bg-red-500 hover:text-white text-lg leading-none">
                        ×
                      </button>
                      <div className="absolute bottom-3 left-3 rounded-xl bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
                        {imageFile?.name}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/20 bg-slate-900/50 p-10 text-center transition hover:border-orange-400/50 hover:bg-slate-900/80"
                    >
                      <span className="text-slate-400"><UploadIcon /></span>
                      <div>
                        <p className="text-sm font-semibold text-slate-300">Cliquez ou glissez une image</p>
                        <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP — max 10 MB</p>
                      </div>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>

                {formError && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{formError}</div>
                )}
                {formSuccess && (
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">{formSuccess}</div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={formLoading}
                    className="flex-1 rounded-2xl bg-[#FF5722] px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-500 disabled:opacity-60">
                    {uploading ? "Upload image..." : formLoading ? "Publication..." : "Publier l'événement"}
                  </button>
                  <button type="button" onClick={resetForm}
                    className="rounded-2xl border border-white/8 bg-slate-900 px-6 py-3 text-sm font-bold text-slate-300 transition hover:text-white">
                    Réinitialiser
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Paramètres ── */}
          {activeTab === "⚙️ Paramètres" && (
            <div className="max-w-2xl space-y-6">
              <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-6">
                <h2 className="text-2xl font-extrabold text-white">Paramètres du compte</h2>
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-900/50 p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5722] to-orange-700 text-xl font-extrabold text-white">
                    {initials}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{user.nom}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-400">Rôle</p>
                    <p className="mt-1 font-semibold text-white">{user.role === "ROLE_CLIENT" ? "Client" : user.role}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-400">Réservations</p>
                    <p className="mt-1 font-semibold text-white">{bookings.length}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => { logout(); navigate("/"); }}
                className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20">
                Se déconnecter
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
