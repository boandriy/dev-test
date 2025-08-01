import { createSSEEventHandlers, setupEventListeners } from "./event-handlers";
import type { SSEConnectionState } from "./event-types";
import type { Session } from "next-auth";

export interface SSEConnectionManager {
  connect: () => void;
  disconnect: () => void;
}

export const createSSEConnectionManager = (
  state: SSEConnectionState,
  session: Session | null,
  eventSourceRef: React.MutableRefObject<EventSource | null>,
): SSEConnectionManager => {
  const connect = () => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Build SSE URL with optional authentication parameters
    const sseUrl = new URL("/api/sse", window.location.origin);
    if (session?.user?.id) {
      sseUrl.searchParams.set("userId", session.user.id);
    }

    const eventSource = new EventSource(sseUrl.toString());
    eventSourceRef.current = eventSource;

    // Initialize event handlers
    const handlers = createSSEEventHandlers(state, session);
    setupEventListeners(eventSource, handlers);
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      state.setIsConnected(false);
    }
  };

  return {
    connect,
    disconnect,
  };
};
