import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext=createContext(null);

export const AuthProvider=({ children }) => {
  const [user, setUser]=useState(null);
  const [loading, setLoading]=useState(true);

  const refresh=async () => {
    try {
      const { data }=await api.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login=async (payload) => {
    const { data }=await api.post("/auth/login", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const register=async (payload) => {
    const { data }=await api.post("/auth/register", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const logout=() => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth=() => useContext(AuthContext);
