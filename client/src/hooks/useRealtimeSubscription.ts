import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface RealtimeEvent {
  channel: string;
  payload: {
    type: string;
    data: any;
  };
}

/**
 * Hook to subscribe to realtime SSE events
 * @param channel - Channel to subscribe to (e.g., "user:123" or "user:123:horses")
 * @param callback - Function to call when event is received
 * @param showToast - Whether to show toast notifications for events
 */
export function useRealtimeSubscription(
  channel: string,
  callback: (data: any) => void,
  showToast: boolean = false,
) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Don't connect if no channel provided
    if (!channel) return;

    // Create SSE connection
    const eventSource = new EventSource("/api/realtime/events");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: RealtimeEvent = JSON.parse(event.data);

        // Check if this event is for our channel
        if (data.channel === channel || data.channel.startsWith(channel)) {
          callback(data.payload);

          // Show toast notification if enabled
          if (showToast && data.payload.type) {
            const eventType =
              data.payload.type.split(".")[1] || data.payload.type;

            switch (eventType) {
              case "created":
                toast.success("New item created");
                break;
              case "updated":
                toast.info("Item updated");
                break;
              case "deleted":
                toast.error("Item deleted");
                break;
              case "reminder":
                toast.info(data.payload.data?.title || "Reminder");
                break;
              default:
                toast.info("Update received");
            }
          }
        }
      } catch (error) {
        console.error("Error parsing SSE event:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      // Will automatically reconnect
    };

    eventSource.onopen = () => {
      console.log(`SSE connected to channel: ${channel}`);
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      console.log(`SSE disconnected from channel: ${channel}`);
    };
  }, [channel, callback, showToast]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
  };
}
