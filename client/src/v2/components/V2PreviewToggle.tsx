/**
 * V2 Preview Toggle (DEPRECATED)
 *
 * This component is no longer rendered in the production app.
 * UI version selection now happens at deploy time via the
 * VITE_UI_VERSION environment variable.
 *
 * This file is preserved for reference only.
 */
import { useState } from "react";
import { getUIVersion, type UIVersion } from "@/config/uiVersion";
import { Paintbrush } from "lucide-react";

/**
 * @deprecated No longer used. Version is selected at deploy time via VITE_UI_VERSION.
 */
export function V2PreviewToggle() {
  const [version] = useState<UIVersion>(getUIVersion);
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      {open && (
        <div className="mb-2 rounded-xl border border-[#e4e7ec] dark:border-[#2a3040] bg-white dark:bg-[#181d27] shadow-lg p-4 w-56">
          <p className="text-xs font-semibold text-[#5c6370] dark:text-[#9ca3b0] uppercase tracking-wider mb-3">
            UI Version (read-only)
          </p>
          <p className="text-sm text-[#1a1d24] dark:text-[#e8eaef]">
            Active: <strong>{version.toUpperCase()}</strong>
          </p>
          <p className="text-xs text-[#5c6370] dark:text-[#9ca3b0] mt-2">
            Set VITE_UI_VERSION in .env and rebuild to change.
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-[#4f5fd6] text-white shadow-lg flex items-center justify-center hover:bg-[#4350b8] transition-colors"
        aria-label="Show UI version info"
        title="Current UI version info"
      >
        <Paintbrush className="w-4 h-4" />
      </button>
    </div>
  );
}
