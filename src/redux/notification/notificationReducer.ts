import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { NotificationService } from "../../services/notification.service";
import type {
  Notification,
  NotificationRequest,
  FetchNotifyParams,
  NotificationType,
  ClientNotification,
} from "../../types/notification";

export const fetchOwnerNotify = createAsyncThunk(
  "notification/fetchOwner",
  async (params: FetchNotifyParams) => {
    return await NotificationService.getNotifyOwner(params);
  },
);

export const fetchUserNotify = createAsyncThunk(
  "notification/fetchUser",
  async (type: NotificationType = "ALL") => {
    return await NotificationService.getNotifyUser(type);
  },
);

export const createNotify = createAsyncThunk(
  "notification/create",
  async (data: NotificationRequest) => {
    return await NotificationService.createNotifyOwner(data);
  },
);

export const deleteNotify = createAsyncThunk(
  "notification/delete",
  async (id: number) => {
    await NotificationService.deleteNotify(id);
    return id;
  },
);

export const fetchNotificationCounts = createAsyncThunk(
  "notification/counts",
  async () => {
    const data = await NotificationService.getNotifyUser("ALL");

    return data;
  },
);

export const markAsReadNotify = createAsyncThunk(
  "notification/markAsRead",
  async (notifyId: number) => {
    await NotificationService.markAsReadNotify(notifyId);
    return notifyId;
  },
);

export const markAllAsReadNotify = createAsyncThunk(
  "notification/markAllAsRead",
  async () => {
    await NotificationService.markAllAsReadNotify();
    return true;
  },
);

interface NotificationCount {
  ALL: number;
  ORDERED: number;
  REFUNDED: number;
  STORE: number;
}

interface NotificationState {
  items: ClientNotification[];

  counts: NotificationCount;

  isLoading: boolean;
  isSubmitting: boolean;
  totalPages: number;
  currentPage: number;
}

const initialState: NotificationState = {
  items: [],

  counts: {
    ALL: 0,
    ORDERED: 0,
    REFUNDED: 0,
    STORE: 0,
  },

  isLoading: false,
  isSubmitting: false,
  totalPages: 0,
  currentPage: 0,
};

const getNotificationType = (
  title: string,
  message: string,
): NotificationType => {
  const text = `${title} ${message}`;

  if (text.includes("คืนเงิน")) {
    return "REFUNDED";
  }

  if (text.includes("สถานะคำสั่งซื้อ")) {
    return "ORDERED";
  }

  // กรณีไม่รู้จัก ให้ถือเป็น STORE หรือ ORDERED ตามที่ทีมตกลงกัน
  return "STORE";
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    // รับข้อมูลจาก WebSocket
    addNotificationFromSocket: (state, action: PayloadAction<Notification>) => {
      const exists = state.items.some((item) => item.id === action.payload.id);

      if (!exists) {
        const type = getNotificationType(
          action.payload.title,
          action.payload.message,
        );

        state.items.unshift({
          ...action.payload,
          type,
        });

        state.counts.ALL++;

        if (type !== "ALL") {
          state.counts[type]++;
        }
      }
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchNotificationCounts.fulfilled, (state, action) => {
        state.counts.ALL = action.payload.totalUnread;

        state.counts.ORDERED = 0;
        state.counts.REFUNDED = 0;
        state.counts.STORE = 0;

        action.payload.unreadByCategory.forEach((item) => {
          state.counts[item.notifyType] = item.unread;
        });
      })

      // --- Fetch Owner Notify ---
      .addCase(fetchOwnerNotify.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOwnerNotify.fulfilled, (state, action) => {
        state.isLoading = false;

        state.items = (action.payload.content || []).map(
          (item: Notification) => ({
            ...item,
          }),
        );
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.number || 0;
      })
      .addCase(fetchOwnerNotify.rejected, (state) => {
        state.isLoading = false;
      })

      // --- Fetch User Notify ---
      .addCase(fetchUserNotify.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserNotify.fulfilled, (state, action) => {
        state.isLoading = false;

        state.items = action.payload.notifyList.map((item) => ({
          ...item,
          type: getNotificationType(item.title, item.message),
        }));
      })

      .addCase(fetchUserNotify.rejected, (state) => {
        state.isLoading = false;
      })

      // --- Create Notify ---
      .addCase(createNotify.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(createNotify.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(createNotify.rejected, (state) => {
        state.isSubmitting = false;
      })

      // --- Delete Notify ---
      .addCase(deleteNotify.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(deleteNotify.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteNotify.rejected, (state) => {
        state.isSubmitting = false;
      })

      // ---markAsReadNotify---
      .addCase(markAsReadNotify.fulfilled, (state, action) => {
        const notify = state.items.find((item) => item.id === action.payload);

        if (notify) {
          notify.read = true;
        }
      })

      // ---markAllAsReadNotify---
      .addCase(markAllAsReadNotify.pending, () => {
        // state.isLoading = true;
      })
      .addCase(markAllAsReadNotify.fulfilled, (state) => {
        state.items.forEach((item) => {
          item.read = true;
        });
      })
      .addCase(markAllAsReadNotify.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(markAsReadNotify.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { addNotificationFromSocket } = notificationSlice.actions;
export default notificationSlice.reducer;
