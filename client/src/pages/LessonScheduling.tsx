import { useState } from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  DollarSign,
  User,
  Check,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { format } from "date-fns";
import DashboardLayout from "../components/DashboardLayout";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function LessonSchedulingContent() {
  const [activeTab, setActiveTab] = useState<"bookings" | "availability">(
    "bookings",
  );

  // Bookings state
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    trainerId: "",
    horseId: "",
    lessonDate: "",
    duration: "60",
    lessonType: "",
    location: "",
    fee: "",
    notes: "",
  });

  // Availability state
  const [isCreateAvailabilityOpen, setIsCreateAvailabilityOpen] =
    useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });

  // Queries
  const { data: bookings = [], refetch: refetchBookings } =
    trpc.lessonBookings.list.useQuery({ asTrainer: false });
  const { data: myTrainingBookings = [], refetch: refetchMyTraining } =
    trpc.lessonBookings.list.useQuery({ asTrainer: true });
  const { data: availability = [], refetch: refetchAvailability } =
    trpc.trainerAvailability.list.useQuery();
  const { data: horses = [] } = trpc.horses.list.useQuery();
  const { data: currentUser } = trpc.user.getProfile.useQuery();
  // For trainer list, we'll use a placeholder or fetch from a trainers endpoint when available
  const trainers = [];

  // Mutations
  const createBooking = trpc.lessonBookings.create.useMutation({
    onSuccess: () => {
      toast.success("Lesson booked successfully");
      setIsCreateBookingOpen(false);
      resetBookingForm();
      refetchBookings();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const updateBooking = trpc.lessonBookings.update.useMutation({
    onSuccess: () => {
      toast.success("Lesson updated successfully");
      refetchBookings();
      refetchMyTraining();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const deleteBooking = trpc.lessonBookings.delete.useMutation({
    onSuccess: () => {
      toast.success("Lesson deleted successfully");
      refetchBookings();
      refetchMyTraining();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const markCompleted = trpc.lessonBookings.markCompleted.useMutation({
    onSuccess: () => {
      toast.success("Lesson marked as completed");
      refetchMyTraining();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const markCancelled = trpc.lessonBookings.markCancelled.useMutation({
    onSuccess: () => {
      toast.success("Lesson cancelled");
      refetchBookings();
      refetchMyTraining();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const createAvailability = trpc.trainerAvailability.create.useMutation({
    onSuccess: () => {
      toast.success("Availability added successfully");
      setIsCreateAvailabilityOpen(false);
      resetAvailabilityForm();
      refetchAvailability();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const deleteAvailability = trpc.trainerAvailability.delete.useMutation({
    onSuccess: () => {
      toast.success("Availability removed");
      refetchAvailability();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const resetBookingForm = () => {
    setBookingForm({
      trainerId: "",
      horseId: "",
      lessonDate: "",
      duration: "60",
      lessonType: "",
      location: "",
      fee: "",
      notes: "",
    });
  };

  const resetAvailabilityForm = () => {
    setAvailabilityForm({
      dayOfWeek: "",
      startTime: "",
      endTime: "",
    });
  };

  const handleCreateBooking = () => {
    if (!bookingForm.trainerId || !bookingForm.lessonDate) {
      toast.error("Error", {
        description: "Please fill in required fields",
      });
      return;
    }

    createBooking.mutate({
      trainerId: parseInt(bookingForm.trainerId),
      horseId: bookingForm.horseId ? parseInt(bookingForm.horseId) : undefined,
      lessonDate: bookingForm.lessonDate,
      duration: parseInt(bookingForm.duration),
      lessonType: bookingForm.lessonType || undefined,
      location: bookingForm.location || undefined,
      fee: bookingForm.fee ? parseInt(bookingForm.fee) : undefined,
      notes: bookingForm.notes || undefined,
    });
  };

  const handleCreateAvailability = () => {
    if (
      !availabilityForm.dayOfWeek ||
      !availabilityForm.startTime ||
      !availabilityForm.endTime
    ) {
      toast.error("Error", {
        description: "Please fill in all fields",
      });
      return;
    }

    createAvailability.mutate({
      dayOfWeek: parseInt(availabilityForm.dayOfWeek),
      startTime: availabilityForm.startTime,
      endTime: availabilityForm.endTime,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      scheduled: "default",
      completed: "secondary",
      cancelled: "destructive",
      no_show: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getHorseName = (horseId: number | null) => {
    if (!horseId) return "N/A";
    const horse = horses.find((h) => h.id === horseId);
    return horse?.name || `Horse #${horseId}`;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lesson Scheduling</h1>
          <p className="text-muted-foreground">
            Manage your riding lessons and trainer availability
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="bookings">My Lessons</TabsTrigger>
          <TabsTrigger value="availability">My Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Lesson Bookings</h2>
            <Dialog
              open={isCreateBookingOpen}
              onOpenChange={setIsCreateBookingOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Book Lesson
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Book a Lesson</DialogTitle>
                  <DialogDescription>
                    Schedule a new riding lesson
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="trainer">Trainer ID *</Label>
                    <Input
                      id="trainer"
                      type="number"
                      value={bookingForm.trainerId}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          trainerId: e.target.value,
                        })
                      }
                      placeholder="Enter trainer ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="horse">Horse (Optional)</Label>
                    <Select
                      value={bookingForm.horseId}
                      onValueChange={(value) =>
                        setBookingForm({ ...bookingForm, horseId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a horse" />
                      </SelectTrigger>
                      <SelectContent>
                        {horses.map((horse) => (
                          <SelectItem
                            key={horse.id}
                            value={horse.id.toString()}
                          >
                            {horse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="lessonDate">Date & Time *</Label>
                    <Input
                      id="lessonDate"
                      type="datetime-local"
                      value={bookingForm.lessonDate}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          lessonDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={bookingForm.duration}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          duration: e.target.value,
                        })
                      }
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lessonType">Lesson Type</Label>
                    <Input
                      id="lessonType"
                      value={bookingForm.lessonType}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          lessonType: e.target.value,
                        })
                      }
                      placeholder="e.g., Dressage, Jumping"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={bookingForm.location}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          location: e.target.value,
                        })
                      }
                      placeholder="Arena, outdoor ring, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="fee">Fee (cents)</Label>
                    <Input
                      id="fee"
                      type="number"
                      value={bookingForm.fee}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, fee: e.target.value })
                      }
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={bookingForm.notes}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Any additional information"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateBookingOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBooking}>Book Lesson</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {bookings.length === 0 && myTrainingBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No lessons scheduled yet
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setIsCreateBookingOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Book Your First Lesson
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myTrainingBookings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">As Trainer</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {myTrainingBookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                Client #{booking.clientId}
                              </CardTitle>
                              <CardDescription>
                                {getHorseName(booking.horseId)}
                              </CardDescription>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center text-sm">
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(new Date(booking.lessonDate), "PPp")}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{booking.duration} minutes</span>
                          </div>
                          {booking.lessonType && (
                            <div className="flex items-center text-sm">
                              <User className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>{booking.lessonType}</span>
                            </div>
                          )}
                          {booking.location && (
                            <div className="flex items-center text-sm">
                              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>{booking.location}</span>
                            </div>
                          )}
                          {booking.fee && (
                            <div className="flex items-center text-sm">
                              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>
                                ${(booking.fee / 100).toFixed(2)}{" "}
                                {booking.paid ? "(Paid)" : "(Unpaid)"}
                              </span>
                            </div>
                          )}
                          {booking.status === "scheduled" && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                onClick={() =>
                                  markCompleted.mutate({ id: booking.id })
                                }
                              >
                                <Check className="mr-1 h-3 w-3" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  markCancelled.mutate({ id: booking.id })
                                }
                              >
                                <X className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {bookings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">My Lessons</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                Trainer #{booking.trainerId}
                              </CardTitle>
                              <CardDescription>
                                {getHorseName(booking.horseId)}
                              </CardDescription>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center text-sm">
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(new Date(booking.lessonDate), "PPp")}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{booking.duration} minutes</span>
                          </div>
                          {booking.lessonType && (
                            <div className="flex items-center text-sm">
                              <User className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>{booking.lessonType}</span>
                            </div>
                          )}
                          {booking.location && (
                            <div className="flex items-center text-sm">
                              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>{booking.location}</span>
                            </div>
                          )}
                          {booking.fee && (
                            <div className="flex items-center text-sm">
                              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>
                                ${(booking.fee / 100).toFixed(2)}{" "}
                                {booking.paid ? "(Paid)" : "(Unpaid)"}
                              </span>
                            </div>
                          )}
                          {booking.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {booking.notes}
                            </p>
                          )}
                          {booking.status === "scheduled" && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  markCancelled.mutate({ id: booking.id })
                                }
                              >
                                <X className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  deleteBooking.mutate({ id: booking.id })
                                }
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">My Training Availability</h2>
            <Dialog
              open={isCreateAvailabilityOpen}
              onOpenChange={setIsCreateAvailabilityOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Availability
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Availability</DialogTitle>
                  <DialogDescription>
                    Set your training availability
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dayOfWeek">Day of Week *</Label>
                    <Select
                      value={availabilityForm.dayOfWeek}
                      onValueChange={(value) =>
                        setAvailabilityForm({
                          ...availabilityForm,
                          dayOfWeek: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={availabilityForm.startTime}
                      onChange={(e) =>
                        setAvailabilityForm({
                          ...availabilityForm,
                          startTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={availabilityForm.endTime}
                      onChange={(e) =>
                        setAvailabilityForm({
                          ...availabilityForm,
                          endTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateAvailabilityOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAvailability}>
                    Add Availability
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {availability.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No availability set yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Set your training schedule to allow clients to book lessons
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setIsCreateAvailabilityOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Set Your Availability
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availability.map((slot) => (
                <Card key={slot.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {DAYS_OF_WEEK[slot.dayOfWeek]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full mt-2"
                      onClick={() => deleteAvailability.mutate({ id: slot.id })}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function LessonScheduling() {
  return (
    <DashboardLayout>
      <LessonSchedulingContent />
    </DashboardLayout>
  );
}
