import { useState } from "react";
import { Link } from "react-router-dom";
// import { Icon } from "@iconify/react";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { FiChevronRight } from "react-icons/fi";
import type { Order, OrderItem } from "../../types/orders";
import { statusConfig, getOrderLabel } from "../../types/orders";

interface OrderCardProps {
  order: Order;
  actionButtons: React.ReactNode;
}

const OrderCard = ({ order, actionButtons }: OrderCardProps) => {
  //ขยายเพื่อดูสินค้าทั้งหมด
  const [isExpanded, setIsExpanded] = useState(false);

  const color = statusConfig[order?.status]?.color || "text-black";
  const label = getOrderLabel(order?.status);

  const visibleItems = isExpanded
    ? order.orderItems || []
    : (order.orderItems || []).slice(0, 1);

  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  const formatOrderNo = (orderNo: string) => {
  const match = orderNo.match(/^ORD-(\d{4})(\d{2})(\d{2})/);

  if (!match) return orderNo;

  const [, year, month, day] = match;

  return `ORD-${year}-${month}-${day}`;
};

  return (
    <div
      data-test={`order-card-${order.id}`}
      className="w-full cursor-pointer hover:shadow-md transition-shadow rounded-xl p-4 bg-white border border-gray-200/80 shadow-sm"
    >
      <div className="grid grid-cols-3 gap-2 pb-4 border-b border-gray-200">
        <div className="min-w-0">
          <p className="text-[10px] min-[400px]:text-[11px] sm:text-sm text-gray-500 mb-1 ">
            เลขที่คำสั่งซื้อ
          </p>
          <p
  className="
    font-semibold
    text-black
    text-[11px]
    sm:text-[16px]
    leading-tight
  "
  data-test={`card-order-${order.orderNo}`}
>
  {/* จอมือถือ */}
  <span className="sm:hidden whitespace-nowrap">
    {formatOrderNo(order.orderNo)}
  </span>

  {/* จอ Desktop */}
  <span className="hidden sm:inline">
    {order.orderNo}
  </span>
</p>
        </div>
        <div className="min-w-0 px-1">
          <p className="text-[10px] min-[400px]:text-[11px] sm:text-sm text-gray-500 mb-1">
            วันที่สั่งซื้อ
          </p>
          <p className=" font-medium
        text-black
        text-[11px]
        min-[400px]:text-[12px]
        sm:text-[16px]
        leading-tight">
            {formatOrderDate(order.createdAt)}
          </p>
        </div>
        <div className="min-w-0 pl-1">
          <p className="text-[10px] min-[400px]:text-[11px] sm:text-sm text-gray-500 mb-1">สถานะ</p>
          <p
            className={` font-semibold
        ${color}
        text-[11px]
        min-[400px]:text-[12px]
        sm:text-[16px]
        leading-tight`}
          >
            {label}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 py-3 border-b border-gray-100 w-full">
        {visibleItems.map((item: OrderItem, idx: number) => (
          <div key={item.id || idx} className="flex gap-3 py-1">
            <img
              src={item.imageUrl || ""}
              alt=""
              className="w-16 h-16 sm:w-28 sm:h-28 object-contain rounded-lg flex-shrink-0 bg-gray-50 border border-gray-100"
            />
            <div className="flex flex-col flex-1 gap-0.5 min-w-0">
              <div
                className="font-bold text-[14px] sm:text-[16px] text-black line-clamp-2 leading-snug"
                data-test="order-item-name"
              >
                {item.productName}
              </div>
              <div
                className="text-black text-[12px] sm:text-[14px]"
                data-test="unit-price"
              >
                ราคาต่อหน่วย ฿ {item.price.toLocaleString()}
              </div>
              <div
                className="text-black text-[12px] sm:text-[14px]"
                data-test="order-item-quantity"
              >
                จำนวน x {item.quantity}
              </div>

             <Link
    to={`/orders/${order.orderNo}`}
    className="
      mt-0.5
      text-[#3B82F6]
      text-[12px]
      sm:text-[14px]
      font-semibold
      inline-flex
      items-center
      gap-0.5
      w-fit
      whitespace-nowrap
    "
    data-test="btn-order-details"
  >
    ดูรายละเอียดสินค้า
    <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
  </Link>
              
            </div>
            <div
              className="text-right text-[#3B82F6] font-bold text-[15px] sm:text-lg flex-shrink-0 self-center pl-2"
              data-test="order-item-sub-total"
            >
              ฿ {item.subTotal.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {order.orderItems && order.orderItems.length > 1 && (
        <div className="w-full pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="cursor-pointer w-full h-[44px] bg-[#F9FAFB] hover:bg-gray-100 rounded-xl flex items-center justify-center gap-2"
            data-test="btn-show-more"
          >
            <span>{isExpanded ? "น้อยลง" : "ดูเพิ่มเติม"}</span>

            {isExpanded ? (
              <IoIosArrowUp className="w-5 h-5" />
            ) : (
              <IoIosArrowDown className="w-5 h-5" />
            )}
          </button>
        </div>
      )}

      <div className="mt-3">
        <div className="flex justify-center md:justify-between items-center gap-4 rounded-lg bg-[#F9FAFB] px-4 py-3">
          <div className="flex items-center gap-3 md:w-full md:justify-between">
            <span
              className="text-black font-bold text-[15px] sm:text-[18px]"
              data-test="order-total"
            >
              ยอดรวมสุทธิ
            </span>
            <span className="font-bold text-[#3B82F6] text-[16px] sm:text-[20px]">
              ฿ {order.total}
            </span>
          </div>
        </div>

        {actionButtons}
      </div>
    </div>
  );
};

export default OrderCard;
