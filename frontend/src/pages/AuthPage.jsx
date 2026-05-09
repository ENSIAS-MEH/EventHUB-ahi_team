import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

export function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ nom: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        navigate('/');
      } else {
        if (!form.nom.trim()) { setError('Le nom est requis.'); setLoading(false); return; }
        await register(form.nom, form.email, form.password);
        setSuccess('Compte créé ! Vous pouvez vous connecter.');
        setMode('login');
        setForm((f) => ({ ...f, nom: '' }));
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo showText={true} />
          <p className="text-sm text-slate-400">Votre billetterie moderne</p>
        </div>

        <div className="rounded-[32px] border border-stroke bg-panel/80 p-8 shadow-glow backdrop-blur">
          {/* Tabs */}
          <div className="mb-8 flex rounded-2xl border border-white/8 bg-slate-950/60 p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                mode === 'login' ? 'bg-[#FF5722] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                mode === 'register' ? 'bg-[#FF5722] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">Nom complet</label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  placeholder="Alice Dupont"
                  className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="alice@example.com"
                className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">Mot de passe</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/8 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#FF5722] px-6 py-4 text-sm font-bold text-white transition hover:bg-orange-500 disabled:opacity-60"
            >
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
