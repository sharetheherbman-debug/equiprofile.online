import { useState } from 'react';
import { trpc } from '../_core/trpc';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { useRealtimeModule } from '../hooks/useRealtime';
import { PlusCircle, Edit2, Trash2, FileImage } from 'lucide-react';

export default function Xrays() {
  return (
    <DashboardLayout>
      <XraysContent />
    </DashboardLayout>
  );
}

function XraysContent() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingXray, setEditingXray] = useState<any>(null);

  const [formData, setFormData] = useState({
    horseId: '',
    date: new Date().toISOString().split('T')[0],
    bodyPart: '',
    vetName: '',
    vetClinic: '',
    findings: '',
    diagnosis: '',
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    fileMimeType: '',
    costPence: 0,
    notes: ''
  });

  const { data: horses } = trpc.horses.list.useQuery();
  const { data: xrays, refetch } = trpc.xrays.list.useQuery();
  const [localXrays, setLocalXrays] = useState(xrays || []);

  // Real-time updates
  useRealtimeModule('xrays', (action, data) => {
    if (action === 'created') {
      setLocalXrays(prev => [data, ...(prev || [])]);
      toast({ title: 'New x-ray added' });
    } else if (action === 'updated') {
      setLocalXrays(prev => (prev || []).map(x => x.id === data.id ? { ...x, ...data } : x));
    } else if (action === 'deleted') {
      setLocalXrays(prev => (prev || []).filter(x => x.id !== data.id));
    }
  });

  // Update local state when data loads
  useState(() => {
    if (xrays) setLocalXrays(xrays);
  });

  const createMutation = trpc.xrays.create.useMutation({
    onSuccess: () => {
      toast({ title: 'X-ray record created successfully' });
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const updateMutation = trpc.xrays.update.useMutation({
    onSuccess: () => {
      toast({ title: 'X-ray record updated successfully' });
      setIsDialogOpen(false);
      setEditingXray(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const deleteMutation = trpc.xrays.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'X-ray record deleted' });
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({
      horseId: '',
      date: new Date().toISOString().split('T')[0],
      bodyPart: '',
      vetName: '',
      vetClinic: '',
      findings: '',
      diagnosis: '',
      fileUrl: '',
      fileName: '',
      fileSize: 0,
      fileMimeType: '',
      costPence: 0,
      notes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const costInPence = Math.round(parseFloat(formData.costPence.toString()) * 100);

    if (editingXray) {
      updateMutation.mutate({
        id: editingXray.id,
        ...formData,
        costPence: costInPence
      });
    } else {
      createMutation.mutate({
        ...formData,
        costPence: costInPence
      });
    }
  };

  const handleEdit = (xray: any) => {
    setEditingXray(xray);
    setFormData({
      horseId: xray.horseId || '',
      date: xray.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      bodyPart: xray.bodyPart || '',
      vetName: xray.vetName || '',
      vetClinic: xray.vetClinic || '',
      findings: xray.findings || '',
      diagnosis: xray.diagnosis || '',
      fileUrl: xray.fileUrl || '',
      fileName: xray.fileName || '',
      fileSize: xray.fileSize || 0,
      fileMimeType: xray.fileMimeType || '',
      costPence: (xray.costPence || 0) / 100,
      notes: xray.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this x-ray record?')) {
      deleteMutation.mutate({ id });
    }
  };

  const getHorseName = (horseId: string) => {
    const horse = horses?.find(h => h.id === horseId);
    return horse ? horse.name : 'Unknown Horse';
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">X-rays</h1>
          <p className="text-muted-foreground">Manage x-ray records and imaging</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingXray(null); resetForm(); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add X-ray Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingXray ? 'Edit X-ray Record' : 'New X-ray Record'}</DialogTitle>
              <DialogDescription>
                {editingXray ? 'Update x-ray record details' : 'Add a new x-ray record'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="horseId">Horse *</Label>
                  <Select value={formData.horseId} onValueChange={(value) => setFormData({...formData, horseId: value})} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select horse" />
                    </SelectTrigger>
                    <SelectContent>
                      {horses?.map((horse) => (
                        <SelectItem key={horse.id} value={horse.id}>
                          {horse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bodyPart">Body Part *</Label>
                    <Input
                      id="bodyPart"
                      placeholder="e.g., Left front leg"
                      value={formData.bodyPart}
                      onChange={(e) => setFormData({...formData, bodyPart: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="vetName">Vet Name</Label>
                    <Input
                      id="vetName"
                      placeholder="Vet name"
                      value={formData.vetName}
                      onChange={(e) => setFormData({...formData, vetName: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vetClinic">Vet Clinic</Label>
                    <Input
                      id="vetClinic"
                      placeholder="Clinic name"
                      value={formData.vetClinic}
                      onChange={(e) => setFormData({...formData, vetClinic: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="findings">Findings</Label>
                  <Textarea
                    id="findings"
                    placeholder="X-ray findings..."
                    value={formData.findings}
                    onChange={(e) => setFormData({...formData, findings: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Diagnosis..."
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fileUrl">File URL (placeholder)</Label>
                  <Input
                    id="fileUrl"
                    placeholder="File will be uploaded to secure storage"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                  />
                  <p className="text-sm text-muted-foreground">File upload integration pending</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cost">Cost (£)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.costPence}
                      onChange={(e) => setFormData({...formData, costPence: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingXray ? 'Update' : 'Create'} Record
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {localXrays && localXrays.length > 0 ? (
          localXrays.map((xray: any) => (
            <Card key={xray.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileImage className="h-5 w-5" />
                      {getHorseName(xray.horseId)} - {xray.bodyPart}
                    </CardTitle>
                    <CardDescription>
                      {new Date(xray.date).toLocaleDateString()} • {xray.vetName || 'No vet specified'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(xray)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(xray.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  {xray.vetClinic && (
                    <div>
                      <span className="font-medium">Clinic:</span> {xray.vetClinic}
                    </div>
                  )}
                  {xray.findings && (
                    <div>
                      <span className="font-medium">Findings:</span> {xray.findings}
                    </div>
                  )}
                  {xray.diagnosis && (
                    <div>
                      <span className="font-medium">Diagnosis:</span> {xray.diagnosis}
                    </div>
                  )}
                  {xray.costPence > 0 && (
                    <div>
                      <span className="font-medium">Cost:</span> £{(xray.costPence / 100).toFixed(2)}
                    </div>
                  )}
                  {xray.notes && (
                    <div>
                      <span className="font-medium">Notes:</span> {xray.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileImage className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No x-ray records yet. Add your first record above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
