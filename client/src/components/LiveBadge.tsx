import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";

interface LiveBadgeProps {
  className?: string;
}

/**
 * LiveBadge component - displays a "Live" indicator with pulse animation
 * Connects to SSE endpoint to show real-time connection status
 */
export function LiveBadge({ className }: LiveBadgeProps) {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        eventSource = new EventSource("/events");

        eventSource.onopen = () => {
          console.log("[LiveBadge] SSE connection established");
          setIsConnected(true);
        };

        eventSource.onerror = (error) => {
          console.error("[LiveBadge] SSE connection error:", error);
          setIsConnected(false);
          
          // Attempt to reconnect after 5 seconds
          reconnectTimeout = setTimeout(() => {
            console.log("[LiveBadge] Attempting to reconnect...");
            connect();
          }, 5000);
        };

        // Listen for heartbeat or any event to confirm connection
        eventSource.onmessage = () => {
          setIsConnected(true);
        };
      } catch (error) {
        console.error("[LiveBadge] Failed to establish SSE connection:", error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [user]);

  if (!isConnected) {
    return null;
  }

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1.5 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span className="text-xs font-medium">Live</span>
    </Badge>
  );
}
