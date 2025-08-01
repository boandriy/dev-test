import type { SSEClient, SSEEvent, SSEStats, SSEMessage } from "../types";

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

class SSEManager {
  private clients = new Map<string, SSEClient>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly CLIENT_TIMEOUT = 120000; // 2 minutes

  constructor() {
    this.startHeartbeat();
  }

  addClient(
    controller: ReadableStreamDefaultController,
    userId?: string,
  ): SSEClient {
    const clientId = generateId();

    const client: SSEClient = {
      id: clientId,
      userId,
      controller,
      send: (data: string) => this.sendToClient(clientId, data),
      close: () => this.removeClient(clientId),
      lastActivity: new Date(),
      isAlive: true,
    };

    this.clients.set(clientId, client);

    // Send initial connection event
    this.sendToClient(
      clientId,
      this.formatSSEMessage({
        event: "connected",
        data: { clientId, userId },
      }),
    );

    console.log(`SSE Client connected: ${clientId}`, {
      userId,
      totalConnections: this.clients.size,
    });

    return client;
  }

  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.isAlive = false;
      this.clients.delete(clientId);

      console.log(`SSE Client disconnected: ${clientId}`, {
        totalConnections: this.clients.size,
      });
    }
  }

  // Send message to specific client
  private sendToClient(clientId: string, data: string): void {
    const client = this.clients.get(clientId);
    if (client?.isAlive) {
      try {
        client.controller.enqueue(new TextEncoder().encode(data));
        client.lastActivity = new Date();
        console.log(`Sending to client ${clientId}:`, data);
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error);
        this.removeClient(clientId);
      }
    }
  }

  // Send message to multiple clients (all or specific)
  sendMessage(message: SSEMessage): void {
    const sseData = this.formatSSEMessage({
      event: message.event,
      data: message.data,
    });

    if (message.broadcast) {
      // Send to all clients
      this.clients.forEach((client, clientId) => {
        this.sendToClient(clientId, sseData);
      });
    } else if (message.target) {
      // Send to specific targets
      const targetClients = this.getTargetClients(message.target);
      targetClients.forEach((clientId) => {
        this.sendToClient(clientId, sseData);
      });
    }
  }

  // Get clients by target options
  private getTargetClients(target: SSEMessage["target"]): string[] {
    const targetClientIds: string[] = [];

    this.clients.forEach((client, clientId) => {
      if (target?.clientIds?.includes(clientId)) {
        targetClientIds.push(clientId);
      } else if (
        target?.userIds &&
        client.userId &&
        target.userIds.includes(client.userId)
      ) {
        targetClientIds.push(clientId);
      }
    });

    return targetClientIds;
  }

  // Form an SSE message
  private formatSSEMessage(event: SSEEvent): string {
    let sseMessage = "";

    if (event.id) {
      sseMessage += `id: ${event.id}\n`;
    }

    if (event.retry) {
      sseMessage += `retry: ${event.retry}\n`;
    }

    sseMessage += `event: ${event.event}\n`;
    sseMessage += `data: ${JSON.stringify(event.data)}\n\n`;

    return sseMessage;
  }

  private sendHeartbeat(): void {
    const heartbeatData = this.formatSSEMessage({
      event: "heartbeat",
      data: { timestamp: new Date().toISOString() },
    });

    this.clients.forEach((client, clientId) => {
      this.sendToClient(clientId, heartbeatData);
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
      this.cleanupInactiveClients();
    }, this.HEARTBEAT_INTERVAL);
  }

  private cleanupInactiveClients(): void {
    const now = new Date();
    const clientsToRemove: string[] = [];

    this.clients.forEach((client, clientId) => {
      const timeSinceLastActivity =
        now.getTime() - client.lastActivity.getTime();
      if (timeSinceLastActivity > this.CLIENT_TIMEOUT) {
        clientsToRemove.push(clientId);
      }
    });

    clientsToRemove.forEach((clientId) => {
      this.removeClient(clientId);
    });
  }

  getStats(): SSEStats {
    const uniqueUsers = new Set<string>();
    const userConnections = new Map<string, number>();

    this.clients.forEach((client) => {
      if (client.userId) {
        uniqueUsers.add(client.userId);
        userConnections.set(
          client.userId,
          (userConnections.get(client.userId) ?? 0) + 1,
        );
      }
    });

    // Log detailed statistics
    console.log("SSE Statistics:", {
      totalConnections: this.clients.size,
      activeUsers: uniqueUsers.size,
      userConnections: Object.fromEntries(userConnections),
      clients: Array.from(this.clients.values()).map((client) => ({
        id: client.id,
        userId: client.userId,
        lastActivity: client.lastActivity,
        isAlive: client.isAlive,
      })),
    });

    return {
      totalConnections: this.clients.size,
      activeUsers: uniqueUsers.size,
    };
  }

  getClients(): SSEClient[] {
    return Array.from(this.clients.values());
  }

  disconnectAll(): void {
    // Send disconnect notification to all clients before removing them
    const disconnectData = this.formatSSEMessage({
      event: "disconnected",
      data: {
        reason: "server_disconnect",
        message: "All clients have been disconnected by the server",
        timestamp: new Date().toISOString(),
      },
    });

    this.clients.forEach((client, clientId) => {
      // Send disconnect notification
      this.sendToClient(clientId, disconnectData);
      // Then remove the client
      this.removeClient(clientId);
    });
  }

  // Cleanup resources
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.disconnectAll();
  }
}

// Create and export a singleton instance
export const sseManager = new SSEManager();

// Export the class for testing
export { SSEManager };
