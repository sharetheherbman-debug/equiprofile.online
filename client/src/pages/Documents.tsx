import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  FileText,
  Download,
  Trash2,
  Upload,
  File,
  Image,
  FileSpreadsheet,
  Heart,
  BookOpen,
  Shield,
  Trophy,
  Dumbbell,
  Apple,
  Receipt,
  BookMarked,
  FolderOpen,
  Folder,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

const documentTypes = [
  { value: "health", label: "Health Record" },
  { value: "passport", label: "Equine Passport" },
  { value: "registration", label: "Registration Papers" },
  { value: "insurance", label: "Insurance Document" },
  { value: "competition", label: "Competition Results" },
  { value: "training", label: "Training Record" },
  { value: "feeding", label: "Feeding / Nutrition" },
  { value: "invoice", label: "Invoice / Billing" },
  { value: "other", label: "Other" },
];

const folderConfig: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    description: string;
  }
> = {
  health: {
    label: "Health Records",
    icon: Heart,
    gradient: "from-rose-500 to-pink-500",
    description: "Vet records, vaccinations, treatments",
  },
  passport: {
    label: "Equine Passports",
    icon: BookMarked,
    gradient: "from-violet-500 to-purple-500",
    description: "Horse passports and ID documents",
  },
  registration: {
    label: "Registration",
    icon: BookOpen,
    gradient: "from-blue-500 to-indigo-500",
    description: "Breed registrations and papers",
  },
  insurance: {
    label: "Insurance",
    icon: Shield,
    gradient: "from-emerald-500 to-teal-500",
    description: "Insurance policies and certificates",
  },
  competition: {
    label: "Competition",
    icon: Trophy,
    gradient: "from-amber-500 to-orange-500",
    description: "Results, entries, and qualification docs",
  },
  training: {
    label: "Training Records",
    icon: Dumbbell,
    gradient: "from-cyan-500 to-blue-500",
    description: "Training logs and coaching notes",
  },
  feeding: {
    label: "Feeding & Nutrition",
    icon: Apple,
    gradient: "from-lime-500 to-green-500",
    description: "Feed plans and nutrition records",
  },
  invoice: {
    label: "Invoices & Billing",
    icon: Receipt,
    gradient: "from-orange-500 to-red-500",
    description: "Invoices, receipts, and expenses",
  },
  other: {
    label: "Other Documents",
    icon: FileText,
    gradient: "from-slate-500 to-gray-500",
    description: "General and miscellaneous files",
  },
};

function DocumentsContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    horseId: "",
    documentType: "other" as
      | "health"
      | "passport"
      | "registration"
      | "insurance"
      | "competition"
      | "training"
      | "feeding"
      | "invoice"
      | "other",
    title: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: horses } = trpc.horses.list.useQuery();
  const {
    data: documents,
    isLoading,
    refetch,
  } = trpc.documents.list.useQuery();

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success("Document uploaded!");
      setIsDialogOpen(false);
      refetch();
      setFormData({
        horseId: "",
        documentType: "other" as
          | "health"
          | "registration"
          | "insurance"
          | "competition"
          | "other",
        title: "",
      });
      setSelectedFile(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Document deleted");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      if (!formData.title) {
        setFormData({ ...formData, title: file.name.replace(/\.[^/.]+$/, "") });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.title) {
      toast.error("Please select a file and enter a title");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        uploadMutation.mutate({
          horseId:
            formData.horseId && formData.horseId !== "none"
              ? parseInt(formData.horseId)
              : undefined,
          category: formData.documentType as
            | "health"
            | "registration"
            | "insurance"
            | "competition"
            | "other",
          description: formData.title,
          fileName: selectedFile.name,
          fileData: base64,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        });
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const getCategoryIcon = (category: string, mimeType?: string) => {
    switch (category) {
      case "health":
        return <Heart className="w-5 h-5" />;
      case "passport":
        return <BookMarked className="w-5 h-5" />;
      case "registration":
        return <BookOpen className="w-5 h-5" />;
      case "insurance":
        return <Shield className="w-5 h-5" />;
      case "competition":
        return <Trophy className="w-5 h-5" />;
      case "training":
        return <Dumbbell className="w-5 h-5" />;
      case "feeding":
        return <Apple className="w-5 h-5" />;
      case "invoice":
        return <Receipt className="w-5 h-5" />;
      default:
        if (mimeType?.startsWith("image/"))
          return <Image className="w-5 h-5" />;
        if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel"))
          return <FileSpreadsheet className="w-5 h-5" />;
        return <FileText className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Group documents by category
  const docsByCategory = (documents ?? []).reduce(
    (acc, doc) => {
      const cat = doc.category || "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
    },
    {} as Record<string, typeof documents>,
  );

  const folderOrder = [
    "health",
    "passport",
    "registration",
    "insurance",
    "competition",
    "training",
    "feeding",
    "invoice",
    "other",
  ];

  const uploadButton = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload passports, certificates, and other important documents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <File className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to select a file or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, DOCX, JPG, PNG (max 10MB)
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Document title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, documentType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Horse (optional)</Label>
                <Select
                  value={formData.horseId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, horseId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select horse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General</SelectItem>
                    {horses?.map((horse) => (
                      <SelectItem key={horse.id} value={horse.id.toString()}>
                        {horse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || uploadMutation.isPending}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // ── Folder contents view ──────────────────────────────────────────────
  if (activeFolder !== null) {
    const folderDocs = docsByCategory[activeFolder] ?? [];
    const cfg = folderConfig[activeFolder] ?? folderConfig.other;
    const FolderIcon = cfg.icon;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFolder(null)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              All Folders
            </Button>
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}
            >
              <FolderIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">
                {cfg.label}
              </h1>
              <p className="text-muted-foreground text-xs">{cfg.description}</p>
            </div>
          </div>
          {uploadButton}
        </div>

        {folderDocs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No documents in this folder yet
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {folderDocs.map((doc) => {
              const horse = horses?.find((h) => h.id === doc.horseId);
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${cfg.gradient} text-white`}
                  >
                    {getCategoryIcon(
                      doc.category || "other",
                      doc.fileType || undefined,
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {doc.description || doc.fileName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {horse && <span>{horse.name}</span>}
                      {doc.fileSize && (
                        <span>{horse ? "· " : ""}{formatFileSize(doc.fileSize)}</span>
                      )}
                      {doc.uploadedAt && (
                        <span>
                          ·{" "}
                          {new Date(doc.uploadedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.fileUrl && (
                      <Button variant="outline" size="icon" asChild>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate({ id: doc.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Folder grid view (main view) ──────────────────────────────────────
  const totalDocs = (documents ?? []).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Documents
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalDocs === 0
              ? "Store and manage important documents for your horses"
              : `${totalDocs} document${totalDocs !== 1 ? "s" : ""} across ${Object.keys(docsByCategory).length} folder${Object.keys(docsByCategory).length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {uploadButton}
      </div>

      {totalDocs === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Folder className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No documents uploaded yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Upload health records, passports, insurance documents, and more.
              They'll be organised into folders automatically.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folderOrder
            .filter((cat) => (docsByCategory[cat] ?? []).length > 0)
            .map((cat) => {
              const cfg = folderConfig[cat] ?? folderConfig.other;
              const FolderIcon = cfg.icon;
              const count = (docsByCategory[cat] ?? []).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFolder(cat)}
                  className="group relative rounded-xl border bg-card/80 p-5 text-left hover:bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <FolderIcon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm text-foreground truncate">
                    {cfg.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {cfg.description}
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-3 text-xs"
                  >
                    {count} file{count !== 1 ? "s" : ""}
                  </Badge>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default function Documents() {
  return (
    <DashboardLayout>
      <DocumentsContent />
    </DashboardLayout>
  );
}

