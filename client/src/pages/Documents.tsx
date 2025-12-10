import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";

const documentTypes = [
  { value: 'health', label: 'Health Record' },
  { value: 'registration', label: 'Registration Papers' },
  { value: 'insurance', label: 'Insurance Document' },
  { value: 'competition', label: 'Competition Results' },
  { value: 'other', label: 'Other' },
];

function DocumentsContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    horseId: "",
    documentType: "other" as 'health' | 'registration' | 'insurance' | 'competition' | 'other',
    title: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: horses } = trpc.horses.list.useQuery();
  const { data: documents, isLoading, refetch } = trpc.documents.list.useQuery();

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success("Document uploaded!");
      setIsDialogOpen(false);
      refetch();
      setFormData({
        horseId: "",
        documentType: "other" as 'health' | 'registration' | 'insurance' | 'competition' | 'other',
        title: "",
      });
      setSelectedFile(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Document deleted!");
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
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        uploadMutation.mutate({
          horseId: formData.horseId ? parseInt(formData.horseId) : undefined,
          category: formData.documentType as 'health' | 'registration' | 'insurance' | 'competition' | 'other',
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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Store and manage important documents for your horses
          </p>
        </div>
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
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Document title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select
                      value={formData.documentType}
                      onValueChange={(value: any) => setFormData({ ...formData, documentType: value })}
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
                      onValueChange={(value) => setFormData({ ...formData, horseId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select horse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">General</SelectItem>
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || uploadMutation.isPending}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>Your uploaded files and documents</CardDescription>
        </CardHeader>
        <CardContent>
          {!documents || documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload First Document
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const horse = horses?.find(h => h.id === doc.horseId);
                const docType = documentTypes.find(t => t.value === doc.category);
                return (
                  <div key={doc.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {getFileIcon(doc.fileType || 'application/pdf')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.description || doc.fileName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{docType?.label || 'Document'}</span>
                        {horse && <span>• {horse.name}</span>}
                        {doc.fileSize && <span>• {formatFileSize(doc.fileSize)}</span>}
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize hidden sm:inline-flex">
                      {doc.category || 'other'}
                    </Badge>
                    <div className="flex items-center gap-2">
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
        </CardContent>
      </Card>
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
