/**
 * AdminViewContext — Global admin "View As" dashboard system.
 *
 * Allows admin users to switch between viewing different dashboard types
 * (admin, pro, stable, student, teacher) without breaking real auth or billing.
 *
 * Persisted to sessionStorage so the view mode survives page refreshes
 * but resets on new browser sessions.
 *
 * Non-admin users always get null — the context is a no-op for them.
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

// ── Types ──────────────────────────────────────────────────────────────────

export const ADMIN_VIEW_MODES = ["admin", "pro", "stable", "student", "teacher"] as const;
export type AdminViewMode = (typeof ADMIN_VIEW_MODES)[number];

interface AdminViewContextValue {
  /** Current view mode — null for non-admin users */
  viewMode: AdminViewMode | null;
  /** Switch to a different dashboard view (admin-only) */
  setViewMode: (mode: AdminViewMode) => void;
  /** Return to default admin view */
  exitViewMode: () => void;
  /** Whether the admin is currently simulating a non-admin dashboard */
  isViewingAs: boolean;
  /** Whether the current user is an admin at all */
  isAdmin: boolean;
}

const STORAGE_KEY = "equiprofile-admin-view-mode";

const AdminViewContext = createContext<AdminViewContextValue>({
  viewMode: null,
  setViewMode: () => {},
  exitViewMode: () => {},
  isViewingAs: false,
  isAdmin: false,
});

// ── Provider ───────────────────────────────────────────────────────────────

export function AdminViewProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [viewMode, setViewModeState] = useState<AdminViewMode>(() => {
    if (!isAdmin) return "admin";
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved && (ADMIN_VIEW_MODES as readonly string[]).includes(saved)) {
      return saved as AdminViewMode;
    }
    return "admin";
  });

  const setViewMode = useCallback(
    (mode: AdminViewMode) => {
      if (!isAdmin) return;
      setViewModeState(mode);
      sessionStorage.setItem(STORAGE_KEY, mode);
    },
    [isAdmin],
  );

  const exitViewMode = useCallback(() => {
    setViewModeState("admin");
    sessionStorage.setItem(STORAGE_KEY, "admin");
  }, []);

  const value: AdminViewContextValue = {
    viewMode: isAdmin ? viewMode : null,
    setViewMode,
    exitViewMode,
    isViewingAs: isAdmin && viewMode !== "admin",
    isAdmin,
  };

  return (
    <AdminViewContext.Provider value={value}>
      {children}
    </AdminViewContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useAdminViewMode() {
  return useContext(AdminViewContext);
}
