/**
 * PageHeader — Shared page-level heading component for the DASHBOARD APP.
 *
 * ⚠️  NOT FOR MANAGEMENT MARKETING PAGES
 * ----------------------------------------
 * This component is NOT a banner or hero for the public marketing site.
 * It renders the inner-app `<h1>` + optional subtitle visible to
 * authenticated users inside their dashboard.
 *
 * For public marketing page heroes (Features, Pricing, About, Contact),
 * use MgmtHero:
 *   client/src/components/management/MgmtHero.tsx
 *
 * In V2 mode a small brand accent overline is prepended, giving every inner
 * feature page the V2 premium look beyond what DashboardLayout already
 * provides.
 */

import { isV2 } from "@/config/uiVersion";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Extra Tailwind classes applied to the subtitle paragraph (e.g. "hidden sm:block") */
  subtitleClassName?: string;
}

export function PageHeader({ title, subtitle, subtitleClassName }: PageHeaderProps) {
  return (
    <div>
      {isV2() && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-[2px] rounded-full bg-primary" />
          <span className="text-[10px] tracking-[0.15em] uppercase text-primary font-semibold">
            EquiProfile
          </span>
        </div>
      )}
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground leading-tight">{title}</h1>
      {subtitle && (
        <p className={cn("text-muted-foreground mt-1 text-sm", subtitleClassName)}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
