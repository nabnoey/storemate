export interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  sendTo: "ALL" | "CUSTOMER" | "MODERATOR";
  read: boolean;
}

export interface NotificationRequest {
  title: string;
  message: string;
  sendTo: "MODERATOR" | "CUSTOMER" | "ALL";
}

export interface FetchNotifyParams {
  keyword: string;
  page: number;
  size: number;
}

export interface UnreadByCategory {
  notifyType: NotificationType;
  unread: number;
}

export interface NotificationResponse {
  notifyList: Notification[];
  totalUnread: number;
  unreadByCategory: UnreadByCategory[];
}

export type NotificationType = "ALL" | "STORE" | "ORDERED" | "REFUNDED";

export interface ClientNotification extends Notification {
  type: NotificationType;
}
