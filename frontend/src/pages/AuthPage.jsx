import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

export function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    nom: '', username: '', password: '',
    telephone: '', age: '', termsAccepted: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setError('');
    setSuccess('');
  }

  function getFullEmail() {
    return `${form.username.trim().toLowerCase()}@eventhub.com`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.username.trim()) { setError("L'identifiant est requis."); return; }
    if (!/^[a-zA-Z0-9._-]+$/.test(form.username.trim())) {
      setError("L'identifiant ne doit contenir que des lettres, chiffres, points, tirets ou underscores.");
      return;
    }

    setLoading(true);
    try {
      const email = getFullEmail();
      if (mode === 'login') {
        await login(email, form.password);
        navigate('/');
      } else {
        if (!form.nom.trim()) { setError('Le nom complet est requis.'); setLoading(false); return; }
        if (!form.telephone.trim()) { setError('Le numéro de téléphone est requis.'); setLoading(false); return; }
        if (!form.age || parseInt(form.age) < 13 || parseInt(form.age) > 120) {
          setError('Veuillez entrer un âge valide (13 ans minimum).'); setLoading(false); return;
        }
        if (!form.termsAccepted) {
          setError("Vous devez accepter les conditions d'utilisation."); setLoading(false); return;
        }
        await register(form.nom, email, form.password, form.telephone, parseInt(form.age));
        setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setMode('login');
        setForm((f) => ({ ...f, nom: '', telephone: '', age: '', termsAccepted: false }));
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link to="/" className="hover:opacity-80 transition">
            <Logo showText={true} />
          </Link>
          <p className="text-sm text-slate-400">Votre billetterie moderne</p>
        </div>

        <div className="rounded-[32px] border border-stroke bg-panel/80 p-8 shadow-glow backdrop-blur">
          {/* Tabs */}
          <div className="mb-8 flex rounded-2xl border border-white/8 bg-slate-950/60 p-1">
            <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${mode === 'login' ? 'bg-[#FF5722] text-white' : 'text-slate-400 hover:text-white'}`}>
              Connexion
            </button>
            <button type="button" onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${mode === 'register' ? 'bg-[#FF5722] text-white' : 'text-slate-400 hover:text-white'}`}>
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Nom complet — inscription uniquement */}
            {mode === 'register' && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">Nom complet</label>
                <input type="text" name="nom" value={form.nom} onChange={handleChange} required
                  placeholder="Alice Dupont" className={inputCls} />
              </div>
            )}

            {/* Identifiant @eventhub.com */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                {mode === 'login' ? 'Identifiant' : "Nom d'utilisateur"}
              </label>
              <div className="flex overflow-hidden rounded-2xl border border-white/8 bg-slate-900 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400">
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  placeholder="alice.dupont"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none"
                />
                <span className="flex shrink-0 items-center border-l border-white/8 bg-slate-800/60 px-3 text-sm text-slate-400 select-none">
                  @eventhub.com
                </span>
              </div>
              {form.username && (
                <p className="mt-1 text-xs text-slate-500">
                  Email : <span className="text-orange-300">{form.username.trim().toLowerCase()}@eventhub.com</span>
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white">Mot de passe</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="••••••••" className={inputCls} />
            </div>

            {/* Champs inscription uniquement */}
            {mode === 'register' && (
              <>
                {/* Téléphone + Âge côte à côte */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">Téléphone</label>
                    <input type="tel" name="telephone" value={form.telephone} onChange={handleChange} required
                      placeholder="+212 6 00 00 00 00" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">Âge</label>
                    <input type="number" name="age" value={form.age} onChange={handleChange} required
                      min="13" max="120" placeholder="25" className={inputCls} />
                  </div>
                </div>

                {/* Conditions d'utilisation */}
                <div className="space-y-3 rounded-2xl border border-white/8 bg-slate-900/50 p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input type="checkbox" name="termsAccepted" checked={form.termsAccepted}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#FF5722]" />
                    <span className="text-sm text-slate-300">
                      J'accepte les{' '}
                      <span className="font-semibold text-orange-400 underline underline-offset-2 cursor-pointer">
                        conditions d'utilisation
                      </span>{' '}
                      et la{' '}
                      <span className="font-semibold text-orange-400 underline underline-offset-2 cursor-pointer">
                        politique de confidentialité
                      </span>{' '}
                      de EventHUB. *
                    </span>
                  </label>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                {success}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full rounded-2xl bg-[#FF5722] px-6 py-4 text-sm font-bold text-white transition hover:bg-orange-500 disabled:opacity-60">
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
