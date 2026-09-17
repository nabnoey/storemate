import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "react-hot-toast";
import { setPaymentStatus } from "../redux/payment/paymentReducer";
import type { RootState } from "../redux/store";

let globalClient: Client | null = null;
// ไว้เช็คว่าเป็น token ใคร แล้ว token ที่ได้มามีการเปลี่ยน token ไหม
let currentToken: string | null = null;

// เรียกว่าคือการสร้าง hooks
const usePaymentSocket = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    // console.log("SOCKET EFFECT RUN");

    if (!token) {
      // console.log("WAITING TOKEN...");
      return;
    }

    // reuse connection
    if (globalClient && currentToken === token) {
      // console.log("REUSE SOCKET");
      return;
    }

    if (globalClient && currentToken !== token) {
      // console.log("TOKEN CHANGED, RECONNECTING...");
      globalClient.deactivate();
      globalClient = null;
    }

    // console.log("CONNECT SOCKET WITH TOKEN");

    // สร้างตัวเชื่อมต่อ
    const client = new Client({
      //https://api.store-mate-api.me/ws
      webSocketFactory: () => new SockJS(import.meta.env.VITE_SOCKET_URL, null),

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // debug: (str) => console.log("[STOMP]", str),
      // onWebSocketError: (event) => {
      //   console.error("WS ERROR:", event);
      // },

      // onDisconnect: () => {
      //   console.log("STOMP DISCONNECTED");
      // },

      onConnect: () => {
        currentToken = token;
        // console.log("SOCKET CONNECTED");

        client.subscribe("/user/queue/notifications", (message) => {
          if (!message.body) return;

          // console.log("========== SOCKET MESSAGE ==========");
          // console.log("RAW:", message.body);

          const data = JSON.parse(message.body);

          // console.log("PARSED:", data);
          // console.log("CURRENT ORDER:", localStorage.getItem("orderNo"));
          // console.log("===================================");

          const currentOrder = localStorage.getItem("orderNo");

          if (data.orderNo && data.orderNo !== currentOrder) return;

          if (
            data.paymentStatus === "PAYMENT_SUCCESS" ||
            data.status === "COMPLETED"
          ) {
            toast.dismiss();
            toast.success("คำสั่งซื้อสำเร็จ");

            localStorage.removeItem("orderNo");

            dispatch(
              setPaymentStatus({
                status: "PAYMENT_SUCCESS",
                orderId: data.orderNo || data.orderId,
              }),
            );
          }
          // console.log("WS DATA:", data);

          if (
            data.paymentStatus === "PAYMENT_FAILS" ||
            data.status === "CANCELLED"
          ) {
            toast.error("QR Code หมดอายุการใช้งาน");

            dispatch(
              setPaymentStatus({
                status: "PAYMENT_FAILS",
                orderId: data.orderNo || data.orderId,
              }),
            );
          }
        });
      },

      // onStompError: (frame) => {
      //   console.error("STOMP ERROR:", frame);
      //   console.error("MESSAGE:", frame.headers["message"]);
      //   console.error("BODY:", frame.body);
      // },

      onWebSocketClose: () => {
        // console.log("SOCKET CLOSED");
        globalClient = null;
        currentToken = null;
      },
    });

    globalClient = client;
    client.activate();

    // ❌ ไม่ต้อง deactivate ทุกครั้ง
    return () => {
      // console.log("EFFECT CLEANUP (NO DISCONNECT)");
    };
  }, [token, dispatch]);
};

export default usePaymentSocket;
