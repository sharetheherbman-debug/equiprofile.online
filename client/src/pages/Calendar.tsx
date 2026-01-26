import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, RefreshCw, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useRealtimeModule } from "@/hooks/useRealtime";
import DashboardLayout from "@/components/DashboardLayout";

// UK timezone helper
const formatUKDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatUKDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

function CalendarContent() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventType: "other" as const,
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    isAllDay: false,
  });

  // Calculate date range for queries
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Fetch events
  const { data: events = [], isLoading, refetch } = trpc.calendar.getEvents.useQuery({
    startDate: startOfMonth.toISOString(),
    endDate: endOfMonth.toISOString(),
  });

  const createMutation = trpc.calendar.createEvent.useMutation({
    onSuccess: () => {
      toast.success("Event created successfully");
      refetch();
      setIsAddEventOpen(false);
      resetNewEvent();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  const deleteMutation = trpc.calendar.deleteEvent.useMutation({
    onSuccess: () => {
      toast.success("Event deleted");
      refetch();
      setSelectedEvent(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete event");
    },
  });

  // Real-time updates
  useRealtimeModule('events', (action, data) => {
    switch (action) {
      case 'created':
      case 'updated':
      case 'deleted':
        refetch();
        break;
    }
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: "",
      description: "",
      eventType: "other",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      location: "",
      isAllDay: false,
    });
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.startDate) {
      toast.error("Please fill in required fields");
      return;
    }

    // Combine date and time
    const startDateTime = newEvent.isAllDay 
      ? new Date(newEvent.startDate).toISOString()
      : new Date(`${newEvent.startDate}T${newEvent.startTime || '00:00'}`).toISOString();

    const endDateTime = newEvent.endDate
      ? newEvent.isAllDay
        ? new Date(newEvent.endDate).toISOString()
        : new Date(`${newEvent.endDate}T${newEvent.endTime || '23:59'}`).toISOString()
      : undefined;

    createMutation.mutate({
      title: newEvent.title,
      description: newEvent.description,
      eventType: newEvent.eventType,
      startDate: startDateTime,
      endDate: endDateTime,
      location: newEvent.location,
      isAllDay: newEvent.isAllDay,
    });
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteMutation.mutate({ id: selectedEvent.id });
    }
  };

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();
    });
  };

  const eventTypeColors: Record<string, string> = {
    training: "bg-blue-100 text-blue-700 border-blue-200",
    competition: "bg-green-100 text-green-700 border-green-200",
    veterinary: "bg-purple-100 text-purple-700 border-purple-200",
    farrier: "bg-yellow-100 text-yellow-700 border-yellow-200",
    lesson: "bg-red-100 text-red-700 border-red-200",
    meeting: "bg-gray-100 text-gray-700 border-gray-200",
    other: "bg-orange-100 text-orange-700 border-orange-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif">{t("nav.calendar")}</h1>
          <p className="text-muted-foreground">
            Schedule and manage all your equestrian activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Create a new event or appointment for your horses.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <Label htmlFor="event-title">Title *</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="e.g., Vet Appointment, Training Session"
                  />
                </div>
                <div>
                  <Label htmlFor="event-type">Event Type *</Label>
                  <Select
                    value={newEvent.eventType}
                    onValueChange={(value: any) => setNewEvent({ ...newEvent, eventType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="competition">Competition</SelectItem>
                      <SelectItem value="veterinary">Veterinary</SelectItem>
                      <SelectItem value="farrier">Farrier</SelectItem>
                      <SelectItem value="lesson">Lesson</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-date">Start Date *</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-time">Start Time</Label>
                    <Input
                      id="event-time"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      disabled={newEvent.isAllDay}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-end-date">End Date</Label>
                    <Input
                      id="event-end-date"
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-end-time">End Time</Label>
                    <Input
                      id="event-end-time"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      disabled={newEvent.isAllDay}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="all-day"
                    checked={newEvent.isAllDay}
                    onChange={(e) => setNewEvent({ ...newEvent, isAllDay: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="all-day" className="cursor-pointer">All Day Event</Label>
                </div>
                <div>
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="e.g., Arena, Paddock"
                  />
                </div>
                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Additional details..."
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleAddEvent} 
                  className="w-full" 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Card */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 mr-4">
                <Button
                  variant={view === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("month")}
                >
                  Month
                </Button>
              </div>
              <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-medium text-sm text-muted-foreground p-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {Array.from({ length: 35 }, (_, i) => {
              const dayNumber = i - new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 1;
              const isCurrentMonth = dayNumber > 0 && dayNumber <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
              const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
              const isToday = isCurrentMonth && dayNumber === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              const dayEvents = isCurrentMonth ? getEventsForDay(dayDate) : [];

              return (
                <div
                  key={i}
                  className={`
                    min-h-[100px] p-2 border rounded-lg transition-all hover:shadow-md cursor-pointer
                    ${isCurrentMonth ? "bg-background" : "bg-muted/30"}
                    ${isToday ? "border-primary ring-2 ring-primary/20" : "border-border"}
                  `}
                >
                  {isCurrentMonth && (
                    <>
                      <div className={`text-sm mb-1 ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                        {dayNumber}
                      </div>
                      {/* Event badges */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`text-xs p-1 rounded border truncate ${eventTypeColors[event.eventType] || eventTypeColors.other}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-2">
            <h3 className="font-semibold text-sm">Event Types</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950">Training</Badge>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950">Competition</Badge>
              <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950">Veterinary</Badge>
              <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950">Farrier</Badge>
              <Badge variant="outline" className="bg-red-50 dark:bg-red-950">Lesson</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>
            Next 30 days · {events.length} event{events.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No upcoming events</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add events to your calendar to stay organized
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 10).map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-all cursor-pointer"
                >
                  <div className={`px-3 py-1 rounded-md text-xs font-medium ${eventTypeColors[event.eventType] || eventTypeColors.other}`}>
                    {event.eventType}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatUKDateTime(new Date(event.startDate))}
                      {event.location && ` • ${event.location}`}
                    </p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle>{selectedEvent.title}</DialogTitle>
                  <div className={`inline-block px-2 py-1 rounded-md text-xs font-medium mt-2 ${eventTypeColors[selectedEvent.eventType] || eventTypeColors.other}`}>
                    {selectedEvent.eventType}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedEvent(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Date & Time</Label>
                <p className="font-medium">
                  {formatUKDateTime(new Date(selectedEvent.startDate))}
                  {selectedEvent.endDate && ` - ${formatUKDateTime(new Date(selectedEvent.endDate))}`}
                </p>
              </div>
              {selectedEvent.location && (
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">{selectedEvent.location}</p>
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="font-medium">{selectedEvent.description}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleDeleteEvent}
                  disabled={deleteMutation.isPending}
                  className="flex-1"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete Event"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedEvent(null)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <CalendarContent />
    </DashboardLayout>
  );
}
