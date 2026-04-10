// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
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
  ArrowLeft,
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

// ─── Types for active view ────────────────────────────────────
type ActiveView =
  | "overview"
  | "virtual-horse"
  | "tasks"
  | "training"
  | "study-hub"
  | "ai-tutor"
  | "progress";

// ─── Sub-components ───────────────────────────────────────────

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
  const deleteMut = trpc.student.deleteTraining.useMutation({
    onSuccess: () => utils.student.listTraining.invalidate(),
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "", sessionDate: new Date().toISOString().split("T")[0],
    sessionType: "lesson" as const, notes: "", wentWell: "", needsImprovement: "", instructor: "",
  });

  if (isLoading) return <SCard><SkeletonBar className="w-full h-32" /></SCard>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SectionHeading icon={TrendingUp} title="Training Log" />
        <button onClick={() => setShowAdd(!showAdd)} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          <Plus className="w-4 h-4" /> Log Session
        </button>
      </div>

      {showAdd && (
        <SCard>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Session title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none" />
              <input type="date" value={form.sessionDate} onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
                className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-indigo-500 focus:outline-none" />
              <select value={form.sessionType} onChange={(e) => setForm({ ...form, sessionType: e.target.value as typeof form.sessionType })}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-indigo-500 focus:outline-none">
                <option value="lesson">Lesson</option>
                <option value="practice">Practice</option>
                <option value="groundwork">Groundwork</option>
                <option value="theory">Theory</option>
                <option value="other">Other</option>
              </select>
              <input placeholder="Instructor (optional)" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <textarea placeholder="What went well?" value={form.wentWell} onChange={(e) => setForm({ ...form, wentWell: e.target.value })} rows={2}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none resize-none" />
            <textarea placeholder="What needs improvement?" value={form.needsImprovement} onChange={(e) => setForm({ ...form, needsImprovement: e.target.value })} rows={2}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none resize-none" />
            <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:outline-none resize-none" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button
                disabled={!form.title.trim() || createMut.isPending}
                onClick={() => {
                  createMut.mutate({
                    title: form.title.trim(),
                    sessionDate: form.sessionDate,
                    sessionType: form.sessionType,
                    notes: form.notes.trim() || undefined,
                    wentWell: form.wentWell.trim() || undefined,
                    needsImprovement: form.needsImprovement.trim() || undefined,
                    instructor: form.instructor.trim() || undefined,
                  });
                  setForm({ title: "", sessionDate: new Date().toISOString().split("T")[0], sessionType: "lesson", notes: "", wentWell: "", needsImprovement: "", instructor: "" });
                  setShowAdd(false);
                }}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Entry"}
              </button>
            </div>
          </div>
        </SCard>
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
            <SCard key={entry.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">{entry.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{String(entry.sessionDate)} · {entry.sessionType}{entry.instructor ? ` · ${entry.instructor}` : ""}</p>
                </div>
                <button onClick={() => deleteMut.mutate({ id: entry.id })} className="text-gray-600 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {entry.wentWell && <p className="text-xs text-emerald-400 mb-1">✓ {entry.wentWell}</p>}
              {entry.needsImprovement && <p className="text-xs text-amber-400 mb-1">△ {entry.needsImprovement}</p>}
              {entry.notes && <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>}
            </SCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Study Hub View ───────────────────────────────────────────
function StudyHubView() {
  const { data: topics, isLoading } = trpc.student.listStudyTopics.useQuery({});

  if (isLoading) return <SCard><SkeletonBar className="w-full h-32" /></SCard>;

  const categories = Array.from(new Set((topics ?? []).map(t => t.category)));
  const catColors: Record<string, string> = {
    riding: "#6366f1", care: "#10b981", theory: "#f59e0b", safety: "#ef4444",
  };

  return (
    <div className="space-y-4">
      <SectionHeading icon={BookOpen} title="Study Hub" />

      {categories.length === 0 ? (
        <SCard>
          <div className="text-center py-8">
            <BookOpen className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Study topics are being prepared. Check back soon.</p>
          </div>
        </SCard>
      ) : (
        categories.map((cat) => (
          <div key={cat}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: catColors[cat] || STUDENT_ACCENT }}>
              {cat}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(topics ?? []).filter(t => t.category === cat).map((topic) => (
                <SCard key={topic.id} className="hover:border-indigo-500/30 transition-colors cursor-default">
                  <h4 className="text-sm font-semibold text-white mb-1">{topic.title}</h4>
                  <p className="text-xs text-gray-500">{topic.description}</p>
                  <span className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium">
                    {topic.difficulty}
                  </span>
                </SCard>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── AI Tutor View ────────────────────────────────────────────
function AITutorView() {
  const { data: usage } = trpc.student.getTutorUsage.useQuery();
  const askMut = trpc.student.askTutor.useMutation();

  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);

  const handleAsk = () => {
    if (!question.trim() || askMut.isPending) return;
    const q = question.trim();
    setHistory((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    askMut.mutate(
      { question: q, conversationHistory: history.slice(-6) },
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
            {usage.remaining}/{usage.dailyLimit} questions remaining today
          </span>
        )}
      </div>

      <SCard>
        {/* Chat history */}
        <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
          {history.length === 0 && (
            <div className="text-center py-8">
              <Brain className="w-10 h-10 text-violet-400 mx-auto mb-3" />
              <p className="text-sm text-gray-400 mb-1">Ask me anything about horse care, riding, or equestrian studies.</p>
              <p className="text-xs text-gray-600">I'm here to help you learn — try questions like "How do I groom a horse?" or "What are the aids for trotting?"</p>
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
            onClick={handleAsk}
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
function ProgressView() {
  const { data: progress, isLoading } = trpc.student.getProgress.useQuery();

  if (isLoading) return <SCard><SkeletonBar className="w-full h-32" /></SCard>;

  const skillColors: Record<string, string> = {
    riding_position: "#6366f1", aids_control: "#8b5cf6",
    grooming: "#10b981", feeding: "#f59e0b", tack: "#ec4899",
    safety: "#ef4444", health_awareness: "#06b6d4", behaviour: "#f97316",
  };

  const formatSkillName = (s: string) =>
    s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-4">
      <SectionHeading icon={Target} title="Progress & Skills" />

      {(progress ?? []).length === 0 ? (
        <SCard>
          <div className="text-center py-8">
            <Target className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Complete tasks and training sessions to start tracking your progress.
            </p>
          </div>
        </SCard>
      ) : (
        <SCard>
          <div className="space-y-4">
            {(progress ?? []).map((skill) => (
              <div key={skill.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-white font-medium">{formatSkillName(skill.skillArea)}</span>
                  <span className="text-xs text-gray-500">Level {skill.level} · {skill.xp} XP</span>
                </div>
                {/* XP bar: 100 XP per level; modulo shows progress toward next level */}
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (skill.xp % 100))}%`,
                      backgroundColor: skillColors[skill.skillArea] || STUDENT_ACCENT,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SCard>
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
    "study-hub": "Study Hub",
    "ai-tutor": "AI Tutor",
    "progress": "Progress",
  };

  return (
    <DashboardLayout>
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
              {activeView !== "overview" && (
                <button
                  onClick={() => setActiveView("overview")}
                  className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-400" />
                </button>
              )}
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
          {activeView === "study-hub" && <StudyHubView />}
          {activeView === "ai-tutor" && <AITutorView />}
          {activeView === "progress" && <ProgressView />}
        </div>
      </div>
    </DashboardLayout>
  );
}
