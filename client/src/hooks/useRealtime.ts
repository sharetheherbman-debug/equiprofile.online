/**
 * React hook for Server-Sent Events (SSE) real-time updates.
 * Delegates to the singleton RealtimeContext — one connection per session.
 */

import { useEffect, useCallback, useState, useRef } from "react";
import { useRealtimeContext } from "../contexts/RealtimeContext";

type EventHandler = (data: any) => void;

interface UseRealtimeOptions {
  /** When false the hook won't subscribe. Default: true */
  enabled?: boolean;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { enabled = true } = options;
  const { isConnected, subscribe } = useRealtimeContext();

  return {
    isConnected,
    subscribe: enabled ? subscribe : (_: string, __: EventHandler) => () => {},
    // kept for API compatibility — no-ops because the context manages the connection
    disconnect: () => {},
    reconnect: () => {},
  };
}

/**
 * Hook to subscribe to specific module events.
 *
 * Uses a ref to hold the latest `onEvent` callback so that the subscription
 * effect only re-runs when `module` or `enabled` changes — NOT every time the
 * caller re-renders with a new inline function reference.  This prevents the
 * repeated subscribe/unsubscribe churn that was causing the calendar refetch
 * loop when multiple `useRealtimeModule` calls shared the same `refetch`.
 */
export function useRealtimeModule(
  module: string,
  onEvent: (action: string, data: any) => void,
  enabled = true,
) {
  const { isConnected, subscribe } = useRealtimeContext();

  // Always keep the ref pointing at the latest callback without re-subscribing
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled) return;

    const commonActions = ["created", "updated", "deleted", "completed"];
    const unsubscribers = commonActions.map((action) => {
      const eventType = `${module}:${action}`;
      return subscribe(eventType, (data) => {
        onEventRef.current(action, data);
      });
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  // onEvent intentionally excluded — latest value always available via ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, enabled, subscribe]);

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
