import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import type { SSEEvent } from "../sse-event-handlers/event-types";
import type { SSEStats } from "../sse-api/stats-api";
import { createSSEConnectionManager } from "../sse-event-handlers/connection-manager";
import { sendCustomMessage, disconnectAllClients } from "../sse-api/sse-api";
import {
  sendWebhookBroadcast,
  sendWebhookNotification,
} from "../sse-api/webhook-api";
import { fetchSSEStats } from "../sse-api/stats-api";

export const useSSE = () => {
  const { data: session, status } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const [stats, setStats] = useState<SSEStats>({
    totalConnections: 0,
    activeUsers: 0,
  });
  const [message, setMessage] = useState("");
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Create connection state object
  const connectionState = {
    isConnected,
    setLastEvent,
    setEvents,
    setIsConnected,
  };

  // Create connection manager
  const connectionManager = createSSEConnectionManager(
    connectionState,
    session,
    eventSourceRef,
  );

  // Connect to SSE
  const connect = () => {
    connectionManager.connect();
  };

  // Disconnect from SSE
  const disconnect = () => {
    connectionManager.disconnect();
  };

  // Disconnect all clients
  const disconnectAll = async () => {
    try {
      await disconnectAllClients();
    } catch (error) {
      console.error("Error disconnecting all clients:", error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim()) {
      return;
    }

    try {
      await sendCustomMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Test broadcast webhook
  const testWebhookBroadcast = async () => {
    try {
      await sendWebhookBroadcast("Test broadcast message from webhook");
    } catch (error) {
      console.error("Error sending webhook broadcast:", error);
    }
  };

  // Test user notification webhook
  const testUserNotification = async () => {
    if (!session?.user?.id) return;

    try {
      await sendWebhookNotification(
        session.user.id,
        "Test notification for current user",
      );
    } catch (error) {
      console.error("Error sending webhook notification:", error);
    }
  };

  // Update stats periodically (every 5 seconds)
  useEffect(() => {
    const updateStats = async () => {
      try {
        const statsData = await fetchSSEStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    void updateStats();
    const interval = setInterval(() => {
      void updateStats();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const currentEventSource = eventSourceRef.current;
    return () => {
      if (currentEventSource) {
        currentEventSource.close();
      }
    };
  }, []);

  return {
    // State
    session,
    status,
    isConnected,
    lastEvent,
    stats,
    message,
    events,

    // Actions
    setMessage,
    connect,
    disconnect,
    disconnectAll,
    sendMessage,
    testWebhookBroadcast,
    testUserNotification,
  };
};
