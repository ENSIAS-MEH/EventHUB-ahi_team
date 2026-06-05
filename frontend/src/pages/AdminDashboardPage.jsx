import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../api/api";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80";

const TABS = ["Vue globale", "Utilisateurs", "Événements", "Paiements"];

const ROLE_OPTIONS = ["ROLE_CLIENT", "ROLE_ADMIN", "ROLE_ORGANIZER"];

const STATUT_STYLE = {
  CONFIRMEE: "bg-green-500/20 text-green-300",
  ANNULEE: "bg-red-500/20 text-red-400",
  EN_ATTENTE_PAIEMENT: "bg-yellow-500/20 text-yellow-300",
};

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-slate-950/60 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Vue globale");

  const [userStats, setUserStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);

  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventPosters, setEventPosters] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ROLE_ADMIN") { navigate("/"); return; }
    loadStats();
  }, [user]);

  useEffect(() => {
    if (activeTab === "Utilisateurs") loadUsers();
    if (activeTab === "Événements") loadEvents();
    if (activeTab === "Paiements") loadBookings();
  }, [activeTab]);

  async function loadStats() {
    try {
      const [us, es, bs] = await Promise.allSettled([
        adminApi.getUserStats(),
        adminApi.getEventStats(),
        adminApi.getBookingStats(),
      ]);
      if (us.status === "fulfilled") setUserStats(us.value);
      if (es.status === "fulfilled") setEventStats(es.value);
      if (bs.status === "fulfilled") setBookingStats(bs.value);
    } catch {}
  }

  async function loadUsers() {
    setLoading(true);
    try { setUsers(await adminApi.getUsers()); } catch {}
    setLoading(false);
  }

  async function loadEvents() {
    setLoading(true);
    try {
      const list = await adminApi.getAllEvents();
      setEvents(list);
      const posters = {};
      await Promise.allSettled(
        list.map(async (ev) => {
          if (ev.annonceurId && !posters[ev.annonceurId]) {
            try {
              const u = await adminApi.getUser(ev.annonceurId);
              posters[ev.annonceurId] = u;
            } catch {}
          }
        })
      );
      setEventPosters(posters);
    } catch {}
    setLoading(false);
  }

  async function loadBookings() {
    setLoading(true);
    try { setBookings(await adminApi.getAllBookings()); } catch {}
    setLoading(false);
  }

  function flash(m) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function handleChangeRole(id, role) {
    try { await adminApi.changeRole(id, role); flash("Rôle mis à jour"); loadUsers(); }
    catch (e) { flash("Erreur : " + e.message); }
  }

  async function handleToggle(id) {
    try { const r = await adminApi.toggleUser(id); flash(r); loadUsers(); }
    catch (e) { flash("Erreur : " + e.message); }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try { await adminApi.deleteUser(id); flash("Utilisateur supprimé"); loadUsers(); }
    catch (e) { flash("Erreur : " + e.message); }
  }

  async function handleValider(ev) {
    try {
      await adminApi.validerEvent(ev.id);
      if (ev.annonceurId) {
        try { await adminApi.changeRole(ev.annonceurId, "ROLE_ORGANIZER"); } catch {}
      }
      flash("Événement validé — annonceur promu ROLE_ORGANIZER");
      setSelectedEvent(null);
      loadEvents();
    } catch (e) { flash("Erreur : " + e.message); }
  }

  async function handleRefuser(ev) {
    try {
      await adminApi.refuserEvent(ev.id);
      flash("Événement refusé");
      setSelectedEvent(null);
      loadEvents();
    } catch (e) { flash("Erreur : " + e.message); }
  }

  async function handleDeleteEvent(id) {
    if (!window.confirm("Supprimer cet événement ?")) return;
    try {
      await adminApi.deleteEvent(id);
      flash("Événement supprimé");
      setSelectedEvent(null);
      loadEvents();
    } catch (e) { flash("Erreur : " + e.message); }
  }

  if (!user || user.role !== "ROLE_ADMIN") return null;

  return (
    <>
    <section className="rounded-[32px] border border-stroke bg-panel/80 p-6 shadow-glow sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">

        {/* Sidebar */}
        <aside className="sticky top-20 h-fit rounded-[28px] border border-white/8 bg-slate-950/70 p-5">
          <p className="mb-4 text-lg font-extrabold text-white">Admin Panel</p>
          <p className="mb-4 text-xs text-slate-400">{user.email}</p>
          <div className="space-y-2">
            {TABS.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === t ? "bg-[#FF5722] text-white" : "bg-panel-soft text-slate-300 hover:text-white"}`}>
                {t}
              </button>
            ))}
            <button onClick={() => { logout(); navigate("/"); }}
              className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10">
              Déconnexion
            </button>
          </div>
        </aside>

        <div className="space-y-6">
          {msg && (
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
              {msg}
            </div>
          )}

          {/* ── Vue globale ── */}
          {activeTab === "Vue globale" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-white">Tableau de bord</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Utilisateurs" value={userStats?.total ?? "—"} />
                <StatCard label="Événements" value={eventStats?.total ?? "—"} sub={`${eventStats?.enAttente ?? 0} en attente`} />
                <StatCard label="Réservations" value={bookingStats?.total ?? "—"} sub={`${bookingStats?.confirmees ?? 0} confirmées`} />
                <StatCard label="Chiffre d'affaires" value={bookingStats ? `${bookingStats.chiffreAffaires.toFixed(0)} DH` : "—"} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Événements validés" value={eventStats?.valides ?? "—"} />
                <StatCard label="Événements refusés" value={eventStats?.refuses ?? "—"} />
                <StatCard label="Réservations annulées" value={bookingStats?.annulees ?? "—"} />
              </div>
              {userStats?.byRole && (
                <div className="rounded-[24px] border border-white/8 bg-slate-950/60 p-5">
                  <p className="mb-3 text-sm font-semibold text-slate-300">Répartition des rôles</p>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(userStats.byRole).map(([role, count]) => (
                      <div key={role} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm">
                        <span className="text-slate-400">{role} : </span>
                        <span className="font-bold text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Utilisateurs ── */}
          {activeTab === "Utilisateurs" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-extrabold text-white">Gestion des utilisateurs</h2>
                <span className="text-sm text-slate-400">{users.length} utilisateur{users.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Barre de recherche */}
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-slate-400">
                  <path d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher par nom..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
                {userSearch && (
                  <button onClick={() => setUserSearch("")} className="text-slate-500 hover:text-white text-lg leading-none">×</button>
                )}
              </div>

              {loading ? <p className="text-slate-400">Chargement...</p> : (
                <div className="space-y-3">
                  {users
                    .filter(u => u.nom?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
                    .map((u) => (
                    <div key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="cursor-pointer rounded-[24px] border border-white/8 bg-slate-950/60 p-4 transition hover:border-orange-400/30">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5722] to-orange-700 text-sm font-bold text-white">
                            {u.nom?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{u.nom}</p>
                            <p className="text-sm text-slate-400">{u.email}</p>
                            <div className="mt-1 flex gap-2">
                              <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-300">{u.role}</span>
                              <span className={`rounded-full px-2 py-0.5 text-xs ${u.enabled ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-400"}`}>
                                {u.enabled ? "Actif" : "Désactivé"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 sm:text-right">Cliquer pour détails →</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Événements ── */}
          {activeTab === "Événements" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-white">Gestion des événements</h2>
                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                  {events.filter(e => e.statut === "EN_ATTENTE" || !e.statut).length} en attente • {events.filter(e => e.statut === "VALIDE").length} validés
                </span>
              </div>
              {loading ? <p className="text-slate-400">Chargement...</p> : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {events.filter(ev => ev.statut !== "REFUSE").map((ev) => {
                    const poster = eventPosters[ev.annonceurId];
                    return (
                      <div key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className="cursor-pointer rounded-[24px] border border-white/8 bg-slate-950/60 overflow-hidden transition hover:border-orange-400/40 hover:shadow-lg">
                        <div className="relative h-40 w-full">
                          <img
                            src={ev.imageUrl && ev.imageUrl.trim() !== "" ? ev.imageUrl : DEFAULT_IMAGE}
                            alt={ev.titre}
                            className="h-full w-full object-cover"
                            onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                          />
                          <span className={`absolute top-3 right-3 rounded-full px-2 py-0.5 text-xs font-bold ${
                            ev.statut === "VALIDE" ? "bg-green-500 text-white" :
                            ev.statut === "REFUSE" ? "bg-red-500 text-white" :
                            "bg-yellow-500 text-black"
                          }`}>{ev.statut ?? "EN_ATTENTE"}</span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-white truncate">{ev.titre}</h3>
                          <p className="text-xs text-slate-400 mt-1 truncate">📍 {ev.lieu} • 📅 {ev.date}</p>
                          <p className="text-xs text-orange-300 mt-1 font-semibold">{ev.prix} DH</p>
                          {poster && (
                            <div className="mt-3 flex items-center gap-2 border-t border-white/8 pt-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5722] to-orange-700 text-xs font-bold text-white">
                                {poster.nom?.[0]?.toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-300 truncate">{poster.nom}</p>
                                <p className="text-xs text-slate-500 truncate">{poster.email}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Paiements ── */}
          {activeTab === "Paiements" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-white">Gestion des paiements</h2>
              {bookingStats && (
                <div className="grid gap-4 md:grid-cols-4">
                  <StatCard label="Total" value={bookingStats.total} />
                  <StatCard label="Confirmées" value={bookingStats.confirmees} />
                  <StatCard label="Annulées" value={bookingStats.annulees} />
                  <StatCard label="CA total" value={`${bookingStats.chiffreAffaires.toFixed(0)} DH`} />
                </div>
              )}
              {loading ? <p className="text-slate-400">Chargement...</p> : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.id} className="rounded-[24px] border border-white/8 bg-slate-950/60 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-white">Réservation #{b.id}</p>
                          <p className="text-sm text-slate-400">
                            User #{b.userId} • Événement #{b.eventId} • {b.nombrePlaces} place{b.nombrePlaces > 1 ? "s" : ""}
                          </p>
                          {b.prixUnitaire && (
                            <p className="text-sm text-orange-300 font-semibold">
                              {(b.prixUnitaire * b.nombrePlaces).toFixed(2)} DH
                            </p>
                          )}
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUT_STYLE[b.statut] ?? "bg-slate-700 text-slate-300"}`}>
                          {b.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>

    {/* ── Modal détail utilisateur ── */}
    {selectedUser && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        onClick={() => setSelectedUser(null)}>
        <div className="w-full max-w-md rounded-[28px] border border-stroke bg-panel/95 p-6 shadow-glow"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5722] to-orange-700 text-2xl font-extrabold text-white">
              {selectedUser.nom?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">{selectedUser.nom}</h2>
              <p className="text-sm text-slate-400">{selectedUser.email}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {[
              { label: "ID", value: `#${selectedUser.id}` },
              { label: "Rôle", value: selectedUser.role },
              { label: "Téléphone", value: selectedUser.telephone || "—" },
              { label: "Âge", value: selectedUser.age ? `${selectedUser.age} ans` : "—" },
              { label: "Statut", value: selectedUser.enabled ? "Actif" : "Désactivé" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between rounded-2xl bg-slate-900/60 px-4 py-3">
                <span className="text-sm text-slate-400">{label}</span>
                <span className={`text-sm font-semibold ${label === "Statut" ? (selectedUser.enabled ? "text-green-300" : "text-red-400") : "text-white"}`}>{value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              defaultValue={selectedUser.role}
              onChange={(e) => { handleChangeRole(selectedUser.id, e.target.value); setSelectedUser(prev => ({...prev, role: e.target.value})); }}
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white">
              {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
            <button onClick={() => { handleToggle(selectedUser.id); setSelectedUser(null); }}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${selectedUser.enabled ? "border border-yellow-500/30 bg-yellow-500/10 text-yellow-300" : "border border-green-500/30 bg-green-500/10 text-green-300"}`}>
              {selectedUser.enabled ? "Désactiver" : "Activer"}
            </button>
            <button onClick={() => { handleDeleteUser(selectedUser.id); setSelectedUser(null); }}
              className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20">
              Supprimer
            </button>
            <button onClick={() => setSelectedUser(null)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:text-white mt-1">
              Fermer
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── Modal détail événement ── */}
    {selectedEvent && (() => {
      const ev = selectedEvent;
      const poster = eventPosters[ev.annonceurId];
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={() => setSelectedEvent(null)}>
          <div className="w-full max-w-lg rounded-[28px] border border-stroke bg-panel/95 p-6 shadow-glow"
            onClick={(e) => e.stopPropagation()}>

            <div className="relative mb-4 overflow-hidden rounded-2xl h-48">
              <img
                src={ev.imageUrl && ev.imageUrl.trim() !== "" ? ev.imageUrl : DEFAULT_IMAGE}
                alt={ev.titre}
                className="h-full w-full object-cover"
                onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
              />
              <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold ${
                ev.statut === "VALIDE" ? "bg-green-500 text-white" :
                ev.statut === "REFUSE" ? "bg-red-500 text-white" :
                "bg-yellow-500 text-black"
              }`}>{ev.statut ?? "EN_ATTENTE"}</span>
            </div>

            <h2 className="text-xl font-extrabold text-white">{ev.titre}</h2>
            <p className="mt-1 text-sm text-slate-400">{ev.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-300">
              <span>📍 {ev.lieu}</span>
              <span>📅 {ev.date}</span>
              <span>💰 {ev.prix} DH</span>
              <span>🎫 {ev.placesDisponibles} places</span>
              <span>🏷️ {ev.categorie}</span>
            </div>

            {poster && (
              <div className="mt-4 rounded-2xl border border-white/8 bg-slate-900/60 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-300">Publié par</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5722] to-orange-700 font-bold text-white">
                    {poster.nom?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{poster.nom}</p>
                    <p className="text-xs text-slate-400">{poster.email}</p>
                    <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-300">{poster.role}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              {ev.statut !== "VALIDE" && (
                <button onClick={() => handleValider(ev)}
                  className="flex-1 rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-500">
                  Valider
                </button>
              )}
              {ev.statut !== "REFUSE" && (
                <button onClick={() => handleRefuser(ev)}
                  className="flex-1 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-300 transition hover:bg-yellow-500/20">
                  Refuser
                </button>
              )}
              <button onClick={() => handleDeleteEvent(ev.id)}
                className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20">
                Supprimer
              </button>
              <button onClick={() => setSelectedEvent(null)}
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:text-white">
                Fermer
              </button>
            </div>
          </div>
        </div>
      );
    })()}
  </>
  );
}
