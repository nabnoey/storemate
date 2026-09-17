import api from "./api";
import type {
  NotificationRequest,
  Notification,
  FetchNotifyParams,
  NotificationType,
  NotificationResponse,
} from "../types/notification";

const getNotifyUser = async (
  type: NotificationType = "ALL",
): Promise<NotificationResponse> => {
  const res = await api.get<NotificationResponse>("/notify", {
    params: { type },
  });

  return res.data;
};
const getNotifyOwner = async (params: FetchNotifyParams) => {
  const res = await api.get(`${import.meta.env.VITE_OWNER_API}/notify`, {
    params,
  });

  return res.data;
};

const createNotifyOwner = async (
  data: NotificationRequest,
): Promise<Notification> => {
  const res = await api.post<Notification>(
    `${import.meta.env.VITE_OWNER_API}/notify/send`,
    data,
  );
  return res.data;
};

const deleteNotify = async (notifyId: number): Promise<number> => {
  await api.delete(`${import.meta.env.VITE_OWNER_API}/notify/${notifyId}`);
  return notifyId; // ส่ง ID กลับไปเพื่อให้ Redux ไปกรองออก
};

const markAsReadNotify = async (notifyId: number): Promise<string> => {
  const res = await api.put<string>("/notify/read", null, {
    params: {
      notifyId,
    },
  });

  return res.data;
};

const markAllAsReadNotify = async (): Promise<string> => {
  const res = await api.put<string>("/notify/read/all");
  return res.data;
};

export const NotificationService = {
  getNotifyUser,
  createNotifyOwner,
  getNotifyOwner,
  deleteNotify,
  markAllAsReadNotify,
  markAsReadNotify,
};
