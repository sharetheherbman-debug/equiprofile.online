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
  Eye,
  X,
} from "lucide-react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csvDownload";
import { PageHeader } from "@/components/PageHeader";

const documentTypes = [
  { value: "health", label: "Health Record" },
  { value: "passport", label: "Equine Passport" },
  { value: "registration", label: "Registration Papers" },
  { value: "insurance", label: "Insurance Document" },
  { value: "competition", label: "Competition Results" },
  { value: "training", label: "Training Record" },
  { value: "feeding", label: "Feeding / Nutrition" },
  { value: "invoice", label: "Invoice / Billing" },
  { value: "gallery", label: "Gallery (Photos)" },
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
  gallery: {
    label: "Gallery",
    icon: Image,
    gradient: "from-pink-500 to-rose-400",
    description: "Photos and images",
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
  const [horseFilter, setHorseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string; type: string } | null>(null);
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
      | "gallery"
      | "other",
    title: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: horses } = trpc.horses.list.useQuery();
  const {
    data: documents,
    isLoading,
  } = trpc.documents.list.useQuery();

  const exportQuery = trpc.documents.exportCSV.useQuery(undefined, {
    enabled: false,
  });
  const handleExport = async () => {
    const result = await exportQuery.refetch();
    if (result.data) {
      downloadCSV(result.data.csv, result.data.filename);
      toast.success("Documents index exported!");
    } else {
      toast.error("Failed to export documents");
    }
  };

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: async () => {
      setUploading(false);
      toast.success("Document uploaded!");
      setIsDialogOpen(false);
      await utils.documents.list.invalidate();
      setFormData({
        horseId: "",
        documentType: "other",
        title: "",
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (error) => {
      setUploading(false);
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: async () => {
      toast.success("Document deleted");
      await utils.documents.list.invalidate();
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
      // Auto-classify images as Gallery unless the user has already chosen a type
      const isImage = file.type.startsWith("image/");
      setFormData((prev) => ({
        ...prev,
        documentType: isImage && prev.documentType === "other" ? "gallery" : prev.documentType,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.title) {
      toast.error("Please select a file and enter a title");
      return;
    }

    setUploading(true);
    let reader: FileReader;
    try {
      reader = new FileReader();
    } catch {
      setUploading(false);
      toast.error("Failed to read file. Please try again.");
      return;
    }
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        horseId:
          formData.horseId && formData.horseId !== "none"
            ? parseInt(formData.horseId)
            : undefined,
        category: formData.documentType,
        description: formData.title,
        fileName: selectedFile.name,
        fileData: base64,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      });
    };
    reader.onerror = () => {
      setUploading(false);
      toast.error("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(selectedFile);
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
      case "gallery":
        return <Image className="w-5 h-5" />;
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

  const isHeic = (url: string, mimeType?: string) => {
    if (mimeType === "image/heic" || mimeType === "image/heif") return true;
    const lower = url.toLowerCase();
    return lower.endsWith(".heic") || lower.endsWith(".heif");
  };

  const canPreview = (url: string, mimeType?: string) => {
    if (!url) return false;
    if (isHeic(url, mimeType)) return false; // HEIC can't render in browser
    if (mimeType?.startsWith("image/")) return true;
    if (mimeType === "application/pdf") return true;
    const lower = url.toLowerCase();
    return (
      lower.endsWith(".pdf") ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".gif") ||
      lower.endsWith(".webp")
    );
  };

  // Filter docs by selected horse and keyword search
  const filteredDocs = (documents ?? []).filter((doc) => {
    const matchesHorse =
      horseFilter === "all" ||
      (horseFilter === "general" ? !doc.horseId : doc.horseId === parseInt(horseFilter));
    if (!matchesHorse) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.fileName?.toLowerCase().includes(q) ||
        (doc.description ?? "").toLowerCase().includes(q) ||
        (doc.category ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group filtered documents by category
  // Images stored under "other" (legacy uploads before gallery was added) are re-mapped to "gallery"
  const docsByCategory = filteredDocs.reduce(
    (acc, doc) => {
      let cat = doc.category || "other";
      // Re-classify legacy image uploads as gallery
      if (cat === "other" && doc.fileType?.startsWith("image/")) {
        cat = "gallery";
      }
      if (!acc[cat]) acc[cat] = [];
      acc[cat]!.push(doc);
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
    "gallery",
    "other",
  ];

  const uploadButton = (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          // Reset form state when dialog closes
          setFormData({ horseId: "", documentType: "other", title: "" });
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      }}
    >      <DialogTrigger asChild>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        ) : activeFolder === "gallery" ? (
          // ── Photo grid for Gallery folder ──────────────────────────────
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {folderDocs.map((doc) => {
              const isImage = doc.fileType?.startsWith("image/");
              const isHeicFile = doc.fileUrl ? isHeic(doc.fileUrl, doc.fileType || undefined) : false;
              const showImg = isImage && !isHeicFile && !!doc.fileUrl;
              return (
                <div
                  key={doc.id}
                  className="group relative aspect-square rounded-lg overflow-hidden border bg-muted/30"
                >
                  {showImg && (
                    <img
                      src={doc.fileUrl!}
                      alt={doc.description || doc.fileName}
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.style.display = "none";
                        const fallback = img.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                      onClick={() =>
                        setPreviewDoc({
                          url: doc.fileUrl!,
                          name: doc.description || doc.fileName,
                          type: doc.fileType || "",
                        })
                      }
                    />
                  )}
                  {/* Fallback / HEIC placeholder */}
                  <div
                    className={`${showImg ? "hidden" : ""} absolute inset-0 flex flex-col items-center justify-center gap-2 p-2`}
                  >
                    <Image className="w-8 h-8 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground text-center truncate w-full px-1">
                      {doc.description || doc.fileName}
                    </p>
                    {doc.fileUrl && (
                      <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                          <Download className="w-3 h-3 mr-1" />
                          {isHeicFile ? "Download HEIC" : "Download"}
                        </a>
                      </Button>
                    )}
                  </div>
                  {/* Dark overlay on hover */}
                  {showImg && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors pointer-events-none" />
                  )}
                  {/* Action buttons overlay */}
                  {showImg && doc.fileUrl && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7 bg-white/90 hover:bg-white"
                        onClick={() =>
                          setPreviewDoc({
                            url: doc.fileUrl!,
                            name: doc.description || doc.fileName,
                            type: doc.fileType || "",
                          })
                        }
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7 bg-white/90 hover:bg-white"
                        asChild
                      >
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7 bg-white/90 hover:bg-destructive hover:text-white"
                        onClick={() => deleteMutation.mutate({ id: doc.id })}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                  {/* Caption strip */}
                  {showImg && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">
                        {doc.description || doc.fileName}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // ── Generic list view for all other folders ──────────────────────
          <div className="space-y-3">
            {folderDocs.map((doc) => {
              const horse = horses?.find((h) => h.id === doc.horseId);
              const previewable = doc.fileUrl ? canPreview(doc.fileUrl, doc.fileType || undefined) : false;
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${cfg.gradient} text-white`}
                  >
                    {getCategoryIcon(
                      doc.category === "other" && doc.fileType?.startsWith("image/") ? "gallery" : (doc.category || "other"),
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
                        <span>{horse ? "· " : ""} {formatFileSize(doc.fileSize)}</span>
                      )}
                      {doc.createdAt && (
                        <span>
                          ·{" "}
                          {new Date(doc.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {previewable && doc.fileUrl && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPreviewDoc({ url: doc.fileUrl!, name: doc.description || doc.fileName, type: doc.fileType || "" })}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {doc.fileUrl && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
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

        {/* Inline preview dialog */}
        {previewDoc && (
          <Dialog open={!!previewDoc} onOpenChange={(o) => !o && setPreviewDoc(null)}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-3xl w-full">
              <DialogHeader>
                <DialogTitle className="truncate pr-8">{previewDoc.name}</DialogTitle>
                <DialogDescription>Document preview</DialogDescription>
              </DialogHeader>
              <div className="min-h-[400px] flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
                {isHeic(previewDoc.url, previewDoc.type) ? (
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <Image className="w-12 h-12 text-muted-foreground/40" />
                    <p className="text-muted-foreground text-sm">
                      HEIC images cannot be previewed in the browser.
                    </p>
                    <Button asChild>
                      <a href={previewDoc.url} target="_blank" rel="noopener noreferrer" download>
                        <Download className="w-4 h-4 mr-2" />
                        Download to view
                      </a>
                    </Button>
                  </div>
                ) : previewDoc.type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(previewDoc.url) ? (
                  <img
                    src={previewDoc.url}
                    alt={previewDoc.name}
                    className="max-w-full max-h-[60vh] object-contain"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.style.display = "none";
                      const fallback = img.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : (
                  <iframe
                    src={previewDoc.url}
                    title={previewDoc.name}
                    className="w-full h-[60vh] border-0 rounded"
                  />
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" asChild>
                  <a href={previewDoc.url} target="_blank" rel="noopener noreferrer" download>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
                <Button onClick={() => setPreviewDoc(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // ── Folder grid view (main view) ──────────────────────────────────────
  const totalDocs = (documents ?? []).length;
  const noDocsAtAll = totalDocs === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <PageHeader
            title="Documents"
            subtitle={totalDocs === 0
              ? "Store and manage important documents for your horses"
              : `${filteredDocs.length} document${filteredDocs.length !== 1 ? "s" : ""} across ${Object.keys(docsByCategory).length} folder${Object.keys(docsByCategory).length !== 1 ? "s" : ""}`}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Keyword search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents…"
              className="pl-8 h-9 w-44 text-sm"
            />
          </div>
          {/* Horse filter — only show when there are multiple horses */}
          {(horses ?? []).length > 0 && (
            <Select value={horseFilter} onValueChange={setHorseFilter}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SelectValue placeholder="All horses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All horses</SelectItem>
                <SelectItem value="general">General docs</SelectItem>
                {horses?.map((h) => (
                  <SelectItem key={h.id} value={h.id.toString()}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {uploadButton}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportQuery.isFetching}
            className="h-9"
          >
            <Download className="w-4 h-4 mr-2" />
            {exportQuery.isFetching ? "Exporting…" : "Export CSV"}
          </Button>
        </div>
      </div>

      {noDocsAtAll ? (
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

