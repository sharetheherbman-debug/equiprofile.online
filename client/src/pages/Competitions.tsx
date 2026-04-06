// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogTrigger,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Plus,
  Trash2,
  Download,
  MapPin,
  Calendar,
  Medal,
  DollarSign,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { downloadCSV } from "@/lib/csvDownload";

// ─── Disciplines ─────────────────────────────────────────────────────────────
const DISCIPLINES = [
  "Dressage",
  "Show Jumping",
  "Eventing",
  "Cross Country",
  "Hunter",
  "Western",
  "Endurance",
  "Polo",
  "Racing",
  "Other",
];

const LEVELS = [
  "Novice",
  "Preliminary",
  "Intermediate",
  "Advanced",
  "Grand Prix",
  "Open",
  "Amateur",
  "Professional",
];

const PLACEMENTS = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "Top 10",
  "Clear Round",
  "Eliminated",
  "Retired",
  "DNS",
];

function CompetitionsContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterHorseId, setFilterHorseId] = useState<string>("all");
  const [formData, setFormData] = useState({
    horseId: "",
    competitionName: "",
    venue: "",
    date: new Date().toISOString().slice(0, 10),
    discipline: "",
    level: "",
    class: "",
    placement: "",
    score: "",
    cost: "",
    winnings: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: horses = [] } = trpc.horses.list.useQuery();
  const { data: competitions = [], isLoading } = trpc.competitions.list.useQuery({
    horseId: filterHorseId !== "all" ? parseInt(filterHorseId) : undefined,
  });

  const createMutation = trpc.competitions.create.useMutation({
    onSuccess: () => {
      toast.success("Competition logged successfully!");
      setIsDialogOpen(false);
      resetForm();
      utils.competitions.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.competitions.delete.useMutation({
    onSuccess: () => {
      toast.success("Competition deleted");
      setDeleteId(null);
      utils.competitions.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleExportCSV = async () => {
    try {
      const result = await utils.client.competitions.exportCSV.query();
      downloadCSV(result.csv, result.filename);
      toast.success("Competitions exported!");
    } catch {
      toast.error("Failed to export competitions");
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const resetForm = () => {
    setFormData({
      horseId: "",
      competitionName: "",
      venue: "",
      date: new Date().toISOString().slice(0, 10),
      discipline: "",
      level: "",
      class: "",
      placement: "",
      score: "",
      cost: "",
      winnings: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.horseId) {
      toast.error("Please select a horse");
      return;
    }
    if (!formData.competitionName.trim()) {
      toast.error("Competition name is required");
      return;
    }
    createMutation.mutate({
      horseId: parseInt(formData.horseId),
      competitionName: formData.competitionName.trim(),
      venue: formData.venue || undefined,
      date: formData.date,
      discipline: formData.discipline || undefined,
      level: formData.level || undefined,
      class: formData.class || undefined,
      placement: formData.placement || undefined,
      score: formData.score || undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      winnings: formData.winnings ? parseFloat(formData.winnings) : undefined,
      notes: formData.notes || undefined,
    });
  };

  const getHorseName = (horseId: number) =>
    horses.find((h) => h.id === horseId)?.name ?? "Unknown";

  const getPlacementBadge = (placement?: string | null) => {
    if (!placement) return null;
    const colorMap: Record<string, string> = {
      "1st": "bg-yellow-400/20 text-yellow-700 border-yellow-400/40 dark:text-yellow-300",
      "2nd": "bg-slate-300/20 text-slate-700 border-slate-400/40 dark:text-slate-300",
      "3rd": "bg-amber-700/20 text-amber-800 border-amber-600/40 dark:text-amber-300",
    };
    const cls = colorMap[placement] ?? "bg-blue-100/50 text-blue-700 border-blue-300/40 dark:text-blue-300";
    return (
      <Badge variant="outline" className={`${cls} font-semibold`}>
        <Medal className="w-3 h-3 mr-1" />
        {placement}
      </Badge>
    );
  };

  // Stats
  const total = competitions.length;
  const placements1st = competitions.filter((c: any) => c.placement === "1st").length;
  const totalCost = competitions.reduce((sum: number, c: any) => sum + (c.cost ?? 0), 0);
  const totalWinnings = competitions.reduce((sum: number, c: any) => sum + (c.winnings ?? 0), 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Competitions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your horses' competition results and performance
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Log Competition
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log Competition Result</DialogTitle>
                <DialogDescription>
                  Record a competition entry and result for one of your horses.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Horse */}
                <div className="space-y-1.5">
                  <Label htmlFor="horse">Horse *</Label>
                  <Select
                    value={formData.horseId}
                    onValueChange={(v) => setFormData((p) => ({ ...p, horseId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a horse" />
                    </SelectTrigger>
                    <SelectContent>
                      {horses.map((h) => (
                        <SelectItem key={h.id} value={String(h.id)}>
                          {h.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Competition Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name">Competition Name *</Label>
                  <Input
                    id="name"
                    value={formData.competitionName}
                    onChange={(e) => setFormData((p) => ({ ...p, competitionName: e.target.value }))}
                    placeholder="e.g. Regional Dressage Championships"
                  />
                </div>

                {/* Date + Venue */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => setFormData((p) => ({ ...p, venue: e.target.value }))}
                      placeholder="Location / arena"
                    />
                  </div>
                </div>

                {/* Discipline + Level */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Discipline</Label>
                    <Select
                      value={formData.discipline}
                      onValueChange={(v) => setFormData((p) => ({ ...p, discipline: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISCIPLINES.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Level / Class</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(v) => setFormData((p) => ({ ...p, level: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Class + Placement */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="class">Class</Label>
                    <Input
                      id="class"
                      value={formData.class}
                      onChange={(e) => setFormData((p) => ({ ...p, class: e.target.value }))}
                      placeholder="e.g. Elementary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Placement</Label>
                    <Select
                      value={formData.placement}
                      onValueChange={(v) => setFormData((p) => ({ ...p, placement: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLACEMENTS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Score */}
                <div className="space-y-1.5">
                  <Label htmlFor="score">Score / Points</Label>
                  <Input
                    id="score"
                    value={formData.score}
                    onChange={(e) => setFormData((p) => ({ ...p, score: e.target.value }))}
                    placeholder="e.g. 68.5% or 75/100"
                  />
                </div>

                {/* Cost + Winnings */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cost">Entry Cost (£)</Label>
                    <Input
                      id="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData((p) => ({ ...p, cost: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="winnings">Prize Money (£)</Label>
                    <Input
                      id="winnings"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.winnings}
                      onChange={(e) => setFormData((p) => ({ ...p, winnings: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="How did it go? Any lessons learned..."
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Saving…" : "Save Competition"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-yellow-950/20">
          <CardContent className="pt-5 pb-4">
            <Trophy className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-950/30 to-amber-950/20">
          <CardContent className="pt-5 pb-4">
            <Medal className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-2xl font-bold">{placements1st}</p>
            <p className="text-xs text-muted-foreground">First Places</p>
          </CardContent>
        </Card>
        <Card className="border-rose-500/20 bg-gradient-to-br from-rose-950/30 to-pink-950/20">
          <CardContent className="pt-5 pb-4">
            <DollarSign className="w-5 h-5 text-rose-400 mb-2" />
            <p className="text-2xl font-bold">£{totalCost.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Entry Costs</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/20 bg-gradient-to-br from-green-950/30 to-emerald-950/20">
          <CardContent className="pt-5 pb-4">
            <DollarSign className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-bold">£{totalWinnings.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Prize Winnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Horse filter */}
      {horses.length > 1 && (
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterHorseId} onValueChange={setFilterHorseId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All horses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All horses</SelectItem>
              {horses.map((h) => (
                <SelectItem key={h.id} value={String(h.id)}>
                  {h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Competition list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : competitions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-1">No competitions yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start logging your competition results to track progress and performance.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Log Your First Competition
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(competitions as any[]).map((comp) => (
            <Card key={comp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base leading-tight">
                        {comp.competitionName}
                      </h3>
                      {getPlacementBadge(comp.placement)}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {comp.date
                          ? format(new Date(comp.date), "d MMM yyyy")
                          : "—"}
                      </span>
                      {comp.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {comp.venue}
                        </span>
                      )}
                      <span className="font-medium text-foreground">
                        {getHorseName(comp.horseId)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {comp.discipline && (
                        <Badge variant="secondary" className="text-xs">
                          {comp.discipline}
                        </Badge>
                      )}
                      {comp.level && (
                        <Badge variant="outline" className="text-xs">
                          {comp.level}
                        </Badge>
                      )}
                      {comp.class && (
                        <Badge variant="outline" className="text-xs">
                          {comp.class}
                        </Badge>
                      )}
                      {comp.score && (
                        <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300">
                          Score: {comp.score}
                        </Badge>
                      )}
                    </div>
                    {comp.notes && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {comp.notes}
                      </p>
                    )}
                    {(comp.cost || comp.winnings) && (
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        {comp.cost > 0 && (
                          <span>Cost: <span className="font-medium text-foreground">£{comp.cost}</span></span>
                        )}
                        {comp.winnings > 0 && (
                          <span>Winnings: <span className="font-medium text-green-600 dark:text-green-400">£{comp.winnings}</span></span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive shrink-0"
                    onClick={() => setDeleteId(comp.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Competition?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the competition record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Competitions() {
  return (
    <DashboardLayout>
      <CompetitionsContent />
    </DashboardLayout>
  );
}
