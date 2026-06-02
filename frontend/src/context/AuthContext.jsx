import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('eventhub_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const stored = localStorage.getItem('eventhub_user');
    if (!stored) return;
    let parsed;
    try { parsed = JSON.parse(stored); } catch { localStorage.removeItem('eventhub_user'); setUser(null); return; }
    authApi.verifyUser(parsed.userId)
      .catch(() => { localStorage.removeItem('eventhub_user'); setUser(null); });
  }, []);

  async function login(email, password) {
    const data = await authApi.login(email, password);
    const u = {
      userId: data.userId,
      nom: data.nom,
      email: data.email,
      role: data.role,
      token: data.token,
    };
    setUser(u);
    localStorage.setItem('eventhub_user', JSON.stringify(u));
    return u;
  }

  async function register(nom, email, password, telephone, age) {
    await authApi.register(nom, email, password, telephone, age);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('eventhub_user');
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
