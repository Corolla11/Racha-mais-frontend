import { createContext, useContext } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export type AuthSessionResponse = {
  session: { id: string; userId: string; expiresAt: string };
  user: AuthUser;
} | null;

export type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  sessionError: string | null;
  refreshSession: () => Promise<AuthUser | null>;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de AuthProvider");
  }
  return context;
}
