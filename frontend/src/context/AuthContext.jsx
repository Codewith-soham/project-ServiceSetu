import { useCallback, useMemo, useState } from "react";
import { loginUser } from "../services/auth.api";
import { tokenStorage } from "../services/api";
import { AuthContext } from "./auth-context";

const USER_KEY = "servicesetu_user";

const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const setStoredUser = (user) => {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());

  const logout = useCallback(() => {
    tokenStorage.clear();
    setStoredUser(null);
    setUser(null);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials);
    if (data?.accessToken) {
      tokenStorage.set(data.accessToken);
    }
    setStoredUser(data?.user || null);
    setUser(data?.user || null);
    return data?.user;
  }, []);

  const value = useMemo(
    () => ({ user, loading: false, login, logout, isAuthenticated: !!user }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
