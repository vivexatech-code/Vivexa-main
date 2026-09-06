"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

function loginErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-email":
        return "Invalid email or password. Sign in with a user created under Firebase Authentication → Users, not an employee record.";
      case "auth/too-many-requests":
        return "Too many sign-in attempts. Wait a few minutes and try again.";
      case "auth/user-disabled":
        return "This administrator account has been disabled.";
      case "auth/operation-not-allowed":
        return "Email/password sign-in is turned off in the Firebase console.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      case "auth/invalid-api-key":
        return "Firebase API key is invalid. Check NEXT_PUBLIC_FIREBASE_API_KEY in .env.local.";
      case "auth/email-already-in-use":
        return "That email already has an account. Sign in instead.";
      case "auth/weak-password":
        return "Password is too weak. Use at least 6 characters.";
      default:
        return error.message || "Sign in failed.";
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Sign in failed.";
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(getClientAuth(), (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      await signInWithEmailAndPassword(
        getClientAuth(),
        normalizedEmail,
        password,
      );
    } catch (error) {
      throw new Error(loginErrorMessage(error));
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      await createUserWithEmailAndPassword(
        getClientAuth(),
        normalizedEmail,
        password,
      );
    } catch (error) {
      throw new Error(loginErrorMessage(error));
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(getClientAuth());
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
