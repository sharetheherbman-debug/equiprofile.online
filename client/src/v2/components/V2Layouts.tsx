/**
 * V2 Layout Primitives
 *
 * Clean, reusable layout wrappers for the V2 frontend.
 * Used across Website V2, Standard Dashboard V2, and Stable Dashboard V2.
 */
import React from "react";
import { cn } from "@/lib/utils";
import { v2Card, v2Section, v2Type, v2Badge, v2EmptyState } from "../styles/tokens";
import type { LucideIcon } from "lucide-react";

/* ─── Page Container ───────────────────────────────────────────── */

export function V2Page({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#f7f8fa] dark:bg-[#0f1219] text-[#1a1d24] dark:text-[#e8eaef]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ─── Section Container ────────────────────────────────────────── */

export function V2Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("py-16 md:py-24 px-5 md:px-8 lg:px-12", className)}
    >
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

/* ─── Section Header ───────────────────────────────────────────── */

export function V2SectionHeader({
  overline,
  title,
  subtitle,
  align = "center",
}: {
  overline?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "mb-10 md:mb-14",
        align === "center" ? v2Section.header : "text-left",
      )}
    >
      {overline && <p className={v2Section.overline}>{overline}</p>}
      <h2 className={v2Section.title}>{title}</h2>
      {subtitle && (
        <p
          className={cn(
            v2Section.subtitle,
            align === "left" && "max-w-none",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── V2 Card ──────────────────────────────────────────────────── */

export function V2Card({
  children,
  variant = "base",
  className,
  onClick,
}: {
  children: React.ReactNode;
  variant?: keyof typeof v2Card;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(v2Card[variant], "p-5 md:p-6", className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

/* ─── Metric Card ──────────────────────────────────────────────── */

export function V2MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
}) {
  return (
    <div className={cn(v2Card.base, "p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#5c6370] dark:text-[#9ca3b0] font-medium">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</p>
          {trend && (
            <p className="mt-1 text-xs text-[#2d8a56] font-medium">{trend}</p>
          )}
        </div>
        {Icon && (
          <div className="flex-shrink-0 p-2.5 rounded-lg bg-[#eef0fb] dark:bg-[#252a40]">
            <Icon className="w-5 h-5 text-[#4f5fd6]" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Status Badge ─────────────────────────────────────────────── */

export function V2Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: keyof typeof v2Badge;
}) {
  return <span className={v2Badge[variant]}>{children}</span>;
}

/* ─── Empty State ──────────────────────────────────────────────── */

export function V2EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={v2EmptyState.container}>
      {Icon && <Icon className={v2EmptyState.icon} />}
      <h3 className={v2EmptyState.title}>{title}</h3>
      {description && <p className={v2EmptyState.description}>{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ─── List Item ────────────────────────────────────────────────── */

export function V2ListItem({
  icon: Icon,
  title,
  subtitle,
  trailing,
  onClick,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 px-4 py-3 rounded-lg transition-colors duration-150",
        onClick && "cursor-pointer hover:bg-[#f0f2f5] dark:hover:bg-[#1e2433]",
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {Icon && (
        <div className="flex-shrink-0 p-2 rounded-lg bg-[#f0f2f5] dark:bg-[#1e2433]">
          <Icon className="w-4 h-4 text-[#5c6370] dark:text-[#9ca3b0]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1a1d24] dark:text-[#e8eaef] truncate">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-[#8b919e] dark:text-[#6b7280] truncate">
            {subtitle}
          </p>
        )}
      </div>
      {trailing}
    </div>
  );
}
