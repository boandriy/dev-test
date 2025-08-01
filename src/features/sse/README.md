# SSE (Server-Sent Events) Manager

A centralized SSE manager for handling real-time communication between the server and clients.

## Features

- **Centralized Connection Management**: Track active client connections per user
- **Named Events**: Send events with payloads to specific clients or broadcast to all
- **Connection Lifecycle**: Handle connect, disconnect, and error events
- **Heartbeat System**: Keep connections alive with automatic ping messages
- **Resource Management**: Clean up inactive connections to prevent memory leaks
- **Statistics**: Monitor active connections and users
- **Flexible Authentication**: Support both authenticated and anonymous connections

## API Endpoints

### Connect to SSE Stream

```
GET /api/sse?userId=123
```

**Authentication**: Optional. Users can connect anonymously or with authentication.

### Send Message

```
POST /api/sse
Content-Type: application/json

{
  "event": "notification",
  "data": { "message": "Hello!" },
  "broadcast": true
}
```

### Get Statistics

```
GET /api/sse/stats
```

### Disconnect All Clients

```
POST /api/sse/disconnect-all
```

This endpoint disconnects all active SSE clients and sends a "disconnected" event to each client before closing their connections. Clients will receive a notification.

## Usage Examples

### Sending Messages from Backend

```typescript
import {
  broadcastMessage,
  sendToUsers,
  sendNotification,
} from "@/features/sse";

// Broadcast to all clients
broadcastMessage("system-update", {
  message: "System maintenance in 5 minutes",
  type: "warning",
});

// Send to specific users
sendToUsers(
  "notification",
  {
    title: "New Message",
    content: "You have a new message",
  },
  ["user1", "user2"],
);

// Send a notification
sendNotification("user123", "Welcome!", "Welcome to our platform", "success");
```

### Client-Side Connection

```typescript
// Authenticated connection (recommended)
const eventSource = new EventSource("/api/sse?userId=123");

// Anonymous connection
const eventSource = new EventSource("/api/sse");

eventSource.onopen = () => {
  console.log("Connected to SSE");
};

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
};

eventSource.addEventListener("notification", (event) => {
  const data = JSON.parse(event.data);
  console.log("Notification:", data);
});

eventSource.addEventListener("disconnected", (event) => {
  const data = JSON.parse(event.data);
  console.log("Disconnected by server:", data);
  // Update your connection state here
  setIsConnected(false);
});

eventSource.onerror = (error) => {
  console.error("SSE Error:", error);
};
```

## Testing

Visit `/sse-client` to test the SSE functionality with a built-in client interface. You can test both authenticated and anonymous connections. Authenticate on the Home page, then navigate to the `/sse-client`. You will see your authentication status in the interface.

## Event Types

### Standard Events

- **connected**: Sent when a client successfully connects
- **heartbeat**: Periodic ping to keep connections alive
- **disconnected**: Sent when a client is disconnected by the server (e.g., via disconnect-all)
- **custom-message**: User-defined events

### Disconnect Event

When clients are disconnected via the `/api/sse/disconnect-all` endpoint, they receive a "disconnected" event with the following structure:

```json
{
  "reason": "server_disconnect",
  "message": "All clients have been disconnected by the server",
  "timestamp": "2025-07-31T15:07:27.597Z"
}
```

## Architecture

- **SSEManager**: Singleton class managing all client connections
- **SSEClient**: Individual client connection with controller
- **Event Types**: Structured events with type safety
- **Utility Functions**: Easy-to-use functions for common operations
