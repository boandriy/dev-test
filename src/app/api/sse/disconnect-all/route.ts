import { NextResponse } from "next/server";
import { sseManager } from "@/features/sse";

export async function POST() {
  try {
    sseManager.disconnectAll();
    return NextResponse.json({
      success: true,
      message: "All clients disconnected",
    });
  } catch (error) {
    console.error("Error disconnecting all clients:", error);
    return NextResponse.json(
      { error: "Failed to disconnect all clients" },
      { status: 500 },
    );
  }
}
