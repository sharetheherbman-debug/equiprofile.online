/**
 * Real-time Event System using Server-Sent Events (SSE)
 * Provides instant updates across all modules without page refresh
 */

import { Request, Response } from "express";
import { nanoid } from "nanoid";

interface SSEClient {
  id: string;
  userId: number;
  res: Response;
  channels: Set<string>;
}

interface RealtimeEvent {
  channel: string;
  event: string;
  data: any;
  timestamp: string;
}

class RealtimeEventManager {
  private clients: Map<string, SSEClient> = new Map();
  private eventHistory: Map<string, RealtimeEvent[]> = new Map();
  private readonly MAX_HISTORY = 50;

  /**
   * Register a new SSE client connection
   */
  addClient(userId: number, res: Response): string {
    const clientId = nanoid();

    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    });

    const client: SSEClient = {
      id: clientId,
      userId,
      res,
      channels: new Set(["global", `user:${userId}`]),
    };

    this.clients.set(clientId, client);

    // Send initial connection message
    this.sendToClient(client, {
      channel: "system",
      event: "connected",
      data: { clientId, timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    });

    // Setup heartbeat
    const heartbeat = setInterval(() => {
      if (!this.clients.has(clientId)) {
        clearInterval(heartbeat);
        return;
      }
      try {
        res.write(": heartbeat\n\n");
      } catch (error) {
        console.error(`[SSE] Heartbeat failed for client ${clientId}:`, error);
        this.removeClient(clientId);
        clearInterval(heartbeat);
      }
    }, 30000); // Every 30 seconds

    // Cleanup on disconnect
    res.on("close", () => {
      clearInterval(heartbeat);
      this.removeClient(clientId);
      console.log(`[SSE] Client disconnected: ${clientId}`);
    });

    console.log(`[SSE] Client connected: ${clientId}, userId: ${userId}`);
    return clientId;
  }

  /**
   * Remove a client connection
   */
  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  /**
   * Subscribe client to specific channels
   */
  subscribe(clientId: string, channels: string[]): void {
    const client = this.clients.get(clientId);
    if (client) {
      channels.forEach((channel) => client.channels.add(channel));
    }
  }

  /**
   * Unsubscribe client from channels
   */
  unsubscribe(clientId: string, channels: string[]): void {
    const client = this.clients.get(clientId);
    if (client) {
      channels.forEach((channel) => client.channels.delete(channel));
    }
  }

  /**
   * Publish event to a channel
   */
  publish(channel: string, event: string, data: any): void {
    const realtimeEvent: RealtimeEvent = {
      channel,
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    // Store in history
    if (!this.eventHistory.has(channel)) {
      this.eventHistory.set(channel, []);
    }
    const history = this.eventHistory.get(channel)!;
    history.push(realtimeEvent);
    if (history.length > this.MAX_HISTORY) {
      history.shift();
    }

    // Send to all subscribed clients
    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.channels.has(channel) || client.channels.has("global")) {
        this.sendToClient(client, realtimeEvent);
        sentCount++;
      }
    });

    console.log(`[SSE] Published ${channel}:${event} to ${sentCount} clients`);
  }

  /**
   * Publish event to specific user
   */
  publishToUser(userId: number, event: string, data: any): void {
    this.publish(`user:${userId}`, event, data);
  }

  /**
   * Send event to specific client
   */
  private sendToClient(client: SSEClient, event: RealtimeEvent): void {
    try {
      const sseData = `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`;
      client.res.write(sseData);
    } catch (error) {
      console.error(`[SSE] Failed to send to client ${client.id}:`, error);
      this.removeClient(client.id);
    }
  }

  /**
   * Get recent events for a channel (for reconnection)
   */
  getHistory(channel: string, limit: number = 10): RealtimeEvent[] {
    const history = this.eventHistory.get(channel) || [];
    return history.slice(-limit);
  }

  /**
   * Get connection stats
   */
  getStats() {
    return {
      connectedClients: this.clients.size,
      channels: Array.from(
        new Set(
          Array.from(this.clients.values()).flatMap((c) =>
            Array.from(c.channels),
          ),
        ),
      ),
      eventHistorySize: this.eventHistory.size,
    };
  }
}

// Singleton instance
export const realtimeManager = new RealtimeEventManager();

/**
 * Standard event naming convention:
 * - horses:created
 * - horses:updated
 * - horses:deleted
 * - documents:uploaded
 * - tasks:created
 * - tasks:completed
 * - health:appointment:created
 * - breeding:event:updated
 * - finance:invoice:created
 * etc.
 */

/**
 * Helper to publish module events with standard naming
 */
export function publishModuleEvent(
  module: string,
  action: string,
  data: any,
  userId?: number,
) {
  const event = `${module}:${action}`;
  const channel = userId ? `user:${userId}` : module;
  realtimeManager.publish(channel, event, data);
}

/**
 * Helper to publish to all users (admin broadcasts)
 */
export function publishGlobal(event: string, data: any) {
  realtimeManager.publish("global", event, data);
}
