import { useEffect, useMemo, useState } from "react";
import Skeleton from "@mui/material/Skeleton";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  fetchRefunds,
  fetchRefundDetail,
  approveRefund,
  rejectRefund,
  clearSelectedRefund,
} from "../../redux/moderator/refundReducer";
import HeaderAdmin from "../../components/admin/HeaderAdmin";
import { toast } from "react-hot-toast";
import OwnerSkeletons from "../../components/loading/OwnerSkeletons";

// MANAGE ในนี้คือ"รายการที่ต้องเข้าไปจัดการ" เช่น กดอนุมัติคำขอ หรือปฎิเสธ
// จริงๆใน BE ไม่มีแต่ที่เพิ่มมาเพราะเอาไว้จำกัดการแสดงข้อความในคอลัมน์ การดำเนินการ
type ModalType = "VIEW" | "MANAGE" | null;

const RefundPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = searchParams.get("page");
  const initialPage = pageParam !== null ? Number(pageParam) + 1 : 1;

  const [currentPage, setCurrentPage] = useState(initialPage);

  const pageSize = 6;
  const statusFilter = searchParams.get("status") || "ALL";
  const keywordParam = searchParams.get("keyword") || "";

  const [keywordInput, setKeywordInput] = useState(keywordParam);
  const { refunds, total, pendingCount, selectedRefund, isLoading } =
    useSelector((state: RootState) => state.refunds);
  const { token } = useSelector((state: RootState) => state.auth);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [targetRefundNo, setTargetRefundNo] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const statusOptions = [
    { value: "ALL", label: "สถานะทั้งหมด" },
    { value: "APPROVED", label: "อนุมัติ" },
    { value: "PENDING", label: "รอดำเนินการ" },
    { value: "REJECTED", label: "ปฏิเสธ" },
  ];
  const selectedStatus =
    statusOptions.find((item) => item.value === statusFilter) ??
    statusOptions[0];

  useEffect(() => {
    setKeywordInput(keywordParam);
  }, [keywordParam]);

  useEffect(() => {
    if (!token) return;

    dispatch(
      fetchRefunds({
        page: currentPage - 1,
        size: pageSize,
        keyword: keywordParam,
        status: statusFilter,
      }),
    );

    const params: Record<string, string> = {
      page: String(currentPage - 1),
      size: String(pageSize),
      status: statusFilter,
    };

    if (keywordParam) {
      params.keyword = keywordParam;
    }

    setSearchParams(params);
  }, [
    dispatch,
    token,
    currentPage,
    keywordParam,
    statusFilter,
    setSearchParams,
  ]);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "null") return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
  };

  const handleOpenModal = async (
    type: ModalType,
    refundNo: string | null,
    orderNo: string,
  ) => {
    const identifier = refundNo || orderNo;
    setTargetRefundNo(identifier);
    setAlertError(null);
    setActiveModal(type);
    dispatch(fetchRefundDetail(identifier));
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setTargetRefundNo(null);
    setAlertError(null);
    dispatch(clearSelectedRefund());
  };

  const handleAction = async (actionType: "APPROVED" | "REJECTED") => {
    if (!targetRefundNo || !activeModal) return;

    try {
      setAlertError(null);

      if (actionType === "APPROVED") {
        await dispatch(approveRefund(targetRefundNo)).unwrap();
      } else if (actionType === "REJECTED") {
        await dispatch(rejectRefund(targetRefundNo)).unwrap();
      }

      toast.dismiss();
      toast.success("อัปเดตสถานะคำขอคืนเงินเรียบร้อยแล้ว");

      handleCloseModal();

      dispatch(
        fetchRefunds({
          page: currentPage - 1,
          size: pageSize,
          keyword: keywordParam,
          status: statusFilter,
        }),
      );
    } catch (err: any) {
      const errorMessage = "ขออภัยเกิดข้อผิดพลาดในระบบ";

      setAlertError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total]);

  const maxVisiblePages = 5;

  const getVisiblePages = () => {
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let end = start + maxVisiblePages - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="min-h-screen bg-white flex flex-col items-start text-left w-full font-['Anuphan']">
      <div className="w-full flex flex-col items-start print:hidden">
        <HeaderAdmin
          title="จัดการคำขอคืนเงิน"
          subtitle="ตรวจสอบและจัดการรายการการคำขอคืนเงิน"
        />

        <div className="p-6 w-full text-[#374151] max-w-7xl mx-auto flex flex-col flex-1">
          <main className="bg-[#FCFCFC] rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col flex-1 w-full">
            <div className="flex items-center gap-2 mb-5">
              <div className="px-4 py-2 border border-black/10 text-[#0A0A0A] rounded-lg text-xs font-medium bg-white">
                ทั้งหมด: <span className="font-semibold">{total}</span>
              </div>
              <div className="px-4 py-2 bg-[#FEFCE8] border border-black/10 text-[#0A0A0A] rounded-lg text-xs font-medium">
                รอดำเนินการ:{" "}
                <span className="font-semibold">{pendingCount}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm max-w-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Search */}
                <div className="relative w-full sm:w-[400px]">
                  <Icon
                    icon="lucide:search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                  />

                  <input
                    type="text"
                    placeholder="ค้นหาด้วยชื่อ, หมายเลขคำสั่งซื้อ หรือ หมายเลขคำขอ"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const params = new URLSearchParams(
                          searchParams.toString(),
                        );

                        params.set("status", statusFilter);

                        if (keywordInput.trim()) {
                          params.set("keyword", keywordInput.trim());
                        } else {
                          params.delete("keyword");
                        }

                        setCurrentPage(1);
                        setSearchParams(params);
                      }
                    }}
                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-600"
                  />

                  {keywordInput && (
                    <button
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams(
                          searchParams.toString(),
                        );

                        params.delete("keyword");

                        setKeywordInput("");
                        setCurrentPage(1);
                        setSearchParams(params);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Icon icon="lucide:x" className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter */}
                <div className="relative w-[190px]">
                  <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-[#F3F4F6] px-4 py-2.5 shadow-sm hover:border-blue-400 transition"
                  >
                    <span>{selectedStatus.label}</span>

                    <Icon
                      icon="lucide:chevron-down"
                      className={`transition-transform duration-300 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute z-50 mt-2 w-full origin-top rounded-lg bg-white shadow-xl border transition-all duration-300 overflow-hidden ${
                      open
                        ? "opacity-100 scale-100 translate-y-0"
                        : "pointer-events-none opacity-0 scale-95 -translate-y-2"
                    }`}
                  >
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setOpen(false);

                          const params = new URLSearchParams(
                            searchParams.toString(),
                          );

                          params.set("status", option.value);

                          if (keywordParam) {
                            params.set("keyword", keywordParam);
                          }

                          setCurrentPage(1);
                          setSearchParams(params);
                        }}
                        className={`w-full px-4 py-2.5 text-left transition-colors hover:bg-blue-50 ${
                          statusFilter === option.value
                            ? "text-blue-600 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto flex flex-col items-start rounded-lg bg-white px-[6px] py-3">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-black text-black text-[16px] font-normal">
                    <th className="py-3 px-1 font-normal">หมายเลขคำขอ</th>
                    <th className="py-3 px-1 font-normal w-[140px] text-center">
                      ชื่อลูกค้า
                    </th>
                    <th className="py-3 px-2 w-[140px] font-normal">
                      หมายเลขคำสั่งซื้อ
                    </th>
                    <th className="py-3 px-2 font-normal text-center">
                      จำนวนเงิน
                    </th>
                    <th className="py-3 px-1 font-normal text-center">
                      เหตุผล
                    </th>
                    <th className="py-3 px-1 font-normal">วันที่ยื่นคำขอ</th>
                    <th className="py-3 px-1 font-normal">สถานะ</th>
                    <th className="py-3 px-1 font-normal text-center">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 text-gray-600">
                  {isLoading ? (
                    <OwnerSkeletons
                      type="mod-table"
                      rows={pageSize}
                      columns={8}
                    />
                  ) : refunds.length === 0 ? (
                    <tr>
                      <td
                        data-test="row-empty"
                        colSpan={8}
                        className="text-center py-16 text-gray-400"
                      >
                        ไม่พบรายการคำขอคืนเงินที่ค้นหา
                      </td>
                    </tr>
                  ) : (
                    refunds.map((row) => (
                      <tr
                        data-test={`row-refund-${row.orderNo}`}
                        key={row.orderNo}
                        onClick={() => {
                          if (row.status !== "PENDING") {
                            handleOpenModal("VIEW", row.refundNo, row.orderNo);
                          }
                        }}
                        className={`transition-colors ${
                          row.status !== "PENDING"
                            ? "cursor-pointer hover:bg-gray-50/50"
                            : "hover:bg-gray-50/50"
                        }`}
                      >
                        <td
                          data-test="row-open-refundNo"
                          className="px-2 py-4 text-[#4B5563] text-[14px] break-all max-w-[180px] cursor-pointer"
                        >
                          {row.refundNo || "ไม่มีข้อมูลหมายเลข"}
                        </td>
                        <td className="px-1 py-4 w-[140px] text-[#4B5563] text-[14px] font-medium min-w-[100px] whitespace-nowrap cursor-pointer">
                          {row.receiverName}
                        </td>
                        <td className="px-2 py-4 w-[140px] text-[#4B5563] text-[14px] break-all max-w-[180px] cursor-pointer">
                          {row.orderNo}
                        </td>
                        <td className="px-1 py-4 text-center text-[#4B5563] text-[14px] font-medium cursor-pointer">
                          ฿{row.total.toLocaleString()}
                        </td>
                        <td className="px-2 py-4 text-[#4B5563] item-center text-[14px] break-all max-w-[180px] cursor-pointer">
                          {row.reason || "-"}
                        </td>
                        <td className="px-1 py-4 text-[#4B5563] text-[14px] cursor-pointer">
                          {row.requestedAt !== "null"
                            ? formatDate(row.requestedAt)
                            : "-"}
                        </td>
                        <td className="px-1 py-4 cursor-pointer">
                          {row.status === "APPROVED" && (
                            <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-medium bg-[#10b981] text-white rounded-full whitespace-nowrap">
                              อนุมัติ
                            </span>
                          )}
                          {row.status === "PENDING" && (
                            <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-medium bg-[#D4AF37] text-white rounded-full whitespace-nowrap">
                              รอดำเนินการ
                            </span>
                          )}
                          {row.status === "REJECTED" && (
                            <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-medium bg-[#ef4444] text-white rounded-full whitespace-nowrap">
                              ปฏิเสธ
                            </span>
                          )}
                        </td>

                        <td className="px-1 py-4">
                          <div className="flex items-center justify-center gap-3">
                            {row.status === "PENDING" ? (
                              <button
                                data-test="btn-open-refundNo"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenModal(
                                    "MANAGE",
                                    row.refundNo,
                                    row.orderNo,
                                  );
                                }}
                                className="text-blue-500 hover:text-blue-600 transition-colors cursor-pointer text-sm font-medium"
                              >
                                จัดการ
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm"></span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t border-gray-100 text-sm">
              <button
                data-test="btn-prev-page"
                type="button"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className={`cursor-pointer border border-gray-300 rounded-md px-4 py-1.5 font-medium transition-colors ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed border-gray-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                ก่อนหน้า
              </button>

              <div className="flex items-center gap-1">
                {visiblePages.map((page) => (
                  <button
                    data-test="btn-current-page"
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`cursor-pointer w-8 h-8 rounded-md flex items-center justify-center font-medium transition-colors ${
                      page === currentPage
                        ? "text-blue-500 font-bold"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                data-test="btn-next-page"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => handlePageChange(currentPage + 1)}
                className={`cursor-pointer border border-gray-300 rounded-md px-4 py-1.5 font-medium transition-colors ${
                  currentPage === totalPages || totalPages === 0
                    ? "text-gray-300 cursor-not-allowed border-gray-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                ถัดไป
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Modal Section */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-[420px] w-full rounded-2xl shadow-xl relative flex flex-col border border-gray-100">
            <h2 className="text-base font-bold text-black mb-0.5">
              รายละเอียดคำขอคืนเงิน
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              ข้อมูลรายละเอียดของคำขอคืนเงิน
            </p>

            {alertError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 font-medium">
                <Icon
                  icon="lucide:alert-circle"
                  className="w-4 h-4 flex-shrink-0"
                />
                <span>{alertError}</span>
              </div>
            )}

            {!selectedRefund ? (
              <div className="w-full flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index}>
                      <Skeleton
                        variant="text"
                        animation="wave"
                        width={90}
                        height={18}
                      />

                      <Skeleton
                        variant="text"
                        animation="wave"
                        width={140}
                        height={24}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <Skeleton
                    variant="text"
                    animation="wave"
                    width={100}
                    height={18}
                  />

                  <Skeleton
                    variant="text"
                    animation="wave"
                    width="100%"
                    height={24}
                  />

                  <Skeleton
                    variant="text"
                    animation="wave"
                    width="80%"
                    height={24}
                  />
                </div>

                <div className="flex justify-between items-end border-t border-gray-50 pt-3">
                  <div>
                    <Skeleton
                      variant="text"
                      animation="wave"
                      width={100}
                      height={18}
                    />
                    <Skeleton
                      variant="text"
                      animation="wave"
                      width={100}
                      height={24}
                    />
                  </div>

                  <div>
                    <Skeleton
                      variant="rounded"
                      animation="wave"
                      width={80}
                      height={28}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-5">
                  <Skeleton
                    variant="rounded"
                    animation="wave"
                    width={70}
                    height={40}
                  />

                  <Skeleton
                    variant="rounded"
                    animation="wave"
                    width={70}
                    height={40}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <span className="text-gray-400 block mb-1">
                      หมายเลขคำขอ
                    </span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {selectedRefund.refundNo || "ไม่มีข้อมูลหมายเลข"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">
                      หมายเลขคำสั่งซื้อ
                    </span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {selectedRefund.orderNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">ชื่อลูกค้า</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {selectedRefund.receiverName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">จำนวนเงิน</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      ฿{selectedRefund.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block mb-1">
                    เหตุผลการคืนเงิน
                  </span>
                  <span className="font-semibold text-gray-800 text-sm block leading-relaxed">
                    {selectedRefund.reason || "ไม่ระบุข้อมูลเหตุผล"}
                  </span>
                </div>

                <div className="flex justify-between items-end mt-1 border-t border-gray-50 pt-3">
                  <div>
                    <span className="text-gray-400 block mb-1">
                      วันที่ยื่นคำขอ
                    </span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {selectedRefund.requestedAt !== "null"
                        ? formatDate(selectedRefund.requestedAt)
                        : "-"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block mb-1.5">
                      สถานะปัจจุบัน
                    </span>
                    {selectedRefund?.status === "APPROVED" && (
                      <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-medium bg-[#10b981] text-white rounded-full whitespace-nowrap">
                        อนุมัติ
                      </span>
                    )}
                    {selectedRefund?.status === "PENDING" && (
                      <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-medium bg-[#D4AF37] text-white rounded-full whitespace-nowrap">
                        รอดำเนินการ
                      </span>
                    )}
                    {selectedRefund?.status === "REJECTED" && (
                      <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-medium bg-[#ef4444] text-white rounded-full whitespace-nowrap">
                        ปฏิเสธ
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 w-full mt-5 justify-end">
                  {activeModal === "MANAGE" && (
                    <>
                      <button
                        data-test="btn-approved"
                        type="button"
                        onClick={() => handleAction("APPROVED")}
                        className="px-4 py-2 bg-green-500 text-white rounded-md font-medium cursor-pointer text-[16px] transition-colors"
                      >
                        อนุมัติ
                      </button>
                      <button
                        type="button"
                        data-test="btn-rejected"
                        onClick={() => handleAction("REJECTED")}
                        className="px-4 py-2 bg-white border border-red-700 text-black rounded-md font-medium cursor-pointer text-[16px] transition-colors"
                      >
                        ปฏิเสธ
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    data-test="btn-close"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-200 text-gray-600 bg-white rounded-md font-medium cursor-pointer text-[16px]"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundPage;
