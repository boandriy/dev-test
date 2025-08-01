import { type NextRequest, NextResponse } from "next/server";
import { broadcastMessage, sendNotification } from "@/features/sse";

// NOTE: This route is for development/testing purposes only. Not for production.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      type: string;
      userId?: string;
      message?: string;
    };
    const { type, userId, message } = body;

    switch (type) {
      case "broadcast":
        // Send a message to all connected clients
        broadcastMessage("webhook-event", {
          type: "broadcast",
          message: message ?? "Broadcast message from webhook",
          timestamp: new Date().toISOString(),
        });
        break;

      case "user-notification":
        // Send a notification to a specific user
        if (userId) {
          sendNotification(
            userId,
            "Webhook Notification",
            message ?? "You have a new notification",
            "info",
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid webhook type" },
          { status: 400 },
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
