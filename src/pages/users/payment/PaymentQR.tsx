import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useStripe, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector, useDispatch } from "react-redux";

import { UserService } from "../../../services/users.service";
import { OrdersService } from "../../../services/orders.service";

import {
  setPaymentStatus,
  resetPaymentStatus,
} from "../../../redux/payment/paymentReducer";
import type { RootState } from "../../../redux/store";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
import usePaymentSocket from "../../../hooks/usePaymentSocket";

const PaymentQRInner = () => {
  const stripe = useStripe();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // ลบข้อมูลออกจาก local
  const clearPaymentSession = () => {
    localStorage.removeItem("orderNo");
    localStorage.removeItem("payment_expiry_timestamp");
    localStorage.removeItem("payment_qr_image");
    localStorage.removeItem("payment_ref_id");
    localStorage.removeItem("payment_total_price");
    localStorage.removeItem("payment_client_secret");
  };
  const getRemainingSeconds = () =>
    Math.max(Math.floor((getExpiryTimestamp() - Date.now()) / 1000), 0);

  const getExpiryTimestamp = () => {
    const stateExpiry = location.state?.paymentExpired;

    if (stateExpiry) {
      return new Date(stateExpiry).getTime();
    }

    const savedExpiry = localStorage.getItem("payment_expiry_timestamp");

    return savedExpiry ? new Date(savedExpiry).getTime() : 0;
  };

  // const isPaymentSessionValid = () => {
  //   return getExpiryTimestamp() > Date.now();
  // };

  const [clientSecret] = useState(() => {
    const stateSecret = location.state?.clientSecret;

    if (stateSecret) {
      localStorage.setItem("payment_client_secret", stateSecret);
      return stateSecret;
    }

    return localStorage.getItem("payment_client_secret") || "";
  });

  const [totalPrice] = useState<number>(() => {
    const statePrice = location.state?.totalPrice;

    if (statePrice !== undefined) {
      localStorage.setItem("payment_total_price", String(statePrice));

      return Number(statePrice);
    }

    return Number(localStorage.getItem("payment_total_price")) || 0;
  });

  // ถ้ารีหน้า เวลาต้องนับต่อห้ามนับใหม่
  const [timeLeft, setTimeLeft] = useState(() => {
    const expiryTimestampMs = getExpiryTimestamp();

    if (!expiryTimestampMs) {
      return 0;
    }

    return Math.max(Math.floor((expiryTimestampMs - Date.now()) / 1000), 0);
  });

  const [qrImage, setQrImage] = useState<string | null>(() =>
    localStorage.getItem("payment_qr_image"),
  );
  const [refId, setRefId] = useState<string>(
    () => localStorage.getItem("payment_ref_id") || "",
  );

  const [isGenerating, setIsGenerating] = useState(() => {
    const savedQR = localStorage.getItem("payment_qr_image");

    if (savedQR) {
      const remaining = Math.floor((getExpiryTimestamp() - Date.now()) / 1000);

      return remaining <= 0;
    }

    return true;
  });

  const initialHasRequested = (() => {
    const savedQR = localStorage.getItem("payment_qr_image");

    if (savedQR) {
      return getExpiryTimestamp() > Date.now();
    }

    return false;
  })();

  const hasRequestedQR = useRef<boolean>(initialHasRequested);

  usePaymentSocket();

  const paymentStatus = useSelector((state: RootState) => state.payment.status);

  // เช็คว่่ามีสถานะจาก api อะป่าวหลังรีหน้า
  useEffect(() => {
    const savedOrderNo = localStorage.getItem("orderNo");
    if (!savedOrderNo) return;

    const checkStatusOnRefresh = async () => {
      try {
        const data = await OrdersService.getOrdersStatus(savedOrderNo);

        if (
          data.status === "COMPLETED" ||
          data.paymentStatus === "PAYMENT_SUCCESS"
        ) {
          toast.success("สั่งซื้อสำเร็จ");
          dispatch(
            setPaymentStatus({
              status: "PAYMENT_SUCCESS",
              orderId: savedOrderNo,
            }),
          );
        } else if (
          data.status === "CANCELLED" ||
          data.paymentStatus === "FAILED"
        ) {
          dispatch(
            setPaymentStatus({
              status: "PAYMENT_FAILS",
              orderId: savedOrderNo,
            }),
          );
        }
      } catch (error) {
        console.error("ไม่สามารถดึงสถานะล่าสุดของคำสั่งซื้อได้", error);
      }
    };

    checkStatusOnRefresh();
  }, [dispatch]);

  // ตรงนี้เช็คว่าจ่ายตังได้ป่าว
  useEffect(() => {
    // เงื่อนไขตรงนี้จ่ายตังได้ -> ล้าง local เลย
    if (paymentStatus === "PAYMENT_SUCCESS") {
      clearPaymentSession();
      dispatch(resetPaymentStatus());
      navigate("/orders", { replace: true });
    } else if (paymentStatus === "PAYMENT_FAILS") {
      // เงื่อนไขตรงนี้จ่ายตังไม่ได้ -> ล้าง local เหมือนกันค่อยให้ข้อมูลมาตอนชำระใหม่อีกที
      clearPaymentSession();
      dispatch(resetPaymentStatus());
      navigate("/orders", { replace: true });
    }
  }, [paymentStatus, navigate, dispatch]);

  // สร้าง qr
  useEffect(() => {
    const savedExpiry = localStorage.getItem("payment_expiry_timestamp");
    const savedQR = localStorage.getItem("payment_qr_image");

    if (savedExpiry && savedQR) {
      const remaining = Math.floor((getExpiryTimestamp() - Date.now()) / 1000);

      if (remaining > 0) {
        setIsGenerating(false);
        hasRequestedQR.current = true;
        return;
      }
    }

    if (!stripe || !clientSecret || hasRequestedQR.current) return;

    const generateQR = async () => {
      hasRequestedQR.current = true;
      setIsGenerating(true);

      try {
        const userProfile = await UserService.getProfile();
        const userEmail = userProfile?.email || "guest@yourstore.com";
        const userName = userProfile?.name || "Guest";

        const { error, paymentIntent } = await stripe.confirmPromptPayPayment(
          clientSecret,
          {
            payment_method: {
              billing_details: {
                email: userEmail,
                name: userName,
              },
            },
          },
          { handleActions: false },
        );

        if (error) {
          toast.error(error.message || "เกิดข้อผิดพลาดในการสร้าง QR Code");
          // ปิ้วๆ qr ใหม่ได้ถ้าพัง
          hasRequestedQR.current = false;
        } else {
          if (paymentIntent?.id) {
            const shortRef = paymentIntent.id.slice(-6).toUpperCase();
            setRefId(shortRef);
            localStorage.setItem("payment_ref_id", shortRef);
          }

          const nextAction: any = paymentIntent?.next_action;
          const qrData =
            nextAction?.promptpay_display_qr_code?.image_url_svg ||
            nextAction?.promptpay_display_qr_code?.image_url_png;
          const expiryTimestamp = getExpiryTimestamp();

          if (!expiryTimestamp) {
            toast.error("ไม่พบข้อมูลเวลาหมดอายุ");
            return;
          }

          const remaining = Math.floor((expiryTimestamp - Date.now()) / 1000);

          setTimeLeft(Math.max(remaining, 0));

          if (qrData) {
            setQrImage(qrData);
            localStorage.setItem("payment_qr_image", qrData);
          } else {
            toast.error("ไม่พบข้อมูล QR Code จากระบบ");
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("ขออภัย ไม่สามารถติดต่อผู้ให้บริการชำระเงินได้ในขณะนี้");
      } finally {
        setIsGenerating(false);
      }
    };

    generateQR();
  }, [stripe, clientSecret]);

  // เรื่องเวลาถอยหลัง และจัดการตอนเบิ่ดเวลา
  useEffect(() => {
    if (!clientSecret || !totalPrice) {
      toast.error("ข้อมูลการชำระเงินไม่ครบถ้วน");
      clearPaymentSession();
      navigate("/shopping-cart", { replace: true });
      return;
    }

    const timerId = setInterval(() => {
      const remaining = getRemainingSeconds();

      if (remaining === 0) {
        clearInterval(timerId);
        toast.error("QR Code หมดอายุการใช้งาน");
        clearPaymentSession();
        navigate("/orders", { replace: true });
        return;
      }

      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(timerId);
  }, [clientSecret, totalPrice, navigate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- แยกส่วนการแสดงผล QR Code ออกมาจาก Nested Ternary ---
  let qrContent;
  if (isGenerating) {
    qrContent = (
      <div className="flex flex-col items-center text-gray-500">
        <Icon icon="eos-icons:loading" className="w-8 h-8 mb-2" />
        <span className="text-xs">กำลังสร้าง QR...</span>
      </div>
    );
  } else if (qrImage) {
    qrContent = (
      <img
        data-test="promptpay-qr-image"
        src={qrImage}
        alt="PromptPay QR Code"
        className="w-full h-full object-contain"
      />
    );
  } else {
    qrContent = (
      <span className="text-xs text-red-500 text-center">
        โหลด QR ไม่สำเร็จ
        <br />
        โปรดลองใหม่อีกครั้ง
      </span>
    );
  }

  const handleConfirmButtonClick = () => {
    clearPaymentSession();
    navigate("/orders");
  };

  return (
    <div className="min-h-screen bg-white lg:bg-white pb-4 lg:pb-0 pt-5 font-anuphan text-gray-800 flex flex-col items-center">
      {" "}
      {/* --- DESKTOP BREADCRUMB --- */}
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
          <Link
            to="/shopping-cart"
            className="transition-colors cursor-pointer"
          >
            รถเข็น
          </Link>
          <Icon
            icon="material-symbols:chevron-right-rounded"
            className="w-5 h-5 mx-1 text-black"
          />
          <Link to="/payment" className="transition-colors cursor-pointer">
            สรุปคำสั่งซื้อ
          </Link>
          <Icon
            icon="material-symbols:chevron-right-rounded"
            className="w-5 h-5 mx-1 text-black"
          />
          <span className="text-black">ชำระด้วย QRCODE</span>
        </nav>
      </div>
      {/* --- MOBILE HEADER --- */}
      <div className="lg:hidden w-full flex items-center bg-white p-4 pt-10 shadow-sm sticky top-0 z-30 mb-2">
        <Icon
          data-test="btn-back-payment"
          icon="lucide:arrow-left"
          className="w-6 h-6 mr-3 text-black cursor-pointer"
          onClick={() => {
            clearPaymentSession();
            navigate(-1);
          }}
        />
        <span className="text-lg font-bold text-black">ข้อมูลการชำระเงิน</span>
      </div>
      <div className="w-full lg:max-w-[700px] mx-auto bg-white lg:border border-gray-200 lg:rounded-xl lg:shadow-sm px-4 pt-4 pb-0 sm:p-10 lg:mt-6 lg:mb-10 flex flex-col flex-1">
        {" "}
        {/* Title (Desktop Only) */}
        <button
          className="hidden lg:flex items-center gap-2 mb-6 cursor-pointer w-full border-b border-gray-200 pb-6 hover:text-[#4285F4] transition-colors"
          onClick={() => {
            clearPaymentSession();
            navigate(-1);
          }}
        >
          <Icon icon="lucide:arrow-left" className="w-6 h-6" />
          <span className="font-bold text-xl text-black">
            ข้อมูลการชำระเงิน
          </span>
        </button>
        {/* ส่วนแสดงราคาและเวลา */}
        <div className="flex flex-col items-center mb-6 gap-3 lg:pb-6 pb-4">
          <div className="flex justify-between w-full max-w-[400px] items-center  px-4 ">
            <span className="text-black font-bold text-[15px] sm:text-base">
              ยอดชำระเงินทั้งหมด
            </span>
            <span
              data-test="payment-total-price-mobile"
              className="text-blue-500 font-bold text-lg sm:text-xl"
            >
              ฿ {totalPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between w-full max-w-[400px] items-center px-4">
            <span className="text-black font-medium text-[15px] sm:text-base">
              กรุณาชำระภายใน
            </span>
            <span
              data-test="payment-countdown"
              className="text-blue-500 font-bold text-lg sm:text-xl"
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* QR Code Slip (Responsive) */}
          <div className="flex justify-center mb-8 px-2 sm:px-0">
            <div className="w-full max-w-[380px] border border-gray-200 rounded-xl overflow-hidden shadow-md">
              <div className="bg-[#113566] h-[50px] sm:h-[60px] w-full flex justify-center items-center">
                <span className="text-white font-bold tracking-widest text-sm">
                  PROMPTPAY
                </span>
              </div>
              <div className="p-6 flex flex-col items-center bg-white">
                <div
                  data-test="promptpay-qr-container"
                  className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] bg-white flex items-center justify-center border-2 border-[#113566] mb-5 p-2 rounded-xl shadow-sm relative"
                >
                  {/* แสดงผลตัวแปร qrContent ที่เราดึงออกมาจาก Ternary */}
                  {qrContent}
                </div>
                <span
                  data-test="payment-total-price-desktop"
                  className="text-blue-500 font-bold text-xl mb-3"
                >
                  ฿ {totalPrice.toLocaleString()}
                </span>
                <span className="text-[13px] sm:text-md font-bold text-black mb-1">
                  บริษัท สโตร์เมท จำกัด
                </span>
                <span className="text-[11px] px-5 sm:text-md font-medium text-gray-500 mb-2">
                  STOREMATE CO.,LTD.
                </span>
                <div className="px-2 py-0.5 rounded-md w-full text-center">
                  <span
                    data-test="payment-reference-id"
                    className="text-[11px] sm:text-md text-[#94A3B8] font-bold"
                  >
                    รหัสอ้างอิง: {refId || "กำลังโหลด..."}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ข้อแนะนำในการโอน */}
          <div className="max-w-[500px] mx-auto mb-8 bg-white px-2 sm:px-5 font-anuphan">
            <h4 className="font-bold text-gray-900 mb-5 text-base sm:text-lg border-b border-gray-100 pb-3">
              ขั้นตอนการชำระเงิน
            </h4>

            <div className="flex flex-col gap-5">
              {[
                {
                  id: "step-1",
                  icon: "mdi:number-1-circle",
                  text: 'คลิกปุ่ม "บันทึก QR" หรือแคปหน้าจอ',
                },
                {
                  id: "step-2",
                  icon: "mdi:number-2-circle",
                  text: "เปิดแอปพลิเคชันธนาคารในอุปกรณ์ของท่าน",
                },
                {
                  id: "step-3",
                  icon: "mdi:number-3-circle",
                  text: "คำสั่งซื้อจะได้รับการยืนยันทันทีหลังจากชำระเงินสำเร็จ หรือภายใน 24 ชั่วโมง ในกรณีที่มีธุรกรรมจำนวนมาก",
                },
                {
                  id: "step-4",
                  icon: "mdi:number-4-circle",
                  text: 'เลือกไปที่ปุ่ม "สแกน" หรือ "QR Code" และกดที่ "รูปภาพ" เลือกรูปภาพที่ท่านแคปไว้และทำการชำระเงิน โดยกรุณาเช็คชื่อบัญชีผู้รับคือ "บริษัท สโตร์เมท จำกัด"',
                  boldWords: ['"บริษัท สโตร์เมท จำกัด"'],
                },
                {
                  id: "step-5",
                  icon: "mdi:number-5-circle",
                  text: "QR สามารถสแกนได้ 1 ครั้งต่อ 1 การชำระเงินเท่านั้น หากต้องการสแกนใหม่ โปรดรีเฟรช QR อีกครั้ง",
                },
              ].map((item) => {
                return (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon
                        icon={item.icon}
                        className="w-7 h-7 sm:w-8 sm:h-8 text-black opacity-80"
                      />
                    </div>
                    <p className="text-gray-700 text-[13.5px] sm:text-[15px] leading-relaxed">
                      {item.boldWords ? (
                        <>
                          {item.text.split(item.boldWords[0])[0]}
                          <strong className="text-black font-bold">
                            {item.boldWords[0]}
                          </strong>
                        </>
                      ) : (
                        item.text
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* สำหรับคนที่ไม่อยากจ่ายเงินตอนนี้ มันจะไปที่หน้าออเดอร์และจะมีปุ่มชำระเงินมาให้อีกที แต่ถ้าจะจ่ายตังเลยก็ได้ */}
          <div className="flex justify-center mt-auto lg:mt-8 w-full pt-4">
            {" "}
            <button
              data-test="confirm-paid-btn"
              onClick={handleConfirmButtonClick}
              className="cursor-pointer w-full lg:max-w-[400px] bg-[#1E40AF] text-white font-bold py-3.5 sm:py-4 rounded-xl transition-all active:scale-[0.98] shadow-md text-sm sm:text-base"
            >
              ตกลง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentQR = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentQRInner />
    </Elements>
  );
};

export default PaymentQR;
