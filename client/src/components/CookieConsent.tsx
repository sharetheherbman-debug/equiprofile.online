import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "equiprofile_cookie_consent";

/**
 * Cookie consent banner.
 *
 * Shown on first visit. Once the user accepts or declines the banner is hidden
 * and the choice is persisted in localStorage so it never shows again.
 *
 * Accessible: keyboard-focusable buttons, role="dialog", aria-live region.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!stored) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (private browsing) — show banner anyway
      setVisible(true);
    }
  }, []);

  const persist = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-label="Cookie consent"
          aria-live="polite"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
        >
          <div className="max-w-3xl mx-auto bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="flex-1 text-sm text-gray-300 leading-relaxed">
              We use cookies to keep you signed in and improve your experience.
              See our{" "}
              <Link
                href="/privacy"
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => persist("declined")}
                className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => persist("accepted")}
                className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0"
              >
                Accept
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
