import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import ProfileSidebar from "../../../components/user/ProfileSidebar";
import OrderCard from "../../../components/user/orderCard";
import { Icon } from "@iconify/react";
import StatusOrderTabs from "../../../components/user/StatusOrderTabs";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../../redux/orders/orderReducer";
import type { OrderStatus, Order } from "../../../types/orders";
import { statusConfig } from "../../../types/orders";
import { toast } from "react-hot-toast";
import {
  retryPaymentThunk,
  resetPaymentStatus,
} from "../../../redux/payment/paymentReducer";
import { useReview } from "../../../hooks/useReview";
import ReviewManager from "../../../components/user/review/ReviewManager";
import Skeleton from "../../../components/loading/Skeletons";

const Order = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // แก้ไข: เพิ่ม setError เพื่อหลีกเลี่ยง Dead Code
  const [error] = useState<string | null>(null);

  const rawStatus = searchParams.get("status") as OrderStatus;
  const status = rawStatus && statusConfig[rawStatus] ? rawStatus : "ALL";

  const { orders, loading } = useSelector((state: RootState) => state.orders);

  const dispatch = useDispatch<AppDispatch>();

  const review = useReview({
    onRefresh: () => dispatch(fetchOrders(status)),
  });

  useEffect(() => {
    dispatch(fetchOrders("ALL"));
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (status === "ALL") return true;
        if (status === "CANCELLED") {
          return order.status === "CANCELLED";
        }
        if (status === "REFUNDED") {
          return order.status === "REFUNDED";
        }
        return order.status === status;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, status]);

  const handleTabChange = (nextStatus: OrderStatus) => {
    if (nextStatus !== status) {
      setSearchParams({ status: nextStatus });
    }
  };

  const handleBuyAgain = async (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    try {
      navigate("/payment", {
        state: {
          orderNo: order.orderNo,
          isReOrder: true,
        },
      });
    } catch {
      toast.error("ไม่สามารถสั่งซื้อสินค้าอีกครั้งได้");
    }
  };

  const clearPaymentSession = () => {
    localStorage.removeItem("payment_expiry_timestamp");
    localStorage.removeItem("payment_qr_image");
    localStorage.removeItem("payment_ref_id");
    localStorage.removeItem("payment_total_price");
    localStorage.removeItem("payment_client_secret");
  };

  const handleRetryPayment = async (
    e: React.MouseEvent,
    order: Order,
    orderTotal: number,
  ) => {
    e.stopPropagation();

    try {
      // ล้าง session เก่า
      clearPaymentSession();

      // สำคัญ: reset status จาก payment ครั้งก่อน
      dispatch(resetPaymentStatus());

      // สร้าง Payment ใหม่
      const response = await dispatch(
        retryPaymentThunk({
          orderNo: order.orderNo,
        }),
      ).unwrap();

      localStorage.setItem("orderNo", order.orderNo);

      localStorage.setItem("payment_client_secret", response.clientSecret);

      localStorage.setItem("payment_total_price", String(orderTotal));

      localStorage.setItem("payment_expiry_timestamp", response.paymentExpired);

      navigate("/payment-qr", {
        state: {
          orderNo: order.orderNo,
          totalPrice: orderTotal,
          clientSecret: response.clientSecret,
          paymentExpired: response.paymentExpired,
        },
      });
    } catch {
      toast.error("ไม่สามารถสร้างรายการชำระเงินได้");
    }
  };

  return (
    <div className="relative min-h-screen bg-white font-anuphan text-gray-950 pb-20 pt-5 w-full overflow-x-hidden break-all">
      {review.isBlocking && (
        <div className="fixed inset-0 bg-black/40 z-[999] pointer-events-auto" />
      )}
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
          <span className="text-black">การซื้อของฉัน</span>
        </nav>

        <div className="lg:hidden bg-white pt-2 pb-4">
          <div className="flex items-center gap-3">
            <button
              className="mt-[2px] text-black p-0 flex-shrink-0 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <Icon icon="material-symbols:arrow-back" className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-[18px] font-bold text-black">
                การซื้อของฉัน
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="hidden lg:block w-full lg:w-64 flex-shrink-0">
            <ProfileSidebar />
          </div>

          <main className="flex-1 w-full min-h-[500px]">
            <StatusOrderTabs activeTab={status} onTabChange={handleTabChange} />

            <div className="flex flex-col gap-4 py-4 w-full bg-white">
              {loading && orders.length === 0 ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} />
                ))
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-28">
                  <p className="text-[20px] sm:text-[24px] font-medium text-red-500 mb-4 sm:mb-6">
                    ไม่พบข้อมูลคำสั่งซื้อ
                  </p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-28">
                  {/* แก้ไข: เปลี่ยน w-50, h-50, w-70, h-70 เป็นขนาดมาตรฐานของ Tailwind CSS */}
                  <Icon
                    icon="mdi-light:cart"
                    className="w-48 h-48 sm:w-72 sm:h-72 text-black mb-6"
                  />
                  <p className="text-[20px] lg:text-[36px] font-medium text-black mb-4 sm:mb-6">
                    ยังไม่มีรายการคำสั่งซื้อ
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const orderTotal = (order?.orderItems || []).reduce(
                    (sum, item) =>
                      sum + (item?.price || 0) * (item?.quantity || 0),
                    0,
                  );

                  const isRefundRequested =
                    order.status === "PROCESSING" &&
                    (order.checkoutType === "PROMPTPAY" ||
                      order.checkoutType === "CARD") &&
                    !!order.reason;

                  const reviewedItems =
                    order.orderItems?.filter((item: any) => item.is_review) ||
                    [];
                  const unreviewedItems =
                    order.orderItems?.filter((item: any) => !item.is_review) ||
                    [];

                  const hasReviewed = reviewedItems.length > 0;
                  const hasUnreviewed = unreviewedItems.length > 0;

                  return (
                    <OrderCard
                      key={order.id}
                      order={order}
                      actionButtons={
                        <>
                          {order.status === "COMPLETED" ? (
                            <div className="mt-3 flex flex-wrap gap-3 sm:justify-end sm:items-center w-full">
                              <button
                                type="button"
                                data-test="btn-retry-orders"
                                onClick={(e) => {
                                  handleBuyAgain(e, order);
                                }}
                                className="cursor-pointer flex-1 sm:flex-initial sm:w-[170px] h-[44px] rounded-lg bg-[#3B82F6] text-[#FCFCFC] font-medium text-[14px] sm:text-[16px] flex justify-center items-center transition hover:bg-blue-600 cursor-pointer shadow-sm"
                              >
                                ซื้ออีกครั้ง
                              </button>

                              {hasUnreviewed && (
                                <button
                                  data-test="btn-add-review"
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();

                                    if (unreviewedItems.length === 1) {
                                      await review.launchReviewModalForItem(
                                        order,
                                        unreviewedItems[0],
                                      );
                                    } else {
                                      review.setOrderForReview(order);
                                      review.setSelectModalMode("WRITE");
                                      review.setLocalSelectedItemId(
                                        unreviewedItems[0]?.id || null,
                                      );
                                      review.setIsSelectModalOpen(true);
                                    }
                                  }}
                                  className="cursor-pointer flex-1 sm:flex-initial sm:w-[170px] h-[44px] rounded-lg bg-[#1E40AF] text-white font-medium text-[14px] sm:text-[16px] flex justify-center items-center transition hover:bg-[#152e7c] cursor-pointer shadow-sm"
                                >
                                  เขียนรีวิว
                                </button>
                              )}

                              {hasReviewed && (
                                <button
                                  data-test="btn-see-review"
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (reviewedItems.length === 1) {
                                      review.handleOpenViewReview(
                                        order,
                                        reviewedItems[0],
                                      );
                                    } else {
                                      review.setOrderForReview(order);
                                      review.setSelectModalMode("VIEW");
                                      review.setLocalSelectedItemId(
                                        reviewedItems[0]?.id || null,
                                      );
                                      review.setIsSelectModalOpen(true);
                                    }
                                  }}
                                  className="cursor-pointer flex-1 sm:flex-initial sm:w-[170px] h-[44px] rounded-lg bg-[#1E40AF] text-white font-medium text-[14px] sm:text-[16px] flex justify-center items-center transition hover:bg-[#152e7c] cursor-pointer shadow-sm"
                                >
                                  ดูรีวิว
                                </button>
                              )}
                            </div>
                          ) : order.status === "CANCELLED" ||
                            order.status === "REFUNDED" ||
                            isRefundRequested ? (
                            <div className="mt-3 flex flex-col items-start w-full px-1">
                              <p className="text-gray-600 text-[14px] sm:text-[16px]">
                                <span className="font-medium text-black">
                                  เหตุผล :
                                </span>
                                {order.reason || "ไม่ได้ระบุเหตุผล"}
                              </p>
                            </div>
                          ) : order.status === "PENDING" ||
                            (order.status === "PROCESSING" &&
                              !isRefundRequested) ? (
                            <div className="mt-3 grid grid-cols-2 gap-3 sm:flex sm:justify-end sm:items-center w-full">
                              {order.status === "PENDING" && (
                                <button
                                  type="button"
                                  data-test="btn-retry-payment"
                                  onClick={(e) =>
                                    handleRetryPayment(e, order, orderTotal)
                                  }
                                  className="cursor-pointer w-full h-[44px] sm:w-[170px] rounded-lg bg-[#1E40AF] text-white font-medium text-[14px] sm:text-[16px] transition hover:bg-[#152e7c] shadow-sm"
                                >
                                  ชำระเงิน
                                </button>
                              )}
                              <button
                                data-test="btn-cancel-order"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/cancel-orders/${order.orderNo}`, {
                                    state: {
                                      status: order.status,
                                      paymentMethod: order.checkoutType,
                                    },
                                  });
                                }}
                                className="cursor-pointer w-full h-[44px] sm:w-[170px] rounded-lg bg-[#3B82F6] text-white font-medium text-[14px] sm:text-[16px] transition hover:bg-blue-600 shadow-sm"
                              >
                                {order.status === "PENDING"
                                  ? "ยกเลิกคำสั่งซื้อ"
                                  : order.checkoutType === "DESTINATION"
                                    ? "ยกเลิกคำสั่งซื้อ"
                                    : "ขอคืนเงิน"}
                              </button>
                            </div>
                          ) : null}
                        </>
                      }
                    />
                  );
                })
              )}
            </div>
          </main>
        </div>
      </div>

      {review.isSelectModalOpen && review.orderForReview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs transition-all animate-fade-in">
          <div className="w-full max-h-[90vh] max-w-[95%] sm:max-w-[550px] md:max-w-[650px] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col border border-gray-100">
            <div className="flex items-center p-4 md:p-5 border-b border-gray-100 bg-white flex-shrink-0">
              <h2 className="text-[18px] md:text-[20px] font-bold text-gray-900">
                {review.selectModalMode === "VIEW"
                  ? "เลือกรีวิว"
                  : "เลือกสินค้าเพื่อเขียนรีวิว"}
              </h2>
            </div>

            <div className="p-0 overflow-y-auto flex flex-col flex-1 bg-white divide-y divide-gray-100">
              {review.orderForReview.orderItems
                ?.filter((item: any) => {
                  return review.selectModalMode === "VIEW"
                    ? item.is_review
                    : !item.is_review;
                })
                ?.map((item: any) => {
                  const isSelected = review.localSelectedItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => review.setLocalSelectedItemId(item.id)}
                      className={`flex items-start gap-4 p-4 md:p-5 transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-blue-50/30"
                          : "bg-white hover:bg-gray-50/50"
                      }`}
                    >
                      <img
                        src={item.imageUrl || ""}
                        alt=""
                        className={`w-20 h-20 md:w-24 md:h-24 object-contain rounded-lg border flex-shrink-0 transition-all ${
                          isSelected
                            ? "border-blue-400 shadow-xs"
                            : "border-gray-200"
                        }`}
                      />

                      <div className="flex-1 min-w-0 pt-1">
                        <p
                          className={`font-semibold text-[14px] md:text-[15px] leading-snug line-clamp-3 transition-colors ${
                            isSelected ? "text-blue-600" : "text-gray-900"
                          }`}
                        >
                          {item.productName}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="p-4 md:p-5 border-t border-gray-100 flex justify-end items-center gap-3 flex-shrink-0 bg-white">
              <button
                data-test="btn-open-model-review"
                type="button"
                onClick={review.handleConfirmProductSelection}
                className="cursor-pointer px-5 py-2 bg-[#1E40AF] text-white rounded-lg font-medium text-[14px] transition shadow-xs min-w-[80px] text-center"
              >
                เลือก
              </button>
              <button
                data-test="btn-cancel-model-review"
                type="button"
                onClick={() => review.setIsSelectModalOpen(false)}
                className="cursor-pointer px-5 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium text-[14px] transition min-w-[80px] text-center"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
      <ReviewManager review={review} />
    </div>
  );
};

export default Order;
