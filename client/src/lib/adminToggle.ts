/**
 * Admin Toggle System
 * Provides a hidden console-based admin section toggle
 * 
 * Usage:
 * - Type "show admin" in browser console to reveal admin section
 * - Type "hide admin" to hide it again
 * - Admin password is required to access
 */

// Admin password should be set via environment variable
// For development, defaults to a placeholder that must be changed in production
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "equi2024!admin";
const ADMIN_VISIBLE_KEY = "equiprofile_admin_visible";
const ADMIN_AUTHENTICATED_KEY = "equiprofile_admin_auth";

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
    
    console.log(
      "%c🐴 EquiProfile Admin Commands",
      "color: #10b981; font-size: 16px; font-weight: bold;"
    );
    console.log(
      "%cType 'showAdmin()' to reveal admin section",
      "color: #6b7280; font-size: 12px;"
    );
    console.log(
      "%cType 'hideAdmin()' to hide admin section",
      "color: #6b7280; font-size: 12px;"
    );
  }

  private loadState() {
    // Check if admin was previously visible
    const visible = sessionStorage.getItem(ADMIN_VISIBLE_KEY) === "true";
    const authenticated = sessionStorage.getItem(ADMIN_AUTHENTICATED_KEY) === "true";
    
    if (visible && authenticated) {
      this.notifyListeners();
    }
  }

  private async showAdmin() {
    try {
      // Check if already authenticated in this session
      const authenticated = sessionStorage.getItem(ADMIN_AUTHENTICATED_KEY) === "true";
      
      if (!authenticated) {
        // Prompt for password
        const password = prompt("Enter admin password:");
        
        if (!password) {
          console.log("%c❌ Admin access cancelled", "color: #ef4444;");
          return;
        }

        if (password !== ADMIN_PASSWORD) {
          console.log("%c❌ Invalid admin password", "color: #ef4444;");
          alert("Invalid admin password");
          return;
        }

        // Store authentication in session
        sessionStorage.setItem(ADMIN_AUTHENTICATED_KEY, "true");
      }

      // Show admin section
      sessionStorage.setItem(ADMIN_VISIBLE_KEY, "true");
      this.notifyListeners();
      
      console.log(
        "%c✅ Admin section is now visible",
        "color: #10b981; font-weight: bold;"
      );
      console.log(
        "%cNavigate to /admin to access the admin panel",
        "color: #6b7280;"
      );
    } catch (error) {
      console.error("Error showing admin:", error);
    }
  }

  private hideAdmin() {
    sessionStorage.setItem(ADMIN_VISIBLE_KEY, "false");
    this.notifyListeners();
    
    console.log(
      "%c✅ Admin section is now hidden",
      "color: #10b981; font-weight: bold;"
    );
  }

  public isAdminVisible(): boolean {
    return sessionStorage.getItem(ADMIN_VISIBLE_KEY) === "true" &&
           sessionStorage.getItem(ADMIN_AUTHENTICATED_KEY) === "true";
  }

  public subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  public resetAuth() {
    sessionStorage.removeItem(ADMIN_VISIBLE_KEY);
    sessionStorage.removeItem(ADMIN_AUTHENTICATED_KEY);
    this.notifyListeners();
  }
}

// Singleton instance
export const adminToggle = new AdminToggleSystem();
