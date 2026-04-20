/**
 * AdminCampaigns — Email / marketing campaign management tool.
 *
 * SINGLE SOURCE OF TRUTH: Admin email campaign system.
 *
 * ⚠️  SYSTEM SEPARATION — READ BEFORE EDITING
 * ---------------------------------------------
 * This file manages EMAIL / MARKETING CAMPAIGNS only:
 *   - Branded HTML email templates (server/_core/emailTemplates.ts)
 *   - Campaign creation, scheduling, and segment targeting
 *   - Marketing contacts management
 *   - Drip-sequence launching
 *
 * This is NOT the horse training template system. For horse training plans:
 *   client/src/pages/TrainingTemplates.tsx  (user-facing, /training-templates)
 *   Admin read-only view of training templates → Admin.tsx (templates section)
 *
 * This component is lazy-loaded from Admin.tsx → "campaigns" section.
 */
import { useState, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  Mail,
  Send,
  Eye,
  Plus,
  Trash2,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  TestTube,
  Palette,
  Pause,
  Play,
  Globe,
  Upload,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldBan,
  ShieldCheck,
  MapPin,
  BarChart3,
  CalendarDays,
  Building2,
  GraduationCap,
  Info,
  TrendingUp,
  Zap,
  Timer,
} from "lucide-react";
import { toast } from "sonner";

// ─── Campaign Operations Panel ───────────────────────────────────────────────
/**
 * Live mailbox status panel — shows today's outreach counts, follow-up counts,
 * remaining capacity, queued campaigns, and the next automated send window.
 */
function CampaignOperationsPanel() {
  const { data, isLoading, refetch } = trpc.admin.getCampaignMailboxStatus.useQuery(undefined, {
    refetchInterval: 60_000, // refresh every 60 s
  });

  const now = new Date();
  const nowUTC = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} UTC`;

  const newPct = data ? Math.round((data.newOutreachSentToday / data.newOutreachCap) * 100) : 0;
  const totalPct = data ? Math.round((data.totalSentToday / data.totalCap) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4 text-[#2e6da4]" />
            Campaign Engine — Today's Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{nowUTC}</span>
            <Button size="sm" variant="ghost" onClick={() => refetch()} className="h-7 px-2 text-xs">
              Refresh
            </Button>
          </div>
        </div>
        <CardDescription>
          Live view of today's send activity, remaining capacity, and automated queue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Status indicators */}
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${data.isWeekday ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                {data.isWeekday ? "✓ Weekday — sends active" : "✗ Weekend — sends paused"}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${data.isWithinSendHours ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                {data.isWithinSendHours ? "✓ Within send hours" : "○ Outside send hours"}
              </span>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* New outreach */}
              <div className="rounded-xl border border-[#2e6da4]/20 bg-[#f0f6ff] dark:bg-[#0c1e3c]/30 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">New Outreach</p>
                <p className="text-2xl font-bold text-[#2e6da4]">{data.newOutreachSentToday}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">of {data.newOutreachCap} today</p>
                <div className="mt-1.5 h-1.5 rounded-full bg-[#2e6da4]/15 overflow-hidden">
                  <div className="h-full rounded-full bg-[#2e6da4] transition-all" style={{ width: `${Math.min(100, newPct)}%` }} />
                </div>
              </div>

              {/* Follow-ups */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700/30 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Follow-ups</p>
                <p className="text-2xl font-bold text-emerald-600">{data.followupsSentToday}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">auto-sequenced today</p>
              </div>

              {/* Total sent */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/40 bg-slate-50 dark:bg-slate-800/30 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Total Sent</p>
                <p className="text-2xl font-bold">{data.totalSentToday}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">of {data.totalCap} cap</p>
                <div className="mt-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${totalPct >= 90 ? "bg-red-500" : totalPct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(100, totalPct)}%` }}
                  />
                </div>
              </div>

              {/* Remaining capacity */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/40 bg-slate-50 dark:bg-slate-800/30 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Remaining Today</p>
                <p className={`text-2xl font-bold ${data.totalRemaining === 0 ? "text-red-500" : data.totalRemaining <= 5 ? "text-amber-500" : "text-slate-700 dark:text-slate-200"}`}>
                  {data.totalRemaining}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {data.newOutreachRemaining} outreach + {Math.max(0, data.totalRemaining - data.newOutreachRemaining)} followup
                </p>
              </div>
            </div>

            {/* Queue + next window row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Queued */}
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700/30 px-4 py-3">
                <Timer className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    {data.queuedForNextWindow} queued
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.pausedCampaignsCount} paused campaign{data.pausedCampaignsCount !== 1 ? "s" : ""} · up to {data.perWindowLimit}/window
                  </p>
                </div>
              </div>

              {/* Next window */}
              <div className="flex items-center gap-3 rounded-xl border border-[#2e6da4]/20 bg-[#f0f6ff] dark:bg-[#0c1e3c]/30 px-4 py-3">
                <TrendingUp className="w-5 h-5 text-[#2e6da4] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#0c1e3c] dark:text-blue-200">
                    Next window: {data.nextSendWindow}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Windows: {data.sendWindows.join(" · ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">Unable to load status</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Status Badge Helper ─────────────────────────────────────────────────────

function statusBadge(status: string) {
  switch (status) {
    case "draft":
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="w-3 h-3" /> Draft
        </Badge>
      );
    case "sending":
      return (
        <Badge className="gap-1 bg-yellow-500">
          <Loader2 className="w-3 h-3 animate-spin" /> Sending
        </Badge>
      );
    case "sent":
      return (
        <Badge className="gap-1 bg-green-600">
          <CheckCircle2 className="w-3 h-3" /> Sent
        </Badge>
      );
    case "paused":
      return (
        <Badge className="gap-1 bg-orange-500">
          <Pause className="w-3 h-3" /> Paused
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" /> Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminCampaigns() {
  const [createOpen, setCreateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmSendId, setConfirmSendId] = useState<number | null>(null);
  // campaign type drives which template subset is shown
  const [campaignCategory, setCampaignCategory] = useState<"management" | "academy_school" | "">("");
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    templateId: "",
    segment: "" as "leads" | "trial" | "paid" | "all" | "marketing" | "",
    content: "",
    firstName: "",
    targetCountry: "",
    targetType: "",
    dailyLimit: 25,
  });

  // Queries
  const templates = trpc.admin.getTemplates.useQuery();
  const segments = trpc.admin.getSegmentCounts.useQuery();
  const campaigns = trpc.admin.getCampaigns.useQuery();
  const utils = trpc.useUtils();

  // Mutations
  const createMutation = trpc.admin.createCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign created");
      setCreateOpen(false);
      setCampaignCategory("");
      setNewCampaign({
        name: "",
        subject: "",
        templateId: "",
        segment: "",
        content: "",
        firstName: "",
        targetCountry: "",
        targetType: "",
        dailyLimit: 25,
      });
      utils.admin.getCampaigns.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const sendMutation = trpc.admin.sendCampaign.useMutation({
    onSuccess: (data) => {
      const parts = [`${data.sentCount} delivered`, `${data.failedCount} failed`];
      if (data.deferred > 0) parts.push(`${data.deferred} deferred (daily limit: ${data.dailyLimit})`);
      toast.success(`Campaign sent! ${parts.join(", ")}`);
      setConfirmSendId(null);
      utils.admin.getCampaigns.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const testEmailMutation = trpc.admin.sendTestEmail.useMutation({
    onSuccess: () => toast.success("Test email sent to your admin email"),
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.deleteCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign deleted");
      utils.admin.getCampaigns.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const pauseMutation = trpc.admin.pauseCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign paused");
      utils.admin.getCampaigns.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const resumeMutation = trpc.admin.resumeCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign resumed");
      utils.admin.getCampaigns.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const previewMutation = trpc.admin.previewTemplate.useQuery(
    {
      templateId: newCampaign.templateId || "general",
      mergeFields: {
        firstName: newCampaign.firstName || "Preview User",
        subject: newCampaign.subject || "Campaign Subject",
        content: newCampaign.content || "Your content here.",
      },
    },
    {
      enabled: previewOpen && !!newCampaign.templateId,
    },
  );

  function handlePreview(templateId?: string) {
    if (templateId) {
      setNewCampaign((prev) => ({ ...prev, templateId }));
    }
    setPreviewOpen(true);
  }

  function handleCreate() {
    if (
      !newCampaign.name ||
      !newCampaign.subject ||
      !newCampaign.templateId ||
      !newCampaign.segment
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate({
      name: newCampaign.name,
      subject: newCampaign.subject,
      templateId: newCampaign.templateId,
      segment: newCampaign.segment as "leads" | "trial" | "paid" | "all" | "marketing",
      targetCountry: newCampaign.targetCountry || undefined,
      targetType: newCampaign.targetType || undefined,
      dailyLimit: newCampaign.dailyLimit,
      mergeFields: {
        subject: newCampaign.subject,
        content: newCampaign.content,
      },
    });
  }

  function handleTestSend() {
    if (!newCampaign.templateId || !newCampaign.subject) {
      toast.error("Select a template and enter a subject first");
      return;
    }
    testEmailMutation.mutate({
      templateId: newCampaign.templateId,
      subject: newCampaign.subject,
      mergeFields: {
        firstName: newCampaign.firstName || undefined,
        subject: newCampaign.subject,
        content: newCampaign.content || undefined,
      },
    });
  }

  // Derive country options for dropdowns
  const countryOptions = segments.data?.byCountry ?? [];
  const typeOptions = segments.data?.byType ?? [];
  const priorityCountries = ["UK", "Ireland", "USA"];

  return (
    <div className="space-y-6">
      {/* Segment Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Chat Leads",
            key: "leads" as const,
            color: "text-orange-600",
          },
          {
            label: "Marketing",
            key: "marketing" as const,
            color: "text-indigo-600",
          },
          {
            label: "Trial Users",
            key: "trial" as const,
            color: "text-blue-600",
          },
          {
            label: "Paid Users",
            key: "paid" as const,
            color: "text-green-600",
          },
          {
            label: "All Users",
            key: "all" as const,
            color: "text-purple-600",
          },
          {
            label: "Unsubscribed",
            key: "unsubscribed" as const,
            color: "text-red-500",
          },
        ].map((seg) => (
          <Card key={seg.key}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-sm text-muted-foreground">{seg.label}</p>
              <p className={`text-2xl font-bold ${seg.color}`}>
                {segments.isLoading ? (
                  <Skeleton className="h-8 w-12 mx-auto" />
                ) : (
                  segments.data?.[seg.key] || 0
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Segment Breakdown: By Country & By Type */}
      {segments.data && (segments.data.byCountry.length > 0 || segments.data.byType.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* By Country */}
          {segments.data.byCountry.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="w-4 h-4" />
                  Contacts by Country
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Priority countries first */}
                  {priorityCountries.map((pc) => {
                    const entry = segments.data!.byCountry.find(
                      (c) => c.country.toLowerCase() === pc.toLowerCase(),
                    );
                    if (!entry) return null;
                    return (
                      <div key={pc} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span className="text-sm font-medium">{entry.country}</span>
                        </div>
                        <Badge variant="secondary">{entry.count}</Badge>
                      </div>
                    );
                  })}
                  {/* Other countries */}
                  {segments.data.byCountry
                    .filter((c) => !priorityCountries.some((pc) => pc.toLowerCase() === c.country.toLowerCase()))
                    .map((c) => (
                      <div key={c.country} className="flex items-center justify-between px-3 py-1.5">
                        <span className="text-sm text-muted-foreground">{c.country}</span>
                        <span className="text-sm">{c.count}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* By Type */}
          {segments.data.byType.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="w-4 h-4" />
                  Contacts by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {segments.data.byType.map((t) => (
                    <div key={t.type} className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50">
                      <Badge variant="outline" className="capitalize">
                        {t.type.replace(/_/g, " ")}
                      </Badge>
                      <Badge variant="secondary">{t.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Email Sending Safety / DNS Readiness */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Email Sending Readiness
          </CardTitle>
          <CardDescription>
            Ensure DNS and email provider are properly configured before sending campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                name: "SPF Record",
                hint: "TXT record authorizing your SMTP server to send on behalf of your domain.",
                doc: "v=spf1 include:_spf.google.com ~all",
              },
              {
                name: "DKIM Signing",
                hint: "Cryptographic signature added by your email provider to authenticate messages.",
                doc: "Configure via your SMTP/email provider settings.",
              },
              {
                name: "DMARC Policy",
                hint: "Policy record that tells receiving servers how to handle unauthenticated emails.",
                doc: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com',
              },
              {
                name: "SMTP Provider",
                hint: "Ensure SMTP_HOST, SMTP_USER, and SMTP_PASS are configured in your environment.",
                doc: "SMTP credentials must be set in .env before sending.",
              },
            ].map((item) => (
              <div key={item.name} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{item.hint}</p>
                <code className="text-[10px] text-blue-600 break-all">{item.doc}</code>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ⚠️ Campaigns will attempt to send via your configured SMTP provider. Ensure DNS records are verified
            and your sending domain has good reputation before launching campaigns to avoid deliverability issues.
          </p>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Email Templates
            </CardTitle>
            <CardDescription>
              Professional branded templates — one standard EquiProfile letterhead
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {templates.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Management / Stable / Yard / Owner Templates */}
              {templates.data?.filter((t) => t.category === "management").length ? (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#2e6da4]" />
                    Management · Stable · Yard · Owner
                    <Badge variant="secondary" className="text-[10px] ml-auto">{templates.data?.filter((t) => t.category === "management").length} templates</Badge>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {templates.data
                      ?.filter((t) => t.category === "management")
                      .map((tpl) => (
                        <div
                          key={tpl.id}
                          className="border rounded-xl p-4 hover:shadow-md hover:border-[#2e6da4]/40 transition-all flex flex-col bg-white dark:bg-[#0f1a2e]/40"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: "#0c1e3c" }}>
                              <Building2 className="w-3.5 h-3.5 text-white" />
                            </div>
                            <h4 className="font-semibold text-sm leading-snug">{tpl.name}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3 flex-1 leading-relaxed">
                            {tpl.description}
                          </p>
                          <div className="flex gap-2 mt-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handlePreview(tpl.id)}
                            >
                              <Eye className="w-3 h-3 mr-1" /> Preview
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1 bg-[#2e6da4] hover:bg-[#1a5ca0]"
                              onClick={() => {
                                setCampaignCategory("management");
                                setNewCampaign((p) => ({ ...p, templateId: tpl.id }));
                                setCreateOpen(true);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" /> Use
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}

              {/* Academy / School / Education Templates */}
              {templates.data?.filter((t) => t.category === "academy_school").length ? (
                <div>
                  <div className="pt-2 border-t border-border mb-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-[#1a5ca0]" />
                      Academy · Riding School · Education
                      <Badge variant="secondary" className="text-[10px] ml-auto">{templates.data?.filter((t) => t.category === "academy_school").length} templates</Badge>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {templates.data
                      ?.filter((t) => t.category === "academy_school")
                      .map((tpl) => (
                        <div
                          key={tpl.id}
                          className="border rounded-xl p-4 hover:shadow-md hover:border-[#1a5ca0]/40 transition-all flex flex-col bg-white dark:bg-[#0f1a2e]/40"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: "#163563" }}>
                              <GraduationCap className="w-3.5 h-3.5 text-white" />
                            </div>
                            <h4 className="font-semibold text-sm leading-snug">{tpl.name}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3 flex-1 leading-relaxed">
                            {tpl.description}
                          </p>
                          <div className="flex gap-2 mt-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handlePreview(tpl.id)}
                            >
                              <Eye className="w-3 h-3 mr-1" /> Preview
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1 bg-[#163563] hover:bg-[#0c1e3c]"
                              onClick={() => {
                                setCampaignCategory("academy_school");
                                setNewCampaign((p) => ({ ...p, templateId: tpl.id }));
                                setCreateOpen(true);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" /> Use
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sending Policy Banner */}
      <div className="rounded-xl border border-[#2e6da4]/30 bg-[#f0f6ff] dark:bg-[#0c1e3c]/30 p-4 flex flex-wrap gap-4 items-start">
        <Info className="w-4 h-4 text-[#2e6da4] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#0c1e3c] dark:text-blue-200 mb-1">Campaign Sending Policy</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3 text-[#2e6da4]" />
              <strong>Weekdays only</strong> — Mon–Fri, 08:00–18:00 UTC
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-[#2e6da4]" />
              Max <strong>25 new outreach</strong> emails/day
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Send className="w-3 h-3 text-[#2e6da4]" />
              <strong>5 per window</strong> · auto-staggered at 08:30 / 10:30 / 12:30 / 14:30 / 16:30 UTC
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-green-600" />
              40 total/day hard cap · suppression + dedup enforced
            </span>
          </div>
        </div>
      </div>

      {/* Campaign Operations Panel */}
      <CampaignOperationsPanel />

      {/* Create Campaign */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Create Campaign
            </CardTitle>
            <CardDescription>
              Compose and send emails to your audience segments
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Campaign
          </Button>
        </CardHeader>
      </Card>

      {/* Sequence Templates — Pre-built Drip Campaigns */}
      <SequenceTemplatesSection />

      {/* Campaign History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Campaign History
          </CardTitle>
          <CardDescription>
            Past and pending email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !campaigns.data?.length ? (
            <p className="text-center text-muted-foreground py-8">
              No campaigns yet. Create your first campaign above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Targeting</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Recipients</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                    <TableHead className="text-right">Daily Limit</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.data.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c.segment}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {c.targetCountry && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Globe className="w-3 h-3" />
                              {c.targetCountry}
                            </Badge>
                          )}
                          {c.targetType && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {c.targetType.replace(/_/g, " ")}
                            </Badge>
                          )}
                          {!c.targetCountry && !c.targetType && (
                            <span className="text-xs text-muted-foreground">All</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                      <TableCell className="text-right">
                        {c.recipientCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {c.sentCount}
                        {c.sentToday ? (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({c.sentToday} today)
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        {c.failedCount}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        <span className="text-muted-foreground">{c.dailyLimit ?? 50}/day</span>
                        {c.status !== "sent" && (
                          <span className="block text-emerald-600 font-medium">
                            {Math.max(0, (c.dailyLimit ?? 50) - (c.sentToday ?? 0))} left
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.sentAt
                          ? new Date(c.sentAt).toLocaleDateString()
                          : c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString()
                            : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(c.status === "draft" || c.status === "paused") && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => setConfirmSendId(c.id)}
                              disabled={sendMutation.isPending}
                            >
                              <Send className="w-3 h-3 mr-1" /> Send
                            </Button>
                          )}
                          {c.status === "paused" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resumeMutation.mutate({ campaignId: c.id })}
                              disabled={resumeMutation.isPending}
                            >
                              <Play className="w-3 h-3 mr-1" /> Resume
                            </Button>
                          )}
                          {(c.status === "draft" || c.status === "sending") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => pauseMutation.mutate({ campaignId: c.id })}
                              disabled={pauseMutation.isPending || c.status === "sending"}
                            >
                              <Pause className="w-3 h-3 mr-1" /> Pause
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              deleteMutation.mutate({
                                campaignId: c.id,
                              })
                            }
                            disabled={
                              c.status === "sending" ||
                              deleteMutation.isPending
                            }
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) setCampaignCategory(""); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up your email campaign — select a type, template, audience, and daily limit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">

            {/* Step 1: Campaign Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">Campaign Type <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCampaignCategory("management");
                    if (newCampaign.templateId) {
                      const tpl = templates.data?.find((t) => t.id === newCampaign.templateId);
                      if (tpl && tpl.category !== "management") setNewCampaign((p) => ({ ...p, templateId: "" }));
                    }
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-sm font-medium transition-all cursor-pointer ${campaignCategory === "management" ? "border-[#2e6da4] bg-[#f0f6ff] dark:bg-[#0c1e3c]/50" : "border-border hover:border-[#2e6da4]/40"}`}
                >
                  <Building2 className={`w-5 h-5 ${campaignCategory === "management" ? "text-[#2e6da4]" : "text-muted-foreground"}`} />
                  <span>Management</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Stable · Yard · Owner</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCampaignCategory("academy_school");
                    if (newCampaign.templateId) {
                      const tpl = templates.data?.find((t) => t.id === newCampaign.templateId);
                      if (tpl && tpl.category !== "academy_school") setNewCampaign((p) => ({ ...p, templateId: "" }));
                    }
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-sm font-medium transition-all cursor-pointer ${campaignCategory === "academy_school" ? "border-[#163563] bg-[#f0f4ff] dark:bg-[#0c1e3c]/50" : "border-border hover:border-[#163563]/40"}`}
                >
                  <GraduationCap className={`w-5 h-5 ${campaignCategory === "academy_school" ? "text-[#163563]" : "text-muted-foreground"}`} />
                  <span>Academy / School</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Riding School · Education</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name <span className="text-destructive">*</span></Label>
              <Input
                id="campaign-name"
                placeholder="e.g., Spring Health Tracking Promo"
                value={newCampaign.name}
                onChange={(e) =>
                  setNewCampaign((p) => ({
                    ...p,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-subject">Email Subject <span className="text-destructive">*</span></Label>
              <Input
                id="campaign-subject"
                placeholder="e.g., Track your horse's health like never before"
                value={newCampaign.subject}
                onChange={(e) =>
                  setNewCampaign((p) => ({
                    ...p,
                    subject: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template <span className="text-destructive">*</span></Label>
                <Select
                  value={newCampaign.templateId}
                  onValueChange={(v) =>
                    setNewCampaign((p) => ({ ...p, templateId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={campaignCategory ? "Select template" : "Select type first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Show templates filtered by the selected campaign category */}
                    {campaignCategory === "management" && (
                      <SelectGroup>
                        <SelectLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5 flex items-center gap-1.5">
                          <Building2 className="w-3 h-3" /> Management Platform
                        </SelectLabel>
                        {templates.data
                          ?.filter((t) => t.category === "management")
                          .map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    )}
                    {campaignCategory === "academy_school" && (
                      <SelectGroup>
                        <SelectLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5 flex items-center gap-1.5">
                          <GraduationCap className="w-3 h-3" /> Academy / School
                        </SelectLabel>
                        {templates.data
                          ?.filter((t) => t.category === "academy_school")
                          .map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    )}
                    {/* Fallback: show all if no type selected */}
                    {!campaignCategory && (
                      <>
                        <SelectGroup>
                          <SelectLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5">Management Platform</SelectLabel>
                          {templates.data?.filter((t) => t.category === "management").map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectGroup>
                        {templates.data?.some((t) => t.category === "academy_school") && (
                          <SelectGroup>
                            <SelectLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5 mt-1 border-t border-border pt-2">Academy / School</SelectLabel>
                            {templates.data?.filter((t) => t.category === "academy_school").map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Audience Segment</Label>
                <Select
                  value={newCampaign.segment}
                  onValueChange={(v) =>
                    setNewCampaign((p) => ({
                      ...p,
                      segment: v as "leads" | "trial" | "paid" | "all" | "marketing",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leads">
                      Chat Leads ({segments.data?.leads || 0})
                    </SelectItem>
                    <SelectItem value="marketing">
                      Marketing Contacts ({segments.data?.marketing || 0})
                    </SelectItem>
                    <SelectItem value="trial">
                      Trial Users ({segments.data?.trial || 0})
                    </SelectItem>
                    <SelectItem value="paid">
                      Paid Users ({segments.data?.paid || 0})
                    </SelectItem>
                    <SelectItem value="all">
                      All Users ({segments.data?.all || 0})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Targeting: Country, Type, Daily Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Target Country</Label>
                <Select
                  value={newCampaign.targetCountry}
                  onValueChange={(v) =>
                    setNewCampaign((p) => ({ ...p, targetCountry: v === "__all__" ? "" : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Countries</SelectItem>
                    {priorityCountries.map((pc) => {
                      const entry = countryOptions.find(
                        (c) => c.country.toLowerCase() === pc.toLowerCase(),
                      );
                      return (
                        <SelectItem key={pc} value={pc}>
                          {pc} {entry ? `(${entry.count})` : ""}
                        </SelectItem>
                      );
                    })}
                    {countryOptions
                      .filter((c) => !priorityCountries.some((pc) => pc.toLowerCase() === c.country.toLowerCase()))
                      .map((c) => (
                        <SelectItem key={c.country} value={c.country}>
                          {c.country} ({c.count})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Type</Label>
                <Select
                  value={newCampaign.targetType}
                  onValueChange={(v) =>
                    setNewCampaign((p) => ({ ...p, targetType: v === "__all__" ? "" : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Types</SelectItem>
                    {typeOptions.map((t) => (
                      <SelectItem key={t.type} value={t.type}>
                        {t.type.replace(/_/g, " ")} ({t.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily-limit">Daily Limit</Label>
                <Input
                  id="daily-limit"
                  type="number"
                  min={1}
                  max={25}
                  value={newCampaign.dailyLimit}
                  onChange={(e) =>
                    setNewCampaign((p) => ({
                      ...p,
                      dailyLimit: Math.max(1, Math.min(25, parseInt(e.target.value) || 25)),
                    }))
                  }
                />
                <p className="text-[10px] text-muted-foreground">
                  Max 25 new outreach/day. Total mailbox cap: 40/day.
                </p>
              </div>
            </div>

            {/* Weekday-only notice */}
            <div className="flex items-center gap-2 rounded-lg border border-[#2e6da4]/20 bg-[#f0f6ff] dark:bg-[#0c1e3c]/30 px-3 py-2">
              <CalendarDays className="w-3.5 h-3.5 text-[#2e6da4] shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong>Weekdays only.</strong> Campaign sending is restricted to Mon–Fri to protect deliverability.
              </p>
            </div>

            {/* Inline template preview card — shown immediately after selection */}
            {newCampaign.templateId && (() => {
              const selected = templates.data?.find((t) => t.id === newCampaign.templateId);
              return selected ? (
                <div className="flex items-start gap-3 rounded-xl border border-[#2e6da4]/30 bg-[#f0f6ff] dark:bg-[#0c1e3c]/30 p-3">
                  <div className="mt-0.5 h-9 w-9 shrink-0 rounded-lg flex items-center justify-center" style={{ background: "#0c1e3c" }}>
                    {selected.category === "academy_school"
                      ? <GraduationCap className="w-4 h-4 text-white" />
                      : <Building2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug">{selected.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{selected.description}</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1 h-auto p-0 text-xs text-[#2e6da4]"
                      onClick={() => handlePreview(selected.id)}
                    >
                      <Eye className="mr-1 w-3 h-3" /> Full preview →
                    </Button>
                  </div>
                </div>
              ) : null;
            })()}
            {newCampaign.templateId === "general" && (
              <div className="space-y-2">
                <Label htmlFor="campaign-content">Email Content</Label>
                <Textarea
                  id="campaign-content"
                  placeholder="Write your email content here..."
                  rows={5}
                  value={newCampaign.content}
                  onChange={(e) =>
                    setNewCampaign((p) => ({
                      ...p,
                      content: e.target.value,
                    }))
                  }
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview()}
                disabled={!newCampaign.templateId}
              >
                <Eye className="w-3 h-3 mr-1" /> Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestSend}
                disabled={
                  !newCampaign.templateId ||
                  !newCampaign.subject ||
                  testEmailMutation.isPending
                }
              >
                {testEmailMutation.isPending ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <TestTube className="w-3 h-3 mr-1" />
                )}
                Test Send to Me
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-1" />
              )}
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              This is how the email will look to recipients
            </DialogDescription>
          </DialogHeader>
          {previewMutation.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : previewMutation.data?.html ? (
            <div className="border rounded-lg overflow-hidden">
              <iframe
                srcDoc={previewMutation.data.html}
                title="Email Preview"
                className="w-full min-h-[500px] border-0"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Select a template to preview
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Send Dialog */}
      <AlertDialog
        open={confirmSendId !== null}
        onOpenChange={() => setConfirmSendId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the campaign to all recipients in the selected
              segment, up to the configured daily limit. Sending is restricted
              to weekdays (Mon–Fri). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmSendId) {
                  sendMutation.mutate({ campaignId: confirmSendId });
                }
              }}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1" />
              )}
              Send Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Marketing Contacts Section */}
      <MarketingContactsSection />
    </div>
  );
}

// ─── Sequence Templates Sub-Component ─────────────────────────────────────────

function SequenceTemplatesSection() {
  const seqTemplates = trpc.admin.getSequenceTemplates.useQuery();
  const utils = trpc.useUtils();
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [segment, setSegment] = useState<"marketing" | "leads" | "trial" | "paid" | "all">("marketing");
  const segments = trpc.admin.getSegmentCounts.useQuery();

  const launchMutation = trpc.admin.launchSequenceFromTemplate.useMutation({
    onSuccess: (data) => {
      toast.success(`Campaign created with ${data.stepsCreated} follow-up steps`);
      setLaunchingId(null);
      utils.admin.getCampaigns.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Ready-to-Run Campaign Sequences
        </CardTitle>
        <CardDescription>
          Pre-built 4-step drip sequences — Initial → Day 3 → Day 6 → Day 10. Sends weekdays only, 30/day total.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {seqTemplates.isLoading ? (
          <div className="space-y-2"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
        ) : (
          <div className="space-y-4">
            {seqTemplates.data?.map((tpl) => (
              <div key={tpl.id} className="border rounded-xl p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{tpl.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{tpl.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tpl.steps.map((s) => (
                        <Badge key={s.stepNumber} variant="outline" className="text-xs">
                          Day {s.delayDays}: {s.subject.slice(0, 40)}{s.subject.length > 40 ? "…" : ""}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {launchingId === tpl.id ? (
                      <div className="flex items-center gap-2">
                        <Select value={segment} onValueChange={(v) => setSegment(v as typeof segment)}>
                          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="marketing">Marketing ({segments.data?.marketing || 0})</SelectItem>
                            <SelectItem value="leads">Chat Leads ({segments.data?.leads || 0})</SelectItem>
                            <SelectItem value="trial">Trial ({segments.data?.trial || 0})</SelectItem>
                            <SelectItem value="paid">Paid ({segments.data?.paid || 0})</SelectItem>
                            <SelectItem value="all">All ({segments.data?.all || 0})</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          className="text-xs"
                          onClick={() => launchMutation.mutate({ templateId: tpl.id, segment })}
                          disabled={launchMutation.isPending}
                        >
                          {launchMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create"}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setLaunchingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => setLaunchingId(tpl.id)}>
                        <Plus className="w-3 h-3 mr-1" />
                        Launch Sequence
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Marketing Contacts Sub-Component ────────────────────────────────────────

function MarketingContactsSection() {
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    email: "",
    name: "",
    businessName: "",
    contactType: "individual" as "individual" | "riding_school" | "stable",
    region: "",
    country: "",
    tags: "",
  });

  // Filters & pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterType, setFilterType] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const utils = trpc.useUtils();
  const segments = trpc.admin.getSegmentCounts.useQuery();

  const contacts = trpc.admin.getMarketingContacts.useQuery({
    search: searchQuery || undefined,
    country: filterCountry || undefined,
    contactType: filterType || undefined,
    limit: pageSize,
    offset: page * pageSize,
  });

  const unsubscribes = trpc.admin.getUnsubscribes.useQuery();

  const createMutation = trpc.admin.createMarketingContact.useMutation({
    onSuccess: () => {
      toast.success("Contact added");
      setAddOpen(false);
      setNewContact({ email: "", name: "", businessName: "", contactType: "individual", region: "", country: "", tags: "" });
      utils.admin.getMarketingContacts.invalidate();
      utils.admin.getSegmentCounts.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.deleteMarketingContact.useMutation({
    onSuccess: () => {
      toast.success("Contact removed");
      utils.admin.getMarketingContacts.invalidate();
      utils.admin.getSegmentCounts.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const hasMore = (contacts.data?.length ?? 0) >= pageSize;
  const countryOptions = segments.data?.byCountry ?? [];
  const typeOptions = segments.data?.byType ?? [];

  return (
    <>
      {/* Marketing Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Marketing Contacts
            </CardTitle>
            <CardDescription>
              Manage external leads and outreach contacts (UK GDPR compliant)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search email, name, business..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
            </div>
            <Select
              value={filterCountry || "__all__"}
              onValueChange={(v) => {
                setFilterCountry(v === "__all__" ? "" : v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Countries</SelectItem>
                {countryOptions.map((c) => (
                  <SelectItem key={c.country} value={c.country}>
                    {c.country} ({c.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterType || "__all__"}
              onValueChange={(v) => {
                setFilterType(v === "__all__" ? "" : v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Types</SelectItem>
                {typeOptions.map((t) => (
                  <SelectItem key={t.type} value={t.type}>
                    {t.type.replace(/_/g, " ")} ({t.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {contacts.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !contacts.data?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchQuery || filterCountry || filterType
                ? "No contacts match your filters."
                : "No marketing contacts yet. Add contacts manually or import a file."}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.data.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="text-xs">{contact.email}</TableCell>
                        <TableCell className="text-xs">{contact.name || "—"}</TableCell>
                        <TableCell className="text-xs">{contact.businessName || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {contact.contactType?.replace(/_/g, " ") || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{contact.country || "—"}</TableCell>
                        <TableCell className="text-xs">{contact.region || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={contact.status === "active" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {contact.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteMutation.mutate({ id: contact.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page + 1} · Showing {contacts.data.length} contacts
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasMore}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Suppression List */}
      <SuppressionListSection />

      {/* Add Contact Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Marketing Contact</DialogTitle>
            <DialogDescription>Add a new contact to your outreach list</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Email *</Label>
              <Input
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="info@example.com"
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <Label>Business Name</Label>
              <Input
                value={newContact.businessName}
                onChange={(e) => setNewContact({ ...newContact, businessName: e.target.value })}
                placeholder="Happy Hooves Stables"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select
                  value={newContact.contactType}
                  onValueChange={(v) => setNewContact({ ...newContact, contactType: v as "individual" | "riding_school" | "stable" })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="riding_school">Riding School</SelectItem>
                    <SelectItem value="stable">Stable / Yard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={newContact.country}
                  onChange={(e) => setNewContact({ ...newContact, country: e.target.value })}
                  placeholder="e.g. UK"
                />
              </div>
            </div>
            <div>
              <Label>Region</Label>
              <Input
                value={newContact.region}
                onChange={(e) => setNewContact({ ...newContact, region: e.target.value })}
                placeholder="e.g. South East England"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate({
                email: newContact.email,
                name: newContact.name || undefined,
                businessName: newContact.businessName || undefined,
                contactType: newContact.contactType,
                region: newContact.region || undefined,
                country: newContact.country || undefined,
              })}
              disabled={createMutation.isPending || !newContact.email}
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Import Dialog */}
      <FileImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </>
  );
}

// ─── Suppression List with Manual Add/Remove ─────────────────────────────────

function SuppressionListSection() {
  const [suppressEmail, setSuppressEmail] = useState("");
  const [suppressReason, setSuppressReason] = useState("");

  const utils = trpc.useUtils();
  const unsubscribes = trpc.admin.getUnsubscribes.useQuery();

  const addSuppressionMutation = trpc.admin.addSuppression.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Email added to suppression list");
      setSuppressEmail("");
      setSuppressReason("");
      utils.admin.getUnsubscribes.invalidate();
      utils.admin.getMarketingContacts.invalidate();
      utils.admin.getSegmentCounts.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const removeSuppressionMutation = trpc.admin.removeSuppression.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Email removed from suppression list");
      utils.admin.getUnsubscribes.invalidate();
      utils.admin.getMarketingContacts.invalidate();
      utils.admin.getSegmentCounts.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  function handleAddSuppression() {
    if (!suppressEmail.trim() || !suppressEmail.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    addSuppressionMutation.mutate({
      email: suppressEmail.trim(),
      reason: suppressReason.trim() || undefined,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldBan className="w-5 h-5" />
          Suppression List
        </CardTitle>
        <CardDescription>
          Unsubscribed emails — excluded from all marketing sends. Remove an entry to re-enable sending if requested by the user.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Manual Suppression Form */}
        <div className="flex flex-wrap gap-2 mb-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs">Email to suppress</Label>
            <Input
              placeholder="email@example.com"
              value={suppressEmail}
              onChange={(e) => setSuppressEmail(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <Label className="text-xs">Reason (optional)</Label>
            <Input
              placeholder="e.g. Requested removal"
              value={suppressReason}
              onChange={(e) => setSuppressReason(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleAddSuppression}
            disabled={addSuppressionMutation.isPending || !suppressEmail.trim()}
          >
            {addSuppressionMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <ShieldBan className="w-4 h-4 mr-1" />
            )}
            Suppress
          </Button>
        </div>

        {unsubscribes.isLoading ? (
          <Skeleton className="h-8 w-full" />
        ) : !unsubscribes.data?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">No unsubscribes yet.</p>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unsubscribes.data.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="text-xs">{u.email}</TableCell>
                    <TableCell className="text-xs">{u.reason || "—"}</TableCell>
                    <TableCell className="text-xs">{u.source || "—"}</TableCell>
                    <TableCell className="text-xs">
                      {u.unsubscribedAt ? new Date(u.unsubscribedAt).toLocaleDateString("en-GB") : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2"
                        disabled={removeSuppressionMutation.isPending}
                        onClick={() => {
                          if (confirm(`Remove ${u.email} from suppression list? They will be able to receive marketing emails again.`)) {
                            removeSuppressionMutation.mutate({ email: u.email });
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── File Import Dialog ──────────────────────────────────────────────────────

type ParsedImport = {
  headers: string[];
  rows: Array<Record<string, string>>;
  mapping: Record<string, string>;
  totalRows: number;
  allRows: Array<Record<string, string>>;
};

const MAPPING_FIELDS = ["email", "name", "businessName", "contactType", "region", "country", "organizationName", "leadFocus"] as const;

function FileImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedImport | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; invalid: number; rejected: number; total: number } | null>(null);

  const utils = trpc.useUtils();

  const parseMutation = trpc.admin.parseImportFile.useMutation({
    onSuccess: (data) => {
      if (!data.totalRows) {
        toast.error("No rows found in file");
        return;
      }
      setParsed(data as ParsedImport);
      setMapping(data.mapping as Record<string, string>);
    },
    onError: (e) => toast.error(e.message),
  });

  const importMutation = trpc.admin.importMarketingContacts.useMutation({
    onSuccess: (data) => {
      setImportResult(data);
      const parts = [`${data.imported} imported`];
      if (data.skipped > 0) parts.push(`${data.skipped} already in DB`);
      if (data.invalid > 0) parts.push(`${data.invalid} invalid`);
      if (data.rejected > 0) parts.push(`${data.rejected} rejected (compliance)`);
      toast.success(parts.join(" · "));
      utils.admin.getMarketingContacts.invalidate();
      utils.admin.getSegmentCounts.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx") {
      toast.error("Please upload a CSV or XLSX file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1] || reader.result as string;
      parseMutation.mutate({
        fileContent: base64,
        fileType: ext as "csv" | "xlsx",
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  }, [parseMutation]);

  function handleImport() {
    if (!parsed?.allRows) return;

    const contacts: Array<{
      email: string;
      name?: string;
      businessName?: string;
      organizationName?: string;
      contactType?: string;
      region?: string;
      country?: string;
      leadFocus?: string;
    }> = [];

    // Build reverse mapping: field -> header column
    const reverseMap: Record<string, string> = {};
    for (const [header, field] of Object.entries(mapping)) {
      if (field && field !== "__skip__") {
        reverseMap[field] = header;
      }
    }

    if (!reverseMap.email) {
      toast.error("Please map at least the Email column");
      return;
    }

    // Client-side deduplication — dedupe by email (case-insensitive) before sending
    const seenEmails = new Set<string>();
    let clientDuplicates = 0;

    for (const row of parsed.allRows) {
      const email = row[reverseMap.email]?.trim();
      if (!email || !email.includes("@")) continue;

      const emailLower = email.toLowerCase();
      if (seenEmails.has(emailLower)) {
        clientDuplicates++;
        continue;
      }
      seenEmails.add(emailLower);

      contacts.push({
        email,
        name: reverseMap.name ? row[reverseMap.name]?.trim() || undefined : undefined,
        businessName: reverseMap.businessName ? row[reverseMap.businessName]?.trim() || undefined : undefined,
        organizationName: reverseMap.organizationName ? row[reverseMap.organizationName]?.trim() || undefined : undefined,
        contactType: reverseMap.contactType ? row[reverseMap.contactType]?.trim() || "individual" : "individual",
        region: reverseMap.region ? row[reverseMap.region]?.trim() || undefined : undefined,
        country: reverseMap.country ? row[reverseMap.country]?.trim() || undefined : undefined,
        leadFocus: reverseMap.leadFocus ? row[reverseMap.leadFocus]?.trim() || undefined : undefined,
      });
    }

    if (contacts.length === 0) {
      toast.error("No valid contacts found with the current mapping");
      return;
    }

    if (clientDuplicates > 0) {
      toast.info(`Removed ${clientDuplicates} duplicate email${clientDuplicates > 1 ? "s" : ""} from the file before importing.`);
    }

    importMutation.mutate({ contacts, source: "file_import" });
  }

  function handleClose(v: boolean) {
    if (!v) {
      setParsed(null);
      setMapping({});
      setImportResult(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Marketing Contacts
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or XLSX file to import contacts in bulk
          </DialogDescription>
        </DialogHeader>

        {importResult ? (
          /* Import Result Summary */
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-sm text-muted-foreground">Imported</p>
                  <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-sm text-muted-foreground">Skipped</p>
                  <p className="text-2xl font-bold text-yellow-600">{importResult.skipped}</p>
                  <p className="text-[10px] text-muted-foreground">already in DB, bounced, or unsubscribed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-orange-600">{importResult.rejected}</p>
                  <p className="text-[10px] text-muted-foreground">compliance / B2B freemail</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-sm text-muted-foreground">Invalid</p>
                  <p className="text-2xl font-bold text-red-600">{importResult.invalid}</p>
                  <p className="text-[10px] text-muted-foreground">bad email format</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-sm text-muted-foreground">Total Rows</p>
                  <p className="text-2xl font-bold">{importResult.total}</p>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : !parsed ? (
          /* File Upload Step */
          <div className="space-y-4 py-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Click to upload CSV or XLSX file</p>
              <p className="text-xs text-muted-foreground mt-1">
                File should contain columns for email, name, business, type, country, etc.
              </p>
              {parseMutation.isPending && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Parsing file...</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={handleFileSelect}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
            </DialogFooter>
          </div>
        ) : (
          /* Preview & Mapping Step */
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Found <span className="text-primary font-bold">{parsed.totalRows}</span> rows with{" "}
                <span className="text-primary font-bold">{parsed.headers.length}</span> columns
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setParsed(null);
                  setMapping({});
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Choose different file
              </Button>
            </div>

            {/* Column Mapping */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Column Mapping</CardTitle>
                <CardDescription className="text-xs">
                  Map your file columns to contact fields. Auto-detected mappings are shown.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {parsed.headers.map((header) => (
                    <div key={header} className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded min-w-[100px] truncate">
                        {header}
                      </span>
                      <span className="text-xs text-muted-foreground">→</span>
                      <Select
                        value={mapping[header] || "__skip__"}
                        onValueChange={(v) =>
                          setMapping((prev) => ({ ...prev, [header]: v }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__skip__">— Skip —</SelectItem>
                          {MAPPING_FIELDS.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preview Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Preview (first {Math.min(10, parsed.rows.length)} rows)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {parsed.headers.map((h) => (
                          <TableHead key={h} className="text-xs whitespace-nowrap">
                            {h}
                            {mapping[h] && mapping[h] !== "__skip__" && (
                              <Badge variant="secondary" className="ml-1 text-[10px]">
                                {mapping[h]}
                              </Badge>
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsed.rows.map((row, i) => (
                        <TableRow key={i}>
                          {parsed.headers.map((h) => (
                            <TableCell key={h} className="text-xs whitespace-nowrap">
                              {row[h] || "—"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
              <Button
                onClick={handleImport}
                disabled={importMutation.isPending || !Object.values(mapping).includes("email")}
              >
                {importMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-1" />
                )}
                Import {parsed.totalRows} Contacts
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
