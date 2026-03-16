/**
 * Admin Toggle System
 * Provides a hidden console-based admin section toggle
 *
 * Usage:
 * - Type "showAdmin()" in browser console to reveal admin section
 * - Type "hideAdmin()" to hide it again
 * - Admin role is enforced server-side; the client toggle is UI-only.
 *
 * Security note: this sessionStorage flag only controls *UI visibility*.
 * All admin API actions require role=admin in the server session token plus
 * a valid server-side admin-unlock session.  Manually toggling the flag in
 * the browser has no security impact.
 */

const ADMIN_VISIBLE_KEY = "equiprofile_admin_visible";

class AdminToggleSystem {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.setupConsoleCommands();
    this.loadState();
  }

  private setupConsoleCommands() {
    // Make commands globally available
    (window as any).showAdmin = () => this.showAdmin();
    (window as any).hideAdmin = () => this.hideAdmin();

    // Only print console hints in development to avoid noisy banners in production
    if (import.meta.env.DEV) {
      console.log(
        "%c🐴 EquiProfile Admin Commands",
        "color: #10b981; font-size: 16px; font-weight: bold;",
      );
      console.log(
        "%cType 'showAdmin()' to reveal admin section",
        "color: #6b7280; font-size: 12px;",
      );
      console.log(
        "%cType 'hideAdmin()' to hide admin section",
        "color: #6b7280; font-size: 12px;",
      );
    }
  }

  private loadState() {
    const visible = sessionStorage.getItem(ADMIN_VISIBLE_KEY) === "true";
    if (visible) {
      this.notifyListeners();
    }
  }

  private showAdmin() {
    // The client only toggles UI visibility.  All actual admin actions require
    // role=admin (server-side) plus an admin-unlock session (server-side).
    sessionStorage.setItem(ADMIN_VISIBLE_KEY, "true");
    this.notifyListeners();

    console.log(
      "%c✅ Admin section is now visible",
      "color: #10b981; font-weight: bold;",
    );
    console.log(
      "%cNavigate to /admin to access the admin panel",
      "color: #6b7280;",
    );
  }

  private hideAdmin() {
    sessionStorage.setItem(ADMIN_VISIBLE_KEY, "false");
    this.notifyListeners();

    console.log(
      "%c✅ Admin section is now hidden",
      "color: #10b981; font-weight: bold;",
    );
  }

  public isAdminVisible(): boolean {
    return sessionStorage.getItem(ADMIN_VISIBLE_KEY) === "true";
  }

  public subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => callback());
  }

  public resetAuth() {
    sessionStorage.removeItem(ADMIN_VISIBLE_KEY);
    this.notifyListeners();
  }
}

// Singleton instance
export const adminToggle = new AdminToggleSystem();
