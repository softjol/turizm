import { api } from "./client";

export interface NotificationResponse {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

/** GET /api/v1/notifications — current user's notifications. */
export async function getNotifications(): Promise<NotificationResponse[]> {
  const { data } = await api.get<NotificationResponse[]>("/notifications");
  return data;
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch("/notifications/read-all");
}
