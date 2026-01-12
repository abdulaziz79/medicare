import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, getCurrentUser, onAuthStateChange, logout as authLogout } from "../services/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isDoctor: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { login: authLogin } = await import("../services/auth");
    const result = await authLogin({ email, password });
    setUser(result.user);
  };

  const handleLogout = async () => {
    await authLogout();
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === "ADMIN";
  };

  const isDoctor = () => {
    return user?.role === "DOCTOR";
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout: handleLogout,
    isAdmin,
    isDoctor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

