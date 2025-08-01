import { NextResponse } from "next/server";
import { sseManager } from "@/features/sse";

export async function GET() {
  try {
    const stats = sseManager.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching SSE stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch SSE stats" },
      { status: 500 },
    );
  }
}
