import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ContextualTipProps {
  tipId: string;
  title: string;
  message: string;
  /** Optional list of already-dismissed tip IDs from user preferences */
  dismissedTips?: string[];
}

/**
 * A small, dismissable smart-tip banner.
 *
 * Shown once per page/context. When dismissed the tip ID is persisted
 * server-side so it never shows again.
 */
export function ContextualTip({
  tipId,
  title,
  message,
  dismissedTips = [],
}: ContextualTipProps) {
  const [dismissed, setDismissed] = useState(
    dismissedTips.includes(tipId),
  );
  const dismissMutation = trpc.user.dismissTip.useMutation();

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    dismissMutation.mutate({ tipId });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="relative bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-4 pr-10 mb-4"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
          aria-label="Dismiss tip"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-300 mb-0.5">
              {title}
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">{message}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
