import { sseManager } from "../services/sse-manager";

// Send a message to all connected clients
export function broadcastMessage(event: string, data: unknown): void {
  sseManager.sendMessage({
    event,
    data,
    broadcast: true,
  });
}

// Send message to specific users
export function sendToUsers(
  event: string,
  data: unknown,
  userIds: string[],
): void {
  sseManager.sendMessage({
    event,
    data,
    target: { userIds },
  });
}

// Send message to specific clients
export function sendToClients(
  event: string,
  data: unknown,
  clientIds: string[],
): void {
  sseManager.sendMessage({
    event,
    data,
    target: { clientIds },
  });
}

// Send notification to a specific user
export function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
): void {
  sendToUsers(
    "notification",
    {
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
    },
    [userId],
  );
}

// Send system update to all users
export function sendSystemUpdate(
  message: string,
  type: "info" | "maintenance" | "update" = "info",
): void {
  broadcastMessage("system-update", {
    message,
    type,
    timestamp: new Date().toISOString(),
  });
}

// Get SSE statistics (active authorized users and connections)
export function getSSEStats() {
  return sseManager.getStats();
}

// Get active clients
export function getActiveClients() {
  return sseManager.getClients();
}
