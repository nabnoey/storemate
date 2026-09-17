import { useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import type { OrderStatus, RefundRequest } from "../../../types/orders";
import type { PaymentMethod } from "../../../types/payment";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../redux/store";

import { sendRefundThunk } from "../../../redux/payment/paymentReducer";

const reasonOptions = [
  { value: "change_payment_method", label: "เปลี่ยนวิธีการชำระเงิน" },
  { value: "no_longer_want", label: "ไม่ต้องการสินค้านี้แล้ว" },
  {
    value: "change_shipping_address",
    label: "ต้องการเปลี่ยนที่อยู่ในการจัดส่ง",
  },
  { value: "edit_order_details", label: "สั่งซื้อสินค้าผิด" },
  { value: "no_longer_want", label: "ไม่ต้องการสินค้านี้แล้ว" },
];

const CancelOrderPage = () => {
  const { orderNo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const orderStatus = (location.state?.status as OrderStatus) || "PENDING";
  const checkoutType =
    location.state?.checkoutType ||
    (location.state?.paymentMethod as PaymentMethod) ||
    "PROMPTPAY";

  const isCancelAction =
    (orderStatus === "PENDING" && checkoutType === "PROMPTPAY") ||
    (orderStatus === "PROCESSING" && checkoutType === "DESTINATION");

  const isRefundAction =
    orderStatus === "PROCESSING" &&
    (checkoutType === "PROMPTPAY" || checkoutType === "CARD");

  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("กรุณาเลือกเหตุผลในการยกเลิกคำสั่งซื้อ");
      return;
    }

    if (!orderNo) {
      toast.error("ไม่พบข้อมูลคำสั่งซื้อ");

      return;
    }

    const payload: RefundRequest = {
      orderNo: orderNo,
      reason: selectedReason,
      description: description,
    };

    setIsSubmitting(true);
    try {
      await dispatch(sendRefundThunk(payload)).unwrap();

      if (isCancelAction) {
        toast.success("ส่งคำขอยกเลิกสำเร็จ");

        setTimeout(() => {
          navigate("/orders?status=CANCELLED");
        });
      } else if (isRefundAction) {
        toast.success("ส่งคำขอคืนเงินสำเร็จ อยู่ระหว่างการตรวจสอบ");
        setTimeout(() => {
          navigate("/orders?status=PROCESSING");
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message;
      const statusCode = error?.response?.status;

      if (
        statusCode === 404 ||
        errorMessage?.toLowerCase().includes("not found")
      ) {
        toast.error("ไม่พบข้อมูลคำสั่งซื้อ");
      } else if (errorMessage === "Refund exist") {
        toast.error("คุณได้ส่งคำขอยกเลิก/คืนเงิน สำหรับออเดอร์นี้ไปแล้ว");
      } else if (errorMessage === "Can't refund this order") {
        toast.error(
          "หลังบ้านยังไม่ได้ปรับสิทธิ์: ออเดอร์ PENDING ไม่ต้องวิ่งเข้าฟังก์ชัน Refund",
        );
      } else {
        toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-white font-anuphan text-gray-950 pt-4 md:pt-5 pb-4 md:pb-20">
      {/* --- DESKTOP & TABLET BREADCRUMB --- */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-5 pt-5 md:pt-6">
        <nav className="hidden md:hidden lg:flex flex-wrap items-center text-md text-black mb-4 md:mb-8 font-medium">
          <Link
            data-test="click-home"
            to="/"
            className="transition-colors cursor-pointer"
          >
            หน้าหลัก
          </Link>
          <Icon
            icon="material-symbols:chevron-right-rounded"
            className="w-5 h-5 mx-1 text-black"
          />
          <Link to="/orders" className="transition-colors cursor-pointer">
            การซื้อของฉัน
          </Link>
          <Icon
            icon="material-symbols:chevron-right-rounded"
            className="w-5 h-5 mx-1 text-black"
          />
          <span className="text-black">ขอคืนเงิน/ยกเลิกสินค้า</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto w-full flex flex-col flex-1">
        <div className="flex flex-col flex-1 md:bg-white md:rounded-xl md:shadow-md md:border border-gray-100 md:p-8 lg:p-12">
          {/* --- HEADER --- */}
          <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-8 px-4 md:px-0 md:border-b border-[#D1D5DB] pb-4 pt-2 md:pt-0">
            <button
              data-test="btn-back"
              type="button"
              onClick={() => navigate(-1)}
            >
              <Icon
                icon="lucide:arrow-left"
                className="w-6 h-6 mt-1 cursor-pointer text-black transition-colors"
              />
            </button>
            <div>
              <h1 className="text-[18px] md:text-[20px] font-bold text-[#0F172A]">
                ยกเลิกคำสั่งซื้อ / ขอคืนเงิน
              </h1>
              <p className="text-[13px] md:text-sm text-[#64748B]">
                ระบุรายละเอียดเพื่อแจ้งความประสงค์
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg md:rounded-none shadow-sm md:shadow-none border border-gray-200 md:border-none p-4 md:p-0 mx-4 md:mx-0 flex flex-col gap-5 md:gap-6">
            <div className="rounded-lg p-4 flex items-start gap-3 bg-[#FFEB55]">
              <Icon
                icon="lucide:info"
                className="w-5 h-5 mt-0.5 flex-shrink-0 text-black"
              />
              <div>
                <h3 className="text-[14px] md:text-[15px] font-semibold mb-1text-yellow-900">
                  เงื่อนไขการทำรายการ
                </h3>
                <p className="text-[13px] md:text-[14px] leading-relaxed text-[#B45309]">
                  การยกเลิกคำสั่งซื้อและการขอคืนเงินสามารถดำเนินการได้เฉพาะคำสั่งซื้อที่มีสถานะ
                  “ที่ต้องชำระ” และ “ที่ต้องจัดส่ง” เท่านั้น{" "}
                  <br className="hidden sm:block" />
                  เมื่อคำสั่งซื้อเปลี่ยนเป็นสถานะอื่น
                  จะไม่สามารถยกเลิกหรือขอคืนเงินผ่านระบบได้
                </p>
              </div>
            </div>

            {/* Reason Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1 text-[14px] md:text-[16px] text-[#94A3B8] font-medium md:pt-4">
                <span>เหตุผลในการขอทำรายการ</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative w-full md:w-1/2">
                <div
                  data-test="dropdown-reason"
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full flex justify-between items-center bg-[#F3F4F6] hover:bg-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 transition-colors cursor-pointer"
                >
                  <span
                    className={
                      selectedReason ? "text-gray-900" : "text-gray-700"
                    }
                  >
                    {selectedReason
                      ? reasonOptions.find(
                          (opt) => opt.label === selectedReason,
                        )?.label
                      : "ระบุเหตุผล"}
                  </span>
                  <Icon
                    icon="lucide:chevron-down"
                    className={`w-5 h-5 text-black transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {isOpen && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-1">
                    {reasonOptions.map((option) => (
                      <li
                        // test flow เลือกเหตุผลแต่ละ option
                        data-test={`reason-option-${option.value}`}
                        key={option.label}
                        onClick={() => {
                          setSelectedReason(option.label);
                          setIsOpen(false);
                        }}
                        className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                          selectedReason === option.label
                            ? "bg-gray-50 text-blue-600 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Details Textarea */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] md:text-[16px] text-[#94A3B8] font-medium md:pt-4">
                รายละเอียดเพิ่มเติม
              </label>
              <textarea
                data-test="input-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="รายละเอียดเพิ่มเติม"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-black outline-none focus:border-[#4285F4] transition-colors resize-y"
              ></textarea>
            </div>
          </div>

          {/* --- SUBMIT BUTTON --- */}
          <div className="mt-auto md:mt-8 pt-6 md:pt-0 px-4 md:px-0 flex justify-center pb-2 md:pb-0">
            <button
              data-test="btn-submit-cancel"
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`cursor-pointer w-full md:w-auto min-w-[200px] text-white font-semibold rounded-lg px-8 py-3.5 md:py-3 text-[15px] md:text-sm transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-2
                ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-[#4285F4] hover:bg-blue-600"}`}
            >
              {isSubmitting ? (
                <>
                  <Icon
                    icon="lucide:loader-2"
                    className="w-5 h-5 animate-spin"
                  />
                  กำลังดำเนินการ...
                </>
              ) : (
                "ยืนยันการส่งคำขอ"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderPage;
