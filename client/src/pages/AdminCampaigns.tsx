import { useState } from "react";
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
  SelectItem,
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
} from "lucide-react";
import { toast } from "sonner";

export default function AdminCampaigns() {
  const [createOpen, setCreateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmSendId, setConfirmSendId] = useState<number | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    templateId: "",
    segment: "" as "leads" | "trial" | "paid" | "all" | "marketing" | "",
    content: "",
    firstName: "",
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
      setNewCampaign({
        name: "",
        subject: "",
        templateId: "",
        segment: "",
        content: "",
        firstName: "",
      });
      utils.admin.getCampaigns.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const sendMutation = trpc.admin.sendCampaign.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Campaign sent! ${data.sentCount} delivered, ${data.failedCount} failed.`,
      );
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

      {/* Templates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Email Templates
            </CardTitle>
            <CardDescription>
              Professional branded templates ready to use
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.data?.map((tpl) => (
                <div
                  key={tpl.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: tpl.previewColor }}
                    />
                    <h4 className="font-medium text-sm">{tpl.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {tpl.description}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handlePreview(tpl.id)}
                  >
                    <Eye className="w-3 h-3 mr-1" /> Preview
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Recipients</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
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
                      <TableCell>{statusBadge(c.status)}</TableCell>
                      <TableCell className="text-right">
                        {c.recipientCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {c.sentCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {c.failedCount}
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
                          {c.status === "draft" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => setConfirmSendId(c.id)}
                              disabled={sendMutation.isPending}
                            >
                              <Send className="w-3 h-3 mr-1" /> Send
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
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up your email campaign details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
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
              <Label htmlFor="campaign-subject">Email Subject</Label>
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
                <Label>Template</Label>
                <Select
                  value={newCampaign.templateId}
                  onValueChange={(v) =>
                    setNewCampaign((p) => ({ ...p, templateId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.data?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
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
                      segment: v as "leads" | "trial" | "paid" | "all",
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
            {/* Inline template preview card — shown immediately after selection */}
            {newCampaign.templateId && (() => {
              const selected = templates.data?.find((t) => t.id === newCampaign.templateId);
              return selected ? (
                <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
                  <div
                    className="mt-0.5 h-8 w-8 shrink-0 rounded"
                    style={{ background: selected.previewColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{selected.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{selected.description}</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1 h-auto p-0 text-xs"
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
              segment. This action cannot be undone. Are you sure you want
              to proceed?
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
          📧 Ready-to-Run Campaign Sequences
        </CardTitle>
        <CardDescription>
          Pre-built 4-step drip sequences. Launch creates a campaign + follow-up steps (Day 1 → 3 → 6 → 10).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {seqTemplates.isLoading ? (
          <div className="space-y-2"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
        ) : (
          <div className="space-y-4">
            {seqTemplates.data?.map((tpl) => (
              <div key={tpl.id} className="border rounded-lg p-4">
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
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [newContact, setNewContact] = useState({
    email: "",
    name: "",
    businessName: "",
    contactType: "individual" as "individual" | "riding_school" | "stable",
    region: "",
    tags: "",
  });

  const utils = trpc.useUtils();
  const contacts = trpc.admin.getMarketingContacts.useQuery();
  const unsubscribes = trpc.admin.getUnsubscribes.useQuery();

  const createMutation = trpc.admin.createMarketingContact.useMutation({
    onSuccess: () => {
      toast.success("Contact added");
      setAddOpen(false);
      setNewContact({ email: "", name: "", businessName: "", contactType: "individual", region: "", tags: "" });
      utils.admin.getMarketingContacts.invalidate();
      utils.admin.getSegmentCounts.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const importMutation = trpc.admin.importMarketingContacts.useMutation({
    onSuccess: (data) => {
      toast.success(`Imported ${data.imported} contacts (${data.skipped} skipped)`);
      setCsvOpen(false);
      setCsvText("");
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

  function handleCSVImport() {
    if (!csvText.trim()) { toast.error("Paste CSV data first"); return; }
    const lines = csvText.trim().split("\n");
    const contacts: Array<{
      email: string;
      name?: string;
      businessName?: string;
      contactType: "individual" | "riding_school" | "stable";
      region?: string;
    }> = [];
    for (const line of lines) {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      if (cols.length < 1 || !cols[0].includes("@")) continue; // skip header/invalid
      contacts.push({
        email: cols[0],
        name: cols[1] || undefined,
        businessName: cols[2] || undefined,
        contactType: (cols[3] as "individual" | "riding_school" | "stable") || "individual",
        region: cols[4] || undefined,
      });
    }
    if (contacts.length === 0) { toast.error("No valid contacts found in CSV"); return; }
    importMutation.mutate({ contacts, source: "csv_import" });
  }

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
            <Button variant="outline" size="sm" onClick={() => setCsvOpen(true)}>
              CSV Import
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {contacts.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !contacts.data?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No marketing contacts yet. Add contacts manually or import via CSV.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Type</TableHead>
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
                          {contact.contactType?.replace("_", " ")}
                        </Badge>
                      </TableCell>
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
          )}
        </CardContent>
      </Card>

      {/* Suppression List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            🚫 Suppression List
          </CardTitle>
          <CardDescription>
            Unsubscribed emails — these are permanently excluded from all marketing sends
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
            <div>
              <Label>Type</Label>
              <Select
                value={newContact.contactType}
                onValueChange={(v) => setNewContact({ ...newContact, contactType: v as any })}
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
              })}
              disabled={createMutation.isPending || !newContact.email}
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Marketing Contacts</DialogTitle>
            <DialogDescription>
              Paste CSV data below. Format: email, name, business, type (individual/riding_school/stable), region
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`info@example.com, Jane Smith, Happy Hooves, riding_school, Kent\noffice@yard.com, John Doe, Oakfield Livery, stable, Surrey`}
            rows={8}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Suppressed and duplicate emails will be automatically skipped.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCsvOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCSVImport}
              disabled={importMutation.isPending || !csvText.trim()}
            >
              {importMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Import Contacts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
