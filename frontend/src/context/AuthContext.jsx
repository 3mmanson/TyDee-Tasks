import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const response = await api.auth.me();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          if (error.status === 401) {
            logout();
          } else {
            console.error('Session restoration failed:', error);
          }
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
