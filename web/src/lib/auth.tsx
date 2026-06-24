import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getMe, logout as apiLogout, type User, type Role } from "@/lib/api";
import { getAccessToken } from "@/lib/api/tokens";

/**
 * App-wide auth state. Loads the current user (with role) once on mount when a
 * token is present, and exposes sign-out + a refresh hook used right after login.
 */
interface AuthValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (...roles: Role[]) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setUser(await getMe());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  const hasRole = useCallback((...roles: Role[]) => !!user && roles.includes(user.role), [user]);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, hasRole, refresh, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
