/**
 * PageHeader — Shared page-level heading component.
 *
 * Renders `<h1>` + optional subtitle. In V2 mode a small brand accent
 * overline is prepended, giving every inner feature page the V2 premium
 * look beyond what DashboardLayout already provides.
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
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-4 h-[2px] rounded-full bg-[#4f5fd6]" />
          <span className="text-[10px] tracking-[0.15em] uppercase text-[#4f5fd6] font-semibold">
            EquiProfile
          </span>
        </div>
      )}
      <h1 className="font-serif text-3xl font-bold text-foreground">{title}</h1>
      {subtitle && (
        <p className={cn("text-muted-foreground mt-1 text-sm", subtitleClassName)}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
