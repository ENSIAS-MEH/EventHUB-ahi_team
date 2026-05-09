import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingsApi, eventsApi } from "../api/api";

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

const EMPTY_FORM = {
  titre: "", categorie: "Concert", description: "",
  lieu: "", date: "", prix: "", placesDisponibles: "",
};

export function DashboardPage({ events, savedEvents, onEventCreated }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Vue globale");

  // Réservations
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Création d'événement
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

  const tabs = ["Vue globale", "Mes reservations", "Mes favoris", "➕ Ajouter un événement", "⚙️ Paramètres"];

  // Charge les réservations + noms d'événements
  const [eventMap, setEventMap] = useState({});
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

  async function handleSubmitEvent(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setFormLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        setUploading(true);
        const result = await eventsApi.uploadImage(imageFile);
        imageUrl = result.url || "";
        setUploading(false);
      }
      await eventsApi.create({
        titre: formData.titre,
        categorie: formData.categorie,
        description: formData.description,
        lieu: formData.lieu,
        date: formData.date,
        prix: parseFloat(formData.prix) || 0,
        placesDisponibles: parseInt(formData.placesDisponibles, 10) || 0,
        imageUrl,
      });
      setFormSuccess("Événement publié avec succès !");
      setFormData(EMPTY_FORM);
      removeImage();
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
          <div className="mb-5 flex items-center gap-3">
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
                  Retrouvez ici vos réservations, favoris et créez vos propres événements.
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
                      <img src={ev.image} alt={ev.title} className="h-14 w-14 shrink-0 rounded-xl object-cover" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=200"; }} />
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

          {/* ── Ajouter un événement ── */}
          {activeTab === "➕ Ajouter un événement" && (
            <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-6">
              <h2 className="text-2xl font-extrabold text-white">Créer un événement</h2>

              <form onSubmit={handleSubmitEvent} className="mt-6 space-y-5">

                {/* Titre */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">Titre *</label>
                  <input type="text" name="titre" value={formData.titre} onChange={handleFormChange} required placeholder="Concert Premium..." className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">Catégorie *</label>
                  <select name="categorie" value={formData.categorie} onChange={handleFormChange} className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400">
                    {["Concert", "Cinema", "Theatre", "Voyage"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleFormChange} required rows="3" placeholder="Décrivez l'événement..." className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                </div>

                {/* Lieu + Date */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">Lieu *</label>
                    <input type="text" name="lieu" value={formData.lieu} onChange={handleFormChange} required placeholder="Casablanca, Morocco Mall" className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">Date *</label>
                    <input type="date" name="date" value={formData.date} onChange={handleFormChange} required className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                  </div>
                </div>

                {/* Prix + Places */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">Prix (DH) *</label>
                    <input type="number" name="prix" value={formData.prix} onChange={handleFormChange} required min="0" step="0.5" placeholder="150" className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">Places disponibles *</label>
                    <input type="number" name="placesDisponibles" value={formData.placesDisponibles} onChange={handleFormChange} required min="1" placeholder="100" className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400" />
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
                  <button type="button" onClick={() => { setFormData(EMPTY_FORM); removeImage(); setFormError(""); setFormSuccess(""); }}
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
