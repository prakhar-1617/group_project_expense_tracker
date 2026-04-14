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

  useEffect(() => {
    if (user?.isGuest) {
      const handleUnload = () => {
        const token = localStorage.getItem('token');
        if (token) {
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          fetch(`${baseURL}/auth/me`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            keepalive: true
          }).catch(console.error); // Ignore errors during unload
        }
      };
      window.addEventListener('beforeunload', handleUnload);
      return () => window.removeEventListener('beforeunload', handleUnload);
    }
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

  const sendOTP = async (email, type) => {
    try {
      const res = await API.post('/auth/send-otp', { email, type });
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const verifyOTP = async (email, code, type) => {
    try {
      const res = await API.post('/auth/verify-otp', { email, code, type });
      if (res.data.user) {
        setUser(res.data.user);
      }
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
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
    <AuthContext.Provider value={{ user, login, loginAsGuest, register, logout, loading, updateUser, sendOTP, verifyOTP }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
