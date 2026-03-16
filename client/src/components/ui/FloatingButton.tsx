import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { ReactNode, useState } from "react";

interface FloatingButtonProps {
  actions: Array<{
    icon: ReactNode;
    label: string;
    onClick: () => void;
  }>;
}

/**
 * FloatingButton with speed dial action menu
 *
 * Note: Using 'as any' type assertions for framer-motion props is a workaround
 * for React 19 type compatibility issues with framer-motion 12.x. This is a
 * known limitation and will be resolved when framer-motion releases full React 19 support.
 * The props work correctly at runtime despite the TypeScript warnings.
 */
export function FloatingButton({ actions }: FloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Speed dial menu */}
      {isOpen && (
        <motion.div
          {...({
            initial: { opacity: 0, scale: 0.8 },
            animate: { opacity: 1, scale: 1 },
          } as any)}
          className="absolute bottom-20 right-0 flex flex-col gap-3"
        >
          {actions.map((action, index) => (
            <motion.button
              key={index}
              {...({
                initial: { opacity: 0, x: 20 },
                animate: { opacity: 1, x: 0 },
                transition: { delay: index * 0.05 },
              } as any)}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all group"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                {action.label}
              </span>
              <div className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Main FAB */}
      <motion.button
        {...({
          whileHover: { scale: 1.1 },
          whileTap: { scale: 0.9 },
        } as any)}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-blue-500/50 transition-shadow"
      >
        <motion.div
          {...({
            animate: { rotate: isOpen ? 45 : 0 },
            transition: { duration: 0.2 },
          } as any)}
        >
          <Plus size={28} />
        </motion.div>
      </motion.button>
    </div>
  );
}
