// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';
import { TOKEN_KEY } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // On mount, load token from local storage (if user was previously logged in)
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
      // TODO: Optionally fetch user profile with savedToken
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await apiLogin(email, password);  // call backend API
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.token);
  };

  const register = async (userInfo) => {
    await apiRegister(userInfo);
    // On successful registration, you could auto-login or redirect to login.
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    // TODO: Also disconnect from WebSocket if connected
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// hooks/useAuth.js for convenience
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
export const useAuth = () => useContext(AuthContext);
