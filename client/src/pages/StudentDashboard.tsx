// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
import { useAuth } from "@/_core/hooks/useAuth";
import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  GraduationCap,
  Heart,
  Sparkles,
  ClipboardList,
  BookOpen,
  TrendingUp,
  Brain,
  Trophy,
  ChevronRight,
  Clock,
  Target,
  Flame,
  CheckCircle2,
  Plus,
  Send,
  Loader2,
  X,
  Zap,
  Star,
  Edit2,
  Save,
  XCircle,
  Lightbulb,
  Shield,
  Leaf,
  MessageSquare,
  AlertCircle,
  Route,
  Library,
  ChevronLeft,
  ArrowRight,
  Eye,
  Award,
} from "lucide-react";

/**
 * Student Dashboard — Phase 2 Integrated
 *
 * A dedicated, engaging dashboard for student users with real backend
 * integration via tRPC. Distinct visual identity from Standard/Stable.
 *
 * Modules: Overview, Virtual Horse, Assigned Horse, Tasks, Training Log,
 *          Study Hub, AI Tutor, Progress.
 */

// ─── Design Tokens (Student-specific) ─────────────────────────
const STUDENT_ACCENT = "#6366f1";
const STUDENT_BG = "#0c1222";
const STUDENT_CARD = "#131a2e";
const STUDENT_BORDER = "rgba(99, 102, 241, 0.15)";

// ─── Re-export the ActiveView type from layout for internal use ──────────
import type { StudentView as ActiveView } from "@/components/StudentDashboardLayout";

// ─── Sub-components ───────────────────────────────────────────

/** Format a date value to YYYY-MM-DD string safely. */
function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  return String(d).slice(0, 10);
}

function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-white/[0.06] animate-pulse ${className}`}
    />
  );
}

/** Section card wrapper */
function SCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border p-5 sm:p-6 ${className}`}
      style={{ backgroundColor: STUDENT_CARD, borderColor: STUDENT_BORDER }}
    >
      {children}
    </div>
  );
}

/** Section heading */
function SectionHeading({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-indigo-300" />
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
  );
}

// ─── Overview View ────────────────────────────────────────────
// ─── Teacher Integration Panels ───────────────────────────────

const FEEDBACK_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  good: { label: "Good Work", color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  needs_improvement: { label: "Needs Improvement", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  urgent: { label: "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  general: { label: "Comment", color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
};

function TeacherFeedbackPanel() {
  const utils = trpc.useUtils();
  const { data: feedback, isLoading } = trpc.student.listMyFeedback.useQuery();
  const markReadMut = trpc.student.markFeedbackRead.useMutation({
    onSuccess: () => utils.student.listMyFeedback.invalidate(),
  });

  if (isLoading || !feedback?.length) return null;

  const unread = feedback.filter(f => !f.isRead);
  const shown = feedback.slice(0, 4);

  return (
    <section>
      <SectionHeading icon={MessageSquare} title={`Instructor Feedback${unread.length > 0 ? ` (${unread.length} new)` : ""}`} />
      <div className="space-y-3">
        {shown.map(f => {
          const style = FEEDBACK_STYLES[f.feedbackType] ?? FEEDBACK_STYLES.general;
          return (
            <SCard key={f.id} className={`!p-4 ${!f.isRead ? "ring-1 ring-indigo-500/30" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: style.bg, color: style.color }}>
                      {style.label}
                    </span>
                    <span className="text-[10px] text-gray-500 capitalize">{f.entryType?.replace(/_/g, " ")}</span>
                    {f.teacherName && <span className="text-[10px] text-gray-600">from {f.teacherName}</span>}
                    {!f.isRead && <span className="text-[10px] text-indigo-400 font-semibold">● New</span>}
                  </div>
                  <p className="text-sm text-gray-300">{f.comment}</p>
                  <p className="text-[10px] text-gray-600 mt-1">{String(f.createdAt).slice(0, 10)}</p>
                </div>
                {!f.isRead && (
                  <button
                    onClick={() => markReadMut.mutate({ id: f.id })}
                    className="text-xs text-indigo-400 hover:text-indigo-300 shrink-0 mt-0.5"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </SCard>
          );
        })}
      </div>
    </section>
  );
}

function AssignedTasksPanel({ onNavigate }: { onNavigate: (v: ActiveView) => void }) {
  const utils = trpc.useUtils();
  const { data: assignedTasks, isLoading } = trpc.student.listAssignedTasksForMe.useQuery();
  const completeMut = trpc.student.completeAssignedTask.useMutation({
    onSuccess: () => utils.student.listAssignedTasksForMe.invalidate(),
  });

  if (isLoading || !assignedTasks?.length) return null;

  const pending = assignedTasks.filter(t => !t.isCompleted).slice(0, 5);
  if (!pending.length) return null;

  return (
    <section>
      <SectionHeading icon={AlertCircle} title={`Assigned Tasks (${pending.length} pending)`} />
      <SCard>
        <div className="space-y-3">
          {pending.map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <div className="w-6 h-6 rounded-full border-2 border-amber-500/50 flex items-center justify-center shrink-0">
                <ClipboardList className="w-3 h-3 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{t.title}</p>
                <p className="text-[10px] text-amber-400/70">
                  {t.category} · {t.frequency}
                  {t.dueDate ? ` · Due ${String(t.dueDate).slice(0, 10)}` : ""}
                  {t.groupId ? " · Class task" : " · Personal task"}
                </p>
              </div>
              <button
                onClick={() => completeMut.mutate({ id: t.id })}
                disabled={completeMut.isPending}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors shrink-0"
              >
                Done
              </button>
            </div>
          ))}
          <button
            onClick={() => onNavigate("tasks")}
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-1"
          >
            View all tasks <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </SCard>
    </section>
  );
}

const LEVEL_PATHWAY_ITEMS: Record<string, string[]> = {
  beginner: ["riding-position", "aids-and-control", "grooming-basics", "feeding-basics", "tack-and-equipment", "horse-behaviour", "stable-safety", "horse-health-awareness"],
  developing: ["transitions", "trot-work", "nutrition-in-depth", "hoof-care", "rugging", "horse-behaviour-advanced", "first-aid-basics", "warming-up"],
  intermediate: ["canter-work", "lateral-work-intro", "health-monitoring", "lameness-awareness", "competition-basics", "arena-figures"],
  advanced: ["collection-and-engagement", "horse-biomechanics", "nutrition-advanced", "accident-management"],
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner", developing: "Developing", intermediate: "Intermediate", advanced: "Advanced",
};

function PathwayProgressPanel({ onNavigate }: { onNavigate: (v: ActiveView) => void }) {
  const { data: pathwayData, isLoading } = trpc.student.getPathwayProgress.useQuery();

  if (isLoading || !pathwayData) return null;

  const { completed, currentLevel } = pathwayData;
  const allItemsForLevel = LEVEL_PATHWAY_ITEMS[currentLevel] ?? LEVEL_PATHWAY_ITEMS.beginner;
  const completedSlugs = new Set(completed.filter(c => c.pathwayLevel === currentLevel).map(c => c.itemSlug));
  const completedCount = completedSlugs.size;
  const totalCount = allItemsForLevel.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const nextItem = allItemsForLevel.find(slug => !completedSlugs.has(slug));

  return (
    <section>
      <SectionHeading icon={Route} title="Learning Pathway" />
      <SCard>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{LEVEL_LABELS[currentLevel] ?? "Beginner"} Pathway</p>
              <p className="text-xs text-gray-500">{completedCount} of {totalCount} topics completed</p>
            </div>
            <span className="text-lg font-bold text-indigo-400">{pct}%</span>
          </div>
          <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #6366f1, #818cf8)" }} />
          </div>
          {nextItem && (
            <div className="flex items-center gap-2 pt-1">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <p className="text-xs text-gray-400">
                Next: <span className="text-indigo-300 capitalize">{nextItem.replace(/-/g, " ")}</span>
              </p>
            </div>
          )}
          <button
            onClick={() => onNavigate("study-hub")}
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Open Study Hub <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </SCard>
    </section>
  );
}

// ─── Overview View ────────────────────────────────────────────
function OverviewView({ onNavigate }: { onNavigate: (v: ActiveView) => void }) {
  const { data: overview, isLoading } = trpc.student.getOverview.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0,1,2,3].map(i => (
            <SCard key={i}><SkeletonBar className="w-full h-12" /></SCard>
          ))}
        </div>
        <SCard><SkeletonBar className="w-full h-32" /></SCard>
      </div>
    );
  }

  const vHorse = overview?.virtualHorse;
  const aHorse = overview?.assignedHorse;
  const tasks = overview?.todayTasks ?? [];
  const completedCount = overview?.tasksCompleted ?? 0;
  const pendingCount = overview?.tasksPending ?? 0;
  const weekSessions = overview?.weeklySessionCount ?? 0;
  const skills = overview?.progressSkills ?? [];
  const avgLevel = skills.length > 0
    ? Math.round(skills.reduce((s, p) => s + p.level, 0) / skills.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: Flame, label: "Active Days", value: `${weekSessions > 0 ? weekSessions : 0} this week`, color: "#f59e0b" },
          { icon: ClipboardList, label: "Tasks Today", value: `${completedCount}/${completedCount + pendingCount}`, color: "#6366f1" },
          { icon: TrendingUp, label: "This Week", value: `${weekSessions} sessions`, color: "#10b981" },
          { icon: Trophy, label: "Level", value: avgLevel > 0 ? `Level ${avgLevel}` : "—", color: "#f97316" },
        ].map((stat) => {
          const StatIcon = stat.icon;
          return (
            <SCard key={stat.label} className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                <span style={{ color: stat.color }}><StatIcon className="w-5 h-5" /></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-sm font-semibold text-white mt-0.5">{stat.value}</p>
              </div>
            </SCard>
          );
        })}
      </div>

      {/* My Horse */}
      <section>
        <SectionHeading icon={Heart} title="My Horse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Virtual Horse Card */}
          <button onClick={() => onNavigate("virtual-horse")} className="text-left w-full">
            <div className="rounded-xl border p-6 transition-colors duration-300 bg-gradient-to-br from-violet-500/15 to-purple-500/15 border-violet-500/20 hover:border-violet-500/40">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-violet-500/20">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Your Virtual Horse</h3>
                  <p className="text-xs text-gray-500">Learn through simulation</p>
                </div>
              </div>
              {vHorse ? (
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-gray-500">Name</span><span className="text-sm text-white">{vHorse.name}</span></div>
                  {vHorse.breed && <div className="flex justify-between"><span className="text-xs text-gray-500">Breed</span><span className="text-sm text-gray-300">{vHorse.breed}</span></div>}
                  <div className="flex justify-between"><span className="text-xs text-gray-500">Overall Score</span><span className="text-sm text-emerald-400">{vHorse.overallScore}/100</span></div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-indigo-300 text-sm mt-1">
                  <Plus className="w-4 h-4" /> Create your virtual horse
                </div>
              )}
            </div>
          </button>

          {/* Assigned Horse Card */}
          <div className="rounded-xl border p-6 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border-emerald-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/20">
                <Heart className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Your Assigned Horse</h3>
                <p className="text-xs text-gray-500">Assigned by your school</p>
              </div>
            </div>
            {aHorse ? (
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-xs text-gray-500">Name</span><span className="text-sm text-white">{aHorse.horseName}</span></div>
                {aHorse.horseBreed && <div className="flex justify-between"><span className="text-xs text-gray-500">Breed</span><span className="text-sm text-gray-300">{aHorse.horseBreed}</span></div>}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">No horse assigned yet. Your school or stable can assign one.</p>
            )}
          </div>
        </div>
      </section>

      {/* Today's Focus */}
      <section>
        <SectionHeading icon={Clock} title="Today's Focus" />
        <SCard>
          {tasks.length === 0 ? (
            <div className="text-center py-6">
              <ClipboardList className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No tasks for today.</p>
              <button
                onClick={() => onNavigate("tasks")}
                className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mx-auto"
              >
                <Plus className="w-4 h-4" /> Add a task
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 6).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    task.isCompleted ? "bg-emerald-500/20 border-emerald-500" : "border-gray-600"
                  }`}>
                    {task.isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <span className={`text-sm flex-1 ${task.isCompleted ? "text-gray-500 line-through" : "text-gray-300"}`}>
                    {task.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    task.isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
                  }`}>
                    {task.isCompleted ? "Done" : task.category}
                  </span>
                </div>
              ))}
              {tasks.length > 6 && (
                <button onClick={() => onNavigate("tasks")} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  View all tasks <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </SCard>
      </section>

      {/* Quick Actions */}
      <section>
        <SectionHeading icon={Target} title="Quick Actions" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: TrendingUp, label: "Log Training", desc: "Record a riding or groundwork session", color: "#10b981", view: "training" as ActiveView },
            { icon: BookOpen, label: "Study Hub", desc: "Browse learning materials", color: "#6366f1", view: "study-hub" as ActiveView },
            { icon: Brain, label: "Ask AI Tutor", desc: "Get help with equine topics", color: "#a78bfa", view: "ai-tutor" as ActiveView },
            { icon: Target, label: "View Progress", desc: "Track your skill development", color: "#06b6d4", view: "progress" as ActiveView },
          ].map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => onNavigate(action.view)}
                className="flex items-start gap-4 p-5 rounded-xl border transition-all duration-200 text-left group w-full"
                style={{ backgroundColor: STUDENT_CARD, borderColor: STUDENT_BORDER }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform" style={{ backgroundColor: `${action.color}15` }}>
                  <span style={{ color: action.color }}><ActionIcon className="w-5 h-5" /></span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{action.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0 mt-1 group-hover:text-gray-400 transition-colors" />
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── Teacher Feedback ─────────────────────────── */}
      <TeacherFeedbackPanel />

      {/* ─── Assigned Tasks ───────────────────────────── */}
      <AssignedTasksPanel onNavigate={onNavigate} />

      {/* ─── Pathway Progress ─────────────────────────── */}
      <PathwayProgressPanel onNavigate={onNavigate} />
    </div>
  );
}

// ─── Virtual Horse View ───────────────────────────────────────
function VirtualHorseView() {
  const utils = trpc.useUtils();
  const { data: vHorse, isLoading } = trpc.student.getVirtualHorse.useQuery();
  const createMut = trpc.student.createVirtualHorse.useMutation({
    onSuccess: () => utils.student.getVirtualHorse.invalidate(),
  });

  const [form, setForm] = useState({ name: "", breed: "", color: "", personality: "" });

  if (isLoading) return <SCard><SkeletonBar className="w-full h-32" /></SCard>;

  if (!vHorse) {
    return (
      <SCard>
        <div className="text-center py-4 mb-6">
          <Sparkles className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">Create Your Virtual Horse</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Your virtual horse helps you learn care routines, feeding, grooming, and exercise — all through safe simulation.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <input
            placeholder="Horse name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <input
            placeholder="Breed (optional)"
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
            className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <input
            placeholder="Colour (optional)"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <input
            placeholder="Personality (optional)"
            value={form.personality}
            onChange={(e) => setForm({ ...form, personality: e.target.value })}
            className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="text-center mt-6">
          <button
            disabled={!form.name.trim() || createMut.isPending}
            onClick={() =>
              createMut.mutate({
                name: form.name.trim(),
                breed: form.breed.trim() || undefined,
                color: form.color.trim() || undefined,
                personality: form.personality.trim() || undefined,
              })
            }
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-medium disabled:opacity-50 transition-all"
          >
            {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Create Virtual Horse"}
          </button>
        </div>
      </SCard>
    );
  }

  // Show existing virtual horse
  const scores = [
    { label: "Feeding", value: vHorse.feedingScore, color: "#f59e0b" },
    { label: "Grooming", value: vHorse.groomingScore, color: "#a78bfa" },
    { label: "Exercise", value: vHorse.exerciseScore, color: "#10b981" },
    { label: "Health", value: vHorse.healthScore, color: "#ef4444" },
  ];

  return (
    <div className="space-y-4">
      <SCard>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{vHorse.name}</h3>
            <p className="text-sm text-gray-500">
              {[vHorse.breed, vHorse.color, vHorse.personality].filter(Boolean).join(" · ") || "Your virtual horse"}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-emerald-400">{vHorse.overallScore}</p>
            <p className="text-xs text-gray-500">Overall Score</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {scores.map((s) => (
            <div key={s.label} className="rounded-lg bg-white/[0.04] p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <div className="mt-1.5 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </SCard>
    </div>
  );
}

// ─── Tasks View ───────────────────────────────────────────────
function TasksView() {
  const utils = trpc.useUtils();
  const { data: tasks, isLoading } = trpc.student.listTasks.useQuery({});
  const createMut = trpc.student.createTask.useMutation({
    onSuccess: () => utils.student.listTasks.invalidate(),
  });
  const completeMut = trpc.student.completeTask.useMutation({
    onSuccess: () => utils.student.listTasks.invalidate(),
  });
  const uncompleteMut = trpc.student.uncompleteTask.useMutation({
    onSuccess: () => utils.student.listTasks.invalidate(),
  });
  const deleteMut = trpc.student.deleteTask.useMutation({
    onSuccess: () => utils.student.listTasks.invalidate(),
  });

  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", category: "care" as const, frequency: "daily" as const });

  if (isLoading) return <SCard><SkeletonBar className="w-full h-32" /></SCard>;

  const pending = (tasks ?? []).filter(t => !t.isCompleted);
  const completed = (tasks ?? []).filter(t => t.isCompleted);

  return (
    <div className="space-y-4">
      {/* Add Task */}
      <div className="flex justify-between items-center">
        <SectionHeading icon={ClipboardList} title="Tasks & Care Routines" />
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {showAdd && (
        <SCard>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <select
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value as typeof newTask.category })}
              className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="care">Care</option>
              <option value="grooming">Grooming</option>
              <option value="feeding">Feeding</option>
              <option value="study">Study</option>
              <option value="exercise">Exercise</option>
              <option value="other">Other</option>
            </select>
            <select
              value={newTask.frequency}
              onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value as typeof newTask.frequency })}
              className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="once">One-off</option>
            </select>
            <button
              disabled={!newTask.title.trim() || createMut.isPending}
              onClick={() => {
                createMut.mutate({
                  title: newTask.title.trim(),
                  category: newTask.category,
                  frequency: newTask.frequency,
                  targetDate: new Date().toISOString().split("T")[0],
                });
                setNewTask({ title: "", category: "care", frequency: "daily" });
                setShowAdd(false);
              }}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50 shrink-0"
            >
              {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
            </button>
          </div>
        </SCard>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <SCard>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3">Pending ({pending.length})</p>
          <div className="space-y-2">
            {pending.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.04] group">
                <button
                  onClick={() => completeMut.mutate({ id: task.id })}
                  className="w-6 h-6 rounded-full border-2 border-gray-600 hover:border-emerald-500 flex items-center justify-center shrink-0 transition-colors"
                />
                <span className="text-sm text-gray-300 flex-1">{task.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium">{task.category}</span>
                <button
                  onClick={() => deleteMut.mutate({ id: task.id })}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </SCard>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <SCard>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">Completed ({completed.length})</p>
          <div className="space-y-2">
            {completed.slice(0, 10).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                <button
                  onClick={() => uncompleteMut.mutate({ id: task.id })}
                  className="w-6 h-6 rounded-full border-2 bg-emerald-500/20 border-emerald-500 flex items-center justify-center shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </button>
                <span className="text-sm text-gray-500 line-through flex-1">{task.title}</span>
              </div>
            ))}
          </div>
        </SCard>
      )}

      {pending.length === 0 && completed.length === 0 && (
        <SCard>
          <div className="text-center py-8">
            <ClipboardList className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No tasks yet. Add your first task above.</p>
          </div>
        </SCard>
      )}
    </div>
  );
}

// ─── Training Log View ────────────────────────────────────────
function TrainingView() {
  const utils = trpc.useUtils();
  const { data: entries, isLoading } = trpc.student.listTraining.useQuery({});
  const createMut = trpc.student.createTraining.useMutation({
    onSuccess: () => utils.student.listTraining.invalidate(),
  });
  const updateMut = trpc.student.updateTraining.useMutation({
    onSuccess: () => utils.student.listTraining.invalidate(),
  });
  const deleteMut = trpc.student.deleteTraining.useMutation({
    onSuccess: () => utils.student.listTraining.invalidate(),
  });

  const blankForm = () => ({
    title: "", sessionDate: new Date().toISOString().split("T")[0],
    sessionType: "lesson" as const, notes: "", wentWell: "", needsImprovement: "", instructor: "",
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(blankForm());

  if (isLoading) return <SCard><SkeletonBar className="w-full h-32" /></SCard>;

  const startEdit = (entry: NonNullable<typeof entries>[0]) => {
    setEditingId(entry.id);
    setEditForm({
      title: entry.title,
    sessionDate: formatDate(entry.sessionDate),
      sessionType: entry.sessionType as typeof form.sessionType,
      notes: entry.notes ?? "",
      wentWell: entry.wentWell ?? "",
      needsImprovement: entry.needsImprovement ?? "",
      instructor: entry.instructor ?? "",
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm(blankForm()); };

  const saveEdit = () => {
    if (!editingId) return;
    updateMut.mutate({
      id: editingId,
      title: editForm.title.trim() || undefined,
      sessionDate: editForm.sessionDate || undefined,
      sessionType: editForm.sessionType || undefined,
      notes: editForm.notes.trim() || undefined,
      wentWell: editForm.wentWell.trim() || undefined,
      needsImprovement: editForm.needsImprovement.trim() || undefined,
      instructor: editForm.instructor.trim() || undefined,
    });
    setEditingId(null);
  };

  const TrainingForm = ({ f, setF, onSubmit, onCancel, submitLabel }: {
    f: typeof form;
    setF: (v: typeof form) => void;
    onSubmit: () => void;
    onCancel: () => void;
    submitLabel: string;
  }) => (
    <SCard>
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input placeholder="Session title *" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })}
            className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none" />
          <input type="date" value={f.sessionDate} onChange={(e) => setF({ ...f, sessionDate: e.target.value })}
            className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-indigo-500 focus:outline-none" />
          <select value={f.sessionType} onChange={(e) => setF({ ...f, sessionType: e.target.value as typeof f.sessionType })}
            className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-indigo-500 focus:outline-none">
            <option value="lesson">Lesson</option>
            <option value="practice">Practice</option>
            <option value="groundwork">Groundwork</option>
            <option value="theory">Theory</option>
            <option value="other">Other</option>
          </select>
          <input placeholder="Instructor (optional)" value={f.instructor} onChange={(e) => setF({ ...f, instructor: e.target.value })}
            className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <textarea placeholder="What went well?" value={f.wentWell} onChange={(e) => setF({ ...f, wentWell: e.target.value })} rows={2}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none resize-none" />
        <textarea placeholder="What needs improvement?" value={f.needsImprovement} onChange={(e) => setF({ ...f, needsImprovement: e.target.value })} rows={2}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none resize-none" />
        <textarea placeholder="Notes (optional)" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} rows={2}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none resize-none" />
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
          <button
            disabled={!f.title.trim() || createMut.isPending || updateMut.isPending}
            onClick={onSubmit}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
          >
            {(createMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : submitLabel}
          </button>
        </div>
      </div>
    </SCard>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SectionHeading icon={TrendingUp} title="Training Log" />
        <button onClick={() => { setShowAdd(!showAdd); cancelEdit(); }} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          <Plus className="w-4 h-4" /> Log Session
        </button>
      </div>

      {showAdd && (
        <TrainingForm
          f={form}
          setF={setForm}
          onSubmit={() => {
            createMut.mutate({
              title: form.title.trim(),
              sessionDate: form.sessionDate,
              sessionType: form.sessionType,
              notes: form.notes.trim() || undefined,
              wentWell: form.wentWell.trim() || undefined,
              needsImprovement: form.needsImprovement.trim() || undefined,
              instructor: form.instructor.trim() || undefined,
            });
            setForm(blankForm());
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
          submitLabel="Save Entry"
        />
      )}

      {(entries ?? []).length === 0 ? (
        <SCard>
          <div className="text-center py-8">
            <TrendingUp className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No training entries yet. Log your first session above.</p>
          </div>
        </SCard>
      ) : (
        <div className="space-y-3">
          {(entries ?? []).map((entry) => (
            editingId === entry.id ? (
              <TrainingForm
                key={entry.id}
                f={editForm}
                setF={setEditForm}
                onSubmit={saveEdit}
                onCancel={cancelEdit}
                submitLabel="Save Changes"
              />
            ) : (
              <SCard key={entry.id}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{entry.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(entry.sessionDate)} · {entry.sessionType}{entry.instructor ? ` · ${entry.instructor}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(entry)} className="text-gray-600 hover:text-indigo-400 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteMut.mutate({ id: entry.id })} className="text-gray-600 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {entry.wentWell && <p className="text-xs text-emerald-400 mb-1">✓ {entry.wentWell}</p>}
                {entry.needsImprovement && <p className="text-xs text-amber-400 mb-1">△ {entry.needsImprovement}</p>}
                {entry.notes && <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>}
              </SCard>
            )
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Study Hub View ───────────────────────────────────────────
const LEVEL_COLORS: Record<string, string> = {
  beginner: "#10b981",
  developing: "#6366f1",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

const CAT_COLORS: Record<string, string> = {
  riding: "#6366f1",
  care: "#10b981",
  theory: "#f59e0b",
  safety: "#ef4444",
};

const CAT_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  riding: GraduationCap,
  care: Heart,
  theory: Brain,
  safety: Shield,
};

function StudyHubView() {
  const { data: topics, isLoading } = trpc.student.listStudyTopics.useQuery({});
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);

  if (isLoading) return <SCard><SkeletonBar className="w-full h-32" /></SCard>;

  const levels = ["all", "beginner", "developing", "intermediate", "advanced"] as const;
  const filtered = levelFilter === "all"
    ? (topics ?? [])
    : (topics ?? []).filter((t) => t.difficulty === levelFilter);

  const categories = Array.from(new Set(filtered.map(t => t.category)));

  return (
    <div className="space-y-4">
      <SectionHeading icon={BookOpen} title="Study Hub" />

      {/* Level filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {levels.map((l) => (
          <button
            key={l}
            onClick={() => setLevelFilter(l)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              levelFilter === l
                ? "text-white border-transparent"
                : "border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20"
            }`}
            style={levelFilter === l ? { backgroundColor: LEVEL_COLORS[l] ?? STUDENT_ACCENT } : {}}
          >
            {l === "all" ? "All Topics" : l.charAt(0).toUpperCase() + l.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <SCard>
          <div className="text-center py-8">
            <BookOpen className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No topics at this level yet.</p>
          </div>
        </SCard>
      ) : (
        categories.map((cat) => {
          const CatIcon = CAT_ICONS[cat] ?? BookOpen;
          const catTopics = filtered.filter(t => t.category === cat);
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <CatIcon className="w-4 h-4" style={{ color: CAT_COLORS[cat] || STUDENT_ACCENT }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: CAT_COLORS[cat] || STUDENT_ACCENT }}>
                  {cat}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {catTopics.map((topic) => (
                  <div key={topic.id}>
                    <button
                      onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                      className="w-full text-left rounded-xl border p-4 transition-all hover:border-indigo-500/30"
                      style={{ backgroundColor: STUDENT_CARD, borderColor: STUDENT_BORDER }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white mb-1">{topic.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2">{topic.description}</p>
                        </div>
                        <span
                          className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium mt-0.5"
                          style={{ backgroundColor: `${LEVEL_COLORS[topic.difficulty] ?? STUDENT_ACCENT}18`, color: LEVEL_COLORS[topic.difficulty] ?? STUDENT_ACCENT }}
                        >
                          {topic.difficulty}
                        </span>
                      </div>
                    </button>
                    {expandedTopic === topic.id && topic.description && (
                      <div
                        className="mt-1 rounded-xl border p-4 text-sm text-gray-300"
                        style={{ backgroundColor: "#1a2240", borderColor: STUDENT_BORDER }}
                      >
                        <p className="text-sm text-gray-300 leading-relaxed">{topic.description}</p>
                        <div className="mt-3 pt-3 border-t border-white/[0.05]">
                          <p className="text-xs text-indigo-400 font-medium">Suggested next step</p>
                          <p className="text-xs text-gray-500 mt-1">Use the AI Tutor to explore this topic further or ask for a quiz.</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── AI Tutor View ────────────────────────────────────────────
const GUIDED_PROMPTS = [
  { label: "Explain a topic", icon: BookOpen, text: "Can you explain the basics of riding position and balance?" },
  { label: "Test my knowledge", icon: Trophy, text: "Test me on horse grooming — ask me 3 questions." },
  { label: "Care tips", icon: Heart, text: "What are the most important daily care checks for a horse?" },
  { label: "Give me hints", icon: Lightbulb, text: "Give me some helpful hints for improving my sitting trot." },
  { label: "Safety advice", icon: Shield, text: "What are the key safety rules I should follow in a stable yard?" },
  { label: "Improve my score", icon: TrendingUp, text: "How can I improve my horse's overall care score?" },
];

function AITutorView() {
  const { data: usage } = trpc.student.getTutorUsage.useQuery();
  const askMut = trpc.student.askTutor.useMutation();

  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);

  const handleAsk = (q?: string) => {
    const text = (q ?? question).trim();
    if (!text || askMut.isPending) return;
    setHistory((prev) => [...prev, { role: "user", content: text }]);
    setQuestion("");
    askMut.mutate(
      { question: text, conversationHistory: history.slice(-6) },
      {
        onSuccess: (res) => {
          setHistory((prev) => [...prev, { role: "assistant", content: res.answer }]);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeading icon={Brain} title="AI Tutor" />
        {usage && (
          <span className="text-xs text-gray-500">
            {usage.remaining}/{usage.dailyLimit} questions left today
          </span>
        )}
      </div>

      {/* Guided action prompts */}
      {history.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {GUIDED_PROMPTS.map((p) => {
            const PIcon = p.icon;
            return (
              <button
                key={p.label}
                onClick={() => handleAsk(p.text)}
                disabled={askMut.isPending}
                className="flex items-center gap-2 p-3 rounded-xl border text-left transition-all hover:border-indigo-500/40 hover:bg-indigo-500/5 disabled:opacity-50"
                style={{ borderColor: STUDENT_BORDER, backgroundColor: STUDENT_CARD }}
              >
                <PIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs text-gray-300 font-medium">{p.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <SCard>
        {/* Chat history */}
        <div className="space-y-3 mb-4 max-h-[420px] overflow-y-auto">
          {history.length === 0 && (
            <div className="text-center py-8">
              <Brain className="w-10 h-10 text-violet-400 mx-auto mb-3" />
              <p className="text-sm text-gray-400 mb-1">Ask me anything about horse care, riding, or equestrian studies.</p>
              <p className="text-xs text-gray-600">Try a guided prompt above or type your own question.</p>
            </div>
          )}
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white/[0.06] text-gray-300 border border-white/[0.06]"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {askMut.isPending && (
            <div className="flex justify-start">
              <div className="bg-white/[0.06] rounded-xl px-4 py-3 border border-white/[0.06]">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              </div>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setHistory([])}
            className="text-xs text-gray-600 hover:text-gray-400 mb-3 transition-colors"
          >
            Clear conversation
          </button>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ask a question about horses, riding, or care..."
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none"
            disabled={askMut.isPending}
          />
          <button
            onClick={() => handleAsk()}
            disabled={!question.trim() || askMut.isPending}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </SCard>
    </div>
  );
}

// ─── Progress View ────────────────────────────────────────────
const LEARNER_LEVELS = [
  { id: "beginner", label: "Beginner", description: "Learning the basics of horse care and riding", color: "#10b981" },
  { id: "developing", label: "Developing", description: "Building confidence and consistency", color: "#6366f1" },
  { id: "intermediate", label: "Intermediate", description: "Expanding skills and independent work", color: "#f59e0b" },
  { id: "advanced", label: "Advanced", description: "Refining technique and deeper knowledge", color: "#ef4444" },
] as const;

function ProgressView() {
  const utils = trpc.useUtils();
  const { data: progress, isLoading: progressLoading } = trpc.student.getProgress.useQuery();
  const { data: levelData, isLoading: levelLoading } = trpc.student.getLearnerLevel.useQuery();
  const { data: intelligence } = trpc.student.getProgressIntelligence.useQuery();
  const { data: competencies } = trpc.student.getMyCompetencies.useQuery();
  const { data: lessonReviewsData } = trpc.student.getMyLessonReviews.useQuery();
  const markReadMut = trpc.student.markReviewRead.useMutation({ onSuccess: () => utils.student.getMyLessonReviews.invalidate() });
  const setLevelMut = trpc.student.setLearnerLevel.useMutation({
    onSuccess: () => utils.student.getLearnerLevel.invalidate(),
  });
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  const skillColors: Record<string, string> = {
    riding_position: "#6366f1", aids_control: "#8b5cf6",
    grooming: "#10b981", feeding: "#f59e0b", tack: "#ec4899",
    safety: "#ef4444", health_awareness: "#06b6d4", behaviour: "#f97316",
  };

  const formatSkillName = (s: string) =>
    s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const currentLevel = LEARNER_LEVELS.find(l => l.id === levelData?.level) ?? LEARNER_LEVELS[0];

  const readinessColors: Record<string, string> = {
    ready_for_next_level: "#10b981",
    needs_support: "#f59e0b",
    focus_on_safety: "#ef4444",
    focus_on_riding: "#6366f1",
    focus_on_care: "#06b6d4",
  };
  const readinessLabels: Record<string, string> = {
    ready_for_next_level: "Ready for Next Level",
    needs_support: "Needs Support",
    focus_on_safety: "Focus on Safety",
    focus_on_riding: "Focus on Riding",
    focus_on_care: "Focus on Care",
  };

  const competencyStatusColors: Record<string, string> = {
    not_assessed: "#6b7280", in_progress: "#6366f1", achieved: "#10b981", needs_support: "#f59e0b",
  };

  if (progressLoading || levelLoading) return <SCard><SkeletonBar className="w-full h-32" /></SCard>;

  return (
    <div className="space-y-4">
      <SectionHeading icon={Target} title="Progress & Skills" />

      {/* Learner level card */}
      <SCard>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Your Learner Level</p>
          <button
            onClick={() => setShowLevelPicker(!showLevelPicker)}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <Edit2 className="w-3 h-3" /> Change
          </button>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: `${currentLevel.color}22`, border: `2px solid ${currentLevel.color}40` }}
          >
            <Star className="w-5 h-5" style={{ color: currentLevel.color }} />
          </div>
          <div>
            <p className="text-base font-bold text-white">{currentLevel.label}</p>
            <p className="text-xs text-gray-500">{currentLevel.description}</p>
          </div>
        </div>
        {showLevelPicker && (
          <div className="mt-4 pt-4 border-t border-white/[0.05] grid grid-cols-2 gap-2">
            {LEARNER_LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setLevelMut.mutate({ level: l.id });
                  setShowLevelPicker(false);
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  l.id === levelData?.level ? "border-transparent" : "border-white/[0.06] hover:border-white/20"
                }`}
                style={l.id === levelData?.level ? { backgroundColor: `${l.color}18`, borderColor: `${l.color}40` } : {}}
              >
                <p className="text-xs font-semibold text-white">{l.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{l.description}</p>
              </button>
            ))}
          </div>
        )}
      </SCard>

      {/* Skill progress */}
      {(progress ?? []).length === 0 ? (
        <SCard>
          <div className="text-center py-8">
            <Leaf className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-medium mb-1">Your learning journey starts here</p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Complete daily care tasks, log training sessions, and work through study topics
              to build your skill scores here.
            </p>
          </div>
        </SCard>
      ) : (
        <SCard>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Skill Areas</p>
          <div className="space-y-4">
            {(progress ?? []).map((skill) => (
              <div key={skill.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-white font-medium">{formatSkillName(skill.skillArea)}</span>
                  <span className="text-xs text-gray-500">Level {skill.level} · {skill.xp} XP</span>
                </div>
                {/* XP bar: 100 XP per level; modulo shows progress toward next level */}
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (skill.xp % 100))}%`,
                      backgroundColor: skillColors[skill.skillArea] || STUDENT_ACCENT,
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-600 mt-1">{skill.xp % 100 === 0 ? "Level up!" : `${100 - (skill.xp % 100)} XP to next level`}</p>
              </div>
            ))}
          </div>
        </SCard>
            )}

      {/* ── Progress Intelligence ── */}
      {intelligence && (
        <SCard>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Learning Intelligence</p>
            {intelligence.readinessStatus && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ color: readinessColors[intelligence.readinessStatus], backgroundColor: `${readinessColors[intelligence.readinessStatus]}18` }}>
                {readinessLabels[intelligence.readinessStatus]}
              </span>
            )}
          </div>

          {/* Lesson completion overview */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-white">Overall Lessons</span>
              <span className="text-xs text-gray-500">{intelligence.overallLessonPercent}%</span>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500 bg-indigo-500"
                style={{ width: `${intelligence.overallLessonPercent}%` }} />
            </div>
          </div>

          {/* Pathway breakdown */}
          {intelligence.pathwayProgress.map(pw => (
            <div key={pw.slug} className="mb-2">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-xs text-gray-400 capitalize">{pw.slug.replace(/-/g, " ")}</span>
                <span className="text-xs text-gray-600">{pw.completed}/{pw.total}</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pw.percent}%`, backgroundColor: pw.percent >= 100 ? "#10b981" : "#6366f1" }} />
              </div>
            </div>
          ))}

          {/* Weak areas */}
          {intelligence.weakAreas.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/[0.05]">
              <p className="text-xs text-gray-500 mb-1">Areas to Focus</p>
              <div className="flex flex-wrap gap-1.5">
                {intelligence.weakAreas.map(w => (
                  <span key={w} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{w}</span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended next */}
          {intelligence.recommendedNextPathway && (
            <div className="mt-3 pt-3 border-t border-white/[0.05]">
              <p className="text-xs text-gray-500 mb-1">Recommended Next</p>
              <p className="text-sm text-indigo-300 capitalize">{intelligence.recommendedNextPathway.replace(/-/g, " ")}</p>
            </div>
          )}
        </SCard>
      )}

      {/* ── Competencies ── */}
      {competencies && competencies.length > 0 && (
        <SCard>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Competencies</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {competencies.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.03]">
                <span className="text-xs text-white">{c.competencyKey.replace(/_/g, " ")}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize"
                  style={{ color: competencyStatusColors[c.status], backgroundColor: `${competencyStatusColors[c.status]}18` }}>
                  {c.status.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">{competencies.filter(c => c.status === "achieved").length}</p>
              <p className="text-[10px] text-gray-500">Achieved</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-indigo-400">{competencies.filter(c => c.status === "in_progress").length}</p>
              <p className="text-[10px] text-gray-500">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-400">{competencies.filter(c => c.status === "needs_support").length}</p>
              <p className="text-[10px] text-gray-500">Needs Support</p>
            </div>
          </div>
        </SCard>
      )}

      {/* ── Teacher Lesson Reviews ── */}
      {lessonReviewsData && lessonReviewsData.length > 0 && (
        <SCard>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Teacher Lesson Reviews</p>
          <div className="space-y-2">
            {lessonReviewsData.slice(0, 5).map(r => (
              <div key={r.id} className={`p-3 rounded-lg border transition-colors ${r.isRead ? "bg-white/[0.02] border-white/[0.04]" : "bg-indigo-500/[0.06] border-indigo-500/20"}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.reviewStatus === "satisfactory" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {r.reviewStatus === "satisfactory" ? "Satisfactory" : "Needs Improvement"}
                  </span>
                  <span className="text-xs text-gray-600">{r.lessonSlug}</span>
                </div>
                {r.feedback && <p className="text-xs text-gray-300">{r.feedback}</p>}
                {r.recommendedNextLesson && <p className="text-xs text-indigo-400 mt-1">Next: {r.recommendedNextLesson}</p>}
                {!r.isRead && (
                  <button onClick={() => markReadMut.mutate({ reviewId: r.id })}
                    className="text-xs text-gray-500 hover:text-gray-300 mt-1 transition-colors">
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        </SCard>
      )}
    </div>
  );
}

// ─── Scenario Training View ───────────────────────────────────
const LEVEL_DISPLAY: Record<string, { label: string; color: string }> = {
  beginner: { label: "Beginner", color: "#10b981" },
  developing: { label: "Developing", color: "#6366f1" },
  intermediate: { label: "Intermediate", color: "#f59e0b" },
  advanced: { label: "Advanced", color: "#ef4444" },
};

type AnswerResult = {
  isCorrect: boolean;
  selectedChoice: { id: string; text: string; isCorrect: boolean; explanation: string };
  allChoices: { id: string; text: string; isCorrect: boolean; explanation: string }[];
  learningTakeaway: string;
};

function ScenarioCard({
  scenario,
  onAnswer,
}: {
  scenario: { id: string; title: string; level: string; category: string; prompt: string; choices: { id: string; text: string }[] };
  onAnswer: (scenarioId: string, choiceId: string) => void;
}) {
  const checkMut = trpc.student.checkScenarioAnswer.useMutation();
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);

  const levelInfo = LEVEL_DISPLAY[scenario.level] ?? { label: scenario.level, color: STUDENT_ACCENT };

  const handleAnswer = (choiceId: string) => {
    if (result) return; // already answered
    setSelected(choiceId);
    checkMut.mutate(
      { scenarioId: scenario.id, choiceId },
      {
        onSuccess: (res) => {
          setResult(res as AnswerResult);
          onAnswer(scenario.id, choiceId);
        },
      },
    );
  };

  const resetScenario = () => { setSelected(null); setResult(null); };

  return (
    <SCard className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${levelInfo.color}18`, color: levelInfo.color }}
            >
              {levelInfo.label}
            </span>
            <span className="text-[10px] text-gray-600 font-medium">{scenario.category}</span>
          </div>
          <h3 className="text-base font-semibold text-white">{scenario.title}</h3>
        </div>
        {result && (
          <button onClick={resetScenario} className="text-xs text-gray-500 hover:text-gray-300 shrink-0 transition-colors">
            Try again
          </button>
        )}
      </div>

      {/* Prompt */}
      <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-4">
        <p className="text-sm text-gray-300 leading-relaxed">{scenario.prompt}</p>
      </div>

      {/* Choices */}
      <div className="space-y-2">
        {scenario.choices.map((choice) => {
          const isSelected = selected === choice.id;
          const isRevealed = !!result;
          const resultChoice = result?.allChoices.find(c => c.id === choice.id);
          const isCorrectAnswer = resultChoice?.isCorrect ?? false;

          let borderColor = STUDENT_BORDER;
          let bgColor = "transparent";
          let textColor = "text-gray-300";

          if (isRevealed) {
            if (isCorrectAnswer) {
              borderColor = "#10b981";
              bgColor = "rgba(16,185,129,0.08)";
              textColor = "text-emerald-300";
            } else if (isSelected && !isCorrectAnswer) {
              borderColor = "#ef4444";
              bgColor = "rgba(239,68,68,0.06)";
              textColor = "text-red-300";
            } else {
              textColor = "text-gray-500";
            }
          }

          return (
            <button
              key={choice.id}
              onClick={() => handleAnswer(choice.id)}
              disabled={!!result || checkMut.isPending}
              className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-all ${textColor} ${
                !result ? "hover:border-indigo-500/40 hover:bg-indigo-500/5" : ""
              } disabled:cursor-not-allowed`}
              style={{ borderColor, backgroundColor: bgColor }}
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{ borderColor, color: isRevealed ? (isCorrectAnswer ? "#10b981" : isSelected ? "#ef4444" : "transparent") : "inherit" }}>
                  {choice.id.toUpperCase()}
                </span>
                <span>{choice.text}</span>
                {isRevealed && isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-auto mt-0.5" />}
                {isRevealed && isSelected && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-auto mt-0.5" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Result reveal */}
      {result && (
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/[0.05] p-4 space-y-3">
          <div className="flex items-center gap-2">
            {result.isCorrect
              ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              : <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            }
            <p className={`text-sm font-semibold ${result.isCorrect ? "text-emerald-300" : "text-red-300"}`}>
              {result.isCorrect ? "Correct!" : "Not quite right."}
            </p>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">{result.selectedChoice.explanation}</p>
          <div className="pt-2 border-t border-white/[0.05]">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/80 leading-relaxed">{result.learningTakeaway}</p>
            </div>
          </div>
        </div>
      )}
    </SCard>
  );
}

function ScenarioTrainingView() {
  const { data: levelData } = trpc.student.getLearnerLevel.useQuery();
  const currentLevel = levelData?.level ?? "beginner";

  const [levelFilter, setLevelFilter] = useState<string>(currentLevel);
  const { data: scenarios, isLoading } = trpc.student.listScenarios.useQuery(
    { level: levelFilter as "beginner" | "developing" | "intermediate" | "advanced" },
  );
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const handleAnswered = (id: string) => {
    setCompletedIds((prev) => new Set(Array.from(prev).concat(id)));
  };

  if (isLoading) return <SCard><SkeletonBar className="w-full h-32" /></SCard>;

  const levels = ["beginner", "developing", "intermediate", "advanced"] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeading icon={Zap} title="Scenario Training" />
        {completedIds.size > 0 && (
          <span className="text-xs text-emerald-400">{completedIds.size} answered this session</span>
        )}
      </div>

      <p className="text-sm text-gray-500 -mt-2">
        Real-world decision scenarios to develop your equestrian judgement. Work through situations you'll face in the yard, stable, and arena.
      </p>

      {/* Level filter */}
      <div className="flex gap-2 flex-wrap">
        {levels.map((l) => {
          const info = LEVEL_DISPLAY[l];
          return (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                levelFilter === l ? "text-white border-transparent" : "border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20"
              }`}
              style={levelFilter === l ? { backgroundColor: info.color } : {}}
            >
              {info.label}
            </button>
          );
        })}
      </div>

      {(scenarios ?? []).length === 0 ? (
        <SCard>
          <div className="text-center py-8">
            <Zap className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No scenarios available at this level.</p>
          </div>
        </SCard>
      ) : (
        <div className="space-y-4">
          {(scenarios ?? []).map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onAnswer={handleAnswered}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Lessons View ─────────────────────────────────────────────
const PATHWAY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart, Eye, Shield, BookOpen, Target, TrendingUp,
};

function LessonsView() {
  const { data: pathways, isLoading: loadingPathways } = trpc.student.listLessonPathways.useQuery();
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const levelParam = levelFilter !== "all" ? { level: levelFilter as "beginner" | "developing" | "intermediate" | "advanced" } : {};
  const listInput = selectedPathway ? { pathwaySlug: selectedPathway, ...levelParam } : { ...levelParam };

  const { data: lessons, isLoading: loadingLessons } = trpc.student.listLessons.useQuery(
    listInput,
    { enabled: true },
  );

  const { data: lessonDetail, isLoading: loadingDetail } = trpc.student.getLesson.useQuery(
    { slug: selectedLesson! },
    { enabled: !!selectedLesson },
  );

  const { data: progress } = trpc.student.getLessonProgress.useQuery();
  const { data: assignedLessons } = trpc.student.getAssignedLessons.useQuery();
  const { data: lessonReviews } = trpc.student.getMyLessonReviews.useQuery();
  const completeMutation = trpc.student.completeLesson.useMutation();
  const utils = trpc.useUtils();

  const completedSlugs = new Set((progress ?? []).map((p) => p.lessonSlug));

  const handleComplete = async () => {
    if (!lessonDetail) return;
    let score: number | undefined;
    if (quizMode && quizSubmitted && lessonDetail.knowledgeCheck) {
      const checks = lessonDetail.knowledgeCheck as Array<{ correctIndex: number }>;
      const correct = checks.filter((q, i) => quizAnswers[i] === q.correctIndex).length;
      score = Math.round((correct / checks.length) * 100);
    }
    await completeMutation.mutateAsync({
      lessonSlug: lessonDetail.slug,
      pathwaySlug: lessonDetail.pathwaySlug,
      level: lessonDetail.level as any,
      score,
    });
    utils.student.getLessonProgress.invalidate();
  };

  const levelColors: Record<string, string> = {
    beginner: "bg-emerald-500/20 text-emerald-400",
    developing: "bg-blue-500/20 text-blue-400",
    intermediate: "bg-amber-500/20 text-amber-400",
    advanced: "bg-rose-500/20 text-rose-400",
  };

  // ── Lesson detail view ──
  if (selectedLesson && lessonDetail) {
    const checks = (lessonDetail.knowledgeCheck ?? []) as Array<{
      question: string; options: string[]; correctIndex: number; explanation: string;
    }>;
    const objectives = (lessonDetail.objectives ?? []) as string[];
    const keyPoints = (lessonDetail.keyPoints ?? []) as string[];
    const commonMistakes = (lessonDetail.commonMistakes ?? []) as string[];
    const aiPrompts = (lessonDetail.aiTutorPrompts ?? []) as string[];
    const linkedCompetencies = (lessonDetail.linkedCompetencies ?? []) as string[];
    const isCompleted = completedSlugs.has(lessonDetail.slug);

    return (
      <div className="space-y-6">
        {/* Back button */}
        <button onClick={() => { setSelectedLesson(null); setQuizMode(false); setQuizAnswers({}); setQuizSubmitted(false); }}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to lessons
        </button>

        {/* Lesson header */}
        <div className="rounded-xl p-6" style={{ background: STUDENT_CARD, border: `1px solid ${STUDENT_BORDER}` }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[lessonDetail.level] ?? ""}`}>
                  {lessonDetail.level}
                </span>
                <span className="text-xs text-gray-500">{lessonDetail.category}</span>
                {isCompleted && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>}
              </div>
              <h2 className="text-xl font-bold text-white">{lessonDetail.title}</h2>
            </div>
            {!isCompleted && (
              <button onClick={handleComplete} disabled={completeMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50">
                {completeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark Complete"}
              </button>
            )}
          </div>
        </div>

        {/* Objectives */}
        {objectives.length > 0 && (
          <div className="rounded-xl p-5" style={{ background: STUDENT_CARD, border: `1px solid ${STUDENT_BORDER}` }}>
            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> Learning Objectives
            </h3>
            <ul className="space-y-2">
              {objectives.map((obj, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-indigo-400 mt-1 shrink-0" /> {obj}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Competency mapping — "This lesson helps you achieve" */}
        {linkedCompetencies.length > 0 && (
          <div className="rounded-xl p-4 border" style={{ background: "rgba(16,185,129,0.05)", borderColor: "rgba(16,185,129,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <Award className="w-3.5 h-3.5" /> This lesson helps you achieve
            </p>
            <div className="flex flex-wrap gap-2">
              {linkedCompetencies.map((key) => (
                <span key={key} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium capitalize">
                  {key.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="rounded-xl p-5" style={{ background: STUDENT_CARD, border: `1px solid ${STUDENT_BORDER}` }}>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-line leading-relaxed">
            {lessonDetail.content}
          </div>
        </div>

        {/* Key points */}
        {keyPoints.length > 0 && (
          <div className="rounded-xl p-5" style={{ background: STUDENT_CARD, border: `1px solid ${STUDENT_BORDER}` }}>
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" /> Key Points
            </h3>
            <ul className="space-y-2">
              {keyPoints.map((kp, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-1 shrink-0" /> {kp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety note */}
        {lessonDetail.safetyNote && (
          <div className="rounded-xl p-5 bg-amber-500/10 border border-amber-500/20">
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Safety Note
            </h3>
            <p className="text-sm text-amber-200/80">{lessonDetail.safetyNote}</p>
          </div>
        )}

        {/* Practical application */}
        {lessonDetail.practicalApplication && (
          <div className="rounded-xl p-5" style={{ background: STUDENT_CARD, border: `1px solid ${STUDENT_BORDER}` }}>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Practical Application
            </h3>
            <p className="text-sm text-gray-300">{lessonDetail.practicalApplication}</p>
          </div>
        )}

        {/* Common mistakes */}
        {commonMistakes.length > 0 && (
          <div className="rounded-xl p-5" style={{ background: STUDENT_CARD, border: `1px solid ${STUDENT_BORDER}` }}>
            <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Common Mistakes
            </h3>
            <ul className="space-y-2">
              {commonMistakes.map((m, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <XCircle className="w-3 h-3 text-rose-400 mt-1 shrink-0" /> {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Knowledge check */}
        {checks.length > 0 && (
          <div className="rounded-xl p-5" style={{ background: STUDENT_CARD, border: `1px solid ${STUDENT_BORDER}` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4" /> Knowledge Check
              </h3>
              {!quizMode && (
                <button onClick={() => setQuizMode(true)} className="text-xs px-3 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 transition-colors">
                  Take Quiz
                </button>
              )}
            </div>
            {quizMode ? (
              <div className="space-y-5">
                {checks.map((q, qi) => (
                  <div key={qi} className="space-y-2">
                    <p className="text-sm text-white font-medium">{qi + 1}. {q.question}</p>
                    <div className="grid gap-2">
                      {q.options.map((opt, oi) => {
                        const selected = quizAnswers[qi] === oi;
                        const isCorrect = quizSubmitted && oi === q.correctIndex;
                        const isWrong = quizSubmitted && selected && oi !== q.correctIndex;
                        return (
                          <button key={oi} disabled={quizSubmitted}
                            onClick={() => setQuizAnswers((prev) => ({ ...prev, [qi]: oi }))}
                            className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                              isCorrect ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" :
                              isWrong ? "border-rose-500 bg-rose-500/20 text-rose-300" :
                              selected ? "border-indigo-500 bg-indigo-500/20 text-indigo-300" :
                              "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
                            }`}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <p className="text-xs text-gray-400 mt-1 pl-2">{q.explanation}</p>
                    )}
                  </div>
                ))}
                {!quizSubmitted ? (
                  <button onClick={() => setQuizSubmitted(true)} disabled={Object.keys(quizAnswers).length < checks.length}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50">
                    Submit Answers
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-300">
                      Score: {checks.filter((q, i) => quizAnswers[i] === q.correctIndex).length}/{checks.length}
                    </p>
                    {!isCompleted && (
                      <button onClick={handleComplete} disabled={completeMutation.isPending}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-50">
                        {completeMutation.isPending ? "Saving..." : "Complete with Score"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{checks.length} questions available. Take the quiz to test your knowledge.</p>
            )}
          </div>
        )}

        {/* AI Tutor integration — lesson-aware prompts */}
        {aiPrompts.length > 0 && (
          <div className="rounded-xl p-5" style={{ background: STUDENT_CARD, border: `1px solid ${STUDENT_BORDER}` }}>
            <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Ask the AI Tutor
            </h3>
            <div className="grid gap-2">
              {aiPrompts.map((prompt, i) => (
                <p key={i} className="text-sm text-gray-400 italic flex items-start gap-2">
                  <Brain className="w-3 h-3 text-violet-400 mt-1 shrink-0" /> &ldquo;{prompt}&rdquo;
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Loading states ──
  if (selectedLesson && loadingDetail) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  // ── Pathway list / lesson list ──
  const filteredLessons = lessons ?? [];
  const pathwayObj = pathways?.find((p) => p.slug === selectedPathway);
  const totalLessons = filteredLessons.length;
  const completedCount = filteredLessons.filter((l) => completedSlugs.has(l.slug)).length;

  return (
    <div className="space-y-6">
      {/* Pathway header / breadcrumb */}
      {selectedPathway && pathwayObj ? (
        <div className="space-y-3">
          <button onClick={() => setSelectedPathway(null)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /> All Pathways
          </button>
          <div className="rounded-xl p-5" style={{ background: STUDENT_CARD, border: `1px solid ${STUDENT_BORDER}` }}>
            <h2 className="text-lg font-bold text-white">{pathwayObj.title}</h2>
            <p className="text-sm text-gray-400 mt-1">{pathwayObj.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs text-gray-500">{totalLessons} lessons</span>
              <span className="text-xs text-emerald-400">{completedCount} completed</span>
              {totalLessons > 0 && (
                <div className="flex-1 max-w-[200px] h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(completedCount / totalLessons) * 100}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-5" style={{ background: STUDENT_CARD, border: `1px solid ${STUDENT_BORDER}` }}>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Library className="w-5 h-5 text-indigo-400" /> Learning Pathways
          </h2>
          <p className="text-sm text-gray-400 mt-1">Structured courses covering all areas of horse care, riding, and equestrian theory.</p>
        </div>
      )}

      {/* Level filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "beginner", "developing", "intermediate", "advanced"].map((lvl) => (
          <button key={lvl} onClick={() => setLevelFilter(lvl)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              levelFilter === lvl
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}>
            {lvl === "all" ? "All Levels" : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
          </button>
        ))}
      </div>

      {/* Assigned lessons panel */}
      {!selectedPathway && !selectedLesson && (assignedLessons ?? []).length > 0 && (
        <div className="rounded-xl p-5" style={{ background: STUDENT_CARD, border: `1px solid ${STUDENT_BORDER}` }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Assigned to You
          </p>
          <div className="space-y-2">
            {(assignedLessons ?? []).map(a => (
              <div key={a.id} className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${
                a.isOverdue ? "border-rose-500/20 bg-rose-500/[0.04]" : "border-white/[0.05] bg-white/[0.02]"
              }`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${a.assignmentType === "lesson" ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                      {a.assignmentType === "lesson" ? "Lesson" : "Pathway"}
                    </span>
                    <span className="text-sm text-white font-medium truncate">{a.lessonSlug ?? a.pathwaySlug}</span>
                    {a.isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                  {a.dueDate && (
                    <p className={`text-xs mt-0.5 ${a.isOverdue ? "text-rose-400" : "text-gray-500"}`}>
                      Due {String(a.dueDate).slice(0, 10)}{a.isOverdue ? " — Overdue" : ""}
                    </p>
                  )}
                  {a.instructions && <p className="text-xs text-gray-500 mt-0.5 italic">{a.instructions}</p>}
                </div>
                {!a.isCompleted && a.assignmentType === "lesson" && a.lessonSlug && (
                  <button onClick={() => setSelectedLesson(a.lessonSlug!)}
                    className="text-xs px-3 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 shrink-0 transition-colors">
                    Open
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unread lesson reviews panel */}
      {!selectedPathway && !selectedLesson && (lessonReviews ?? []).some(r => !r.isRead) && (
        <div className="rounded-xl p-4" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <p className="text-xs font-semibold text-indigo-400 mb-2 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" /> New Teacher Feedback
          </p>
          {(lessonReviews ?? []).filter(r => !r.isRead).slice(0, 3).map(r => (
            <div key={r.id} className="text-xs text-gray-300 mb-1">
              <span className="font-medium">{r.lessonSlug}</span>: {r.feedback?.slice(0, 80)}
              {(r.feedback?.length ?? 0) > 80 ? "…" : ""}
            </div>
          ))}
        </div>
      )}

      {/* Pathway cards (when no pathway selected) */}
      {!selectedPathway && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingPathways ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : (
            pathways?.map((pw) => {
              const pwLessons = (lessons ?? []).filter((l) => l.pathwaySlug === pw.slug);
              const pwCompleted = pwLessons.filter((l) => completedSlugs.has(l.slug)).length;
              return (
                <button key={pw.slug} onClick={() => setSelectedPathway(pw.slug)}
                  className="text-left rounded-xl p-5 transition-all hover:scale-[1.01] hover:border-indigo-500/40"
                  style={{ background: STUDENT_CARD, border: `1px solid ${STUDENT_BORDER}` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Library className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{pw.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{pw.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{pwLessons.length} lessons</span>
                    {pwLessons.length > 0 && (
                      <>
                        <span className="text-xs text-emerald-400">{pwCompleted} done</span>
                        <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(pwCompleted / pwLessons.length) * 100}%` }} />
                        </div>
                      </>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Lesson list (when pathway selected) */}
      {selectedPathway && (
        <div className="space-y-3">
          {loadingLessons ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">No lessons found for this filter.</div>
          ) : (
            filteredLessons.map((lesson, idx) => {
              const isComplete = completedSlugs.has(lesson.slug);
              return (
                <button key={lesson.slug} onClick={() => setSelectedLesson(lesson.slug)}
                  className="w-full text-left rounded-xl p-4 flex items-center gap-4 transition-all hover:border-indigo-500/40"
                  style={{ background: STUDENT_CARD, border: `1px solid ${STUDENT_BORDER}` }}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isComplete ? "bg-emerald-500/20" : "bg-gray-800"
                  }`}>
                    {isComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-xs text-gray-500 font-mono">{idx + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{lesson.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${levelColors[lesson.level] ?? ""}`}>
                        {lesson.level}
                      </span>
                      <span className="text-[10px] text-gray-500">{lesson.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 shrink-0" />
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function StudentDashboard() {
  const { user } = useAuth();
  const rawName = user?.name?.trim() ?? "";
  const firstName = rawName.split(/\s+/)[0] || "Student";
  const [activeView, setActiveView] = useState<ActiveView>("overview");

  const viewTitle: Record<ActiveView, string> = {
    "overview": "Student Dashboard",
    "virtual-horse": "My Virtual Horse",
    "tasks": "Tasks & Care",
    "training": "Training Log",
    "lessons": "Lessons",
    "study-hub": "Study Hub",
    "ai-tutor": "AI Tutor",
    "progress": "Progress",
    "scenarios": "Scenario Training",
  };

  return (
    <StudentDashboardLayout activeView={activeView} onNavigate={setActiveView}>
      <div className="min-h-screen relative" style={{ backgroundColor: STUDENT_BG }}>
        {/* Subtle background depth — student identity */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/[0.04] blur-[120px]" />
          <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-violet-500/[0.03] blur-[100px]" />
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-cyan-500/[0.02] blur-[80px]" />
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* ─── Header ───────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeView === "overview" ? `Welcome back, ${firstName}` : viewTitle[activeView]}
                </h1>
                <p className="text-sm text-gray-500">
                  {activeView === "overview" ? "Student Dashboard · Your learning journey" : "Student Dashboard"}
                </p>
              </div>
            </div>
          </section>

          {/* ─── Active View ──────────────────────────────── */}
          {activeView === "overview" && <OverviewView onNavigate={setActiveView} />}
          {activeView === "virtual-horse" && <VirtualHorseView />}
          {activeView === "tasks" && <TasksView />}
          {activeView === "training" && <TrainingView />}
          {activeView === "lessons" && <LessonsView />}
          {activeView === "study-hub" && <StudyHubView />}
          {activeView === "ai-tutor" && <AITutorView />}
          {activeView === "progress" && <ProgressView />}
          {activeView === "scenarios" && <ScenarioTrainingView />}
        </div>
      </div>
    </StudentDashboardLayout>
  );
}
