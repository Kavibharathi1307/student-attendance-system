import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import {
  clearStoredUser,
  clearToken,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken
} from '../utils/authStorage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [isInitializing, setIsInitializing] = useState(Boolean(getToken()));

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      const token = getToken();

      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const response = await api.get('/auth/profile');

        if (isMounted) {
          setUser(response.data.user);
          setStoredUser(response.data.user);
        }
      } catch {
        logout();
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(credentials) {
    const response = await api.post('/auth/login', credentials);

    setToken(response.data.token);
    setStoredUser(response.data.user);
    setUser(response.data.user);

    return response.data.user;
  }

  function logout() {
    clearToken();
    clearStoredUser();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && getToken()),
      isInitializing,
      login,
      logout
    }),
    [user, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
