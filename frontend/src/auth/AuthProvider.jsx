import { createContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, logoutUser } from "../api/auth";

export const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    const token = localStorage.getItem("access");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch (error) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials) {
    const response = await loginUser(credentials);

    localStorage.setItem("access", response.access);
    localStorage.setItem("refresh", response.refresh);

    setUser(response.user);

    return response;
  }

  async function logout() {
    try {
      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        await logoutUser(refresh);
      }
    } catch (error) {
      console.log(error);
    }

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;