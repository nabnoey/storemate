import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  changeStatus,
  getOrderByOrderNo,
} from "../../redux/moderator/ModeratorReducer";
import {
  FiClock,
  FiClipboard,
  FiTruck,
  FiCheckCircle,
  FiUser,
  FiPhone,
  FiMapPin,
  FiArrowLeft,
} from "react-icons/fi";
import { FaHistory } from "react-icons/fa";
import { Users } from "lucide-react";
import type { RootState, AppDispatch } from "../../redux/store";
import {
  STATUS_LABELS,
  STATUS_ORDER,
  type OrderItem,
} from "../../types/moderator/ordersMod";
import { toast } from "react-hot-toast";
import type { PaymentMethod } from "../../types/payment";

function StatusStep({
  icon: Icon,
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
    <div className="flex flex-col items-center gap-2 relative z-10 w-full">
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-xl transition-all duration-300 ${
          isCurrent
            ? "bg-[#3B82F6] text-white shadow-md shadow-blue-200"
            : isCompleted
              ? "bg-white border-2 border-[#3B82F6] text-[#3B82F6]"
              : "bg-white border-2 border-gray-300 text-gray-400"
        }`}
      >
        {Icon}
      </div>
      <span
        className={`text-[10px] sm:text-xs text-center px-1 ${
          isCurrent || isCompleted
            ? "font-medium text-gray-800"
            : "text-gray-400"
        }`}
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
}: {
  image: string;
  name: string;
  quantity: number;
  price: number;
}) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        <img
          src={image || "https://via.placeholder.com/150"}
          alt={name}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-md object-cover flex-shrink-0"
        />
        <div>
          <p className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-2">
            {name}
          </p>
          <p className="text-xs text-gray-500 mt-1">จำนวน: {quantity}</p>
        </div>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <p className="font-bold text-gray-800 text-sm sm:text-base">
          ฿ {price}
        </p>
      </div>
    </div>
  );
}

function OrderDetail() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { orderDetail } = useSelector((state: RootState) => state.moderator);
  const order = orderDetail && orderDetail.length > 0 ? orderDetail[0] : null;
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (orderNo && orderNo) {
      dispatch(getOrderByOrderNo(orderNo));
    }
  }, [orderNo, dispatch]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ไม่พบข้อมูลคำสั่งซื้อ</p>
          <button
            onClick={() => navigate("/orders-management")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            กลับไปที่จัดการคำสั่งซื้อ
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateStatus = async () => {
    if (!order) return;

    // ดึงค่าที่เลือกมาใช้ ถ้ายังไม่เลือกอะไรให้ใช้สถานะเดิมจาก backend
    const currentSelected = selectedStatus || order.status;

    if (currentSelected === order.status) {
      toast.error("กรุณาเลือกสถานะใหม่ที่ต่างจากสถานะปัจจุบัน");
      return;
    }

    try {
      await dispatch(
        changeStatus({ orderNo: order.orderNo, status: currentSelected }),
      ).unwrap();

      toast.success("อัปเดตสถานะคำสั่งซื้อสำเร็จ");

      setTimeout(() => {
        navigate("/orders-management");
      }, 1500);
    } catch {
      toast.error("ไม่สามารถเปลี่ยนสถานะคำสั่งซื้อได้");
    }
  };

  const currentIndex = STATUS_ORDER.indexOf(order.status);
  const recipient = order.orderRecipient || {};

  const steps = [
    { icon: <FiClock />, label: "รอดำเนินการ", status: "PENDING" },
    { icon: <FiClipboard />, label: "กำลังเตรียมสินค้า", status: "PROCESSING" },
    { icon: <FiTruck />, label: "จัดส่งแล้ว", status: "RECEIVED" },
    { icon: <FiCheckCircle />, label: "สำเร็จแล้ว", status: "COMPLETED" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.status === order.status);

  const items = order.orderItems || [
    {
      id: 1,
      imageUrl: "https://via.placeholder.com/150",
      productName: "น้ำมะม่วงหาวมะนาวโห่ สกัดเข้มข้น ไม่มีน้ำตาล",
      quantity: 1,
      price: order.total || 35,
    },
  ];

  const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    DESTINATION: "เก็บเงินปลายทาง (COD)",
    PROMPTPAY: "พร้อมเพย์ (PromptPay)",
    CARD: "บัตรเครดิต / เดบิต",
  };

  const progressWidth =
    currentStepIndex > 0
      ? `${(currentStepIndex / (steps.length - 1)) * 100}%`
      : "0%";

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-start text-left w-full mt-0 lg:mt-10">
      <div className="bg-white border-b border-gray-200 w-full p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/orders-management")}
            className="hover:opacity-70 transition-opacity text-gray-700"
            type="button"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div className="flex w-full items-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              รายละเอียดคำสั่งซื้อ
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 w-full text-gray-700 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Timeline & Status */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm relative">
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-6 sm:mb-8 text-center sm:text-left">
                {order.orderNo}
              </p>

              <div className="relative mb-6 sm:mb-10 mt-2">
                {/* เส้นเทาพื้นหลัง (เว้นขอบซ้ายขวา 12.5% เพื่อให้อยู่กึ่งกลางไอคอนพอดี) */}
                <div className="absolute top-4 sm:top-5 left-[12.5%] right-[12.5%] h-[2px] bg-gray-200 z-0">
                  {/* เส้นสีฟ้าวิ่งตามความคืบหน้า */}
                  <div
                    className="absolute top-0 left-0 h-full bg-[#3B82F6] transition-all duration-500"
                    style={{ width: progressWidth }}
                  ></div>
                </div>

                {/* ตัวไอคอน Step */}
                <div className="flex justify-between items-start relative z-10 w-full">
                  {steps.map((step, index) => (
                    <div
                      key={step.status}
                      className="w-1/4 flex justify-center"
                    >
                      <StatusStep
                        icon={step.icon}
                        label={step.label}
                        isCompleted={index < currentStepIndex}
                        isCurrent={index === currentStepIndex}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {order.status !== "COMPLETED" && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-sm sm:text-base">
                    เปลี่ยนสถานะคำสั่งซื้อ
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4">
                    <div className="flex flex-col w-full sm:w-auto">
                      <label className="text-xs text-gray-500 mb-2">
                        เลือกสถานะ:
                      </label>
                      <div className="relative w-full sm:w-56">
                        <select
                          value={selectedStatus || order.status}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8"
                        >
                          {Object.entries(STATUS_LABELS)
                            .filter(
                              ([key]) =>
                                STATUS_ORDER.indexOf(key) >= currentIndex,
                            )
                            .map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button
                        onClick={handleUpdateStatus}
                        className="flex-1 sm:flex-none bg-[#10B981] hover:bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={() => setSelectedStatus("")}
                        className="flex-1 sm:flex-none bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4">
                รายการสินค้า ({items.length})
              </h3>

              <div className="flex flex-col">
                {items.map((item: OrderItem) => (
                  <OrderItemRow
                    key={item.id}
                    image={item.imageUrl || "https://via.placeholder.com/150"}
                    name={item.productName || "ไม่ระบุชื่อสินค้า"}
                    quantity={item.quantity}
                    price={item.price}
                   
                  />
                ))}
              </div>

              <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-[16px] font-medium text-gray-600">
                    ราคารวม
                  </span>
                  <div className="text-right">
                    <p className="text-lg sm:text-xl text-blue-500 font-bold">
                      ฿ {order.total.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold">THB</p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                  <span className="text-sm sm:text-[16px] font-medium text-gray-600">
                    ช่องทางชำระเงิน
                  </span>
                  <div className="text-right">
                    <p className="text-sm sm:text-[16px] font-medium text-gray-900">
                      {PAYMENT_METHOD_LABELS[
                        order.checkoutType as PaymentMethod
                      ] ||
                        order.checkoutType ||
                        "ไม่ระบุช่องทางชำระเงิน"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-6">
                <FaHistory className="text-lg" /> ประวัติการเปลี่ยนแปลง
              </h3>

              <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                {order.orderStatusHistory?.length ? (
                  order.orderStatusHistory.map((history, index) => (
                    <div key={index} className="relative pl-6">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-green-500 rounded-full ring-4 ring-green-100" />

                      <p className="font-bold text-sm text-gray-800">
                        {STATUS_LABELS[history.status] || history.status}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(history.updatedAt).toLocaleString("th-TH", {
                          dateStyle: "short",

                          timeStyle: "short",
                        })}{" "}
                        โดย {history.updatedBy}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">
                    ไม่มีประวัติการเปลี่ยนแปลง
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / ข้อมูลผู้รับ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:sticky lg:top-6">
              <div className="bg-[#3B82F6] text-white px-5 py-3 flex items-center gap-2">
                <Users className="text-lg" />
                <h3 className="font-bold text-sm">ข้อมูลผู้รับ</h3>
              </div>

              <div className="p-5 flex flex-col gap-5">
                <div>
                  <p className="text-xs text-gray-500 font-normal mb-2 block">
                    ชื่อผู้สั่งซื้อ
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                      <FiUser />
                    </div>
                    <p className="font-bold text-sm text-gray-900 break-words">
                      {recipient.recipientName}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-normal mb-2 block">
                    เบอร์โทรศัพท์
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                      <FiPhone />
                    </div>
                    <p className="font-bold text-sm text-gray-900 break-words">
                      {recipient.phone}
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
                    <div className="font-sans text-sm text-black leading-relaxed break-words">
                      {recipient.streetAddress}
                      {recipient.subdistrict && (
                        <>
                          <br />
                          {recipient.subdistrict} {recipient.district}
                        </>
                      )}
                      {recipient.province && (
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
      </div>
    </div>
  );
}

export default OrderDetail;
