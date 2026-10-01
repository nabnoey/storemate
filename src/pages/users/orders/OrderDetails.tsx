import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetails } from "../../../redux/orders/orderReducer";
import {
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiUser,
  FiPhone,
  FiMapPin,
  FiArrowLeft,
} from "react-icons/fi";
import { LuClipboardList } from "react-icons/lu";
import { FaHistory } from "react-icons/fa";

import { Users } from "lucide-react";
import type { RootState, AppDispatch } from "../../../redux/store";
import { statusConfig, getOrderLabel } from "../../../utils/order";
import type { PaymentMethod } from "../../../types/payment";

const formatOrderNo = (orderNo: string) => {
  const match = orderNo.match(/^ORD-(\d{4})(\d{2})(\d{2})/);

  if (!match) return orderNo;

  const [, year, month, day] = match;

  return `ORD-${year}-${month}-${day}`;
};

function StatusStep({
  icon,
  label,
  isCompleted,
  isCurrent,
}: {
  icon: React.ReactNode;
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
}) {
  return (
    <div className="relative z-10 flex flex-col items-center flex-1 min-w-0">
      <div className="h-8 min-[401px]:h-10 flex items-center justify-center">
        <div
          className={`flex items-center justify-center transition-all duration-300 ${
            isCurrent
              ? `
                w-8 h-8 text-base
                min-[401px]:w-10 min-[401px]:h-10 min-[401px]:text-xl
                rounded-full bg-[#3B82F6] text-white
              `
              : isCompleted
                ? `
                  text-[#3B82F6] text-base
                  min-[401px]:text-xl
                  bg-white
                `
                : `
                  text-black text-base
                  min-[401px]:text-xl
                  bg-white
                `
          }`}
        >
          {icon}
        </div>
      </div>

      <span
        className="
          mt-2
          text-[10px]
          leading-tight
          text-black
          text-center
          whitespace-normal
          break-words
          px-1
          min-[401px]:mt-3
          min-[401px]:text-sm
          md:text-base
          min-[401px]:whitespace-nowrap
        "
      >
        {label}
      </span>
    </div>
  );
}

function OrderItemRow({
  image,
  name,
  quantity,
  price,
  isCancelledOrRefunded,
}: {
  image: string;
  name: string;
  quantity: number;
  price: number;
  isCancelledOrRefunded?: boolean;
}) {
  return (
    <div className="flex justify-between items-start pb-4">
      <div className="flex items-start gap-4">
        <img
          src={image}
          alt={name}
          className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-md object-cover shrink-0"
        />
        <div>
          <p className="font-bold text-gray-900 text-sm md:text-base leading-snug">
            {name}
          </p>
          {!isCancelledOrRefunded && (
            <>
              <p className="text-xs text-gray-500 mt-1 md:text-sm">
                ราคาต่อหน่วย ฿ {price}
              </p>
              <p className="text-xs text-gray-500 mt-1 md:text-sm">
                จำนวน x {quantity}
              </p>
            </>
          )}
        </div>
      </div>
      <div className="text-right flex items-center gap-6 shrink-0">
        {isCancelledOrRefunded && (
          <span className="text-xs md:text-sm text-gray-500">x{quantity}</span>
        )}
        <p className="font-bold text-blue-500 text-sm md:text-base">
          ฿ {price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function OrderDetails() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector((state: RootState) => state.auth.user);
  const { orderDetail } = useSelector((state: RootState) => state.orders);

  const order = orderDetail;

  useEffect(() => {
    if (orderNo) {
      dispatch(fetchOrderDetails(orderNo));
    }
  }, [orderNo, dispatch]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ไม่พบข้อมูลคำสั่งซื้อ</p>
          <button
            onClick={() => navigate("/orders")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            กลับไปที่คำสั่งซื้อ
          </button>
        </div>
      </div>
    );
  }

  const recipient = order.orderRecipient;

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("th-TH")
    : new Date().toLocaleDateString("th-TH");

  const formattedDateTime = order.createdAt
    ? `${new Date(order.createdAt).toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })} ${new Date(order.createdAt).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`
    : orderDate;

  const steps = [
    { icon: <FiClock />, label: "รอดำเนินการ", status: "PENDING" },
    { icon: <LuClipboardList />, label: "ที่ต้องจัดส่ง", status: "PROCESSING" },
    { icon: <FiTruck />, label: "ที่ต้องได้รับ", status: "RECEIVE" },
    { icon: <FiCheckCircle />, label: "คำสั่งซื้อสำเร็จ", status: "COMPLETED" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.status === order.status);

  const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    DESTINATION: "เก็บเงินปลายทาง (cash on delivery)",
    PROMPTPAY: "พร้อมเพย์ (PromptPay)",
    CARD: "บัตรเครดิต / เดบิต",
  };

  const statusColor = statusConfig[order?.status]?.color || "text-black";

  const isCancelledOrRefunded =
    order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <div className="min-h-screen bg-white flex flex-col items-start text-left w-full mt-0 lg:mt-10">
      <div className="bg-white border-b border-gray-200 w-full p-3 md:p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/orders")}
            className="cursor-pointer hover:opacity-70 transition-opacity text-gray-700"
            type="button"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div className="flex flex-col md:flex-row w-full md:items-center items-start gap-1 mt-3 md:mt-0">
            <h1 className="text-xl md:text-[20px] font-bold text-gray-900 whitespace-nowrap">
              รายละเอียดคำสั่งซื้อ
            </h1>

            <div className="text-sm md:ml-auto break-words flex flex-wrap items-center gap-1 text-gray-600">
              {isCancelledOrRefunded ? (
                <span>ยื่นคำขอเมื่อ: {formattedDateTime}</span>
              ) : (
                <>
                  <span className="text-gray-500">
                    เลขที่คำสั่งซื้อ: {formatOrderNo(order.orderNo)} |
                  </span>
                  <span className={`font-semibold ${statusColor}`}>
                    {getOrderLabel(order.status, order.checkoutType)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 w-full text-gray-700 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={`${
              isCancelledOrRefunded ? "lg:col-span-3" : "lg:col-span-2"
            } flex flex-col gap-6`}
          >
            {isCancelledOrRefunded ? (
              <div className="bg-white p-2 md:p-4 rounded-xl">
                {order.status === "CANCELLED" && (
                  <>
                    <h2 className="text-[#EF4444] font-bold text-lg md:text-xl mb-1">
                      คำขอยกเลิกได้รับการยอมรับแล้ว
                    </h2>
                    <p className="text-sm text-gray-500">
                      ยื่นคำขอเมื่อ : {formattedDateTime}
                    </p>
                  </>
                )}

                {order.status === "REFUNDED" && (
                  <>
                    <h2 className="text-[#EF4444] font-bold text-lg md:text-xl mb-3">
                      การคืนเงินสำเร็จ
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-5xl">
                      เราได้ทำการคืนเงินจำนวน ฿ {order.total.toLocaleString()}{" "}
                      แล้ว คุณจะ ได้รับเงินคืนภายใน 7-14 วันทำการ
                      ในกรณีที่ชำระด้วยบัตรเดบิต อาจใช้เวลา 15-45 วันทำการ
                      หากคุณยังไม่ได้รับเงินคืนภายในระยะเวลาดังกล่าว
                      กรุณาติดต่อธนาคารหรือสถาบันการเงินของคุณ.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white px-4 md:px-8 py-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative">
                  <div
                    className="absolute h-[2px] bg-gray-300 z-0"
                    style={{
                      top: "20px",
                      left: "12.5%",
                      right: "12.5%",
                    }}
                  />

                  <div
                    className="absolute h-[2px] bg-[#3B82F6] z-[1] transition-all duration-500"
                    style={{
                      top: "20px",
                      left: "12.5%",
                      width: `${(currentStepIndex / (steps.length - 1)) * 75}%`,
                    }}
                  />

                  <div className="relative z-10 flex items-start">
                    {steps.map((step, index) => (
                      <StatusStep
                        key={step.status}
                        icon={step.icon}
                        label={step.label}
                        isCompleted={index < currentStepIndex}
                        isCurrent={index === currentStepIndex}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* การ์ดรายการสินค้า */}
            <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 text-base md:text-lg">
                รายการสินค้า ( {order.orderItems.length} )
              </h3>

              {order.orderItems.map((item) => (
                <OrderItemRow
                  key={item.id}
                  image={item.imageUrl}
                  name={item.productName}
                  quantity={item.quantity}
                  price={item.price}
                  isCancelledOrRefunded={isCancelledOrRefunded}
                />
              ))}

              <div className="flex flex-col gap-4 mt-2">
                {isCancelledOrRefunded ? (
                  <>
                    <div className="flex justify-between items-center text-sm py-2">
                      <span className="text-gray-600 font-medium">
                        {order.status === "REFUNDED"
                          ? "จำนวนเงินคืน"
                          : "ราคารวม"}
                      </span>
                      <p className="text-blue-500 font-bold text-base">
                        ฿ {order.total.toLocaleString()}
                      </p>
                    </div>

                    {order.status === "CANCELLED" && (
                      <div className="flex justify-between items-center text-sm py-2">
                        <span className="text-gray-600 font-medium">
                          ช่องทางการชำระเงิน
                        </span>
                        <p className="text-gray-600 text-xs md:text-sm">
                          {PAYMENT_METHOD_LABELS[order.checkoutType] ||
                            order.checkoutType}
                        </p>
                      </div>
                    )}

                    {/* กล่องสรุปยอดรวมสุทธิแบบแถบเทาอ่อน */}
                    <div className="bg-gray-50/80 px-6 py-4 rounded-lg my-2 flex justify-between items-center">
                      <span className="font-bold text-base text-gray-900">
                        ยอดรวมสุทธิ
                      </span>
                      <span className="font-bold text-blue-500 text-base md:text-lg">
                        ฿ {order.total.toLocaleString()}
                      </span>
                    </div>

                    {/* เหตุผล */}
                    <div className="text-xs md:text-sm text-gray-600 pt-2">
                      เหตุผล : {order.reason || "ต้องการเปลี่ยนที่อยู่ในจัดส่ง"}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] md:text-[16px] font-medium text-gray-600">
                        ยอดรวมสุทธิ
                      </span>
                      <div className="text-right">
                        <p className="text-[16px] md:text-[20px] text-blue-500 font-bold">
                          ฿ {order.total.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-3 max-[400px]:border-t-0 max-[400px]:pt-0 min-[401px]:border-t min-[401px]:border-gray-50 min-[401px]:pt-4">
                      <span className="text-[14px] md:text-[16px] font-medium text-gray-600 whitespace-nowrap">
                        ช่องทางชำระเงิน
                      </span>
                      <div className="text-right">
                        <p className="text-[14px] md:text-[16px] font-medium text-gray-900 whitespace-nowrap ml-8">
                          {PAYMENT_METHOD_LABELS[order.checkoutType] ||
                            order.checkoutType}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* History */}
            {authUser?.role === "MODERATOR" && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-6">
                  <FaHistory className="text-lg" /> ประวัติการเปลี่ยนแปลง
                </h3>

                <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                  <div className="relative pl-6">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-green-500 rounded-full ring-4 ring-green-100"></div>
                    <p className="font-bold text-sm text-gray-800">
                      สถานะปัจจุบัน:{" "}
                      <span className={`${statusColor}`}>
                        {getOrderLabel(order.status, order.checkoutType)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      วันที่สั่งซื้อ: {orderDate}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isCancelledOrRefunded && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
                {/* Mobile */}
                <div className="min-[401px]:hidden">
                  <div className="bg-[#3B82F6] text-white px-4 py-3 text-center">
                    <h3 className="font-bold text-base">ข้อมูลผู้รับ</h3>
                  </div>
                  <div className="px-4 py-4 text-sm text-gray-700">
                    <div className="flex items-center gap-4 mb-4">
                      <p className="font-bold text-gray-900 whitespace-nowrap">
                        {recipient?.recipientName}
                      </p>
                      <p className="text-gray-700 whitespace-nowrap">
                        {recipient?.phone}
                      </p>
                    </div>
                    <div className="pl-3 leading-relaxed text-gray-700">
                      {recipient?.streetAddress}
                      {recipient?.subdistrict && (
                        <>
                          {" "}
                          {recipient.subdistrict} {recipient.district}
                        </>
                      )}
                      {recipient?.province && (
                        <>
                          {" "}
                          {recipient.province} {recipient.zipcode}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop/Tablet */}
                <div className="hidden min-[401px]:block">
                  <div className="bg-[#3B82F6] text-white px-5 py-3 flex items-center gap-2">
                    <Users className="text-lg" />
                    <h3 className="font-extralight md:text-[20px] text-sm">
                      ข้อมูลผู้รับ
                    </h3>
                  </div>

                  <div className="p-5 flex flex-col gap-5">
                    <div>
                      <p className="text-xs md:text-[16px] text-gray-500 font-normal mb-2">
                        ชื่อผู้สั่งซื้อ
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black">
                          <FiUser />
                        </div>
                        <p className="font-bold md:text-[14px] text-sm text-gray-900">
                          {recipient?.recipientName}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs md:text-[16px] text-gray-500 font-normal mb-2">
                        เบอร์โทรศัพท์
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black">
                          <FiPhone />
                        </div>
                        <p className="font-bold md:text-[14px] text-sm text-gray-900">
                          {recipient?.phone}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs md:text-[17px] text-gray-500 font-normal mb-2">
                        ที่อยู่สำหรับการจัดส่ง
                      </p>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black shrink-0">
                          <FiMapPin />
                        </div>
                        <div className="font-sans md:text-[14px] text-sm text-black leading-relaxed">
                          {recipient?.streetAddress}
                          {recipient?.subdistrict && (
                            <>
                              <br />
                              {recipient.subdistrict} {recipient.district}
                            </>
                          )}
                          {recipient?.province && (
                            <>
                              <br />
                              {recipient.province} {recipient.zipcode}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
