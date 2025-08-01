export interface WebhookBroadcastPayload {
  type: "broadcast";
  message: string;
}

export interface WebhookNotificationPayload {
  type: "user-notification";
  userId: string;
  message: string;
}

export type WebhookPayload =
  | WebhookBroadcastPayload
  | WebhookNotificationPayload;

// Send a broadcast message with webhook
export const sendWebhookBroadcast = async (message: string): Promise<void> => {
  try {
    const response = await fetch("/api/webhooks/sse-example", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "broadcast",
        message,
      } as WebhookBroadcastPayload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send webhook broadcast: ${response.statusText}`,
      );
    }

    console.log("Webhook broadcast sent successfully");
  } catch (error) {
    console.error("Error sending webhook broadcast:", error);
    throw error;
  }
};

// Send notification with webhook
export const sendWebhookNotification = async (
  userId: string,
  message: string,
): Promise<void> => {
  try {
    const response = await fetch("/api/webhooks/sse-example", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "user-notification",
        userId,
        message,
      } as WebhookNotificationPayload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send webhook notification: ${response.statusText}`,
      );
    }

    console.log("Webhook notification sent successfully");
  } catch (error) {
    console.error("Error sending webhook notification:", error);
    throw error;
  }
};
