import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";

import type { AppDispatch } from "../redux/store";
import type { CreateReviewPayload } from "../types/review";

import {
  fetchProductReviews,
  submitProductReview,
  updateProductReview,
  deleteProductReview,
} from "../redux/reviews/reviewsReducer";

import { fetchOrderDetails } from "../redux/orders/orderReducer";
import ConfirmToast from "../components/ConfirmToast";

interface UseReviewProps {
  onRefresh: () => void;
}

export const useReview = ({ onRefresh }: UseReviewProps) => {
  const dispatch = useDispatch<AppDispatch>();

  // Write Review
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewScore, setReviewScore] = useState(0);
  const [message, setMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // View Review
  const [isViewReviewModalOpen, setIsViewReviewModalOpen] = useState(false);
  const [activeReviewData, setActiveReviewData] = useState<any>(null);

  // Edit Review
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);

  // Product Selector
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [orderForReview, setOrderForReview] = useState<any>(null);
  const [localSelectedItemId, setLocalSelectedItemId] = useState<number | null>(
    null,
  );
  const [selectModalMode, setSelectModalMode] = useState<"WRITE" | "VIEW">(
    "WRITE",
  );
  const [isBlocking, setIsBlocking] = useState(false);

  const confirmAction = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setIsBlocking(true);

      toast(
        (t) => (
          <div className="relative z-[10000]">
            <ConfirmToast
              t={t}
              message={message}
              onResolve={resolve}
              setIsBlocking={setIsBlocking}
            />
          </div>
        ),
        {
          duration: Infinity,
          position: "top-center",
        },
      );
    });
  };

  const formatOrderDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  const launchReviewModalForItem = async (order: any, itemFromList: any) => {
    try {
      setIsSelectModalOpen(false);

      const orderNo = order.orderNo || `ORD-${order.id}`;
      const orderDetailData = await dispatch(
        fetchOrderDetails(orderNo),
      ).unwrap();

      const matchedItemDetail = orderDetailData?.orderItems?.find(
        (detailItem: any) =>
          detailItem.productId === itemFromList.id ||
          detailItem.id === itemFromList.id ||
          detailItem.productName === itemFromList.productName,
      );

      const actualProductId =
        matchedItemDetail?.productId ||
        matchedItemDetail?.id ||
        itemFromList.id;
      const actualOrderItemId = matchedItemDetail?.id || itemFromList.id;

      if (actualProductId) {
        setSelectedItem({
          ...itemFromList,
          productId: actualProductId,
          orderItemId: actualOrderItemId,
        });
        setIsReviewModalOpen(true);
      } else {
        toast.error("ไม่พบข้อมูลรหัสคำสั่งซื้อสำหรับรายการนี้");
      }
    } catch (error) {
      console.error("Fetch order details error:", error);
      toast.error("ไม่สามารถดึงข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedItem?.productId) return;

    if (reviewScore === 0) {
      toast.error("กรุณากรอกคะแนนความพึงพอใจ");
      return;
    }

    const payload: CreateReviewPayload = {
      reviewScore: reviewScore,
      message: message,
    };

    try {
      await dispatch(
        submitProductReview({ orderItemId: selectedItem.orderItemId, payload }),
      ).unwrap();

      toast.dismiss();
      toast.success("ขอบคุณสำหรับรีวิว");

      setIsReviewModalOpen(false);

      resetReviewForm();
      onRefresh();
    } catch (err) {
      console.error("Review error:", err);
      toast.dismiss();
      toast.error("ไม่สามารถส่งรีวิวได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleSwitchToEditReview = () => {
    if (!activeReviewData) return;
    setReviewScore(activeReviewData.reviewScore);
    setMessage(activeReviewData.message);

    setIsViewReviewModalOpen(false);
    setIsEditReviewModalOpen(true);
  };

  const handleEditReviewSubmit = async () => {
    if (!activeReviewData?.id) return;

    if (reviewScore === 0) {
      toast.error("กรุณากรอกคะแนนความพึงพอใจ");
      return;
    }

    const payload: CreateReviewPayload = {
      reviewScore: reviewScore,
      message: message,
    };

    try {
      await dispatch(
        updateProductReview({ id: activeReviewData.id, payload }),
      ).unwrap();

      toast.dismiss();
      toast.success("แก้ไขรีวิวสำเร็จ");

      resetReviewForm();

      onRefresh();
    } catch (err) {
      console.error("Edit review error:", err);
      toast.dismiss();
      toast.error("ไม่สามารถแก้ไขรีวิวได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ฟังก์ชันแยกย่อยสำหรับดึงรีวิว
  const fetchAndShowReview = async (order: any, itemFromList: any) => {
    try {
      const orderItemId = itemFromList.id;
      const reviewData = await dispatch(
        fetchProductReviews(orderItemId),
      ).unwrap();

      // console.log("ตรวจสอบข้อมูล reviews ที่ดึงมาได้จริง:", reviewData);

      if (reviewData && reviewData.id) {
        setOrderForReview(order);
        setSelectedItem(itemFromList);

        setActiveReviewData({
          id: reviewData.id,
          reviewerName: reviewData.reviewer?.name || "ผู้ใช้งานระบบ",
          reviewerImage: reviewData.reviewer?.imageUrl || "",
          createdAt: formatOrderDate(reviewData.createdAt || order.createdAt),
          reviewScore: reviewData.reviewScore,
          message: reviewData.message,
          productName: itemFromList.productName,
          imageUrl: itemFromList.imageUrl,
        });

        setIsViewReviewModalOpen(true);
      } else {
        toast.error("ไม่พบข้อมูลรีวิวสำหรับสินค้านี้");
      }
    } catch (error) {
      console.error("Error fetching review by orderItemId:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว");
    }
  };

  const handleOpenViewReview = async (order: any, itemFromList?: any) => {
    if (itemFromList) {
      await fetchAndShowReview(order, itemFromList);
      return;
    }

    const reviewedItems =
      order.orderItems?.filter((item: any) => item.is_review) || [];

    if (reviewedItems.length === 0) {
      toast.error("คำสั่งซื้อนี้ยังไม่มีรายการสินค้าที่ถูกรีวิว");
      return;
    }

    if (reviewedItems.length === 1) {
      // สินค้าที่รีวิวชิ้นเดียว -> ให้เปิดดูรีวิวได้เลย
      await fetchAndShowReview(order, reviewedItems[0]);
    } else {
      // มีสินค้าที่รีวิวมากกว่า 1 ชิ้น -> ให้เลือกรายการสินค้าก่อน
      setOrderForReview(order);
      setSelectModalMode("VIEW");
      setIsSelectModalOpen(true);
    }
  };

  // ฟังก์ชันกดยืนยันเลือกสินค้า
  const handleConfirmProductSelection = async () => {
    if (!orderForReview || !localSelectedItemId) return;

    const selectedItemFromList = orderForReview.orderItems?.find(
      (item: any) => item.id === localSelectedItemId,
    );

    if (!selectedItemFromList) return;

    setIsSelectModalOpen(false);

    // ตรวจว่าจะ "ดูรีวิว" หรือ "เขียนรีวิว"
    if (selectModalMode === "VIEW") {
      await fetchAndShowReview(orderForReview, selectedItemFromList);
    } else {
      await launchReviewModalForItem(orderForReview, selectedItemFromList);
    }

    setLocalSelectedItemId(null);
  };

  const handleDeleteReview = async () => {
    if (!activeReviewData?.id) return;

    const confirmed = await confirmAction("คุณต้องการลบรีวิวนี้ใช่หรือไม่?");

    if (!confirmed) return;

    try {
      await dispatch(deleteProductReview({ id: activeReviewData.id })).unwrap();

      toast.success("คุณลบรีวิวเรียบร้อยแล้ว");

      setIsViewReviewModalOpen(false);

      onRefresh();
    } catch (err) {
      console.error("Delete review error:", err);
      toast.error("ไม่สามารถลบรีวิวได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const closeWriteModal = () => {
    setIsReviewModalOpen(false);
    resetReviewForm();
  };

  const closeViewModal = () => {
    setIsViewReviewModalOpen(false);
  };

  const closeEditModal = () => {
    setIsEditReviewModalOpen(false);
    resetReviewForm();
  };

  const closeSelectModal = () => {
    setIsSelectModalOpen(false);
    setOrderForReview(null);
    setLocalSelectedItemId(null);
  };

  const resetReviewForm = () => {
    setReviewScore(0);
    setMessage("");
    setSelectedItem(null);
  };

  return {
    isReviewModalOpen,
    isViewReviewModalOpen,
    isEditReviewModalOpen,
    isSelectModalOpen,
    isBlocking,

    reviewScore,
    message,

    selectedItem,
    activeReviewData,

    orderForReview,
    localSelectedItemId,
    selectModalMode,

    setReviewScore,
    setMessage,
    setLocalSelectedItemId,

    launchReviewModalForItem,
    handleReviewSubmit,
    handleOpenViewReview,
    handleEditReviewSubmit,
    handleDeleteReview,
    handleConfirmProductSelection,
    handleSwitchToEditReview,

    closeWriteModal,
    closeViewModal,
    closeEditModal,
    closeSelectModal,

    resetReviewForm,
    setOrderForReview,

    setIsSelectModalOpen,
    setSelectModalMode,
  };
};
