import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { User, Session } from "@supabase/supabase-js";

// 1️⃣ Define the context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// 2️⃣ Define props type for provider
interface AuthProviderProps {
  children: ReactNode;
}

// 3️⃣ Create context with proper type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1️⃣ Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // 2️⃣ Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    // Cleanup subscription
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4️⃣ Custom hook with type checking
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}



// ============================================
// AUTH CONTEXT - COMMENTED OUT FOR REBUILD
// ============================================
// This file has been commented out to start fresh.
// Uncomment and rebuild as needed.

/*
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, getCurrentUser, logout, onAuthStateChange } from "../services/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isDoctor: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  // console.log("useAuthrrrrrrrr");
  const context = useContext(AuthContext);
  console.log("contextttt", context);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // console.log("AuthProviderrrrrr");
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

  // const login = async (email: string, password: string) => {
  //   const { login: authLogin } = await import("../services/auth");
  //   const result = await authLogin({ email, password });
  //   setUser(result.user);
  // };

  const handleLogout = async () => {
    await logout();
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
    // login,
    logout: handleLogout,
    isAdmin,
    isDoctor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
*/
