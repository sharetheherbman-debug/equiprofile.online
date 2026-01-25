import { useState } from 'react';
import { trpc } from '../_core/trpc';
import { useRealtimeModule } from '../hooks/useRealtime';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Plus, Pencil, Trash2, Clock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

function AppointmentsContent() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  const { data: appointments, refetch } = trpc.appointments.list.useQuery();
  const { data: horses } = trpc.horses.list.useQuery();
  const createMutation = trpc.appointments.create.useMutation();
  const updateMutation = trpc.appointments.update.useMutation();
  const deleteMutation = trpc.appointments.delete.useMutation();

  const [localAppointments, setLocalAppointments] = useState(appointments || []);

  // Update local state when data changes
  useState(() => {
    if (appointments) {
      setLocalAppointments(appointments);
    }
  });

  // Real-time updates
  useRealtimeModule('appointments', (action, data) => {
    switch (action) {
      case 'created':
        setLocalAppointments(prev => [data, ...prev]);
        toast({ title: 'New appointment scheduled', description: data.type });
        break;
      case 'updated':
        setLocalAppointments(prev => prev.map(a => a.id === data.id ? { ...a, ...data } : a));
        break;
      case 'deleted':
        setLocalAppointments(prev => prev.filter(a => a.id !== data.id));
        break;
    }
  });

  const [formData, setFormData] = useState({
    horseId: '',
    type: 'vet',
    appointmentDate: '',
    appointmentTime: '',
    provider: '',
    location: '',
    cost: '',
    status: 'scheduled',
    reminder: 'none',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      horseId: '',
      type: 'vet',
      appointmentDate: '',
      appointmentTime: '',
      provider: '',
      location: '',
      cost: '',
      status: 'scheduled',
      reminder: 'none',
      notes: ''
    });
    setEditingAppointment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        horseId: parseInt(formData.horseId),
        costInPence: formData.cost ? Math.round(parseFloat(formData.cost) * 100) : null,
      };

      if (editingAppointment) {
        await updateMutation.mutateAsync({ id: editingAppointment.id, ...payload });
        toast({ title: 'Appointment updated successfully' });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Appointment scheduled successfully' });
      }

      setOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setFormData({
      horseId: appointment.horseId?.toString() || '',
      type: appointment.type,
      appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
      appointmentTime: appointment.appointmentTime || '',
      provider: appointment.provider || '',
      location: appointment.location || '',
      cost: appointment.costInPence ? (appointment.costInPence / 100).toFixed(2) : '',
      status: appointment.status,
      reminder: appointment.reminder || '',
      notes: appointment.notes || ''
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast({ title: 'Appointment deleted successfully' });
        refetch();
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

  const upcomingAppointments = localAppointments.filter((a: any) => 
    a.status !== 'completed' && a.status !== 'cancelled' && new Date(a.appointmentDate) >= new Date()
  );
  const pastAppointments = localAppointments.filter((a: any) => 
    a.status === 'completed' || new Date(a.appointmentDate) < new Date()
  );

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      vet: 'bg-purple-100 text-purple-800',
      farrier: 'bg-orange-100 text-orange-800',
      dentist: 'bg-teal-100 text-teal-800',
      physio: 'bg-pink-100 text-pink-800',
      trainer: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Appointments
          </h1>
          <p className="text-gray-600 mt-1">Schedule and manage appointments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Horse *</Label>
                  <Select value={formData.horseId} onValueChange={(v) => setFormData({ ...formData, horseId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select horse" />
                    </SelectTrigger>
                    <SelectContent>
                      {horses?.map((horse: any) => (
                        <SelectItem key={horse.id} value={horse.id.toString()}>{horse.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type *</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vet">Vet</SelectItem>
                      <SelectItem value="farrier">Farrier</SelectItem>
                      <SelectItem value="dentist">Dentist</SelectItem>
                      <SelectItem value="physio">Physiotherapist</SelectItem>
                      <SelectItem value="trainer">Trainer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input
                    required
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Provider *</Label>
                <Input
                  required
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="Vet/farrier/provider name"
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Clinic or stable location"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cost (£)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Status *</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Reminder</Label>
                <Select value={formData.reminder} onValueChange={(v) => setFormData({ ...formData, reminder: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="No reminder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No reminder</SelectItem>
                    <SelectItem value="1day">1 day before</SelectItem>
                    <SelectItem value="3days">3 days before</SelectItem>
                    <SelectItem value="1week">1 week before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
                  {editingAppointment ? 'Update' : 'Schedule'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Appointments */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Appointments ({upcomingAppointments.length})</h2>
        <div className="grid gap-4">
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments</p>
          ) : (
            upcomingAppointments.map((appointment: any) => (
              <div key={appointment.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{appointment.provider}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(appointment.type)}`}>
                        {appointment.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Horse: {horses?.find((h: any) => h.id === appointment.horseId)?.name || 'Unknown'}
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                      {appointment.appointmentTime && (
                        <>
                          <Clock className="h-4 w-4 ml-2" />
                          {appointment.appointmentTime}
                        </>
                      )}
                    </p>
                    {appointment.location && <p className="text-sm"><strong>Location:</strong> {appointment.location}</p>}
                    {appointment.costInPence && (
                      <p className="text-sm"><strong>Cost:</strong> £{(appointment.costInPence / 100).toFixed(2)}</p>
                    )}
                    {appointment.notes && <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(appointment)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(appointment.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Past Appointments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Past Appointments ({pastAppointments.length})</h2>
        <div className="grid gap-4">
          {pastAppointments.slice(0, 10).map((appointment: any) => (
            <div key={appointment.id} className="bg-gray-50 border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{appointment.provider}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(appointment.type)}`}>
                      {appointment.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Horse: {horses?.find((h: any) => h.id === appointment.horseId)?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                    {appointment.appointmentTime && ` at ${appointment.appointmentTime}`}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleEdit(appointment)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Appointments() {
  return (
    <DashboardLayout>
      <AppointmentsContent />
    </DashboardLayout>
  );
}
