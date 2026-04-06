import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import { trpc } from "@/lib/trpc";
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
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number;
}

interface RideDraft {
  currentPoints: GpsPoint[];
  currentDistance: number;
  elapsedTime: number;
  maxSpeed: number;
  startTime: number;
  savedAt: number;
}

const RIDE_DRAFT_KEY = "equiprofile_ride_draft";
const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000;
const AUTO_SAVE_INTERVAL_MS = 10_000;

// ─── Leaflet icon fix — use bundled divIcon (no CDN dependency) ──────────────
const defaultIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:25px;height:41px">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.932 12.5 28.5 12.5 28.5S25 22.432 25 12.5C25 5.596 19.404 0 12.5 0z" fill="#2563eb"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  </div>`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const startIcon = L.divIcon({
  className: "",
  html: '<div style="background:#22c55e;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const riderIcon = L.divIcon({
  className: "",
  html: '<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.5)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateDistance(p1: GpsPoint, p2: GpsPoint): number {
  const R = 6371000;
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

const GPS_NOISE_THRESHOLD_METERS = 2;

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
}

// ─── Map sub-components ──────────────────────────────────────────────────────

/** Keeps the map centred on the latest GPS position while tracking */
function MapFollower({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
}

/** Fits map bounds to a polyline on mount */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      const bounds = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [30, 30] });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, [points, map]);
  return null;
}

// ─── Live Map ────────────────────────────────────────────────────────────────

function LiveMap({
  points,
  isTracking,
}: {
  points: GpsPoint[];
  isTracking: boolean;
}) {
  const positions = useMemo<[number, number][]>(
    () => points.map((p) => [p.lat, p.lng]),
    [points],
  );

  const lastPosition =
    positions.length > 0 ? positions[positions.length - 1] : null;
  const firstPosition = positions.length > 0 ? positions[0] : null;
  const center: [number, number] = lastPosition || [51.505, -0.09];

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ height: "300px", isolation: "isolate" }}
    >
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          referrerPolicy="no-referrer"
        />
        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{ color: "#3b82f6", weight: 4, opacity: 0.8 }}
          />
        )}
        {firstPosition && (
          <Marker position={firstPosition} icon={startIcon}>
            <Popup>Start</Popup>
          </Marker>
        )}
        {lastPosition && isTracking && (
          <Marker position={lastPosition} icon={riderIcon}>
            <Popup>Current position</Popup>
          </Marker>
        )}
        {lastPosition && !isTracking && positions.length > 1 && (
          <Marker position={lastPosition} icon={defaultIcon}>
            <Popup>End</Popup>
          </Marker>
        )}
        {isTracking && <MapFollower position={lastPosition} />}
      </MapContainer>
    </div>
  );
}

// ─── Ride History Map (static view of a saved ride) ──────────────────────────

function RideRouteMap({ routeData }: { routeData: string }) {
  const points = useMemo<GpsPoint[]>(() => {
    try {
      return JSON.parse(routeData);
    } catch {
      return [];
    }
  }, [routeData]);

  const positions = useMemo<[number, number][]>(
    () => points.map((p) => [p.lat, p.lng]),
    [points],
  );

  if (positions.length === 0) return null;

  const center: [number, number] = positions[0];

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ height: "250px", isolation: "isolate" }}
    >
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          referrerPolicy="no-referrer"
        />
        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{ color: "#6366f1", weight: 4, opacity: 0.8 }}
          />
        )}
        {positions.length > 0 && (
          <Marker position={positions[0]} icon={startIcon}>
            <Popup>Start</Popup>
          </Marker>
        )}
        {positions.length > 1 && (
          <Marker position={positions[positions.length - 1]} icon={defaultIcon}>
            <Popup>End</Popup>
          </Marker>
        )}
        <FitBounds points={positions} />
      </MapContainer>
    </div>
  );
}

// ─── Main content ────────────────────────────────────────────────────────────

function RideTrackingContent() {
  const utils = trpc.useUtils();
  const [isTracking, setIsTracking] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<GpsPoint[]>([]);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [rideName, setRideName] = useState("");
  const [rideHorseId, setRideHorseId] = useState("");
  const [rideNotes, setRideNotes] = useState("");
  const [viewingRideId, setViewingRideId] = useState<number | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const startTimeRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentPointsRef = useRef<GpsPoint[]>([]);
  const currentDistanceRef = useRef(0);
  const elapsedTimeRef = useRef(0);
  const maxSpeedRef = useRef(0);

  const { data: horses } = trpc.horses.list.useQuery();
  const { data: rides = [], isLoading: ridesLoading } =
    trpc.rides.list.useQuery();

  const createRideMutation = trpc.rides.create.useMutation({
    onSuccess: async () => {
      await utils.rides.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save ride");
    },
  });

  const deleteRideMutation = trpc.rides.delete.useMutation({
    onSuccess: async () => {
      await utils.rides.list.invalidate();
      toast.success("Ride deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete ride");
    },
  });

  // ── GPS tracking ────────────────────────────────────────────────────────────

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
    startTimeRef.current = Date.now();

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const point: GpsPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
          speed:
            position.coords.speed !== null && position.coords.speed >= 0
              ? position.coords.speed * 3.6
              : undefined,
        };

        setCurrentPoints((prev) => {
          const newPoints = [...prev, point];
          if (prev.length > 0) {
            const dist = calculateDistance(prev[prev.length - 1], point);
            if (dist > GPS_NOISE_THRESHOLD_METERS) {
              setCurrentDistance((d) => d + dist);
            }
          }
          return newPoints;
        });

        if (point.speed !== undefined && point.speed >= 0) {
          setCurrentSpeed(point.speed);
          setMaxSpeed((prev) => Math.max(prev, point.speed || 0));
        }
      },
      (error) => {
        console.warn("GPS error:", error.message);
        toast.error("GPS error: " + error.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );

    watchIdRef.current = watchId;
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
    const avgSpeed =
      elapsedTime > 0 ? currentDistance / 1000 / (elapsedTime / 3600) : 0;

    createRideMutation.mutate({
      horseId: rideHorseId ? parseInt(rideHorseId) : undefined,
      name: rideName || `Ride on ${new Date().toLocaleDateString()}`,
      startTime: new Date(startTimeRef.current).toISOString(),
      endTime: new Date().toISOString(),
      duration: elapsedTime,
      distance: currentDistance,
      avgSpeed,
      maxSpeed,
      routeData: JSON.stringify(currentPoints),
      notes: rideNotes || undefined,
    });

    localStorage.removeItem(RIDE_DRAFT_KEY);
    setShowSaveDialog(false);
    setRideName("");
    setRideHorseId("");
    setRideNotes("");
    setCurrentPoints([]);
    setCurrentDistance(0);
    setElapsedTime(0);
    toast.success("Ride saved!");
  }, [
    rideName,
    rideHorseId,
    rideNotes,
    elapsedTime,
    currentDistance,
    maxSpeed,
    currentPoints,
    createRideMutation,
  ]);

  const deleteRide = useCallback(
    (id: number) => {
      deleteRideMutation.mutate({ id });
    },
    [deleteRideMutation],
  );

  const storageWarningShownRef = useRef(false);

  // ── Auto-save draft to localStorage every 10s while tracking ────────────
  useEffect(() => {
    if (!isTracking || currentPoints.length === 0) return;

    // Sync refs for unmount save
    currentPointsRef.current = currentPoints;
    currentDistanceRef.current = currentDistance;
    elapsedTimeRef.current = elapsedTime;
    maxSpeedRef.current = maxSpeed;

    const interval = setInterval(() => {
      const draft: RideDraft = {
        currentPoints,
        currentDistance,
        elapsedTime,
        maxSpeed,
        startTime: startTimeRef.current,
        savedAt: Date.now(),
      };
      try {
        localStorage.setItem(RIDE_DRAFT_KEY, JSON.stringify(draft));
      } catch (err) {
        console.warn("[RideTracking] Auto-save failed (storage quota?):", err);
        // Warn the user once — private browsing on iOS Safari disables localStorage
        if (!storageWarningShownRef.current) {
          storageWarningShownRef.current = true;
          toast.warning(
            "Auto-save unavailable — your ride draft cannot be saved. " +
            "This happens in private/incognito browsing mode. " +
            "Make sure to save your ride before leaving this page.",
            { duration: 8000 },
          );
        }
      }
    }, AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isTracking, currentPoints, currentDistance, elapsedTime, maxSpeed]);

  // ── Check for recoverable draft on mount ────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RIDE_DRAFT_KEY);
      if (raw) {
        const draft: RideDraft = JSON.parse(raw);
        if (Date.now() - draft.savedAt < DRAFT_EXPIRY_MS && draft.currentPoints.length > 0) {
          setHasDraft(true);
        } else {
          localStorage.removeItem(RIDE_DRAFT_KEY);
        }
      }
    } catch {
      localStorage.removeItem(RIDE_DRAFT_KEY);
    }
  }, []);

  const resumeDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(RIDE_DRAFT_KEY);
      if (!raw) return;
      const draft: RideDraft = JSON.parse(raw);
      // Remove from storage immediately so it cannot re-appear on the next mount
      localStorage.removeItem(RIDE_DRAFT_KEY);
      setCurrentPoints(draft.currentPoints);
      setCurrentDistance(draft.currentDistance);
      setElapsedTime(draft.elapsedTime);
      setMaxSpeed(draft.maxSpeed);
      startTimeRef.current = draft.startTime;
      setHasDraft(false);
      setShowSaveDialog(true);
      toast.success("Previous ride data recovered!");
    } catch {
      localStorage.removeItem(RIDE_DRAFT_KEY);
      setHasDraft(false);
    }
  }, []);

  const discardDraft = useCallback(() => {
    localStorage.removeItem(RIDE_DRAFT_KEY);
    setHasDraft(false);
  }, []);

  /** Reset all in-progress tracking state (used by Discard in save dialog). */
  const resetTrackingState = useCallback(() => {
    setShowSaveDialog(false);
    setCurrentPoints([]);
    setCurrentDistance(0);
    setElapsedTime(0);
    setCurrentSpeed(0);
    setMaxSpeed(0);
  }, []);

  useEffect(() => {
    return () => {
      // Save draft on unmount if actively tracking
      if (watchIdRef.current !== null && currentPointsRef.current.length > 0) {
        const draft: RideDraft = {
          currentPoints: currentPointsRef.current,
          currentDistance: currentDistanceRef.current,
          elapsedTime: elapsedTimeRef.current,
          maxSpeed: maxSpeedRef.current,
          startTime: startTimeRef.current,
          savedAt: Date.now(),
        };
        try {
          localStorage.setItem(RIDE_DRAFT_KEY, JSON.stringify(draft));
        } catch (err) {
          console.warn("[RideTracking] Unmount save failed (storage quota?):", err);
        }
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getHorseName = (horseId: number | null | undefined) => {
    if (!horseId) return null;
    return horses?.find((h) => h.id === horseId)?.name ?? null;
  };

  const viewingRide = viewingRideId
    ? rides.find((r) => r.id === viewingRideId)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          GPS Ride Tracking
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track your rides in real time with GPS and see your route on the map
        </p>
      </div>

      {/* ── Draft Recovery Banner ────────────────────────────────────────── */}
      {hasDraft && (
        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Unsaved ride found</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">A previous ride was interrupted. Would you like to recover it?</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={discardDraft}>Discard</Button>
                <Button size="sm" onClick={resumeDraft}>Recover</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Live Map (shown while tracking or if we have points) ──────────── */}
      {(isTracking || currentPoints.length > 0) && (
        <LiveMap points={currentPoints} isTracking={isTracking} />
      )}

      {/* ── Active Tracking / Start Card ─────────────────────────────────── */}
      <Card
        className={
          isTracking
            ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
            : ""
        }
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 bg-background rounded-lg border">
                <Clock className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                <div className="text-lg font-bold font-mono">
                  {formatDuration(elapsedTime)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Duration
                </div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <Route className="w-4 h-4 mx-auto text-green-500 mb-1" />
                <div className="text-lg font-bold">
                  {formatDistance(currentDistance)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Distance
                </div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <Gauge className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                <div className="text-lg font-bold">
                  {currentSpeed.toFixed(1)} km/h
                </div>
                <div className="text-[11px] text-muted-foreground">Speed</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <Activity className="w-4 h-4 mx-auto text-purple-500 mb-1" />
                <div className="text-lg font-bold">
                  {maxSpeed.toFixed(1)} km/h
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Max Speed
                </div>
              </div>
            </div>
          )}

          {isTracking && currentPoints.length > 0 && (
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-green-500" />
              <span>{currentPoints.length} GPS points recorded</span>
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
                Stop &amp; Save
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Save Dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={showSaveDialog}
        onOpenChange={(open) => {
          // Prevent accidental dismissal via backdrop/Escape when there is unsaved ride data
          if (!open && currentPoints.length > 0 && !isTracking) return;
          setShowSaveDialog(open);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Save Ride</DialogTitle>
            <DialogDescription className="sr-only">
              Save ride session details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted rounded-lg text-sm">
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
                <span className="font-medium">
                  {maxSpeed.toFixed(1)} km/h
                </span>
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
              <Button
                onClick={saveRide}
                className="flex-1"
                disabled={createRideMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {createRideMutation.isPending ? "Saving…" : "Save Ride"}
              </Button>
              <Button
                variant="outline"
                onClick={resetTrackingState}
              >
                Discard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Ride History ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Route className="w-5 h-5 text-indigo-500" />
            Ride History
          </CardTitle>
          <CardDescription>Your recorded rides</CardDescription>
        </CardHeader>
        <CardContent>
          {ridesLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading rides…
            </div>
          ) : rides.length === 0 ? (
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
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg shrink-0">
                        <Route className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{ride.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ride.createdAt).toLocaleDateString()} •{" "}
                          {getHorseName(ride.horseId) || "No horse"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right text-sm hidden md:block">
                        <div className="font-medium">
                          {formatDistance(ride.distance)}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {formatDuration(ride.duration)} •{" "}
                          {(ride.avgSpeed / 100).toFixed(1)} km/h avg
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs md:hidden">
                        {formatDistance(ride.distance)}
                      </Badge>
                      {ride.routeData && (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="View route"
                          onClick={() =>
                            setViewingRideId(
                              viewingRideId === ride.id ? null : ride.id,
                            )
                          }
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
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
                  {viewingRideId === ride.id && ride.routeData && (
                    <div className="mt-3">
                      <RideRouteMap routeData={ride.routeData} />
                    </div>
                  )}
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
