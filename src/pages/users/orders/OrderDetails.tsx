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
    <div className="relative z-10 flex flex-col items-center flex-1">
      <div className="h-10 flex items-center justify-center">
        <div
          className={`flex items-center justify-center transition-all duration-300 ${
            isCurrent
              ? "w-10 h-10 rounded-full bg-[#3B82F6] text-white text-xl"
              : isCompleted
                ? "text-[#3B82F6] text-xl bg-white"
                : "text-black text-xl bg-white"
          }`}
        >
          {icon}
        </div>
      </div>

      <span className="mt-3 text-sm md:text-base text-black text-center whitespace-nowrap">
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
}: {
  image: string;
  name: string;
  quantity: number;
  price: number;
}) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
      <div className="flex items-center gap-4">
        <img
          src={image}
          alt={name}
          className="w-14 h-14 bg-gray-100 rounded-md object-cover"
        />
        <div>
          <p className="font-bold text-gray-800 text-sm">{name}</p>
          <p className="text-xs text-gray-500 mt-1">ราคาต่อหน่วย ฿ {price}</p>
          <p className="text-xs text-gray-500 mt-1">จำนวน x {quantity}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-blue-500">฿ {price.toLocaleString()}</p>
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

  const steps = [
    { icon: <FiClock />, label: "รอดำเนินการ", status: "PENDING" },
    { icon: <LuClipboardList />, label: "ที่ต้องจัดส่ง", status: "PROCESSING" },
    { icon: <FiTruck />, label: "ที่ต้องได้รับ", status: "RECEIVE" },
    { icon: <FiCheckCircle />, label: "คำสั่งซื้อสำเร็จ", status: "COMPLETED" },
  ];

  //สถานะปัจจุบันอยู่ขั้นตอนที่เท่าไหร่
  const currentStepIndex = steps.findIndex((s) => s.status === order.status);

  const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    DESTINATION: "เก็บเงินปลายทาง (COD)",
    PROMPTPAY: "พร้อมเพย์ (PromptPay)",
    CARD: "บัตรเครดิต / เดบิต",
  };

  // ดึงค่าสีจาก statusConfig
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
            <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
              รายละเอียดคำสั่งซื้อ
            </h1>

            <div className="text-sm md:ml-auto break-words flex flex-wrap items-center gap-1">
              <span className="text-gray-500">
                เลขที่คำสั่งซื้อ: {order.orderNo} |
              </span>
              {/* นำ statusColor มาแสดงผลสีข้อความให้ตรงกับ order */}
              <span className={`font-semibold ${statusColor}`}>
                {getOrderLabel(order.status, order.checkoutType)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 w-full text-gray-700 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6 ">
            {order.status === "CANCELLED" || order.status === "REFUNDED" ? (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
    {order.status === "CANCELLED" && (
      <>
        <h2 className="text-red-500 font-bold text-lg mb-2">
          คำขอยกเลิกได้รับการยอมรับแล้ว
        </h2>
        <p className="text-sm text-gray-500">
          คืนคำสั่งซื้อเมื่อ : {orderDate}
        </p>
      </>
    )}

    {order.status === "REFUNDED" && (
      <>
        <h2 className="text-[#EF4444] font-bold text-lg mb-2">
          การคืนเงินสำเร็จ
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          เราได้ทำการคืนเงินจำนวน ฿ {order.total.toLocaleString()}{" "}
          ให้คุณแล้ว โอนเงินคืนภายใน 7-14 วันทำการ
          ในกรณีที่ชำระผ่านบัตรเครดิต/เดบิต อาจใช้เวลา 15-45
          วันทำการ หากคุณยังไม่ได้รับเงินคืนภายในระยะเวลาดังกล่าว
          กรุณาติดต่อธนาคารเจ้าของบัตร
        </p>
      </>
    )}
  </div>
) : (
  <div className="bg-white px-4 md:px-8 py-8 rounded-xl border border-gray-200 shadow-sm">
    <div className="relative">
      {/* เส้นสีเทาทั้งเส้น */}
      <div
        className="absolute h-[2px] bg-gray-300 z-0"
        style={{
          top: "20px",
          left: "12.5%",
          right: "12.5%",
        }}
      />

      {/* เส้นสีน้ำเงินตามสถานะ */}
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
            

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4">
                <div className="text-lg" /> รายการสินค้า (
                {order.orderItems.length})
              </h3>

              {order.orderItems.map((item) => (
                <OrderItemRow
                  key={item.id}
                  image={item.imageUrl}
                  name={item.productName}
                  quantity={item.quantity}
                  price={item.price}
                />
              ))}

              <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                {order.status === "CANCELLED" || order.status === "REFUNDED" ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[16px] font-medium text-gray-600">
                        จำนวนเงินคืน
                      </span>
                      <div className="text-right">
                        <p className="text-xl text-blue-500 font-bold">
                          ฿ {order.total.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                      <span className="text-[16px] font-medium text-gray-600">
                        คืนเงินไปยัง
                      </span>
                      <div className="text-right">
                        <p className="text-[16px] font-medium text-gray-900">
                          {PAYMENT_METHOD_LABELS[order.checkoutType] ||
                            order.checkoutType}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[16px] font-medium text-gray-600">
                        ยอดรวมสุทธิ
                      </span>
                      <div className="text-right">
                        <p className="text-xl text-blue-500 font-bold">
                          ฿ {order.total.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                      <span className="text-[16px] font-medium text-gray-600">
                        ช่องทางชำระเงิน
                      </span>
                      <div className="text-right">
                        <p className="text-[16px] font-medium text-gray-900">
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
                      {/* อัปเดตสีตรงส่วนนี้ให้เป็นสีเดียวกับด้านบน */}
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
                <div className="bg-[#3B82F6] text-white px-5 py-3 flex items-center gap-2">
                  <Users className="text-lg" />
                  <h3 className="font-bold text-sm">ข้อมูลผู้รับ</h3>
                </div>

                <div className="p-5 flex flex-col gap-5 ">
                  <div>
                    <p className="text-xs text-gray-500 font-normal mb-2 block ">
                      ชื่อผู้สั่งซื้อ
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black">
                        <FiUser />
                      </div>
                      <p className="font-bold text-sm text-gray-900">
                        {recipient?.recipientName}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-normal mb-2 block">
                      เบอร์โทรศัพท์
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black">
                        <FiPhone />
                      </div>
                      <p className="font-bold text-sm text-gray-900">
                        {recipient?.phone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-normal mb-2 block justify-between">
                      ที่อยู่สำหรับการจัดส่ง
                    </p>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black shrink-0">
                        <FiMapPin />
                      </div>
                      <div className="font-sans text-sm text-black leading-relaxed">
                        {recipient?.streetAddress}
                        {recipient?.subdistrict && (
                          <>
                            <br />
                            {recipient.subdistrict}
                            {recipient.district}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
