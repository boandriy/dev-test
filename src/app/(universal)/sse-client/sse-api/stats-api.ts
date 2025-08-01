export interface SSEStats {
  totalConnections: number;
  activeUsers: number;
}

export const fetchSSEStats = async (): Promise<SSEStats> => {
  try {
    const response = await fetch("/api/sse/stats");

    if (!response.ok) {
      throw new Error(`Failed to fetch SSE stats: ${response.statusText}`);
    }

    const statsData = (await response.json()) as SSEStats;
    return statsData;
  } catch (error) {
    console.error("Error fetching SSE stats:", error);
    throw error;
  }
};
