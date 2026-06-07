import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';

export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('pending_order_meta');
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    logout
  }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};