/**
 * React hook for Server-Sent Events (SSE) real-time updates
 * Provides instant updates across all modules without page refresh
 */

import { useEffect, useRef, useState, useCallback } from "react";

interface RealtimeEvent {
  event: string;
  data: any;
  timestamp: string;
}

type EventHandler = (data: any) => void;

interface UseRealtimeOptions {
  enabled?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const {
    enabled = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  /**
   * Subscribe to specific event type
   */
  const subscribe = useCallback((eventType: string, handler: EventHandler) => {
    if (!handlersRef.current.has(eventType)) {
      handlersRef.current.set(eventType, new Set());
    }
    handlersRef.current.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = handlersRef.current.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          handlersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  /**
   * Connect to SSE endpoint
   */
  const connect = useCallback(() => {
    if (!enabled || eventSourceRef.current) return;

    try {
      const eventSource = new EventSource("/api/realtime/events", {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        console.log("[SSE] Connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onerror = (error) => {
        console.error("[SSE] Connection error:", error);
        setIsConnected(false);
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(
            `[SSE] Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`,
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else {
          console.error("[SSE] Max reconnect attempts reached");
        }
      };

      // Listen for specific event types
      const setupEventListener = (eventType: string) => {
        eventSource.addEventListener(eventType, (event) => {
          try {
            const data = JSON.parse((event as MessageEvent).data);
            const realtimeEvent: RealtimeEvent = {
              event: eventType,
              data,
              timestamp: new Date().toISOString(),
            };

            setLastEvent(realtimeEvent);

            // Call all registered handlers for this event type
            const handlers = handlersRef.current.get(eventType);
            if (handlers) {
              handlers.forEach((handler) => {
                try {
                  handler(data);
                } catch (error) {
                  console.error(`[SSE] Handler error for ${eventType}:`, error);
                }
              });
            }
          } catch (error) {
            console.error(`[SSE] Parse error for ${eventType}:`, error);
          }
        });
      };

      // Setup listeners for common event types
      const eventTypes = [
        "connected",
        "horses:created",
        "horses:updated",
        "horses:deleted",
        "documents:uploaded",
        "documents:deleted",
        "tasks:created",
        "tasks:updated",
        "tasks:deleted",
        "tasks:completed",
        "health:created",
        "health:updated",
        "health:deleted",
        "health:appointment:created",
        "health:appointment:updated",
        "breeding:created",
        "breeding:updated",
        "breeding:deleted",
        "foal:created",
        "foal:updated",
        "finance:income:created",
        "finance:expense:created",
        "finance:invoice:created",
        "finance:invoice:updated",
        "sales:lead:created",
        "sales:lead:updated",
        "nutrition:log:created",
        "nutrition:plan:updated",
        "team:member:added",
        "team:member:removed",
        "report:generated",
        "file:uploaded",
        "file:deleted",
      ];

      eventTypes.forEach(setupEventListener);

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error("[SSE] Setup error:", error);
    }
  }, [enabled, reconnectDelay, maxReconnectAttempts]);

  /**
   * Disconnect from SSE
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    lastEvent,
    subscribe,
    disconnect,
    reconnect: connect,
  };
}

/**
 * Hook to subscribe to specific module events
 */
export function useRealtimeModule(
  module: string,
  onEvent: (action: string, data: any) => void,
  enabled = true,
) {
  const { subscribe, isConnected } = useRealtime({ enabled });

  useEffect(() => {
    if (!enabled) return;

    const eventPattern = new RegExp(`^${module}:`);
    const unsubscribers: (() => void)[] = [];

    // Subscribe to all events matching this module
    const commonActions = ["created", "updated", "deleted", "completed"];
    commonActions.forEach((action) => {
      const eventType = `${module}:${action}`;
      const unsubscribe = subscribe(eventType, (data) => {
        onEvent(action, data);
      });
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [module, onEvent, enabled, subscribe]);

  return { isConnected };
}

/**
 * Hook for optimistic UI updates with real-time sync
 */
export function useOptimisticUpdate<T>(
  initialData: T[],
  moduleKey: string,
): {
  data: T[];
  optimisticAdd: (item: T) => void;
  optimisticUpdate: (id: number | string, updates: Partial<T>) => void;
  optimisticRemove: (id: number | string) => void;
  syncData: (serverData: T[]) => void;
} {
  const [data, setData] = useState<T[]>(initialData);

  // Subscribe to real-time updates
  useRealtimeModule(
    moduleKey,
    (action, eventData) => {
      switch (action) {
        case "created":
          setData((prev) => [...prev, eventData]);
          break;
        case "updated":
          setData((prev) =>
            prev.map((item) =>
              (item as any).id === eventData.id
                ? { ...item, ...eventData }
                : item,
            ),
          );
          break;
        case "deleted":
          setData((prev) =>
            prev.filter((item) => (item as any).id !== eventData.id),
          );
          break;
      }
    },
    true,
  );

  const optimisticAdd = useCallback((item: T) => {
    setData((prev) => [...prev, item]);
  }, []);

  const optimisticUpdate = useCallback(
    (id: number | string, updates: Partial<T>) => {
      setData((prev) =>
        prev.map((item) =>
          (item as any).id === id ? { ...item, ...updates } : item,
        ),
      );
    },
    [],
  );

  const optimisticRemove = useCallback((id: number | string) => {
    setData((prev) => prev.filter((item) => (item as any).id !== id));
  }, []);

  const syncData = useCallback((serverData: T[]) => {
    setData(serverData);
  }, []);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return {
    data,
    optimisticAdd,
    optimisticUpdate,
    optimisticRemove,
    syncData,
  };
}
