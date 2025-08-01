export interface SSEClient {
  id: string;
  userId?: string;
  controller: ReadableStreamDefaultController;
  send: (data: string) => void;
  close: () => void;
  lastActivity: Date;
  isAlive: boolean;
}

export interface SSEEvent {
  event: string;
  data: unknown;
  id?: string;
  retry?: number;
}

export interface SSEStats {
  totalConnections: number;
  activeUsers: number;
}

export interface SSEMessage {
  event: string;
  data: unknown;
  target?: {
    userIds?: string[];
    clientIds?: string[];
  };
  broadcast?: boolean;
}
