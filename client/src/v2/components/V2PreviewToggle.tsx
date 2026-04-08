/**
 * V2 Preview Toggle
 *
 * Small floating button (admin/preview only) that lets users switch
 * between V1 (legacy) and V2 (redesign) frontends.
 * Persists choice to localStorage so it survives page reloads.
 */
import { useState } from "react";
import { getUIVersion, setUIVersion, type UIVersion } from "@/config/uiVersion";
import { Paintbrush } from "lucide-react";

export function V2PreviewToggle() {
  const [version, setVersion] = useState<UIVersion>(getUIVersion);
  const [open, setOpen] = useState(false);

  function switchTo(v: UIVersion) {
    setUIVersion(v);
    setVersion(v);
    setOpen(false);
    // Reload to apply the new version across the whole app
    window.location.reload();
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      {open && (
        <div className="mb-2 rounded-xl border border-[#e4e7ec] dark:border-[#2a3040] bg-white dark:bg-[#181d27] shadow-lg p-4 w-56">
          <p className="text-xs font-semibold text-[#5c6370] dark:text-[#9ca3b0] uppercase tracking-wider mb-3">
            UI Version
          </p>
          <button
            onClick={() => switchTo("v1")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
              version === "v1"
                ? "bg-[#4f5fd6] text-white"
                : "text-[#1a1d24] dark:text-[#e8eaef] hover:bg-[#f0f2f5] dark:hover:bg-[#1e2433]"
            }`}
            aria-pressed={version === "v1"}
          >
            V1 — Legacy
          </button>
          <button
            onClick={() => switchTo("v2")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              version === "v2"
                ? "bg-[#4f5fd6] text-white"
                : "text-[#1a1d24] dark:text-[#e8eaef] hover:bg-[#f0f2f5] dark:hover:bg-[#1e2433]"
            }`}
            aria-pressed={version === "v2"}
          >
            V2 — Redesign
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-[#4f5fd6] text-white shadow-lg flex items-center justify-center hover:bg-[#4350b8] transition-colors"
        aria-label="Toggle UI version"
        title="Switch between V1 and V2 frontend"
      >
        <Paintbrush className="w-4 h-4" />
      </button>
    </div>
  );
}
