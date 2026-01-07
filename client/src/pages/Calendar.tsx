import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function CalendarPage() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("nav.calendar")}</h1>
          <p className="text-muted-foreground">
            Schedule and manage all your equestrian activities
          </p>
        </div>
        <Button>
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
              <div className="flex gap-1 mr-4">
                <Button
                  variant={view === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("month")}
                >
                  Month
                </Button>
                <Button
                  variant={view === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("week")}
                >
                  Week
                </Button>
                <Button
                  variant={view === "day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("day")}
                >
                  Day
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
            
            {/* Calendar days - simplified placeholder */}
            {Array.from({ length: 35 }, (_, i) => {
              const dayNumber = i - new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 1;
              const isCurrentMonth = dayNumber > 0 && dayNumber <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
              const isToday = isCurrentMonth && dayNumber === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={i}
                  className={`
                    min-h-[100px] p-2 border rounded-lg
                    ${isCurrentMonth ? "bg-background" : "bg-muted/30"}
                    ${isToday ? "border-primary" : "border-border"}
                  `}
                >
                  {isCurrentMonth && (
                    <>
                      <div className={`text-sm ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                        {dayNumber}
                      </div>
                      {/* Event badges would go here */}
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

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No upcoming events</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add events to your calendar to stay organized
            </p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
