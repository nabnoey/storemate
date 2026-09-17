export interface RefundItem {
  refundNo: string;
  receiverName: string;
  orderNo: string;
  total: number;
  reason: string;
  requestedAt: string;
  status: RefundType;
}

export interface RefundsResponse {
  refunds: RefundItem[];
  pendingCount: number;
  page: number;
  size: number;
  total: number;
}

export type RefundType = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | null;
