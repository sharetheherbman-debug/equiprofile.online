/**
 * MgmtCTASection — shared management marketing CTA section.
 *
 * Used at the bottom of every management marketing page so the CTA
 * presentation is consistent and driven from a single component.
 * Background gradient, dot pattern, gold hairline and button styles
 * are all defined here — update once, change everywhere.
 */
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { mgmtDotPattern } from "@/styles/managementTheme";

export interface MgmtCTASectionProps {
  /** Small all-caps label above the heading */
  eyebrow?: string;
  /** Italic pull-quote rendered above the heading */
  quote?: string;
  /** Main h2 heading — accepts React nodes so callers can add line breaks */
  heading: React.ReactNode;
  /** Supporting body copy */
  body: string;
  /** Primary gold CTA button */
  primaryCta: { label: string; href: string };
  /** Optional secondary ghost CTA button */
  secondaryCta?: { label: string; href: string };
  /** Optional trust-strip items shown below the buttons */
  trustItems?: string[];
  /** Extra class names added to the outer <section> */
  className?: string;
}

export function MgmtCTASection({
  eyebrow,
  quote,
  heading,
  body,
  primaryCta,
  secondaryCta,
  trustItems,
  className = "",
}: MgmtCTASectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className={`relative py-28 md:py-36 overflow-hidden ${className}`}>
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f2238] via-[#1e3a5f] to-[#11253e]" />

      {/* Radial gold glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_50%,_rgba(197,165,90,0.08)_0%,_transparent_70%)] pointer-events-none" />

      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={mgmtDotPattern}
      />

      {/* Gold top hairline */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px bg-gradient-to-r from-transparent via-[#c5a55a]/50 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 text-center" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {eyebrow && (
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#c5a55a] mb-5">
              {eyebrow}
            </p>
          )}

          {quote && (
            <blockquote className="text-base md:text-lg italic text-white/40 max-w-2xl mx-auto mb-8 leading-relaxed">
              {quote}
            </blockquote>
          )}

          <h2 className="text-4xl md:text-5xl font-bold font-serif text-white max-w-3xl mx-auto leading-tight">
            {heading}
          </h2>

          <p className="mt-6 text-white/45 text-lg max-w-xl mx-auto leading-relaxed">
            {body}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={primaryCta.href}>
              <Button
                size="lg"
                className="bg-[#c5a55a] hover:bg-[#d4b468] text-[#0f1d2e] font-bold px-12 h-12 text-base rounded-full shadow-2xl shadow-[#c5a55a]/25 border-0 transition-all duration-200 hover:-translate-y-0.5 group"
              >
                {primaryCta.label}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>

            {secondaryCta && (
              <Link href={secondaryCta.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/15 text-white hover:bg-white/[0.07] hover:border-white/25 px-10 h-12 text-base rounded-full transition-all duration-200"
                >
                  {secondaryCta.label}
                </Button>
              </Link>
            )}
          </div>

          {trustItems && trustItems.length > 0 && (
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              {trustItems.map((item) => (
                <span
                  key={item}
                  className="text-xs text-white/35 flex items-center gap-1.5"
                >
                  <Check className="w-3 h-3 text-[#c5a55a]/60" />
                  {item}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
