/**
 * GOOGLE MAPS FRONTEND INTEGRATION - DISABLED
 *
 * This component has been disabled as Forge API is no longer available.
 * To enable maps, integrate Google Maps API directly with your own API key.
 * 
 * Steps to re-enable:
 * 1. Get a Google Maps API key from https://console.cloud.google.com/
 * 2. Add VITE_GOOGLE_MAPS_API_KEY to your .env file
 * 3. Update the loadMapScript function to use your API key
 * 4. Uncomment the map initialization code
 */

/// <reference types="@types/google.maps" />

import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
  }
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -122.4194 },
  initialZoom = 12,
  onMapReady,
}: MapViewProps) {
  return (
    <div className={cn("w-full h-[500px] flex items-center justify-center bg-muted rounded-lg", className)}>
      <div className="text-center p-6">
        <p className="text-muted-foreground mb-2">Maps are currently unavailable</p>
        <p className="text-sm text-muted-foreground">
          Contact your administrator to enable map features
        </p>
      </div>
    </div>
  );
}
