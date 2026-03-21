import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { trpc } from "../_core/trpc";
import {
  Play,
  Square,
  MapPin,
  Clock,
  Route,
  Activity,
  Save,
  Trash2,
  Navigation,
  Gauge,
} from "lucide-react";
import { toast } from "sonner";

interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number;
}

interface RideRecord {
  id: string;
  name: string;
  horseId?: number;
  horseName?: string;
  startTime: number;
  endTime?: number;
  duration: number; // seconds
  distance: number; // meters
  avgSpeed: number; // km/h
  maxSpeed: number; // km/h
  points: GpsPoint[];
  notes?: string;
  date: string;
}

const STORAGE_KEY = "equiprofile-rides";

function loadRides(): RideRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRides(rides: RideRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rides));
}

function calculateDistance(p1: GpsPoint, p2: GpsPoint): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const GPS_NOISE_THRESHOLD_METERS = 2; // Filter out GPS drift to avoid inflating distance

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
}

function RideTrackingContent() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<GpsPoint[]>([]);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [rides, setRides] = useState<RideRecord[]>(loadRides());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [rideName, setRideName] = useState("");
  const [rideHorseId, setRideHorseId] = useState("");
  const [rideNotes, setRideNotes] = useState("");
  const startTimeRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingPointsRef = useRef<GpsPoint[]>([]);

  const { data: horses } = trpc.horses.list.useQuery();

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("GPS is not available on this device");
      return;
    }

    setCurrentPoints([]);
    setCurrentDistance(0);
    setElapsedTime(0);
    setCurrentSpeed(0);
    setMaxSpeed(0);
    pendingPointsRef.current = [];
    startTimeRef.current = Date.now();

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const point: GpsPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
          speed:
            position.coords.speed !== null && position.coords.speed >= 0
              ? position.coords.speed * 3.6 // Convert m/s to km/h
              : undefined,
        };

        pendingPointsRef.current.push(point);

        setCurrentPoints((prev) => {
          const newPoints = [...prev, point];

          // Calculate distance
          if (prev.length > 0) {
            const dist = calculateDistance(prev[prev.length - 1], point);
            if (dist > GPS_NOISE_THRESHOLD_METERS) {
              setCurrentDistance((d) => d + dist);
            }
          }

          return newPoints;
        });

        // Update speed
        if (point.speed !== undefined && point.speed >= 0) {
          setCurrentSpeed(point.speed);
          setMaxSpeed((prev) => Math.max(prev, point.speed || 0));
        }
      },
      (error) => {
        console.warn("GPS error:", error.message);
        toast.error("GPS error: " + error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    watchIdRef.current = watchId;

    // Start elapsed time timer
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    setIsTracking(true);
    toast.success("Ride tracking started! GPS is active.");
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTracking(false);
    setShowSaveDialog(true);
  }, []);

  const saveRide = useCallback(() => {
    const ride: RideRecord = {
      id: Date.now().toString(),
      name: rideName || `Ride on ${new Date().toLocaleDateString()}`,
      horseId: rideHorseId ? parseInt(rideHorseId) : undefined,
      horseName: rideHorseId
        ? horses?.find((h) => h.id === parseInt(rideHorseId))?.name
        : undefined,
      startTime: startTimeRef.current,
      endTime: Date.now(),
      duration: elapsedTime,
      distance: currentDistance,
      avgSpeed:
        elapsedTime > 0 ? currentDistance / 1000 / (elapsedTime / 3600) : 0,
      maxSpeed,
      points: currentPoints,
      notes: rideNotes || undefined,
      date: new Date().toISOString(),
    };

    const updatedRides = [ride, ...rides];
    setRides(updatedRides);
    saveRides(updatedRides);
    setShowSaveDialog(false);
    setRideName("");
    setRideHorseId("");
    setRideNotes("");
    setCurrentPoints([]);
    setCurrentDistance(0);
    setElapsedTime(0);
    toast.success("Ride saved successfully!");
  }, [
    rideName,
    rideHorseId,
    rideNotes,
    elapsedTime,
    currentDistance,
    maxSpeed,
    currentPoints,
    rides,
    horses,
  ]);

  const deleteRide = useCallback(
    (id: string) => {
      const updatedRides = rides.filter((r) => r.id !== id);
      setRides(updatedRides);
      saveRides(updatedRides);
      toast.success("Ride deleted");
    },
    [rides],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          GPS Ride Tracking
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your rides and training routes with GPS
        </p>
      </div>

      {/* Active Tracking Card */}
      <Card
        className={
          isTracking
            ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
            : ""
        }
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation
              className={`w-5 h-5 ${isTracking ? "text-green-500 animate-pulse" : "text-muted-foreground"}`}
            />
            {isTracking ? "Tracking Active" : "Start a Ride"}
          </CardTitle>
          <CardDescription>
            {isTracking
              ? "GPS is recording your route. Press stop when finished."
              : "Press start to begin tracking your ride with GPS."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTracking && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-background rounded-lg border">
                <Clock className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                <div className="text-xl font-bold font-mono">
                  {formatDuration(elapsedTime)}
                </div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <Route className="w-5 h-5 mx-auto text-green-500 mb-1" />
                <div className="text-xl font-bold">
                  {formatDistance(currentDistance)}
                </div>
                <div className="text-xs text-muted-foreground">Distance</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <Gauge className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                <div className="text-xl font-bold">
                  {currentSpeed.toFixed(1)} km/h
                </div>
                <div className="text-xs text-muted-foreground">
                  Current Speed
                </div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <Activity className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                <div className="text-xl font-bold">
                  {maxSpeed.toFixed(1)} km/h
                </div>
                <div className="text-xs text-muted-foreground">Max Speed</div>
              </div>
            </div>
          )}

          {/* Route Preview */}
          {isTracking && currentPoints.length > 1 && (
            <div className="mb-6 rounded-lg border overflow-hidden bg-muted/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">
                  {currentPoints.length} GPS points recorded
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Start: {currentPoints[0].lat.toFixed(5)},{" "}
                {currentPoints[0].lng.toFixed(5)} → Current:{" "}
                {currentPoints[currentPoints.length - 1].lat.toFixed(5)},{" "}
                {currentPoints[currentPoints.length - 1].lng.toFixed(5)}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {!isTracking ? (
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                onClick={startTracking}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Ride
              </Button>
            ) : (
              <Button size="lg" variant="destructive" onClick={stopTracking}>
                <Square className="w-5 h-5 mr-2" />
                Stop & Save
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Ride</DialogTitle>
            <DialogDescription className="sr-only">Manage ride session details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted rounded-lg text-sm">
              <div>
                <span className="text-muted-foreground">Duration:</span>{" "}
                <span className="font-medium">
                  {formatDuration(elapsedTime)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Distance:</span>{" "}
                <span className="font-medium">
                  {formatDistance(currentDistance)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">GPS Points:</span>{" "}
                <span className="font-medium">{currentPoints.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Max Speed:</span>{" "}
                <span className="font-medium">{maxSpeed.toFixed(1)} km/h</span>
              </div>
            </div>
            <div>
              <Label>Ride Name</Label>
              <Input
                value={rideName}
                onChange={(e) => setRideName(e.target.value)}
                placeholder={`Ride on ${new Date().toLocaleDateString()}`}
              />
            </div>
            <div>
              <Label>Horse</Label>
              <Select value={rideHorseId} onValueChange={setRideHorseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select horse" />
                </SelectTrigger>
                <SelectContent>
                  {horses?.map((horse) => (
                    <SelectItem key={horse.id} value={String(horse.id)}>
                      {horse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={rideNotes}
                onChange={(e) => setRideNotes(e.target.value)}
                placeholder="How was the ride?"
                rows={2}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={saveRide} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Ride
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Discard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ride History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-indigo-500" />
            Ride History
          </CardTitle>
          <CardDescription>
            Your recorded rides stored locally on this device
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Navigation className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No rides recorded yet</p>
              <p className="text-sm">
                Start a ride to begin tracking your routes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Route className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium">{ride.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ride.date).toLocaleDateString()} •{" "}
                        {ride.horseName || "No horse assigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm hidden md:block">
                      <div className="font-medium">
                        {formatDistance(ride.distance)}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {formatDuration(ride.duration)} •{" "}
                        {ride.avgSpeed.toFixed(1)} km/h avg
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs md:hidden">
                        {formatDistance(ride.distance)}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteRide(ride.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RideTracking() {
  return (
    <DashboardLayout>
      <RideTrackingContent />
    </DashboardLayout>
  );
}
