// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
/**
 * SchoolDashboard — Dashboard for school owners to manage their organization.
 * View teachers, students, seat usage, invite members, manage roles.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Building2,
  Users,
  UserPlus,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";

// ── Design tokens ────────────────────────────────────────────────────────────
const CARD = "bg-[#111827] border border-white/[0.06] rounded-xl p-5";
const ACCENT = "#6366f1"; // Indigo

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`${CARD} ${className}`}>{children}</div>;
}

export default function SchoolDashboard() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.school.getStats.useQuery();
  const { data: members, isLoading: membersLoading, refetch: refetchMembers } = trpc.school.listMembers.useQuery();
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgDesc, setOrgDesc] = useState("");

  const createOrgMutation = trpc.school.createOrganization.useMutation({
    onSuccess: () => {
      setShowCreateOrg(false);
      setOrgName("");
      setOrgDesc("");
      refetchStats();
    },
  });

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"teacher" | "student">("student");

  const inviteMutation = trpc.school.inviteMember.useMutation({
    onSuccess: () => {
      setInviteEmail("");
      setShowInvite(false);
      refetchStats();
    },
  });
  const removeMutation = trpc.school.removeMember.useMutation({
    onSuccess: () => { refetchMembers(); refetchStats(); },
  });

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const org = stats?.organization;
  const teachers = (members ?? []).filter((m: any) => m.role === "teacher" || m.role === "school_owner");
  const students = (members ?? []).filter((m: any) => m.role === "student");

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Header */}
      <header className="bg-[#111827] border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">School Dashboard</h1>
              <p className="text-xs text-gray-500">{org?.name ?? "Set up your school"}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {!org ? (
          // ── No Organization Yet ──────────────────────────────────────────
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Welcome to School Management</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create your school or organisation to start managing teachers and students.
            </p>
            {!showCreateOrg ? (
              <button
                onClick={() => setShowCreateOrg(true)}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
              >
                Create Organisation
              </button>
            ) : (
              <Card className="max-w-md mx-auto text-left">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Organisation Name</label>
                    <input
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Greenfield Riding School"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Description (optional)</label>
                    <textarea
                      value={orgDesc}
                      onChange={(e) => setOrgDesc(e.target.value)}
                      placeholder="Brief description..."
                      rows={2}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/40 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => createOrgMutation.mutate({ name: orgName.trim(), description: orgDesc.trim() || undefined })}
                      disabled={!orgName.trim() || createOrgMutation.isPending}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                    >
                      {createOrgMutation.isPending ? "Creating..." : "Create"}
                    </button>
                    <button
                      onClick={() => setShowCreateOrg(false)}
                      className="px-4 py-2 rounded-lg bg-white/[0.06] text-gray-400 text-sm hover:bg-white/[0.1] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : (
          // ── Organization Dashboard ────────────────────────────────────
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Plan" value={org.planTier.replace(/_/g, " ").toUpperCase()} />
              <StatCard label="Teachers" value={`${stats?.teacherCount ?? 0} / ${org.maxTeachers}`} />
              <StatCard label="Students" value={`${stats?.studentCount ?? 0} / ${org.maxStudents}`} />
              <StatCard label="Pending Invites" value={String(stats?.pendingInviteCount ?? 0)} />
            </div>

            {/* Invite button */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Members
              </h2>
              <button
                onClick={() => setShowInvite(!showInvite)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Invite Member
              </button>
            </div>

            {/* Invite form */}
            {showInvite && (
              <Card>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Email Address</label>
                    <input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teacher@example.com"
                      type="email"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/40"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (inviteEmail.trim()) {
                          inviteMutation.mutate({ email: inviteEmail.trim(), role: inviteRole });
                        }
                      }}
                      disabled={!inviteEmail.trim() || inviteMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {inviteMutation.isPending ? "Sending..." : "Send Invite"}
                    </button>
                    <button
                      onClick={() => setShowInvite(false)}
                      className="px-4 py-2 rounded-lg bg-white/[0.06] text-gray-400 text-sm hover:bg-white/[0.1] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  {inviteMutation.isSuccess && (
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Invite sent successfully!
                    </p>
                  )}
                  {inviteMutation.isError && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {inviteMutation.error?.message || "Failed to send invite"}
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Teachers list */}
            <Card>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Teachers ({teachers.length})
              </h3>
              {membersLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400 mx-auto" />
              ) : teachers.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No teachers yet. Invite one above.</p>
              ) : (
                <div className="space-y-2">
                  {teachers.map((m: any) => (
                    <MemberRow
                      key={m.id}
                      name={m.userName ?? m.userEmail ?? "Unknown"}
                      role={m.role}
                      joinedAt={m.joinedAt}
                      onRemove={m.role !== "school_owner" ? () => removeMutation.mutate({ memberId: m.id }) : undefined}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Students list */}
            <Card>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Students ({students.length})
              </h3>
              {membersLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400 mx-auto" />
              ) : students.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No students yet. Invite them above.</p>
              ) : (
                <div className="space-y-2">
                  {students.map((m: any) => (
                    <MemberRow
                      key={m.id}
                      name={m.userName ?? m.userEmail ?? "Unknown"}
                      role={m.role}
                      joinedAt={m.joinedAt}
                      onRemove={() => removeMutation.mutate({ memberId: m.id })}
                    />
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${CARD}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function MemberRow({ name, role, joinedAt, onRemove }: {
  name: string;
  role: string;
  joinedAt: string | Date | null;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{name}</p>
        <p className="text-[10px] text-gray-500">
          {role === "school_owner" ? "Owner" : role.charAt(0).toUpperCase() + role.slice(1)}
          {joinedAt && <> · Joined {new Date(joinedAt).toLocaleDateString()}</>}
        </p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-gray-500 hover:text-red-400 transition-colors"
          title="Remove member"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
