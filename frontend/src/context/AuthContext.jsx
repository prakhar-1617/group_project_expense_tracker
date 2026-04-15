import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  // User persistence logic (guest auto-cleanup removed to allow refresh)
  useEffect(() => {
    // We could add a background task to cleanup old guests later
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setLoading(true);
    try {
      const res = await API.post('/auth/guest-login');
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phoneNumber) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { name, email, password, phoneNumber });
      // If verification is required, we might not set token yet depending on backend
      // But we'll follow backend response
      if (res.data.token) localStorage.setItem('token', res.data.token);
      setUser(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  };



  const logout = async () => {
    if (user?.isGuest) {
      try {
        await API.delete('/auth/me');
      } catch (error) {
        console.error("Failed to delete guest account during logout", error);
      }
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = async (updatedData) => {
    try {
      const res = await API.put('/auth/profile', updatedData);
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Update profile failed", error);
      throw error;
    }
  };

  // Provide everything. loading acts as global auth loading state
  return (
    <AuthContext.Provider value={{ user, login, loginAsGuest, register, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
