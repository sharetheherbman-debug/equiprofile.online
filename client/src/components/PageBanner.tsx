import { motion } from "framer-motion";

interface PageBannerProps {
  title: string;
  subtitle?: string;
  imageSrc: string;
  imagePosition?: "center" | "top" | "bottom";
  minHeight?: string;
  overlay?: boolean;
}

/**
 * PageBanner Component
 *
 * A reusable banner component for marketing pages.
 * Features:
 * - Responsive design with proper image scaling
 * - Proper heights: 420-520px desktop, 280-360px mobile
 * - Object-fit cover with configurable positioning
 * - Optional gradient overlay for better text readability
 * - Animated entrance
 * - Accounts for fixed navbar (72px)
 */
export function PageBanner({
  title,
  subtitle,
  imageSrc,
  imagePosition = "center",
  minHeight = "min-h-[432px] md:min-h-[552px]",
  overlay = true,
}: PageBannerProps) {
  const objectPosition = {
    center: "object-center",
    top: "object-top",
    bottom: "object-bottom",
  }[imagePosition];

  return (
    <div className={`relative ${minHeight} overflow-hidden`}>
      {/* Background Image – starts at top-0 so it sits behind the transparent navbar */}
      <img
        src={imageSrc}
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover ${objectPosition}`}
      />

      {/* Gradient Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      )}

      {/* Content – pt-[72px] ensures text is below the fixed navbar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center pt-[72px] pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4 text-white drop-shadow-2xl">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-lg">
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
