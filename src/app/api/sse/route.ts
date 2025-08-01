import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/handlers";
import { sseManager } from "@/features/sse";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    // Get session to check user authentication (optional)
    const session = await auth();

    // Extract parameters
    const userId = url.searchParams.get("userId");

    // Use authenticated user ID if available and matches provided userId
    let validatedUserId: string | undefined;
    if (session?.user?.id) {
      validatedUserId =
        userId && userId === session.user.id ? userId : session.user.id;
    } else if (userId) {
      // Allow anonymous connections with provided userId
      validatedUserId = userId;
    }
    // If no userId provided and no session, connection will be anonymous

    return new NextResponse(
      new ReadableStream({
        start(controller) {
          // Add client to SSE manager with optional user credentials
          const client = sseManager.addClient(controller, validatedUserId);

          // Clean up on close
          request.signal.addEventListener("abort", () => {
            client.close();
            controller.close();
          });
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Cache-Control",
        },
      },
    );
  } catch (error) {
    console.error("SSE connection error:", error);
    return NextResponse.json(
      { error: "Failed to establish SSE connection" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      event: string;
      data: unknown;
      target?: {
        userIds?: string[];
        clientIds?: string[];
      };
      broadcast?: boolean;
    };
    const { event, data, target, broadcast } = body;

    if (!event || !data) {
      return NextResponse.json(
        { error: "Event and data are required" },
        { status: 400 },
      );
    }

    // Send message with SSE manager
    sseManager.sendMessage({
      event,
      data,
      target,
      broadcast,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SSE message error:", error);
    return NextResponse.json(
      { error: "Failed to send SSE message" },
      { status: 500 },
    );
  }
}
