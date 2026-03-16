import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Edit2,
  Trash2,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const EVENT_TYPE_COLORS: Record<string, string> = {
  training: "bg-blue-500",
  competition: "bg-green-500",
  veterinary: "bg-purple-500",
  farrier: "bg-yellow-500",
  lesson: "bg-red-500",
  meeting: "bg-gray-500",
  other: "bg-indigo-500",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  training: "Training",
  competition: "Competition",
  veterinary: "Vet Appointment",
  farrier: "Farrier",
  lesson: "Appointment",
  meeting: "Meeting",
  other: "Other",
};

// UI display types (includes "reminder" mapped to "other")
const UI_EVENT_TYPES = [
  { value: "lesson", label: "Appointment" },
  { value: "training", label: "Training" },
  { value: "veterinary", label: "Vet Appointment" },
  { value: "farrier", label: "Farrier" },
  { value: "competition", label: "Competition" },
  { value: "other", label: "Reminder / Other" },
  { value: "meeting", label: "Meeting" },
];

type DbEventType =
  | "training"
  | "competition"
  | "veterinary"
  | "farrier"
  | "lesson"
  | "meeting"
  | "other";

interface EventForm {
  title: string;
  eventType: DbEventType;
  startDate: string;
  startTime: string;
  location: string;
  description: string;
  horseId: string;
}

const EMPTY_FORM: EventForm = {
  title: "",
  eventType: "other",
  startDate: new Date().toISOString().slice(0, 10),
  startTime: "",
  location: "",
  description: "",
  horseId: "",
};

function buildStartDate(date: string, time: string): string {
  const t = time || "12:00";
  return new Date(`${date}T${t}:00`).toISOString();
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([]);
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<EventForm>({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState<EventForm>({ ...EMPTY_FORM });

  const monthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const monthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );

  const { data: events = [], refetch } = trpc.calendar.getEvents.useQuery({
    startDate: monthStart.toISOString(),
    endDate: monthEnd.toISOString(),
  });

  const { data: horses = [] } = trpc.horses.list.useQuery();

  const createEvent = trpc.calendar.createEvent.useMutation({
    onSuccess: () => {
      toast.success("Event created");
      setIsAddDialogOpen(false);
      setNewEvent({ ...EMPTY_FORM });
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateEvent = trpc.calendar.updateEvent.useMutation({
    onSuccess: () => {
      toast.success("Event updated");
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteEvent = trpc.calendar.deleteEvent.useMutation({
    onSuccess: () => {
      toast.success("Event deleted");
      setIsDeleteAlertOpen(false);
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const navigateMonth = (direction: number) => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + direction,
        1,
      ),
    );
  };

  const getEventsForDay = (day: number) => {
    return events.filter((e: any) => {
      const d = new Date(e.startDate);
      return (
        d.getDate() === day &&
        d.getMonth() === currentDate.getMonth() &&
        d.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const upcomingEvents = events
    .filter((e: any) => new Date(e.startDate) >= new Date())
    .sort(
      (a: any, b: any) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )
    .slice(0, 8);

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      toast.error("Please enter an event title");
      return;
    }
    createEvent.mutate({
      title: newEvent.title,
      eventType: newEvent.eventType,
      startDate: buildStartDate(newEvent.startDate, newEvent.startTime),
      location: newEvent.location || undefined,
      description: newEvent.description || undefined,
      horseId: newEvent.horseId ? Number(newEvent.horseId) : undefined,
      isAllDay: !newEvent.startTime,
    });
  };

  const handleOpenEdit = (event: any) => {
    const d = new Date(event.startDate);
    const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    setEditForm({
      title: event.title || "",
      eventType: (event.eventType as DbEventType) || "other",
      startDate: d.toISOString().slice(0, 10),
      startTime: timeStr === "12:00" && event.isAllDay ? "" : timeStr,
      location: event.location || "",
      description: event.description || "",
      horseId: event.horseId ? String(event.horseId) : "",
    });
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
    setIsDayDialogOpen(false);
  };

  const handleUpdateEvent = () => {
    if (!selectedEvent) return;
    if (!editForm.title.trim()) {
      toast.error("Please enter an event title");
      return;
    }
    updateEvent.mutate({
      id: selectedEvent.id,
      title: editForm.title,
      description: editForm.description || undefined,
      startDate: buildStartDate(editForm.startDate, editForm.startTime),
    });
  };

  const handleDayClick = (day: number) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      setSelectedDayEvents(dayEvents);
      setIsDayDialogOpen(true);
    } else {
      setNewEvent({
        ...EMPTY_FORM,
        startDate: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      });
      setIsAddDialogOpen(true);
    }
  };

  const getHorseName = (horseId: number | null) => {
    if (!horseId) return null;
    const horse = (horses as any[]).find((h: any) => h.id === horseId);
    return horse?.name || null;
  };

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t("nav.calendar")}</h1>
            <p className="text-muted-foreground">
              Schedule and manage all your equestrian activities
            </p>
          </div>
          <Button
            onClick={() => {
              setNewEvent({ ...EMPTY_FORM });
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center font-medium text-xs text-muted-foreground p-2"
                >
                  {day}
                </div>
              ))}

              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] p-1" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const today = new Date();
                const isToday =
                  day === today.getDate() &&
                  currentDate.getMonth() === today.getMonth() &&
                  currentDate.getFullYear() === today.getFullYear();
                const dayEvents = getEventsForDay(day);

                return (
                  <div
                    key={day}
                    className={`min-h-[80px] p-1 border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors ${
                      isToday ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    <div
                      className={`text-xs mb-1 font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((event: any) => (
                        <div
                          key={event.id}
                          className={`text-[10px] px-1 py-0.5 rounded text-white truncate ${
                            EVENT_TYPE_COLORS[event.eventType] || "bg-gray-500"
                          }`}
                        >
                          {event.title}
                          {event.horseId && getHorseName(event.horseId) && (
                            <span className="opacity-80">
                              {" "}
                              · {getHorseName(event.horseId)}
                            </span>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-muted-foreground">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
                <div key={type} className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${EVENT_TYPE_COLORS[type]}`}
                  />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming events</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add events to your calendar to stay organised
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setNewEvent({ ...EMPTY_FORM });
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event: any) => {
                  const horseName = getHorseName(event.horseId);
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => handleOpenEdit(event)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full shrink-0 ${EVENT_TYPE_COLORS[event.eventType] || "bg-gray-500"}`}
                        />
                        <div>
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.startDate).toLocaleDateString(
                              "en-GB",
                              {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              },
                            )}
                            {" · "}
                            {new Date(event.startDate).toLocaleTimeString(
                              "en-GB",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                            {event.location && ` · ${event.location}`}
                          </p>
                          {horseName && (
                            <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              🐎 {horseName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {EVENT_TYPE_LABELS[event.eventType] ||
                            event.eventType}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(event);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
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

      {/* Day Events Dialog */}
      <Dialog open={isDayDialogOpen} onOpenChange={setIsDayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Events</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {selectedDayEvents.map((event: any) => {
              const horseName = getHorseName(event.horseId);
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 cursor-pointer"
                  onClick={() => handleOpenEdit(event)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${EVENT_TYPE_COLORS[event.eventType] || "bg-gray-500"}`}
                    />
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.startDate).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {horseName && ` · 🐎 ${horseName}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                  </Badge>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsDayDialogOpen(false);
                setNewEvent({ ...EMPTY_FORM });
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                placeholder="Event title"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newEvent.eventType}
                onValueChange={(v) =>
                  setNewEvent({ ...newEvent, eventType: v as DbEventType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UI_EVENT_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newEvent.startDate}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Time
                </Label>
                <Input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, startTime: e.target.value })
                  }
                />
              </div>
            </div>
            {(horses as any[]).length > 0 && (
              <div className="space-y-2">
                <Label>Horse (optional)</Label>
                <Select
                  value={newEvent.horseId || "none"}
                  onValueChange={(v) =>
                    setNewEvent({ ...newEvent, horseId: v === "none" ? "" : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select horse..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific horse</SelectItem>
                    {(horses as any[]).map((h: any) => (
                      <SelectItem key={h.id} value={String(h.id)}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Location (optional)</Label>
              <Input
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                placeholder="e.g. Main arena"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                placeholder="Notes or details..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={createEvent.isPending}>
              {createEvent.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                placeholder="Event title"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Time
                </Label>
                <Input
                  type="time"
                  value={editForm.startTime}
                  onChange={(e) =>
                    setEditForm({ ...editForm, startTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Notes or details..."
                rows={2}
              />
            </div>
            {selectedEvent && (
              <div className="text-xs text-muted-foreground">
                Type:{" "}
                <span className="font-medium">
                  {EVENT_TYPE_LABELS[selectedEvent.eventType] ||
                    selectedEvent.eventType}
                </span>
                {selectedEvent.location && (
                  <>
                    {" "}
                    · Location:{" "}
                    <span className="font-medium">
                      {selectedEvent.location}
                    </span>
                  </>
                )}
                {selectedEvent.horseId &&
                  getHorseName(selectedEvent.horseId) && (
                    <>
                      {" "}
                      · Horse:{" "}
                      <span className="font-medium">
                        🐎 {getHorseName(selectedEvent.horseId)}
                      </span>
                    </>
                  )}
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteAlertOpen(true)}
              disabled={deleteEvent.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateEvent}
                disabled={updateEvent.isPending}
              >
                {updateEvent.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedEvent?.title}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedEvent && deleteEvent.mutate({ id: selectedEvent.id })
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
