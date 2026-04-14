// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import TeacherDashboardLayout, { type TeacherView } from "@/components/TeacherDashboardLayout";
import {
  Users,
  UsersRound,
  ClipboardList,
  MessageSquare,
  FileText,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  ArrowLeft,
  Edit2,
  Trash2,
  Star,
  Lightbulb,
  Library,
  BookOpen,
  Award,
  AlertCircle,
  Calendar,
  Shield,
  ChevronLeft,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────
const TEACHER_ACCENT = "#10b981";
const T_CARD = "bg-[#111827] border border-white/[0.06] rounded-xl";

// ── Shared sub-components ──────────────────────────────────────────────────

function TCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`${T_CARD} p-5 ${className}`}>{children}</div>;
}

function THeading({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-5 h-5 text-emerald-400" />
      <h2 className="text-base font-semibold text-white">{title}</h2>
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <TCard>
      <div className="text-center py-8">
        <Icon className="w-8 h-8 text-gray-600 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-400 mb-1">{title}</p>
        <p className="text-xs text-gray-600 max-w-xs mx-auto">{body}</p>
      </div>
    </TCard>
  );
}

function StatCard({ label, value, color = "#10b981" }: { label: string; value: number | string; color?: string }) {
  return (
    <div className={T_CARD + " p-4"}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <div className="mt-2 h-0.5 rounded-full" style={{ backgroundColor: color, width: "40%" }} />
    </div>
  );
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: "#10b981",
  developing: "#6366f1",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

const FEEDBACK_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  good: { label: "Good", color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  needs_improvement: { label: "Needs Improvement", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  urgent: { label: "Urgent Attention", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  general: { label: "General", color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
};

// ── Overview View ──────────────────────────────────────────────────────────

function OverviewView({ onNavigate }: { onNavigate: (v: TeacherView) => void }) {
  const { data, isLoading } = trpc.teacher.getTeacherOverview.useQuery();

  if (isLoading) return <TCard><Loader2 className="w-5 h-5 animate-spin text-emerald-400 mx-auto" /></TCard>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Good to see you</h2>
        <p className="text-sm text-gray-500 mt-0.5">Here's what's happening across your classes.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Groups" value={data?.totalGroups ?? 0} color={TEACHER_ACCENT} />
        <StatCard label="Students" value={data?.totalStudents ?? 0} color="#6366f1" />
        <StatCard label="Pending Tasks" value={data?.pendingAssignedTasks ?? 0} color="#f59e0b" />
        <StatCard label="Feedback Sent" value={data?.recentFeedback?.length ?? 0} color="#ec4899" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { icon: UsersRound, label: "Manage Groups", view: "groups" as TeacherView },
          { icon: Users, label: "View Students", view: "students" as TeacherView },
          { icon: ClipboardList, label: "Assign Tasks", view: "tasks" as TeacherView },
          { icon: MessageSquare, label: "Give Feedback", view: "feedback" as TeacherView },
          { icon: FileText, label: "View Reports", view: "reports" as TeacherView },
        ].map((a) => {
          const AIcon = a.icon;
          return (
            <button
              key={a.view}
              onClick={() => onNavigate(a.view)}
              className="flex items-center gap-3 p-4 min-h-[56px] rounded-xl border border-white/[0.06] bg-[#111827] text-left hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
            >
              <AIcon className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-sm font-medium text-white">{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recent feedback */}
      {(data?.recentFeedback?.length ?? 0) > 0 && (
        <TCard>
          <THeading icon={MessageSquare} title="Recent Feedback Sent" />
          <div className="space-y-2 mt-3">
            {data!.recentFeedback.slice(0, 4).map((f) => {
              const style = FEEDBACK_STYLES[f.feedbackType] ?? FEEDBACK_STYLES.general;
              return (
                <div key={f.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: style.bg, borderLeft: `3px solid ${style.color}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/80 line-clamp-2">{f.comment}</p>
                    <p className="text-[10px] mt-1" style={{ color: style.color }}>{style.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </TCard>
      )}
    </div>
  );
}

// ── Groups View ────────────────────────────────────────────────────────────

function GroupsView() {
  const utils = trpc.useUtils();
  const { data: groups, isLoading } = trpc.teacher.listGroups.useQuery();
  const createMut = trpc.teacher.createGroup.useMutation({ onSuccess: () => utils.teacher.listGroups.invalidate() });
  const deleteMut = trpc.teacher.deleteGroup.useMutation({ onSuccess: () => utils.teacher.listGroups.invalidate() });
  const addMemberMut = trpc.teacher.addGroupMember.useMutation({ onSuccess: () => utils.teacher.listGroupMembers.invalidate() });
  const removeMemberMut = trpc.teacher.removeGroupMember.useMutation({ onSuccess: () => utils.teacher.listGroupMembers.invalidate() });

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", level: "beginner" as "beginner" | "developing" | "intermediate" | "advanced", academicYear: "" });
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [addEmail, setAddEmail] = useState("");
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [addError, setAddError] = useState("");

  const { data: members } = trpc.teacher.listGroupMembers.useQuery(
    { groupId: expandedGroup! },
    { enabled: expandedGroup !== null },
  );

  const handleAddMember = (groupId: number) => {
    if (!addEmail.trim()) return;
    setAddError("");
    addMemberMut.mutate({ groupId, studentEmail: addEmail.trim() }, {
      onSuccess: () => { setAddEmail(""); setAddingTo(null); },
      onError: (e) => setAddError(e.message),
    });
  };

  if (isLoading) return <TCard><Loader2 className="w-5 h-5 animate-spin text-emerald-400 mx-auto" /></TCard>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <THeading icon={UsersRound} title="Groups & Classes" />
        <button onClick={() => setShowCreate(!showCreate)} className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          <Plus className="w-4 h-4" /> New Group
        </button>
      </div>

      {showCreate && (
        <TCard>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Group / class name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-emerald-500 focus:outline-none" />
              <input placeholder="Academic year (e.g. 2025–26)" value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })}
                className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-emerald-500 focus:outline-none" />
              <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value as typeof form.level })}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none">
                <option value="beginner">Beginner</option>
                <option value="developing">Developing</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <input placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors">Cancel</button>
              <button
                disabled={!form.name.trim() || createMut.isPending}
                onClick={() => {
                  createMut.mutate({ name: form.name.trim(), level: form.level, description: form.description.trim() || undefined, academicYear: form.academicYear.trim() || undefined });
                  setForm({ name: "", description: "", level: "beginner", academicYear: "" });
                  setShowCreate(false);
                }}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Group"}
              </button>
            </div>
          </div>
        </TCard>
      )}

      {(groups ?? []).length === 0 ? (
        <EmptyState icon={UsersRound} title="No groups yet" body="Create your first class or group to start managing students and assigning tasks." />
      ) : (
        <div className="space-y-3">
          {(groups ?? []).map((g) => {
            const lc = LEVEL_COLORS[g.level] ?? TEACHER_ACCENT;
            const isExpanded = expandedGroup === g.id;
            return (
              <TCard key={g.id}>
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-3 flex-1 text-left" onClick={() => setExpandedGroup(isExpanded ? null : g.id)}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${lc}18` }}>
                      <UsersRound className="w-4 h-4" style={{ color: lc }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{g.name}</p>
                      <p className="text-xs text-gray-500">{g.memberCount} students · <span style={{ color: lc }}>{g.level}</span>{g.academicYear ? ` · ${g.academicYear}` : ""}</p>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" /> : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />}
                  </button>
                  <button onClick={() => deleteMut.mutate({ id: g.id })} className="ml-3 text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/[0.05] space-y-3">
                    {/* Members list */}
                    {(members ?? []).length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-2">No students yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {(members ?? []).map((m) => (
                          <div key={m.memberId} className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-white">{m.name}</p>
                              <p className="text-[10px] text-gray-500">{m.email}</p>
                            </div>
                            <button onClick={() => removeMemberMut.mutate({ memberId: m.memberId })} className="text-gray-600 hover:text-red-400 transition-colors ml-2">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add student */}
                    {addingTo === g.id ? (
                      <div className="space-y-2">
                        <input
                          placeholder="Student's email address"
                          value={addEmail}
                          onChange={e => { setAddEmail(e.target.value); setAddError(""); }}
                          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-emerald-500 focus:outline-none"
                        />
                        {addError && <p className="text-xs text-red-400">{addError}</p>}
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => { setAddingTo(null); setAddEmail(""); setAddError(""); }} className="text-xs text-gray-400 hover:text-white">Cancel</button>
                          <button onClick={() => handleAddMember(g.id)} disabled={addMemberMut.isPending || !addEmail.trim()}
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium disabled:opacity-50">
                            {addMemberMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add Student"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setAddingTo(g.id)} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add student by email
                      </button>
                    )}
                  </div>
                )}
              </TCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Students View ──────────────────────────────────────────────────────────

function StudentsView({ onFeedback }: { onFeedback: (studentId: number, name: string) => void }) {
  const { data: students, isLoading } = trpc.teacher.listMyStudents.useQuery();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const { data: summary, isLoading: summaryLoading } = trpc.teacher.getStudentSummary.useQuery(
    { studentUserId: selectedStudent! },
    { enabled: selectedStudent !== null },
  );

  if (isLoading) return <TCard><Loader2 className="w-5 h-5 animate-spin text-emerald-400 mx-auto" /></TCard>;

  if (selectedStudent !== null) {
    const student = (students ?? []).find(s => s.id === selectedStudent);
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedStudent(null)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to students
        </button>

        {summaryLoading || !summary ? (
          <TCard><Loader2 className="w-5 h-5 animate-spin text-emerald-400 mx-auto" /></TCard>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-emerald-400">{(summary.student.name ?? "?")[0]?.toUpperCase()}</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{summary.student.name}</h3>
                <p className="text-xs text-gray-500">{summary.student.email} · <span style={{ color: LEVEL_COLORS[summary.student.learnerLevel] ?? TEACHER_ACCENT }}>{summary.student.learnerLevel}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Care Completion" value={`${summary.stats.careCompletion}%`} color={TEACHER_ACCENT} />
              <StatCard label="Total XP" value={summary.stats.totalXp} color="#6366f1" />
              <StatCard label="Avg Skill Level" value={summary.stats.avgSkillLevel} color="#f59e0b" />
              <StatCard label="Training Sessions" value={summary.stats.trainingCount} color="#ec4899" />
            </div>

            {summary.recentTraining.length > 0 && (
              <TCard>
                <THeading icon={TrendingUp} title="Recent Training" />
                <div className="space-y-2 mt-3">
                  {summary.recentTraining.map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <div>
                        <p className="text-sm text-white font-medium">{t.title}</p>
                        <p className="text-xs text-gray-500">{String(t.sessionDate).slice(0, 10)} · {t.sessionType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TCard>
            )}

            <button
              onClick={() => onFeedback(summary.student.id, summary.student.name ?? "")}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
            >
              <MessageSquare className="w-4 h-4 inline mr-2" /> Give Feedback to {summary.student.name}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <THeading icon={Users} title="My Students" />
      {(students ?? []).length === 0 ? (
        <EmptyState icon={Users} title="No students yet" body="Create groups and add students by email to see them here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(students ?? []).map((s) => {
            const lc = LEVEL_COLORS[s.learnerLevel] ?? TEACHER_ACCENT;
            return (
              <button key={s.id} onClick={() => setSelectedStudent(s.id)}
                className="text-left p-4 rounded-xl border border-white/[0.06] bg-[#111827] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${lc}20` }}>
                    <span className="text-xs font-bold" style={{ color: lc }}>{(s.name ?? "?")[0]?.toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                    <p className="text-xs text-gray-500 truncate">{s.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${lc}18`, color: lc }}>
                    {s.learnerLevel}
                  </span>
                  {s.groups.map(g => (
                    <span key={g.id} className="text-[10px] text-gray-500">{g.name}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tasks View ─────────────────────────────────────────────────────────────

function TasksView() {
  const utils = trpc.useUtils();
  const { data: students } = trpc.teacher.listMyStudents.useQuery();
  const { data: groups } = trpc.teacher.listGroups.useQuery();
  const { data: tasks, isLoading } = trpc.teacher.listAssignedTasksByTeacher.useQuery();
  const assignMut = trpc.teacher.assignTask.useMutation({ onSuccess: () => utils.teacher.listAssignedTasksByTeacher.invalidate() });
  const deleteMut = trpc.teacher.deleteAssignedTask.useMutation({ onSuccess: () => utils.teacher.listAssignedTasksByTeacher.invalidate() });

  const [showForm, setShowForm] = useState(false);
  const [assignTo, setAssignTo] = useState<"student" | "group">("student");
  const [form, setForm] = useState({
    title: "", description: "", category: "care" as const,
    dueDate: "", frequency: "once" as const,
    studentUserId: "", groupId: "",
  });

  const handleAssign = () => {
    const studentUserId = assignTo === "student" && form.studentUserId ? parseInt(form.studentUserId) : undefined;
    const groupId = assignTo === "group" && form.groupId ? parseInt(form.groupId) : undefined;

    assignMut.mutate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      dueDate: form.dueDate || undefined,
      frequency: form.frequency,
      studentUserId,
      groupId,
    }, {
      onSuccess: () => {
        setForm({ title: "", description: "", category: "care", dueDate: "", frequency: "once", studentUserId: "", groupId: "" });
        setShowForm(false);
      },
    });
  };

  if (isLoading) return <TCard><Loader2 className="w-5 h-5 animate-spin text-emerald-400 mx-auto" /></TCard>;

  const pending = (tasks ?? []).filter(t => !t.isCompleted);
  const completed = (tasks ?? []).filter(t => t.isCompleted);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <THeading icon={ClipboardList} title="Assign Tasks" />
        <button onClick={() => setShowForm(!showForm)} className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          <Plus className="w-4 h-4" /> Assign Task
        </button>
      </div>

      {showForm && (
        <TCard>
          <div className="space-y-3">
            <div className="flex gap-2">
              {(["student", "group"] as const).map(t => (
                <button key={t} onClick={() => setAssignTo(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${assignTo === t ? "bg-emerald-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
                  {t === "student" ? "Individual Student" : "Whole Group"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assignTo === "student" ? (
                <select value={form.studentUserId} onChange={e => setForm({ ...form, studentUserId: e.target.value })}
                  className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none">
                  <option value="">Select student *</option>
                  {(students ?? []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              ) : (
                <select value={form.groupId} onChange={e => setForm({ ...form, groupId: e.target.value })}
                  className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none">
                  <option value="">Select group *</option>
                  {(groups ?? []).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              )}

              <input placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-emerald-500 focus:outline-none" />

              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as typeof form.category })}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none">
                <option value="care">Care</option>
                <option value="grooming">Grooming</option>
                <option value="feeding">Feeding</option>
                <option value="study">Study</option>
                <option value="exercise">Exercise</option>
                <option value="safety">Safety</option>
                <option value="other">Other</option>
              </select>

              <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as typeof form.frequency })}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none">
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>

              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none" />

              <input placeholder="Instructions (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors">Cancel</button>
              <button
                disabled={!form.title.trim() || (assignTo === "student" ? !form.studentUserId : !form.groupId) || assignMut.isPending}
                onClick={handleAssign}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 w-full sm:w-auto"
              >
                {assignMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign Task"}
              </button>
            </div>
          </div>
        </TCard>
      )}

      {pending.length === 0 && completed.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assigned tasks" body="Assign tasks to individual students or whole groups to track completion here." />
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Pending ({pending.length})</p>
              <div className="space-y-2">
                {pending.map(t => (
                  <TCard key={t.id} className="!p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{t.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {t.category} · {t.frequency}
                          {t.dueDate ? ` · Due ${String(t.dueDate).slice(0, 10)}` : ""}
                          {t.groupId ? " · Group task" : ""}
                        </p>
                        {t.description && <p className="text-xs text-gray-500 mt-1">{t.description}</p>}
                      </div>
                      <button onClick={() => deleteMut.mutate({ id: t.id })} className="text-gray-600 hover:text-red-400 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TCard>
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Completed ({completed.length})</p>
              <div className="space-y-2">
                {completed.slice(0, 5).map(t => (
                  <TCard key={t.id} className="!p-4 opacity-60">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <p className="text-sm text-white">{t.title}</p>
                    </div>
                  </TCard>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Feedback View ──────────────────────────────────────────────────────────

function FeedbackView({ prefillStudentId, prefillStudentName, onClearPrefill }: {
  prefillStudentId?: number;
  prefillStudentName?: string;
  onClearPrefill: () => void;
}) {
  const utils = trpc.useUtils();
  const { data: students } = trpc.teacher.listMyStudents.useQuery();
  const { data: feedbackList, isLoading } = trpc.teacher.listFeedbackByTeacher.useQuery();
  const addMut = trpc.teacher.addFeedback.useMutation({ onSuccess: () => { utils.teacher.listFeedbackByTeacher.invalidate(); onClearPrefill(); } });
  const deleteMut = trpc.teacher.deleteFeedback.useMutation({ onSuccess: () => utils.teacher.listFeedbackByTeacher.invalidate() });

  const [showForm, setShowForm] = useState(prefillStudentId !== undefined);
  const [form, setForm] = useState({
    studentUserId: prefillStudentId?.toString() ?? "",
    entryType: "general" as "training_entry" | "task" | "general" | "progress",
    comment: "",
    feedbackType: "general" as "good" | "needs_improvement" | "urgent" | "general",
  });

  const handleAdd = () => {
    if (!form.studentUserId || !form.comment.trim()) return;
    addMut.mutate({
      studentUserId: parseInt(form.studentUserId),
      entryType: form.entryType,
      comment: form.comment.trim(),
      feedbackType: form.feedbackType,
    }, {
      onSuccess: () => {
        setForm({ studentUserId: "", entryType: "general", comment: "", feedbackType: "general" });
        setShowForm(false);
      },
    });
  };

  if (isLoading) return <TCard><Loader2 className="w-5 h-5 animate-spin text-emerald-400 mx-auto" /></TCard>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <THeading icon={MessageSquare} title="Student Feedback" />
        <button onClick={() => setShowForm(!showForm)} className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Feedback
        </button>
      </div>

      {prefillStudentName && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-4 py-2">
          <Lightbulb className="w-3.5 h-3.5" />
          Adding feedback for {prefillStudentName}
          <button onClick={onClearPrefill} className="ml-auto text-gray-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {showForm && (
        <TCard>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={form.studentUserId} onChange={e => setForm({ ...form, studentUserId: e.target.value })}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none">
                <option value="">Select student *</option>
                {(students ?? []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={form.entryType} onChange={e => setForm({ ...form, entryType: e.target.value as typeof form.entryType })}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none">
                <option value="general">General</option>
                <option value="training_entry">Training Entry</option>
                <option value="progress">Progress</option>
                <option value="task">Task</option>
              </select>
              <select value={form.feedbackType} onChange={e => setForm({ ...form, feedbackType: e.target.value as typeof form.feedbackType })}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none">
                <option value="good">Good Work</option>
                <option value="needs_improvement">Needs Improvement</option>
                <option value="urgent">Urgent Attention</option>
                <option value="general">General Comment</option>
              </select>
            </div>
            <textarea
              placeholder="Your feedback comment *"
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-emerald-500 focus:outline-none resize-none"
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors">Cancel</button>
              <button
                disabled={!form.studentUserId || !form.comment.trim() || addMut.isPending}
                onClick={handleAdd}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 w-full sm:w-auto"
              >
                {addMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Feedback"}
              </button>
            </div>
          </div>
        </TCard>
      )}

      {(feedbackList ?? []).length === 0 ? (
        <EmptyState icon={MessageSquare} title="No feedback sent" body="Select a student from the Students tab and give feedback on their training, tasks, or progress." />
      ) : (
        <div className="space-y-3">
          {(feedbackList ?? []).map(f => {
            const style = FEEDBACK_STYLES[f.feedbackType] ?? FEEDBACK_STYLES.general;
            return (
              <TCard key={f.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: style.bg, color: style.color }}>{style.label}</span>
                      <span className="text-[10px] text-gray-500">{f.entryType.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-sm text-gray-300">{f.comment}</p>
                    <p className="text-[10px] text-gray-600 mt-1">{String(f.createdAt).slice(0, 10)}</p>
                  </div>
                  <button onClick={() => deleteMut.mutate({ id: f.id })} className="text-gray-600 hover:text-red-400 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </TCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Reports View ───────────────────────────────────────────────────────────

function ReportsView() {
  const { data: students } = trpc.teacher.listMyStudents.useQuery();
  const [selectedStudent, setSelectedStudent] = useState<{ id: number; name: string } | null>(null);
  const [reportType, setReportType] = useState<"weekly" | "monthly" | "term">("monthly");

  const { data: report, isLoading, refetch } = trpc.teacher.generateReport.useQuery(
    { studentUserId: selectedStudent?.id ?? 0, reportType },
    { enabled: selectedStudent !== null },
  );

  const SKILL_LABELS: Record<string, string> = {
    riding_position: "Riding Position", aids_control: "Aids & Control",
    grooming: "Grooming", feeding: "Feeding", tack: "Tack",
    safety: "Safety", health_awareness: "Health Awareness", behaviour: "Behaviour",
  };

  const READINESS_COLORS: Record<string, string> = {
    "Ready for Next Level": "#10b981",
    "Good Progress": "#6366f1",
    "Developing": "#f59e0b",
    "Needs Support": "#ef4444",
  };

  return (
    <div className="space-y-4">
      <THeading icon={FileText} title="Reports" />

      <TCard>
        <p className="text-xs text-gray-500 mb-3">Select a student and report period to generate a report.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={selectedStudent?.id?.toString() ?? ""}
            onChange={e => {
              const id = parseInt(e.target.value);
              const student = (students ?? []).find(s => s.id === id);
              setSelectedStudent(student ? { id: student.id, name: student.name ?? "" } : null);
            }}
            className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Select student</option>
            {(students ?? []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <div className="flex gap-2">
            {(["weekly", "monthly", "term"] as const).map(t => (
              <button
                key={t}
                onClick={() => setReportType(t)}
                className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${reportType === t ? "bg-emerald-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </TCard>

      {selectedStudent === null ? (
        <EmptyState icon={FileText} title="Select a student" body="Choose a student and report period above to generate their performance report." />
      ) : isLoading ? (
        <TCard><Loader2 className="w-5 h-5 animate-spin text-emerald-400 mx-auto" /></TCard>
      ) : report ? (
        <div className="space-y-4" id="report-content">
          {/* Report header */}
          <TCard>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{report.periodLabel}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{report.student.name}</h3>
                <p className="text-sm text-gray-500">{report.student.email} · <span style={{ color: LEVEL_COLORS[report.student.learnerLevel] ?? TEACHER_ACCENT }}>{report.student.learnerLevel}</span> · {report.groupName}</p>
              </div>
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: `${READINESS_COLORS[report.readiness.label] ?? TEACHER_ACCENT}18`,
                  color: READINESS_COLORS[report.readiness.label] ?? TEACHER_ACCENT,
                }}
              >
                {report.readiness.label}
              </div>
            </div>
          </TCard>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Care Consistency" value={`${report.stats.careConsistency}%`} color={TEACHER_ACCENT} />
            <StatCard label="Training Sessions" value={report.stats.trainingSessionCount} color="#6366f1" />
            <StatCard label="Pathway Progress" value={report.stats.pathwayCompletions} color="#f59e0b" />
            <StatCard label="AI Tutor Use" value={report.stats.aiTutorSessions} color="#ec4899" />
          </div>

          {/* Readiness bar */}
          <TCard>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-white">Readiness Score</p>
              <p className="text-sm font-bold" style={{ color: READINESS_COLORS[report.readiness.label] ?? TEACHER_ACCENT }}>
                {report.readiness.score}%
              </p>
            </div>
            <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${report.readiness.score}%`, backgroundColor: READINESS_COLORS[report.readiness.label] ?? TEACHER_ACCENT }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{report.readiness.label}</p>
          </TCard>

          {/* Strengths and weak areas */}
          {(report.strengths.length > 0 || report.weakAreas.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.strengths.length > 0 && (
                <TCard>
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Strengths</p>
                  <div className="space-y-1.5">
                    {report.strengths.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-sm text-white capitalize">{SKILL_LABELS[s] ?? s}</span>
                      </div>
                    ))}
                  </div>
                </TCard>
              )}
              {report.weakAreas.length > 0 && (
                <TCard>
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Focus Areas</p>
                  <div className="space-y-1.5">
                    {report.weakAreas.map((w, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-sm text-white capitalize">{SKILL_LABELS[w] ?? w}</span>
                      </div>
                    ))}
                  </div>
                </TCard>
              )}
            </div>
          )}

          {/* Recent training */}
          {report.recentTraining.length > 0 && (
            <TCard>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Recent Training</p>
              <div className="space-y-3">
                {report.recentTraining.map((t, i) => (
                  <div key={i} className="pb-3 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white">{t.title}</p>
                      <p className="text-xs text-gray-500">{t.date} · {t.type}</p>
                    </div>
                    {t.wentWell && <p className="text-xs text-emerald-400">✓ {t.wentWell}</p>}
                    {t.needsImprovement && <p className="text-xs text-amber-400">△ {t.needsImprovement}</p>}
                  </div>
                ))}
              </div>
            </TCard>
          )}

          {/* Teacher feedback in report */}
          {report.teacherFeedback.length > 0 && (
            <TCard>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Instructor Feedback This Period</p>
              <div className="space-y-2">
                {report.teacherFeedback.map((f, i) => {
                  const style = FEEDBACK_STYLES[f.feedbackType] ?? FEEDBACK_STYLES.general;
                  return (
                    <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: style.bg, borderLeft: `3px solid ${style.color}` }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold" style={{ color: style.color }}>{style.label}</span>
                        <span className="text-[10px] text-gray-500">{f.date}</span>
                      </div>
                      <p className="text-xs text-gray-300">{f.comment}</p>
                    </div>
                  );
                })}
              </div>
            </TCard>
          )}

          {/* Lessons completed — Phase 2 */}
          {(report as any).lessonsCompleted !== undefined && (
            <TCard>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Lessons &amp; Pathways</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 rounded-lg bg-indigo-500/[0.08]">
                  <p className="text-2xl font-bold text-indigo-400">{(report as any).lessonsCompleted}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Lessons Completed</p>
                </div>
                {(report as any).averageLessonScore != null && (
                  <div className="text-center p-3 rounded-lg bg-emerald-500/[0.08]">
                    <p className="text-2xl font-bold text-emerald-400">{(report as any).averageLessonScore}%</p>
                    <p className="text-xs text-gray-500 mt-0.5">Avg Quiz Score</p>
                  </div>
                )}
              </div>
              {(report as any).lessonsByPathway && Object.keys((report as any).lessonsByPathway).length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {Object.entries((report as any).lessonsByPathway as Record<string, number>).map(([pathway, count]) => (
                    <div key={pathway} className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 capitalize">{pathway.replace(/-/g, " ")}</span>
                      <span className="text-xs font-semibold text-white">{count} lesson{count !== 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </TCard>
          )}

          {/* Competency summary — Phase 2 */}
          {(report as any).competencies && (
            <TCard>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Competency Progress</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-3 rounded-lg bg-emerald-500/[0.08]">
                  <p className="text-xl font-bold text-emerald-400">{(report as any).competencies.achieved}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Achieved</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-indigo-500/[0.08]">
                  <p className="text-xl font-bold text-indigo-400">{(report as any).competencies.inProgress}</p>
                  <p className="text-xs text-gray-500 mt-0.5">In Progress</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-500/[0.08]">
                  <p className="text-xl font-bold text-amber-400">{(report as any).competencies.needsSupport}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Needs Support</p>
                </div>
              </div>
              {(report as any).competencies.total > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Achievement rate</span>
                    <span className="text-xs text-white">
                      {Math.round(((report as any).competencies.achieved / Math.max((report as any).competencies.total, 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.round(((report as any).competencies.achieved / Math.max((report as any).competencies.total, 1)) * 100)}%` }} />
                  </div>
                </div>
              )}
            </TCard>
          )}

          {/* Lesson reviews — Phase 2 */}
          {(report as any).lessonReviews?.length > 0 && (
            <TCard>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Lesson Review Notes</p>
              <div className="space-y-2">
                {((report as any).lessonReviews as Array<{ lessonSlug: string; reviewStatus: string; feedback: string; date: string }>).map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.03]">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 mt-0.5 ${r.reviewStatus === "satisfactory" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {r.reviewStatus === "satisfactory" ? "✓ SAT" : "△ IMP"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white capitalize">{r.lessonSlug.replace(/-/g, " ")}</p>
                      {r.feedback && <p className="text-xs text-gray-400 mt-0.5">{r.feedback}</p>}
                    </div>
                    <span className="text-[10px] text-gray-600 shrink-0">{String(r.date).slice(0, 10)}</span>
                  </div>
                ))}
              </div>
            </TCard>
          )}

          <p className="text-xs text-gray-600 text-center">Report generated {new Date(report.generatedAt).toLocaleDateString("en-GB")} · EquiProfile</p>
        </div>
      ) : null}
    </div>
  );
}

// ── Teacher Lessons View ───────────────────────────────────────────────────

const COMPETENCY_DEFINITIONS = [
  { key: "grooming_safely", label: "Grooming Safely", category: "Care & Handling" },
  { key: "leading_safely", label: "Leading Safely", category: "Care & Handling" },
  { key: "tying_up_safely", label: "Tying Up Safely", category: "Care & Handling" },
  { key: "feeding_awareness", label: "Feeding Awareness", category: "Care & Handling" },
  { key: "stable_checks", label: "Stable Checks", category: "Care & Handling" },
  { key: "tack_identification", label: "Tack Identification", category: "Tack & Equipment" },
  { key: "tacking_up_correctly", label: "Tacking Up Correctly", category: "Tack & Equipment" },
  { key: "tack_care", label: "Tack Care", category: "Tack & Equipment" },
  { key: "rider_position", label: "Rider Position", category: "Riding Basics" },
  { key: "control_at_walk", label: "Control at Walk", category: "Riding Basics" },
  { key: "control_at_trot", label: "Control at Trot", category: "Riding Basics" },
  { key: "balance_and_coordination", label: "Balance and Coordination", category: "Riding Basics" },
  { key: "yard_safety_awareness", label: "Yard Safety Awareness", category: "Safety & Welfare" },
  { key: "horse_behaviour_awareness", label: "Horse Behaviour Awareness", category: "Safety & Welfare" },
  { key: "welfare_awareness", label: "Welfare Awareness", category: "Safety & Welfare" },
  { key: "risk_awareness", label: "Risk Awareness", category: "Safety & Welfare" },
  { key: "basic_first_aid", label: "Basic First Aid Awareness", category: "Safety & Welfare" },
];

const COMPETENCY_STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  not_assessed: { label: "Not Assessed", color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  in_progress: { label: "In Progress", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  achieved: { label: "Achieved", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  needs_support: { label: "Needs Support", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
};

function TeacherLessonsView() {
  const [tab, setTab] = useState<"assign" | "review" | "competencies">("assign");
  const [assignForm, setAssignForm] = useState<{
    studentUserId?: number; groupId?: number; type: "lesson" | "pathway";
    lessonSlug: string; pathwaySlug: string; dueDate: string; instructions: string;
    targetType: "student" | "group";
  }>({ type: "lesson", lessonSlug: "", pathwaySlug: "", dueDate: "", instructions: "", targetType: "student" });
  const [selectedStudentForCompetency, setSelectedStudentForCompetency] = useState<number | null>(null);
  const [competencyForm, setCompetencyForm] = useState<{
    key: string; category: string; status: string; comment: string;
  } | null>(null);
  const [reviewForm, setReviewForm] = useState<{
    studentUserId?: number; lessonSlug: string;
    reviewStatus: "satisfactory" | "needs_improvement"; feedback: string; recommendedNextLesson: string;
  }>({ lessonSlug: "", reviewStatus: "satisfactory", feedback: "", recommendedNextLesson: "" });

  const utils = trpc.useUtils();
  const { data: students } = trpc.teacher.listMyStudents.useQuery();
  const { data: groups } = trpc.teacher.listGroups.useQuery();
  const { data: assignments } = trpc.teacher.listLessonAssignments.useQuery({});
  const { data: reviews } = trpc.teacher.listLessonReviews.useQuery({});
  const { data: availableLessons } = trpc.teacher.listLessons.useQuery();
  const { data: competencies } = trpc.teacher.listStudentCompetencies.useQuery(
    { studentUserId: selectedStudentForCompetency! },
    { enabled: selectedStudentForCompetency !== null },
  );

  const assignMutation = trpc.teacher.assignLesson.useMutation({
    onSuccess: () => {
      utils.teacher.listLessonAssignments.invalidate();
      setAssignForm({ type: "lesson", lessonSlug: "", pathwaySlug: "", dueDate: "", instructions: "", targetType: "student" });
    },
  });
  const deleteAssignmentMutation = trpc.teacher.deleteLessonAssignment.useMutation({
    onSuccess: () => utils.teacher.listLessonAssignments.invalidate(),
  });
  const reviewMutation = trpc.teacher.reviewLesson.useMutation({
    onSuccess: () => {
      utils.teacher.listLessonReviews.invalidate();
      setReviewForm({ lessonSlug: "", reviewStatus: "satisfactory", feedback: "", recommendedNextLesson: "" });
    },
  });
  const signOffMutation = trpc.teacher.signOffCompetency.useMutation({
    onSuccess: () => {
      utils.teacher.listStudentCompetencies.invalidate();
      setCompetencyForm(null);
    },
  });

  const PATHWAY_OPTIONS = [
    { slug: "horse-care-foundations", label: "Horse Care Foundations" },
    { slug: "rider-foundations", label: "Rider Foundations" },
    { slug: "stable-yard-safety", label: "Stable & Yard Safety" },
    { slug: "horse-behaviour-welfare", label: "Horse Behaviour & Welfare" },
    { slug: "tack-equipment", label: "Tack & Equipment" },
    { slug: "developing-rider-skills", label: "Developing Rider Skills" },
  ];

  const now = new Date();

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-white/[0.04] p-1 w-fit">
        {(["assign", "review", "competencies"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
            }`}>
            {t === "assign" ? "Assign Lessons" : t === "review" ? "Reviews" : "Competencies"}
          </button>
        ))}
      </div>

      {/* ── ASSIGN TAB ── */}
      {tab === "assign" && (
        <div className="space-y-5">
          <TCard>
            <THeading icon={Library} title="Assign a Lesson or Pathway" />
            <p className="text-xs text-gray-500 mb-4">Assign structured learning to individual students or whole groups.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Target type */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Assign to</label>
                <select className="w-full text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={assignForm.targetType}
                  onChange={e => setAssignForm(f => ({ ...f, targetType: e.target.value as "student" | "group", studentUserId: undefined, groupId: undefined }))}>
                  <option value="student">Individual Student</option>
                  <option value="group">Group / Class</option>
                </select>
              </div>
              {/* Student or group select */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">{assignForm.targetType === "student" ? "Student" : "Group"}</label>
                {assignForm.targetType === "student" ? (
                  <select className="w-full text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white"
                    value={assignForm.studentUserId ?? ""}
                    onChange={e => setAssignForm(f => ({ ...f, studentUserId: parseInt(e.target.value) || undefined }))}>
                    <option value="">Select student…</option>
                    {(students ?? []).map(s => <option key={s.id} value={s.id}>{s.name ?? s.email}</option>)}
                  </select>
                ) : (
                  <select className="w-full text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white"
                    value={assignForm.groupId ?? ""}
                    onChange={e => setAssignForm(f => ({ ...f, groupId: parseInt(e.target.value) || undefined }))}>
                    <option value="">Select group…</option>
                    {(groups ?? []).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                )}
              </div>
              {/* Assignment type */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Assignment Type</label>
                <select className="w-full text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={assignForm.type}
                  onChange={e => setAssignForm(f => ({ ...f, type: e.target.value as "lesson" | "pathway" }))}>
                  <option value="lesson">Single Lesson</option>
                  <option value="pathway">Full Pathway</option>
                </select>
              </div>
              {/* Lesson or pathway slug */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">{assignForm.type === "lesson" ? "Lesson" : "Pathway"}</label>
                {assignForm.type === "lesson" ? (
                  <select className="w-full text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white"
                    value={assignForm.lessonSlug}
                    onChange={e => setAssignForm(f => ({ ...f, lessonSlug: e.target.value }))}>
                    <option value="">Select lesson…</option>
                    {(availableLessons ?? []).map(l => (
                      <option key={l.slug} value={l.slug}>
                        {l.title} ({l.level})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select className="w-full text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white"
                    value={assignForm.pathwaySlug}
                    onChange={e => setAssignForm(f => ({ ...f, pathwaySlug: e.target.value }))}>
                    <option value="">Select pathway…</option>
                    {PATHWAY_OPTIONS.map(p => <option key={p.slug} value={p.slug}>{p.label}</option>)}
                  </select>
                )}
              </div>
              {/* Due date */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Due Date (optional)</label>
                <input type="date" className="w-full text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={assignForm.dueDate}
                  onChange={e => setAssignForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              {/* Instructions */}
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Instructions (optional)</label>
                <textarea className="w-full text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 resize-none"
                  rows={2} placeholder="Additional notes for the student…"
                  value={assignForm.instructions}
                  onChange={e => setAssignForm(f => ({ ...f, instructions: e.target.value }))} />
              </div>
            </div>
            <button
              onClick={() => {
                const payload = {
                  assignmentType: assignForm.type,
                  lessonSlug: assignForm.type === "lesson" ? assignForm.lessonSlug || undefined : undefined,
                  pathwaySlug: assignForm.type === "pathway" ? assignForm.pathwaySlug || undefined : undefined,
                  dueDate: assignForm.dueDate || undefined,
                  instructions: assignForm.instructions || undefined,
                  studentUserId: assignForm.targetType === "student" ? assignForm.studentUserId : undefined,
                  groupId: assignForm.targetType === "group" ? assignForm.groupId : undefined,
                };
                assignMutation.mutate(payload);
              }}
              disabled={assignMutation.isPending || (!assignForm.studentUserId && !assignForm.groupId) || (assignForm.type === "lesson" && !assignForm.lessonSlug) || (assignForm.type === "pathway" && !assignForm.pathwaySlug)}
              className="mt-4 px-5 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-40">
              {assignMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Assign"}
            </button>
          </TCard>

          {/* Active assignments list */}
          <TCard>
            <THeading icon={ClipboardList} title="Active Assignments" />
            {(assignments ?? []).length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No active assignments.</p>
            ) : (
              <div className="space-y-2 mt-3">
                {(assignments ?? []).map(a => {
                  const isOverdue = a.dueDate ? new Date(a.dueDate) < now : false;
                  return (
                    <div key={a.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.assignmentType === "lesson" ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                            {a.assignmentType === "lesson" ? "Lesson" : "Pathway"}
                          </span>
                          <span className="text-sm text-white font-medium truncate">{a.lessonSlug ?? a.pathwaySlug}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {a.dueDate && (
                            <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-rose-400" : "text-gray-500"}`}>
                              <Calendar className="w-3 h-3" /> {String(a.dueDate).slice(0, 10)}
                              {isOverdue && " (overdue)"}
                            </span>
                          )}
                          <span className="text-xs text-gray-600">
                            {a.studentUserId ? `Student #${a.studentUserId}` : `Group #${a.groupId}`}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => deleteAssignmentMutation.mutate({ id: a.id })}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </TCard>
        </div>
      )}

      {/* ── REVIEW TAB ── */}
      {tab === "review" && (
        <div className="space-y-4">
          {/* Write a review form */}
          <TCard>
            <THeading icon={BookOpen} title="Write a Lesson Review" />
            <p className="text-xs text-gray-500 mb-4">Leave structured feedback on a student's lesson completion to guide their progress.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Student</label>
                <select className="w-full text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={reviewForm.studentUserId ?? ""}
                  onChange={e => setReviewForm(f => ({ ...f, studentUserId: parseInt(e.target.value) || undefined }))}>
                  <option value="">Select student…</option>
                  {(students ?? []).map(s => <option key={s.id} value={s.id}>{s.name ?? s.email}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Lesson</label>
                <select className="w-full text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={reviewForm.lessonSlug}
                  onChange={e => setReviewForm(f => ({ ...f, lessonSlug: e.target.value }))}>
                  <option value="">Select lesson…</option>
                  {(availableLessons ?? []).map(l => (
                    <option key={l.slug} value={l.slug}>{l.title} ({l.level})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Review Outcome</label>
                <div className="flex gap-2">
                  {(["satisfactory", "needs_improvement"] as const).map(s => (
                    <button key={s} onClick={() => setReviewForm(f => ({ ...f, reviewStatus: s }))}
                      className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${reviewForm.reviewStatus === s ? (s === "satisfactory" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white") : "bg-gray-800 text-gray-400 hover:text-white"}`}>
                      {s === "satisfactory" ? "✓ Satisfactory" : "△ Needs Improvement"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Recommended Next Lesson (optional)</label>
                <select className="w-full text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={reviewForm.recommendedNextLesson}
                  onChange={e => setReviewForm(f => ({ ...f, recommendedNextLesson: e.target.value }))}>
                  <option value="">None / not specified</option>
                  {(availableLessons ?? []).map(l => (
                    <option key={l.slug} value={l.slug}>{l.title} ({l.level})</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Feedback for student</label>
                <textarea className="w-full text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 resize-none"
                  rows={3} placeholder="Describe what the student demonstrated, areas of improvement, and next steps…"
                  value={reviewForm.feedback}
                  onChange={e => setReviewForm(f => ({ ...f, feedback: e.target.value }))} />
              </div>
            </div>
            <button
              onClick={() => reviewMutation.mutate({
                studentUserId: reviewForm.studentUserId!,
                lessonSlug: reviewForm.lessonSlug,
                reviewStatus: reviewForm.reviewStatus,
                feedback: reviewForm.feedback || undefined,
                recommendedNextLesson: reviewForm.recommendedNextLesson || undefined,
              })}
              disabled={reviewMutation.isPending || !reviewForm.studentUserId || !reviewForm.lessonSlug}
              className="mt-4 px-5 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-40">
              {reviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Submit Review"}
            </button>
          </TCard>

          {/* Reviews submitted */}
          <TCard>
            <THeading icon={ClipboardList} title="Reviews Submitted" />
            {(reviews ?? []).length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No reviews submitted yet.</p>
            ) : (
              <div className="space-y-2 mt-3">
                {(reviews ?? []).map(r => (
                  <div key={r.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.reviewStatus === "satisfactory" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                        {r.reviewStatus === "satisfactory" ? "✓ Satisfactory" : "△ Needs Improvement"}
                      </span>
                      <span className="text-sm text-white font-medium capitalize">{r.lessonSlug.replace(/-/g, " ")}</span>
                    </div>
                    {r.feedback && <p className="text-xs text-gray-400 mt-1">{r.feedback}</p>}
                    {r.recommendedNextLesson && (
                      <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" /> Next: {r.recommendedNextLesson}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TCard>
        </div>
      )}

      {/* ── COMPETENCIES TAB ── */}
      {tab === "competencies" && (
        <div className="space-y-4">
          <TCard>
            <THeading icon={Award} title="Competency Sign-Off" />
            <p className="text-xs text-gray-500 mb-4">Select a student to view and sign off their competencies.</p>
            <select className="w-full max-w-xs text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white"
              value={selectedStudentForCompetency ?? ""}
              onChange={e => setSelectedStudentForCompetency(parseInt(e.target.value) || null)}>
              <option value="">Select student…</option>
              {(students ?? []).map(s => <option key={s.id} value={s.id}>{s.name ?? s.email}</option>)}
            </select>
          </TCard>

          {selectedStudentForCompetency && (
            <TCard>
              <div className="space-y-4">
                {Object.entries(
                  COMPETENCY_DEFINITIONS.reduce((acc, c) => {
                    if (!acc[c.category]) acc[c.category] = [];
                    acc[c.category].push(c);
                    return acc;
                  }, {} as Record<string, typeof COMPETENCY_DEFINITIONS>)
                ).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" /> {category}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {items.map(comp => {
                        const existing = (competencies ?? []).find(c => c.competencyKey === comp.key);
                        const status = existing?.status ?? "not_assessed";
                        const style = COMPETENCY_STATUS_STYLES[status];
                        const isEditing = competencyForm?.key === comp.key;
                        return (
                          <div key={comp.key} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-white">{comp.label}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
                                style={{ color: style.color, backgroundColor: style.bg }}>
                                {style.label}
                              </span>
                            </div>
                            {existing?.teacherComment && !isEditing && (
                              <p className="text-xs text-gray-500 mt-1">{existing.teacherComment}</p>
                            )}
                            {isEditing ? (
                              <div className="mt-2 space-y-2">
                                <select className="w-full text-xs bg-gray-800 border border-white/10 rounded px-2 py-1.5 text-white"
                                  value={competencyForm.status}
                                  onChange={e => setCompetencyForm(f => f ? { ...f, status: e.target.value } : null)}>
                                  <option value="not_assessed">Not Assessed</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="achieved">Achieved ✓</option>
                                  <option value="needs_support">Needs Support</option>
                                </select>
                                <textarea className="w-full text-xs bg-gray-800 border border-white/10 rounded px-2 py-1.5 text-white resize-none"
                                  rows={2} placeholder="Teacher comment…"
                                  value={competencyForm.comment}
                                  onChange={e => setCompetencyForm(f => f ? { ...f, comment: e.target.value } : null)} />
                                <div className="flex gap-2">
                                  <button onClick={() => signOffMutation.mutate({
                                    studentUserId: selectedStudentForCompetency,
                                    competencyKey: competencyForm.key,
                                    category: competencyForm.category,
                                    status: competencyForm.status as any,
                                    teacherComment: competencyForm.comment || undefined,
                                  })} disabled={signOffMutation.isPending}
                                    className="text-xs px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-40">
                                    {signOffMutation.isPending ? "Saving…" : "Save"}
                                  </button>
                                  <button onClick={() => setCompetencyForm(null)}
                                    className="text-xs px-3 py-1 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setCompetencyForm({ key: comp.key, category: comp.category, status, comment: existing?.teacherComment ?? "" })}
                                className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                                {status === "not_assessed" ? "Assess" : "Update"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </TCard>
          )}
        </div>
      )}
    </div>
  );
}

// ── Teacher Progress View ──────────────────────────────────────────────────

function TeacherProgressView() {
  const { data: students, isLoading: loadingStudents } = trpc.teacher.listMyStudents.useQuery();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const { data: studentSummary } = trpc.teacher.getStudentSummary.useQuery(
    { studentUserId: selectedStudent! },
    { enabled: selectedStudent !== null },
  );
  const { data: competencies } = trpc.teacher.listStudentCompetencies.useQuery(
    { studentUserId: selectedStudent! },
    { enabled: selectedStudent !== null },
  );

  if (loadingStudents) return <TCard><div className="animate-pulse h-32 rounded bg-white/[0.04]" /></TCard>;

  const studentList = students ?? [];

  const COMP_STATUS_STYLES: Record<string, { label: string; color: string }> = {
    achieved: { label: "Achieved", color: "#10b981" },
    in_progress: { label: "In Progress", color: "#6366f1" },
    not_started: { label: "Not Started", color: "#6b7280" },
    needs_support: { label: "Needs Support", color: "#ef4444" },
  };

  // Group competencies by category
  const competencyGroups: Record<string, typeof competencies extends (infer U)[] | undefined ? U[] : never[]> = {};
  (competencies ?? []).forEach(c => {
    const cat = (c as any).category ?? "General";
    if (!competencyGroups[cat]) competencyGroups[cat] = [];
    competencyGroups[cat].push(c as any);
  });

  return (
    <div className="space-y-6">
      <THeading icon={TrendingUp} title="Student Progress" />

      {studentList.length === 0 ? (
        <EmptyState icon={Users} title="No students yet" body="Add students to your groups to track their progress." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student list */}
          <div className="lg:col-span-1">
            <TCard>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Students</h3>
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {studentList.map(s => {
                  const isActive = selectedStudent === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStudent(s.id)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                        isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/[0.06] text-gray-500"
                      }`}>
                        {(s.name ?? s.email ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{s.name || s.email}</p>
                        <p className="text-[10px] text-gray-600">
                          Level: {s.learnerLevel ?? "beginner"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </TCard>
          </div>

          {/* Progress detail */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedStudent ? (
              <EmptyState icon={TrendingUp} title="Select a student" body="Choose a student from the list to view their detailed progress and competencies." />
            ) : (
              <>
                {/* Summary stats */}
                {studentSummary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="Lessons Completed" value={studentSummary.stats?.completedTasks ?? 0} color="#6366f1" />
                    <StatCard label="Tasks Completed" value={studentSummary.stats?.totalTasks ?? 0} color="#10b981" />
                    <StatCard label="Training Sessions" value={studentSummary.stats?.trainingCount ?? 0} color="#f59e0b" />
                    <StatCard label="Competencies" value={(competencies ?? []).filter((c: any) => c.status === "achieved").length} color="#06b6d4" />
                  </div>
                )}

                {/* Competency tracking */}
                <TCard>
                  <h3 className="text-sm font-semibold text-white mb-4">Competency Progress</h3>
                  {Object.keys(competencyGroups).length === 0 ? (
                    <p className="text-xs text-gray-500">No competency data yet. Complete lessons or sign off competencies in the Lessons tab.</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(competencyGroups).map(([cat, comps]) => {
                        const achieved = (comps as any[]).filter(c => c.status === "achieved").length;
                        const total = (comps as any[]).length;
                        const pct = total > 0 ? Math.round((achieved / total) * 100) : 0;
                        return (
                          <div key={cat}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-gray-300">{cat}</p>
                              <span className="text-xs text-gray-500">{achieved}/{total}</span>
                            </div>
                            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {(comps as any[]).map(comp => {
                                const st = COMP_STATUS_STYLES[(comp as any).status] ?? COMP_STATUS_STYLES.not_started;
                                return (
                                  <div key={(comp as any).key ?? (comp as any).competencyKey} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02]">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                                    <span className="text-xs text-gray-400 flex-1 truncate">
                                      {((comp as any).key ?? (comp as any).competencyKey ?? "").replace(/-/g, " ")}
                                    </span>
                                    <span className="text-[10px] font-medium shrink-0" style={{ color: st.color }}>
                                      {st.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TCard>

                {/* Weakness identification */}
                {studentSummary && (
                  <TCard>
                    <h3 className="text-sm font-semibold text-white mb-3">Areas to Watch</h3>
                    {(competencies ?? []).filter((c: any) => c.status === "needs_support").length > 0 ? (
                      <div className="space-y-2">
                        {(competencies ?? []).filter((c: any) => c.status === "needs_support").map((c: any) => (
                          <div key={c.key ?? c.competencyKey} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <span className="text-xs text-gray-300">
                              {(c.key ?? c.competencyKey ?? "").replace(/-/g, " ")}
                            </span>
                            <span className="text-[10px] text-red-400 ml-auto shrink-0">Needs Support</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No flagged areas. All competencies are on track or not yet assessed.</p>
                    )}
                  </TCard>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Teacher Dashboard ─────────────────────────────────────────────────

export default function TeacherDashboard() {
  const [activeView, setActiveView] = useState<TeacherView>("overview");
  const [feedbackPrefill, setFeedbackPrefill] = useState<{ id: number; name: string } | null>(null);

  const handleFeedback = (studentId: number, name: string) => {
    setFeedbackPrefill({ id: studentId, name });
    setActiveView("feedback");
  };

  return (
    <TeacherDashboardLayout activeView={activeView} onNavigate={setActiveView}>
      {activeView === "overview" && <OverviewView onNavigate={setActiveView} />}
      {activeView === "students" && <StudentsView onFeedback={handleFeedback} />}
      {activeView === "groups" && <GroupsView />}
      {activeView === "tasks" && <TasksView />}
      {activeView === "lessons" && <TeacherLessonsView />}
      {activeView === "feedback" && (
        <FeedbackView
          prefillStudentId={feedbackPrefill?.id}
          prefillStudentName={feedbackPrefill?.name}
          onClearPrefill={() => setFeedbackPrefill(null)}
        />
      )}
      {activeView === "reports" && <ReportsView />}
      {activeView === "progress" && <TeacherProgressView />}
    </TeacherDashboardLayout>
  );
}
