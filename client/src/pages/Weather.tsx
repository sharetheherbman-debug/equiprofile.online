import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

function WeatherContent() {
  // Open-Meteo live weather endpoints
  const {
    data: currentWeather,
    isLoading: currentLoading,
    refetch: refetchCurrent,
  } = trpc.weather.getCurrent.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: forecast, isLoading: forecastLoading } =
    trpc.weather.getForecast.useQuery(undefined, {
      retry: false,
      refetchOnWindowFocus: false,
    });

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "excellent":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800";
      case "good":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800";
      case "fair":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800";
      case "poor":
        return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800";
      case "not_recommended":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case "excellent":
      case "good":
        return <CheckCircle className="w-5 h-5" />;
      case "fair":
        return <AlertTriangle className="w-5 h-5" />;
      case "poor":
      case "not_recommended":
        return <XCircle className="w-5 h-5" />;
      default:
        return <CloudSun className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Weather &amp; Riding Conditions
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time weather data with intelligent riding recommendations
        </p>
      </div>

      {/* Current Weather Card */}
      {currentLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </CardContent>
        </Card>
      ) : currentWeather ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="w-6 h-6" />
                Current Conditions
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchCurrent()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Weather Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <Thermometer className="w-6 h-6 text-orange-500 mb-2" />
                <div className="text-2xl font-bold">
                  {currentWeather.weather.temperature}°C
                </div>
                <div className="text-sm text-muted-foreground">Temperature</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <Wind className="w-6 h-6 text-blue-500 mb-2" />
                <div className="text-2xl font-bold">
                  {currentWeather.weather.windSpeed} km/h
                </div>
                <div className="text-sm text-muted-foreground">Wind Speed</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <CloudRain className="w-6 h-6 text-blue-500 mb-2" />
                <div className="text-2xl font-bold">
                  {currentWeather.weather.precipitation} mm
                </div>
                <div className="text-sm text-muted-foreground">
                  Precipitation
                </div>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <Droplets className="w-6 h-6 text-cyan-500 mb-2" />
                <div className="text-2xl font-bold">
                  {currentWeather.weather.humidity}%
                </div>
                <div className="text-sm text-muted-foreground">Humidity</div>
              </div>
            </div>

            {/* Riding Advice */}
            <div
              className={`p-4 rounded-lg border-2 ${getRecommendationColor(currentWeather.advice.level)}`}
            >
              <div className="flex items-start gap-3">
                {getRecommendationIcon(currentWeather.advice.level)}
                <div className="flex-1">
                  <div className="font-semibold text-lg capitalize mb-2">
                    {currentWeather.advice.level} Riding Conditions
                  </div>
                  <p className="text-sm mb-3">
                    {currentWeather.advice.message}
                  </p>
                  {currentWeather.advice.warnings.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-medium text-sm">Warnings:</div>
                      {currentWeather.advice.warnings.map((warning, i) => (
                        <div
                          key={i}
                          className="text-sm flex items-center gap-2"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Condition: {currentWeather.weather.condition} &bull; Last updated:{" "}
              {new Date(currentWeather.weather.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-3">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Please set your location in Settings to see current weather
                conditions
              </p>
              <Button onClick={() => (window.location.href = "/settings")}>
                Go to Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7-Day Forecast */}
      {forecastLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : forecast && forecast.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>7-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {forecast.map((day, i) => (
                <div key={i} className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <CloudSun className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm font-semibold">{day.tempMax}°</div>
                  <div className="text-xs text-muted-foreground">
                    {day.tempMin}°
                  </div>
                  <div className="text-xs mt-1">{day.condition}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Riding Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            General Riding Safety Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="flex items-start gap-2">
                <Thermometer className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                Avoid intense work when temperatures exceed 30°C or drop below
                5°C — warm up and cool down gradually.
              </p>
              <p className="flex items-start gap-2">
                <Wind className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                Strong winds (above 40 km/h) can spook horses — consider
                lungeing before mounting.
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-start gap-2">
                <CloudRain className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                Wet footing increases slip risk — reduce speed and avoid sharp
                turns on muddy ground.
              </p>
              <p className="flex items-start gap-2">
                <Droplets className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                High humidity (above 80%) combined with heat stresses horses
                quickly — shorten sessions and hydrate frequently.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
