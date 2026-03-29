import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// DEMO MODE: Uses localStorage only — no backend needed
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500)); // simulate network
    const userData = { name: 'Demo User', email, token: 'demo-token' };
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setLoading(false);
    return userData;
  };

  const register = async (name, email, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const userData = { name, email, token: 'demo-token' };
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setLoading(false);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
