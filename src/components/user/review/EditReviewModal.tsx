import { Icon } from "@iconify/react";

interface EditReviewModalProps {
  open: boolean;
  review: any;
  reviewScore: number;
  message: string;
  onScoreChange: (score: number) => void;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const EditReviewModal = ({
  open,
  review,
  reviewScore,
  message,
  onScoreChange,
  onMessageChange,
  onSubmit,
  onClose,
}: EditReviewModalProps) => {
  if (!open || !review) return null;

  return (
    <div
      data-test="modal-edit-review"
      className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] p-4 backdrop-blur-sm"
    >
      <div className="w-full max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col sm:max-w-xl overflow-hidden relative">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-6 border-b border-gray-100 flex-shrink-0 bg-white">
          <button
            type="button"
            data-test="btn-close-edit-review-mobile"
            onClick={onClose}
            className="sm:hidden text-gray-700 p-1 -ml-1 hover:bg-gray-100 rounded-full transition"
          >
            <Icon icon="material-symbols:arrow-back" className="w-6 h-6" />
          </button>

          <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900">
            แก้ไขรีวิว
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6 bg-white">
          <div>
            <div className="flex items-start gap-4 mb-4">
              <img
                src={review.imageUrl || ""}
                alt=""
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg border border-gray-100"
              />

              <h3 className="font-semibold text-[14px] sm:text-[15px] text-gray-900 leading-snug">
                {review.productName}
              </h3>
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900 text-[14px] sm:text-[15px]">
                    {review.reviewerName}
                  </p>

                  <p className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5">
                    {review.createdAt}
                  </p>
                </div>

                <div className="flex gap-0.5 mt-1">
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

              <p className="text-gray-800 text-[14px] leading-relaxed break-words">
                {review.message || "ไม่มีรายละเอียดความคิดเห็น"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 sm:p-5 rounded-xl flex flex-col gap-5 border border-gray-100">
            <div>
              <p className="text-[14px] font-medium text-gray-800 mb-2">
                คะแนนความพึงพอใจ
              </p>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    data-test={`btn-star-edit-${star}`}
                    onClick={() => onScoreChange(star)}
                    className="focus:outline-none cursor-pointer transform active:scale-90 transition-transform"
                  >
                    <Icon
                      icon="material-symbols:star-rounded"
                      className={`w-10 h-10 transition-colors ${
                        star <= reviewScore ? "text-[#facc15]" : "text-gray-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[14px] font-medium text-gray-800 mb-2">
                รายละเอียด
              </p>

              <textarea
                rows={4}
                value={message}
                data-test="input-edit-review-message"
                onChange={(e) => onMessageChange(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-[14px] outline-none focus:border-[#2A4494] bg-white resize-none shadow-sm transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:px-6 sm:py-4 border-t border-gray-100 flex gap-3 sm:justify-end bg-white flex-shrink-0">
          <button
            type="button"
            data-test="btn-submit-edit-review"
            onClick={onSubmit}
            className="cursor-pointer flex-1 sm:flex-none px-8 py-2.5 bg-[#2A4494] hover:bg-blue-800 text-white font-medium rounded-lg text-[15px] transition"
          >
            ส่ง
          </button>

          <button
            type="button"
            data-test="btn-cancel-edit-review"
            onClick={onClose}
            className="cursor-pointer flex-1 sm:flex-none px-8 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-[15px] transition bg-white"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditReviewModal;
