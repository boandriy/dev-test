import type {
  SSEEvent,
  SSEConnectionState,
  SSEEventHandlers,
} from "./event-types";
import type { Session } from "next-auth";

const createSSEEvent = (eventType: string, event: MessageEvent): SSEEvent => {
  try {
    const data = JSON.parse(event.data as string) as unknown;
    return {
      event: eventType,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error parsing SSE ${eventType} event:`, error);
    return {
      event: eventType,
      data: event.data,
      timestamp: new Date().toISOString(),
    };
  }
};

export const createSSEEventHandlers = (
  state: SSEConnectionState,
  session: Session | null,
): SSEEventHandlers => {
  const { setLastEvent, setEvents, setIsConnected } = state;

  const handleEvent = (eventType: string, event: MessageEvent) => {
    const newEvent = createSSEEvent(eventType, event);
    setLastEvent(newEvent);
    setEvents((prev) => [...prev, newEvent]);
  };

  return {
    onOpen: () => {
      setIsConnected(true);
      console.log("SSE connection established", {
        userId: session?.user?.id,
        userName: session?.user?.name,
        authenticated: !!session?.user?.id,
      });
    },

    onMessage: (event: MessageEvent) => {
      handleEvent("message", event);
    },

    onError: (error: Event) => {
      console.error("SSE connection error:", error);
      setIsConnected(false);
    },

    onConnected: (event: MessageEvent) => {
      handleEvent("connected", event);
    },

    onHeartbeat: (event: MessageEvent) => {
      handleEvent("heartbeat", event);
    },

    onDisconnected: (event: MessageEvent) => {
      handleEvent("disconnected", event);
      setIsConnected(false);
      console.log("SSE connection disconnected by server:", event.data);
    },

    onWebhookEvent: (event: MessageEvent) => {
      handleEvent("webhook-event", event);
      console.log("Webhook event received:", event.data);
    },

    onSystemUpdate: (event: MessageEvent) => {
      handleEvent("system-update", event);
      console.log("System update received:", event.data);
    },

    onNotification: (event: MessageEvent) => {
      handleEvent("notification", event);
      console.log("Notification received:", event.data);
    },

    onCustomMessage: (event: MessageEvent) => {
      handleEvent("custom-message", event);
      console.log("Custom message received:", event.data);
    },
  };
};

export const setupEventListeners = (
  eventSource: EventSource,
  handlers: SSEEventHandlers,
): void => {
  // Core event handlers
  eventSource.onopen = handlers.onOpen;
  eventSource.onmessage = handlers.onMessage;
  eventSource.onerror = handlers.onError;

  // Custom event listeners
  eventSource.addEventListener("connected", handlers.onConnected);
  eventSource.addEventListener("heartbeat", handlers.onHeartbeat);
  eventSource.addEventListener("disconnected", handlers.onDisconnected);
  eventSource.addEventListener("webhook-event", handlers.onWebhookEvent);
  eventSource.addEventListener("system-update", handlers.onSystemUpdate);
  eventSource.addEventListener("notification", handlers.onNotification);
  eventSource.addEventListener("custom-message", handlers.onCustomMessage);
};
