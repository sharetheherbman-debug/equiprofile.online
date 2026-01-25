import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye,
  Sun,
  CloudRain,
  Loader2,
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Navigation
} from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

function WeatherContent() {
  const [location, setLocation] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [weatherData, setWeatherData] = useState({
    temperature: 15,
    humidity: 60,
    windSpeed: 10,
    precipitation: 0,
    conditions: "partly cloudy",
    uvIndex: 4,
    visibility: 10,
  });

  const { data: latestWeather, isLoading: weatherLoading } = trpc.weather.getLatest.useQuery();
  const { data: weatherHistory } = trpc.weather.getHistory.useQuery({ limit: 5 });
  
  const analyzeMutation = trpc.weather.analyze.useMutation({
    onSuccess: (data) => {
      toast.success("Weather analysis complete!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to analyze weather");
    },
  });

  // Request geolocation on component mount
  useEffect(() => {
    if (navigator.geolocation && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state as 'granted' | 'denied' | 'prompt');
        
        if (result.state === 'granted') {
          // Auto-fetch location if already granted
          handleGetLocation();
        }
      }).catch(() => {
        // Permissions API not supported, try geolocation anyway
        setLocationPermission('prompt');
      });
    }
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported", {
        description: "Please enter your location manually."
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Convert coordinates to location name (simplified - in production use reverse geocoding)
        setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        setLocationPermission('granted');
        toast.success("Location obtained!", {
          description: "Using your current location for weather data."
        });
        setIsGettingLocation(false);
      },
      (error) => {
        setLocationPermission('denied');
        console.error("Geolocation error:", error);
        toast.error("Location access denied", {
          description: "Please enter a UK postcode or area (e.g., M32, London)."
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  };

  const handleAnalyze = () => {
    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }
    
    analyzeMutation.mutate({
      location,
      ...weatherData,
    });
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'poor':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'not_recommended':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-5 h-5" />;
      case 'fair':
        return <AlertTriangle className="w-5 h-5" />;
      case 'poor':
      case 'not_recommended':
        return <XCircle className="w-5 h-5" />;
      default:
        return <CloudSun className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Weather Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Check riding conditions and get AI-powered recommendations
        </p>
      </div>

      {/* Location Permission Alert */}
      {locationPermission === 'denied' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Location access denied. Please enter a UK postcode or area manually (e.g., M32, London, Manchester).
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weather Input Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Check Riding Conditions</CardTitle>
            <CardDescription>
              Enter current weather conditions for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter UK postcode or area (e.g., M32, London)"
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="shrink-0"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Use My Location
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature" className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  Temperature (°C)
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  value={weatherData.temperature}
                  onChange={(e) => setWeatherData({ ...weatherData, temperature: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humidity" className="flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Humidity (%)
                </Label>
                <Input
                  id="humidity"
                  type="number"
                  min="0"
                  max="100"
                  value={weatherData.humidity}
                  onChange={(e) => setWeatherData({ ...weatherData, humidity: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="windSpeed" className="flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Wind (km/h)
                </Label>
                <Input
                  id="windSpeed"
                  type="number"
                  min="0"
                  value={weatherData.windSpeed}
                  onChange={(e) => setWeatherData({ ...weatherData, windSpeed: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precipitation" className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4" />
                  Rain (mm)
                </Label>
                <Input
                  id="precipitation"
                  type="number"
                  min="0"
                  value={weatherData.precipitation}
                  onChange={(e) => setWeatherData({ ...weatherData, precipitation: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conditions" className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4" />
                  Conditions
                </Label>
                <Input
                  id="conditions"
                  value={weatherData.conditions}
                  onChange={(e) => setWeatherData({ ...weatherData, conditions: e.target.value })}
                  placeholder="e.g., sunny, cloudy, rainy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uvIndex" className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  UV Index
                </Label>
                <Input
                  id="uvIndex"
                  type="number"
                  min="0"
                  max="11"
                  value={weatherData.uvIndex}
                  onChange={(e) => setWeatherData({ ...weatherData, uvIndex: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Visibility (km)
                </Label>
                <Input
                  id="visibility"
                  type="number"
                  min="0"
                  value={weatherData.visibility}
                  onChange={(e) => setWeatherData({ ...weatherData, visibility: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={analyzeMutation.isPending}
              className="w-full"
              size="lg"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Analyze Riding Conditions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Latest Result */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              {analyzeMutation.data ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${getRecommendationColor(analyzeMutation.data.recommendation)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getRecommendationIcon(analyzeMutation.data.recommendation)}
                      <span className="font-semibold capitalize text-lg">
                        {analyzeMutation.data.recommendation.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  {analyzeMutation.data.analysis && (
                    <div className="prose prose-sm max-w-none">
                      <Streamdown>{analyzeMutation.data.analysis}</Streamdown>
                    </div>
                  )}
                </div>
              ) : latestWeather ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${getRecommendationColor(latestWeather.ridingRecommendation || 'fair')}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getRecommendationIcon(latestWeather.ridingRecommendation || 'fair')}
                      <span className="font-semibold capitalize text-lg">
                        {(latestWeather.ridingRecommendation || 'fair').replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm opacity-80">
                      Last checked: {new Date(latestWeather.checkedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CloudSun className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Enter weather conditions and click analyze
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Checks</CardTitle>
            </CardHeader>
            <CardContent>
              {!weatherHistory || weatherHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No weather history yet
                </p>
              ) : (
                <div className="space-y-2">
                  {weatherHistory.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{log.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.checkedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={`capitalize ${getRecommendationColor(log.ridingRecommendation || 'fair')}`}>
                        {(log.ridingRecommendation || 'fair').replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Weather() {
  return (
    <DashboardLayout>
      <WeatherContent />
    </DashboardLayout>
  );
}
