import WriteReviewModal from "./WriteReviewModal";
import ViewReviewModal from "./ViewReviewModal";
import EditReviewModal from "./EditReviewModal";

import type { useReview } from "../../../hooks/useReview";

interface ReviewManagerProps {
  review: ReturnType<typeof useReview>;
}

const ReviewManager = ({ review }: ReviewManagerProps) => {
  return (
    <>
      <WriteReviewModal
        open={review.isReviewModalOpen}
        selectedItem={review.selectedItem}
        reviewScore={review.reviewScore}
        message={review.message}
        onScoreChange={review.setReviewScore}
        onMessageChange={review.setMessage}
        onSubmit={review.handleReviewSubmit}
        onClose={review.closeWriteModal}
      />

      <ViewReviewModal
        open={review.isViewReviewModalOpen}
        review={review.activeReviewData}
        onClose={review.closeViewModal}
        onEdit={review.handleSwitchToEditReview}
        onDelete={review.handleDeleteReview}
      />

      <EditReviewModal
        open={review.isEditReviewModalOpen}
        review={review.activeReviewData}
        reviewScore={review.reviewScore}
        message={review.message}
        onScoreChange={review.setReviewScore}
        onMessageChange={review.setMessage}
        onSubmit={review.handleEditReviewSubmit}
        onClose={review.closeEditModal}
      />
    </>
  );
};

export default ReviewManager;
