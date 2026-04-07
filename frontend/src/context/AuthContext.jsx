import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/user/');
      if (res.data && res.data.id) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const loginUser = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    setUser(res.data);
    return res.data;
  };

  const logoutUser = async () => {
    await api.post('/auth/logout/');
    setUser(null);
  };

  const registerUser = async (formData) => {
    const res = await api.post('/auth/register/', formData);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user, loading, loginUser, logoutUser, registerUser, fetchUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
