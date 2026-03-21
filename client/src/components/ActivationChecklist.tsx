import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { Link } from "wouter";

export interface ChecklistItems {
  addedHorse: boolean;
  choseExperience: boolean;
  viewedDashboard: boolean;
  addedHealthRecord: boolean;
  exploredTraining: boolean;
}

interface ActivationChecklistProps {
  items: ChecklistItems;
  /** Hide the checklist once all items are complete */
  hideWhenComplete?: boolean;
}

const CHECKLIST_ROWS: {
  key: keyof ChecklistItems;
  label: string;
  href: string;
}[] = [
  { key: "addedHorse", label: "Add your first horse", href: "/horses/new" },
  {
    key: "choseExperience",
    label: "Choose your experience",
    href: "/settings",
  },
  {
    key: "viewedDashboard",
    label: "Explore the dashboard",
    href: "/dashboard",
  },
  {
    key: "addedHealthRecord",
    label: "Add a health record",
    href: "/health",
  },
  {
    key: "exploredTraining",
    label: "Check out training tools",
    href: "/training",
  },
];

/**
 * A compact activation-progress checklist shown on the dashboard
 * during the trial period.
 */
export function ActivationChecklist({
  items,
  hideWhenComplete = true,
}: ActivationChecklistProps) {
  const completed = Object.values(items).filter(Boolean).length;
  const total = CHECKLIST_ROWS.length;
  const allDone = completed === total;
  const progress = Math.round((completed / total) * 100);

  if (hideWhenComplete && allDone) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#0f1d32]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Getting Started</h3>
        <span className="text-xs text-gray-500">
          {completed}/{total} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="space-y-2">
        {CHECKLIST_ROWS.map((row) => {
          const done = items[row.key];
          return (
            <Link key={row.key} href={done ? "#" : row.href}>
              <div
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                  done
                    ? "bg-white/5 opacity-60"
                    : "bg-white/5 hover:bg-white/10 cursor-pointer"
                }`}
              >
                {done ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-gray-600 shrink-0" />
                )}
                <span
                  className={`text-sm ${done ? "text-gray-500 line-through" : "text-gray-300"}`}
                >
                  {row.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
