import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
// import { toast } from "react-hot-toast";

import type { RootState, AppDispatch } from "../redux/store";
import {
  addNotificationFromSocket,
  fetchNotificationCounts,
} from "../redux/notification/notificationReducer";

let globalNotifyClient: Client | null = null;
let currentNotifyToken: string | null = null;

const useNotificationSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);

  const userRoles: string[] = useSelector((state: RootState) => {
    const roles = state.auth.user?.roles || state.auth.user?.roleName;
    if (Array.isArray(roles)) return roles;
    return roles ? [roles] : [];
  });

  useEffect(() => {
    if (!token || userRoles.length === 0) {
      if (globalNotifyClient) {
        // console.log("[NOTIFY STOMP] Disconnecting due to logout...");
        globalNotifyClient.deactivate();
        globalNotifyClient = null;
        currentNotifyToken = null;
      }
      return;
    }

    if (globalNotifyClient && currentNotifyToken === token) {
      return;
    }

    if (globalNotifyClient && currentNotifyToken !== token) {
      globalNotifyClient.deactivate();
      globalNotifyClient = null;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_SOCKET_URL, null),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      // debug: (str) => console.log("[NOTIFY STOMP]", str),

      onConnect: () => {
        // console.log("NOTIFY SOCKET CONNECTED");

        const handleIncomingNotification = (message: any) => {
          if (!message.body) return;
          const data = JSON.parse(message.body);

          const formattedData = {
            ...data,
            isRead: data.isRead ?? false,
          };

          dispatch(addNotificationFromSocket(formattedData));
          dispatch(fetchNotificationCounts());
        };

        client.subscribe("/topic/all", handleIncomingNotification);

        client.subscribe("/queue/notify", handleIncomingNotification);

        // เช็กทั้งคำว่า CUSTOMER และ USER เพื่อผิด
        if (userRoles.includes("CUSTOMER") || userRoles.includes("USER")) {
          // console.log("[STOMP] Subscribing to /topic/customer");
          client.subscribe("/topic/customer", handleIncomingNotification);
        } else if (userRoles.includes("MODERATOR")) {
          // console.log("[STOMP] Subscribing to /topic/moderator");
          client.subscribe("/topic/moderator", handleIncomingNotification);
        } else if (userRoles.includes("OWNER") || userRoles.includes("ADMIN")) {
          // console.log("[STOMP] Subscribing to /topic/owner");
          client.subscribe("/topic/owner", handleIncomingNotification);
        }
      },
      onWebSocketClose: () => {
        // console.log("NOTIFY SOCKET CLOSED");
        globalNotifyClient = null;
        currentNotifyToken = null;
      },
      // onStompError: (frame) => {
      //   console.error("NOTIFY STOMP ERROR:", frame.headers["message"]);
      // },
    });

    globalNotifyClient = client;
    currentNotifyToken = token;
    client.activate();

    return () => {};
  }, [token, JSON.stringify(userRoles), dispatch]); // ใช้ JSON.stringify ช่วยป้องกันการ Re-run ลูปของ Array
};

export default useNotificationSocket;
