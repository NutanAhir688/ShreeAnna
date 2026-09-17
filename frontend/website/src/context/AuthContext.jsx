import { createContext, useContext, useState, useEffect } from "react";
import { auth, setInMemoryToken } from "@/services/api";

const AuthContext = createContext(null);

export const API_BASE_URL = "http://localhost:5066";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Silent refresh on mount / page reload to restore in-memory token
  useEffect(() => {
    let isMounted = true;
    async function restoreSession() {
      try {
        const data = await auth.refresh();
        if (isMounted && data?.accessToken) {
          setToken(data.accessToken);
          setUser({
            userId: data.userId,
            email: data.email,
            role: data.role,
            memberName: data.memberName || data.email?.split("@")[0],
          });
        }
      } catch (err) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setInMemoryToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await auth.login(email, password);
      const userData = {
        userId: data.userId,
        email: data.email,
        role: data.role,
        memberName: data.memberName || data.email?.split("@")[0],
      };

      setUser(userData);
      setToken(data.accessToken);
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const switchRole = (newRole, name) => {
    const updated = {
      ...(user || {
        userId: "99999999-9999-9999-9999-999999999999",
        email: "fpo@shreeanna.com",
      }),
      role: newRole,
      memberName: name || `${newRole} Demo User`,
    };
    setUser(updated);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await auth.logout();
    } finally {
      setUser(null);
      setToken(null);
      setInMemoryToken(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        switchRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
