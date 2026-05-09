import { createContext, useContext, useState } from 'react';
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

  async function login(email, password) {
    const data = await authApi.login(email, password);
    const u = {
      userId: data.userId,
      nom: data.nom,
      email: data.email,
      role: data.role,
    };
    setUser(u);
    localStorage.setItem('eventhub_user', JSON.stringify(u));
    return u;
  }

  async function register(nom, email, password) {
    await authApi.register(nom, email, password);
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
