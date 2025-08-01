"use client";

import { SessionProvider } from "next-auth/react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils";
import { useSSE } from "./hooks/use-sse";

function SSEClientContent() {
  const {
    session,
    status,
    isConnected,
    lastEvent,
    stats,
    message,
    events,
    setMessage,
    connect,
    disconnect,
    disconnectAll,
    sendMessage,
    testWebhookBroadcast,
    testUserNotification,
  } = useSSE();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">SSE Client</h1>
        </div>

        {/* Authentication Status */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Authentication Status
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  status === "authenticated"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800",
                )}
              >
                {status === "authenticated" ? "Authenticated" : "Anonymous"}
              </span>
            </div>
            {session?.user && (
              <>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">User ID:</span>{" "}
                  {session.user.id}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Name:</span> {session.user.name}
                </div>
              </>
            )}
            {!session?.user && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Note:</span> You can connect
                anonymously without authentication
              </div>
            )}
          </div>
        </div>

        {/* Connection Controls */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Connection Controls
          </h2>
          <div className="flex gap-4">
            <Button onClick={connect} disabled={isConnected}>
              Connect
            </Button>
            <Button onClick={disconnect} disabled={!isConnected}>
              Disconnect
            </Button>
            <Button onClick={disconnectAll}>Disconnect All</Button>
          </div>
          <div className="mt-4">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                isConnected
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800",
              )}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          {isConnected && (
            <div className="mt-2 text-sm text-gray-600">
              {session?.user?.id
                ? `Connected as authenticated user: ${session.user.name}`
                : "Connected anonymously"}
            </div>
          )}
        </div>

        {/* Message Sender */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Send Message
          </h2>
          <div className="flex flex-col justify-start gap-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              className="flex-1 resize-none rounded-md border border-gray-300 p-3 text-black focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
            />
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || !isConnected}
              className="self-start"
            >
              Send Message
            </Button>
          </div>
        </div>

        {/* Webhook Test */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Webhook Test
          </h2>
          <div className="flex flex-col gap-4">
            <Button
              onClick={testWebhookBroadcast}
              disabled={!isConnected}
              className="self-start"
            >
              Test Webhook Broadcast
            </Button>
            <Button
              onClick={testUserNotification}
              disabled={!isConnected || !session?.user?.id}
              className="self-start"
            >
              Test User Notification
            </Button>
          </div>
        </div>

        {/* Last Event */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Last Event
          </h2>
          {lastEvent ? (
            <div className="rounded-md bg-gray-50 p-4">
              <div className="mb-2 text-sm text-gray-600">
                Event: <span className="font-medium">{lastEvent.event}</span>
              </div>
              <div className="mb-2 text-sm text-gray-600">
                Time:{" "}
                <span className="font-medium">
                  {new Date(lastEvent.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Data:{" "}
                <span className="rounded bg-gray-200 px-2 py-1 font-mono text-xs">
                  {JSON.stringify(lastEvent.data, null, 2)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No events received yet</p>
          )}
        </div>

        {/* Statistics */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Statistics (update every 5 seconds)
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalConnections}
              </div>
              <div className="text-sm text-blue-800">Clients</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.activeUsers}
              </div>
              <div className="text-sm text-green-800">Users</div>
            </div>
          </div>
        </div>

        {/* Event History */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Event History
          </h2>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {events.length > 0 ? (
              events
                .slice()
                .reverse()
                .map((event, index) => (
                  <div
                    key={index}
                    className="rounded-md bg-gray-50 p-3 text-sm"
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <span className="font-medium text-blue-600">
                        {event.event}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-gray-700">
                      {JSON.stringify(event.data, null, 2)}
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500">No events in history</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SSEClientPage() {
  return (
    <SessionProvider>
      <SSEClientContent />
    </SessionProvider>
  );
}
