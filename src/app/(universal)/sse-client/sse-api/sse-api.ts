export interface SSEMessage {
  event: string;
  data: Record<string, unknown>;
  broadcast?: boolean;
}

export const sendSSEMessage = async (message: SSEMessage): Promise<void> => {
  try {
    const response = await fetch("/api/sse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Failed to send SSE message: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending SSE message:", error);
    throw error;
  }
};

export const sendCustomMessage = async (message: string): Promise<void> => {
  await sendSSEMessage({
    event: "custom-message",
    data: { message: message.trim() },
    broadcast: true,
  });
};

export const disconnectAllClients = async (): Promise<void> => {
  try {
    const response = await fetch("/api/sse/disconnect-all", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to disconnect all clients: ${response.statusText}`,
      );
    }

    console.log("Disconnect all request sent successfully");
  } catch (error) {
    console.error("Error disconnecting all clients:", error);
    throw error;
  }
};
