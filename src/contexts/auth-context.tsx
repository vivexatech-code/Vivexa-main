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
import { ensurePrimaryAdmin, getAdminUser } from "@/lib/firebase/admin-users";
import { getDepartments } from "@/lib/firebase/departments";
import {
  resolveUserPermissions,
  canView,
  canWrite,
  requiresApproval,
  canDelete,
  canApprove,
  isFull,
} from "@/lib/permissions";
import type { AdminUser, AppModule, ModulePermissions, PermissionLevel } from "@/types/auth";
import type { Department } from "@/types/department";

function loginErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-email":
        return "Invalid email or password. Sign in with a user registered in the system.";
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

type AuthAction = "view" | "write" | "delete" | "approve" | "approval_required" | "full";

type AuthContextValue = {
  user: User | null;
  adminUser: AdminUser | null;
  departments: Department[];
  permissions: ModulePermissions;
  isSuperAdmin: boolean;
  isDeactivated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  can: (module: AppModule, action?: AuthAction) => boolean;
  getModuleLevel: (module: AppModule) => PermissionLevel;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndDepartments = useCallback(async (firebaseUser: User) => {
    try {
      const [profile, depts] = await Promise.all([
        ensurePrimaryAdmin(firebaseUser),
        getDepartments(),
      ]);
      setAdminUser(profile);
      setDepartments(depts);
    } catch (err) {
      console.error("Error loading user profile or departments:", err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const [profile, depts] = await Promise.all([
        getAdminUser(user.uid),
        getDepartments(),
      ]);
      if (profile) setAdminUser(profile);
      setDepartments(depts);
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(getClientAuth(), async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        await fetchProfileAndDepartments(nextUser);
      } else {
        setAdminUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchProfileAndDepartments]);

  const permissions = useMemo(() => {
    return resolveUserPermissions(adminUser, departments);
  }, [adminUser, departments]);

  const isSuperAdmin = Boolean(adminUser?.isSuperAdmin);
  const isDeactivated = Boolean(adminUser && adminUser.status !== "active");

  const getModuleLevel = useCallback(
    (module: AppModule): PermissionLevel => {
      return permissions[module] || "none";
    },
    [permissions],
  );

  const can = useCallback(
    (module: AppModule, action: AuthAction = "view"): boolean => {
      if (!adminUser || isDeactivated) return false;
      if (isSuperAdmin) return true;

      const level = permissions[module] || "none";

      switch (action) {
        case "view":
          return canView(level);
        case "write":
          return canWrite(level);
        case "approval_required":
          return requiresApproval(level);
        case "delete":
          return canDelete(level) || Boolean(adminUser.capabilities?.canDelete);
        case "approve":
          return canApprove(level) || Boolean(adminUser.capabilities?.canApprove);
        case "full":
          return isFull(level);
        default:
          return false;
      }
    },
    [adminUser, isDeactivated, isSuperAdmin, permissions],
  );

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
    setAdminUser(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      adminUser,
      departments,
      permissions,
      isSuperAdmin,
      isDeactivated,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      can,
      getModuleLevel,
    }),
    [
      user,
      adminUser,
      departments,
      permissions,
      isSuperAdmin,
      isDeactivated,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      can,
      getModuleLevel,
    ],
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
