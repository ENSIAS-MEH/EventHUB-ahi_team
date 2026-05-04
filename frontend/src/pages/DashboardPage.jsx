import { useState } from "react";

const PDFIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
    <path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
    <path
      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 013 3L12 15H9v-3L18.5 2.5z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
    <path
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M10 7V4a1 1 0 011-1h2a1 1 0 011 1v3m-6 0h12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const mockReservations = [
  {
    id: 1,
    eventName: "Concert Premium - Artiste International",
    date: "15 mai 2026",
    quantity: 2,
    code: "GDT-2026-001",
  },
  {
    id: 2,
    eventName: "Festival de Cinéma - Projection Spéciale",
    date: "22 mai 2026",
    quantity: 1,
    code: "GDT-2026-002",
  },
  {
    id: 3,
    eventName: "Expérience Voyage - Week-end Découverte",
    date: "28 mai 2026",
    quantity: 3,
    code: "GDT-2026-003",
  },
];

function downloadTicketPDF(reservation) {
  const content = `TICKET GUICHET DARK
==========================================

Événement: ${reservation.eventName}
Date: ${reservation.date}
Nombre de places: ${reservation.quantity}
Code de réservation: ${reservation.code}

Ce billet doit être présenté à l'entrée.
Date d'émission: ${new Date().toLocaleDateString("fr-FR")}

==========================================`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ticket-${reservation.code}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const mockAnnouncements = [
  {
    id: 1,
    title: "Concert Jazz - Soirée élégante",
    category: "Musique",
    date: "10 juin 2026",
    status: "Publié",
    ticketsSold: 45,
    totalPlaces: 100,
    image: "🎵",
  },
  {
    id: 2,
    title: "Atelier Photographie - Techniques avancées",
    category: "Loisir",
    date: "15 juin 2026",
    status: "Brouillon",
    ticketsSold: 12,
    totalPlaces: 30,
    image: "📷",
  },
  {
    id: 3,
    title: "Conférence Tech - Intelligence Artificielle",
    category: "Conférence",
    date: "20 juin 2026",
    status: "Publié",
    ticketsSold: 87,
    totalPlaces: 150,
    image: "💻",
  },
];

const userProfile = {
  name: "Anas Mohamed",
  email: "anas.mohamed@guichetdark.ma",
  phone: "+212 6 12 34 56 78",
  avatar: "AM",
};

export function DashboardPage({ events, savedEvents }) {
  const [activeTab, setActiveTab] = useState("Vue globale");
  const [formData, setFormData] = useState({
    eventTitle: "",
    category: "Musique",
    description: "",
    location: "",
    date: "",
    ticketPrice: "",
    availablePlaces: "",
    image: null,
  });
  const [profileData, setProfileData] = useState(userProfile);
  const [editingProfile, setEditingProfile] = useState(false);

  const savedCount = savedEvents.length;

  const tabs = ["Vue globale", "Mes reservations", "Mes favoris", "➕ Ajouter un événement", "Mes annonces", "⚙️ Paramètres"];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitEvent = (e) => {
    e.preventDefault();
    alert("Événement créé avec succès!");
    setFormData({
      eventTitle: "",
      category: "Musique",
      description: "",
      location: "",
      date: "",
      ticketPrice: "",
      availablePlaces: "",
      image: null,
    });
  };

  const handleSaveProfile = () => {
    setEditingProfile(false);
    alert("Profil mis à jour!");
  };

  return (
    <section className="rounded-[32px] border border-stroke bg-panel/80 p-6 shadow-glow sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        {/* Sidebar */}
        <aside className="h-fit rounded-[28px] border border-white/8 bg-slate-950/70 p-5 sticky top-20">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
            Dashboard
          </p>
          <div className="mt-5 space-y-3">
            {tabs.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveTab(item)}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  activeTab === item
                    ? "bg-[#FF5722] text-white"
                    : "bg-panel-soft text-slate-300 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Vue globale */}
          {activeTab === "Vue globale" && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-white/8 bg-slate-950/60 p-5">
                  <p className="text-sm text-slate-400">Evenements suivis</p>
                  <p className="mt-3 text-3xl font-extrabold text-white">{savedCount}</p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-slate-950/60 p-5">
                  <p className="text-sm text-slate-400">Evenements disponibles</p>
                  <p className="mt-3 text-3xl font-extrabold text-white">{events.length}</p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-slate-950/60 p-5">
                  <p className="text-sm text-slate-400">Statut compte</p>
                  <p className="mt-3 text-3xl font-extrabold text-white">Premium</p>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-6">
                <h2 className="text-2xl font-extrabold text-white">Tableau de bord</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  Cet espace centralise vos informations, reservations et favoris avec une presentation coherente avec la navigation sombre existante.
                </p>
              </div>
            </>
          )}

          {/* Mes réservations */}
          {activeTab === "Mes reservations" && (
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-6">
                <h2 className="text-2xl font-extrabold text-white">Mes réservations</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Vous avez {mockReservations.length} réservation{mockReservations.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-3">
                {mockReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="rounded-[24px] border border-white/8 bg-slate-950/60 p-5 transition hover:border-orange-400/30"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{reservation.eventName}</h3>
                        <div className="mt-2 space-y-1 text-sm text-slate-400">
                          <p>📅 {reservation.date}</p>
                          <p>🎫 {reservation.quantity} place{reservation.quantity > 1 ? "s" : ""}</p>
                          <p className="text-xs text-orange-300">Code: {reservation.code}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadTicketPDF(reservation)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#FF5722] px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
                      >
                        <PDFIcon />
                        <span>Télécharger</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mes favoris */}
          {activeTab === "Mes favoris" && (
            <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-6">
              <h2 className="text-2xl font-extrabold text-white">Mes favoris</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                {savedCount > 0
                  ? `Vous avez ${savedCount} événement${savedCount > 1 ? "s" : ""} dans vos favoris.`
                  : "Vous n'avez pas encore d'événement dans vos favoris. Commencez à explorer !"}
              </p>
            </div>
          )}

          {/* Ajouter un événement */}
          {activeTab === "➕ Ajouter un événement" && (
            <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-6">
              <h2 className="text-2xl font-extrabold text-white">Créer un nouvel événement</h2>
              
              <form onSubmit={handleSubmitEvent} className="mt-6 space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Titre de l'événement</label>
                  <input
                    type="text"
                    name="eventTitle"
                    value={formData.eventTitle}
                    onChange={handleFormChange}
                    required
                    placeholder="Ex: Concert Premium - Artiste International"
                    className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Catégorie</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    <option>Musique</option>
                    <option>Cinéma</option>
                    <option>Sport</option>
                    <option>Voyage</option>
                    <option>Loisir</option>
                    <option>Conférence</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                    placeholder="Décrivez votre événement en détail..."
                    rows="4"
                    className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>

                {/* Grille: Lieu, Date */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Lieu</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      required
                      placeholder="Ex: Casablanca, Maroc"
                      className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                </div>

                {/* Grille: Prix, Places disponibles */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Prix du billet (DH)</label>
                    <input
                      type="number"
                      name="ticketPrice"
                      value={formData.ticketPrice}
                      onChange={handleFormChange}
                      required
                      placeholder="Ex: 150"
                      min="0"
                      className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Places disponibles</label>
                    <input
                      type="number"
                      name="availablePlaces"
                      value={formData.availablePlaces}
                      onChange={handleFormChange}
                      required
                      placeholder="Ex: 100"
                      min="1"
                      className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                </div>

                {/* Upload image */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Image de l'événement</label>
                  <div className="rounded-2xl border-2 border-dashed border-white/20 bg-slate-900/50 p-8 text-center hover:border-orange-400/50 transition">
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] })}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label htmlFor="imageUpload" className="cursor-pointer">
                      <p className="text-sm text-slate-400">📤 Cliquez pour télécharger une image</p>
                      <p className="mt-1 text-xs text-slate-500">PNG, JPG (max. 5MB)</p>
                    </label>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-[#FF5722] px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
                  >
                    ✅ Publier l'événement
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      eventTitle: "",
                      category: "Musique",
                      description: "",
                      location: "",
                      date: "",
                      ticketPrice: "",
                      availablePlaces: "",
                      image: null,
                    })}
                    className="rounded-2xl border border-white/8 bg-slate-900 px-6 py-3 text-sm font-bold text-slate-300 transition hover:text-white"
                  >
                    Réinitialiser
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mes annonces */}
          {activeTab === "Mes annonces" && (
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-6">
                <h2 className="text-2xl font-extrabold text-white">Mes annonces</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Vous avez {mockAnnouncements.length} événement{mockAnnouncements.length > 1 ? "s" : ""} créé{mockAnnouncements.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-[24px] border border-white/8 bg-slate-950/60 overflow-hidden transition hover:border-orange-400/30"
                  >
                    {/* Image */}
                    <div className="flex items-center justify-center h-32 bg-gradient-to-br from-slate-900 to-slate-800 text-4xl">
                      {announcement.image}
                    </div>

                    {/* Contenu */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-white line-clamp-2">{announcement.title}</h3>
                        <p className="text-xs text-orange-300 mt-1">{announcement.category}</p>
                      </div>

                      {/* Stats */}
                      <div className="space-y-1 text-sm text-slate-400">
                        <p>📅 {announcement.date}</p>
                        <p>🎫 {announcement.ticketsSold}/{announcement.totalPlaces} billets vendus</p>
                        <div className="mt-2 w-full bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-[#FF5722] h-2 rounded-full transition"
                            style={{ width: `${(announcement.ticketsSold / announcement.totalPlaces) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Statut */}
                      <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                        announcement.status === "Publié"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}>
                        {announcement.status}
                      </div>

                      {/* Boutons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:text-white hover:border-orange-400/30"
                        >
                          <EditIcon />
                          Modifier
                        </button>
                        <button
                          type="button"
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:text-red-300 hover:border-red-400/30"
                        >
                          <DeleteIcon />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paramètres */}
          {activeTab === "⚙️ Paramètres" && (
            <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-6 max-w-2xl">
              <h2 className="text-2xl font-extrabold text-white">Mes paramètres</h2>

              <div className="mt-6 space-y-6">
                {/* Section Profil */}
                <div className="rounded-2xl border border-white/8 bg-slate-900/50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Informations de profil</h3>
                    <button
                      type="button"
                      onClick={() => setEditingProfile(!editingProfile)}
                      className="text-xs font-semibold text-orange-300 hover:text-orange-200 transition"
                    >
                      {editingProfile ? "Annuler" : "Modifier"}
                    </button>
                  </div>

                  {editingProfile ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4">
                      {/* Avatar */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Photo de profil</label>
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5722] to-orange-700 text-xl font-extrabold text-white">
                            {profileData.avatar}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="avatarUpload"
                          />
                          <label
                            htmlFor="avatarUpload"
                            className="rounded-xl border border-white/8 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 cursor-pointer hover:text-white transition"
                          >
                            Changer
                          </label>
                        </div>
                      </div>

                      {/* Nom */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Nom complet</label>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                      </div>

                      {/* Téléphone */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Téléphone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                      </div>

                      {/* Bouton Enregistrer */}
                      <button
                        type="submit"
                        className="w-full rounded-2xl bg-[#FF5722] px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
                      >
                        ✅ Enregistrer les modifications
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5722] to-orange-700 text-xl font-extrabold text-white">
                          {profileData.avatar}
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Nom</p>
                          <p className="text-white font-semibold">{profileData.name}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Email</p>
                        <p className="text-white">{profileData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Téléphone</p>
                        <p className="text-white">{profileData.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section Sécurité */}
                <div className="rounded-2xl border border-white/8 bg-slate-900/50 p-5">
                  <h3 className="text-lg font-semibold text-white mb-4">Sécurité</h3>
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-white/8 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-300 transition hover:text-white hover:border-orange-400/30"
                  >
                    🔐 Changer le mot de passe
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
