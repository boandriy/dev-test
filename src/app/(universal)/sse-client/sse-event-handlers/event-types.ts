export interface SSEEvent {
  event: string;
  data: unknown;
  timestamp: string;
}

export interface SSEConnectionState {
  isConnected: boolean;
  setLastEvent: (event: SSEEvent) => void;
  setEvents: (updater: (prev: SSEEvent[]) => SSEEvent[]) => void;
  setIsConnected: (connected: boolean) => void;
}

export interface SSEEventHandlers {
  onOpen: () => void;
  onMessage: (event: MessageEvent) => void;
  onError: (error: Event) => void;
  onConnected: (event: MessageEvent) => void;
  onHeartbeat: (event: MessageEvent) => void;
  onDisconnected: (event: MessageEvent) => void;
  onWebhookEvent: (event: MessageEvent) => void;
  onSystemUpdate: (event: MessageEvent) => void;
  onNotification: (event: MessageEvent) => void;
  onCustomMessage: (event: MessageEvent) => void;
}
