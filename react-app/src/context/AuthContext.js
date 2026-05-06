// ============================================
// EduSchedule Pro — Contexte Authentification
// ============================================
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const tokenSauvegarde = localStorage.getItem('edu_token');
    const userSauvegarde = localStorage.getItem('edu_user');
    if (tokenSauvegarde && userSauvegarde) {
      setToken(tokenSauvegarde);
      setUser(JSON.parse(userSauvegarde));
    }
    setLoading(false);
  }, []);

  // Connexion
  const login = (userData, tokenJWT) => {
    setUser(userData);
    setToken(tokenJWT);
    localStorage.setItem('edu_token', tokenJWT);
    localStorage.setItem('edu_user', JSON.stringify(userData));
  };

  // Déconnexion
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('edu_token');
    localStorage.removeItem('edu_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé
export function useAuth() {
  return useContext(AuthContext);
}