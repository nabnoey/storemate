import { Icon } from "@iconify/react";

interface ViewReviewModalProps {
  open: boolean;
  review: any;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ViewReviewModal = ({
  open,
  review,
  onClose,
  onEdit,
  onDelete,
}: ViewReviewModalProps) => {
  if (!open || !review) return null;

  return (
    <div
      data-test="modal-view-review"
      className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] p-4 backdrop-blur-sm"
    >
      <div className="w-full max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col sm:max-w-xl overflow-hidden relative">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-6 border-b border-gray-100 flex-shrink-0 bg-white">
          <button
            type="button"
            data-test="btn-close-view-review-mobile"
            onClick={onClose}
            className="sm:hidden text-gray-700 p-1 -ml-1 hover:bg-gray-100 rounded-full transition"
          >
            <Icon icon="material-symbols:arrow-back" className="w-6 h-6" />
          </button>

          <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900">
            รีวิว
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col bg-white">
          <div className="flex items-start gap-4 mb-6">
            <img
              src={review.imageUrl || ""}
              alt=""
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg border border-gray-100"
            />

            <div className="flex-1 flex justify-between items-start">
              <h3 className="font-semibold text-[14px] sm:text-[15px] text-gray-900 leading-snug pr-2">
                {review.productName}
              </h3>

              <div className="hidden sm:flex gap-2 flex-shrink-0">
                <button
                  type="button"
                  data-test="btn-delete-review-desktop"
                  onClick={onDelete}
                  className="cursor-pointer px-4 py-1.5 border border-red-500 text-red-500 rounded-md text-[13px] font-medium hover:bg-red-50 transition"
                >
                  ลบ
                </button>

                <button
                  type="button"
                  data-test="btn-edit-review-desktop"
                  onClick={onEdit}
                  className="cursor-pointer px-4 py-1.5 border border-[#2A4494] text-[#2A4494] rounded-md text-[13px] font-medium hover:bg-blue-50 transition"
                >
                  แก้ไข
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium text-[14px] sm:text-[15px] text-gray-900">
                  {review.reviewerName}
                </p>

                <p className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5">
                  {review.createdAt}
                </p>
              </div>

              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    icon="material-symbols:star-rounded"
                    className={`w-5 h-5 ${
                      star <= review.reviewScore
                        ? "text-[#facc15]"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p
              data-test="text-view-review-message"
              className="text-gray-800 text-[14px] leading-relaxed break-words bg-white sm:bg-transparent"
            >
              {review.message || "ไม่มีรายละเอียดความคิดเห็น"}
            </p>
          </div>
        </div>

        <div className="p-4 sm:px-6 sm:py-4 border-t border-gray-100 flex gap-3 justify-end bg-white flex-shrink-0">
          <div className="flex gap-3 w-full sm:hidden">
            <button
              type="button"
              data-test="btn-edit-review-mobile"
              onClick={onEdit}
              className="cursor-pointer flex-1 py-2.5 border border-[#2A4494] text-[#2A4494] font-medium rounded-lg text-[15px] hover:bg-blue-50 transition"
            >
              แก้ไข
            </button>

            <button
              type="button"
              data-test="btn-delete-review-mobile"
              onClick={onDelete}
              className="cursor-pointer flex-1 py-2.5 border border-red-500 text-red-500 font-medium rounded-lg text-[15px] hover:bg-red-50 transition"
            >
              ลบ
            </button>
          </div>

          <button
            type="button"
            data-test="btn-close-view-review-desktop"
            onClick={onClose}
            className="cursor-pointer hidden sm:block px-8 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-[15px] transition"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewReviewModal;
