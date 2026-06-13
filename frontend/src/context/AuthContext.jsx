import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";
import { closeSocket } from "../services/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("auloop_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("auloop_user");
    return stored ? JSON.parse(stored) : null;
  });

  const persistSession = (payload) => {
    localStorage.setItem("auloop_token", payload.token);
    localStorage.setItem("auloop_user", JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };
  
  // Update setUser to also persist to localStorage
  const updateUser = (newUser) => {
    localStorage.setItem("auloop_user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async (form) => {
    const { data } = await api.post("/auth/login", form);
    persistSession(data);
  };

  const verify = async (form) => {
    const { data } = await api.post("/auth/verify", form);
    persistSession(data);
  };

  const logout = () => {
    localStorage.removeItem("auloop_token");
    localStorage.removeItem("auloop_user");
    setToken(null);
    setUser(null);
    closeSocket();
  };

  const value = useMemo(() => ({ user, token, login, verify, logout, setUser: updateUser }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
