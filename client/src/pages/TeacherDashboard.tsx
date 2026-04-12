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
              className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-[#111827] text-left hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
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
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
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
                <span className="text-sm font-bold text-emerald-400">{summary.student.name[0]?.toUpperCase()}</span>
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
                        <p className="text-xs text-gray-500">{String(t.date).slice(0, 10)} · {t.sessionType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TCard>
            )}

            <button
              onClick={() => onFeedback(summary.student.id, summary.student.name)}
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
                    <span className="text-xs font-bold" style={{ color: lc }}>{s.name[0]?.toUpperCase()}</span>
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

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button
                disabled={!form.title.trim() || (assignTo === "student" ? !form.studentUserId : !form.groupId) || assignMut.isPending}
                onClick={handleAssign}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50"
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
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button
                disabled={!form.studentUserId || !form.comment.trim() || addMut.isPending}
                onClick={handleAdd}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50"
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
              setSelectedStudent(student ? { id: student.id, name: student.name } : null);
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

          <p className="text-xs text-gray-600 text-center">Report generated {new Date(report.generatedAt).toLocaleDateString("en-GB")} · EquiProfile</p>
        </div>
      ) : null}
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
      {activeView === "feedback" && (
        <FeedbackView
          prefillStudentId={feedbackPrefill?.id}
          prefillStudentName={feedbackPrefill?.name}
          onClearPrefill={() => setFeedbackPrefill(null)}
        />
      )}
      {activeView === "reports" && <ReportsView />}
    </TeacherDashboardLayout>
  );
}
