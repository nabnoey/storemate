import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import HeaderAdmin from "../../components/admin/HeaderAdmin";
import { Pagination } from "../../components/admin/Pagination";
import { format } from "date-fns";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  fetchAllOrders,
  shippingOrder,
} from "../../redux/moderator/ModeratorReducer";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  TIME_FILTER_MAP,
  type OrderMod,
} from "../../types/moderator/ordersMod";
import { InvoicePrint } from "../../components/admin/InvoicePrint";
import { toast } from "react-hot-toast";
import { CiCalendar } from "react-icons/ci";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useReactToPrint } from "react-to-print";
import OwnerSkeletons from "../../components/loading/OwnerSkeletons";

const formatDateTime = (isoString: string) => {
  if (!isoString) return { dateStr: "-", timeStr: "-" };
  const date = new Date(isoString);
  // ใช้ date-fns จัดรูปแบบวัน/เดือน และชั่วโมง.นาที
  const dateStr = `${format(date, "d/M/")}${date.getFullYear() + 543}`;
  const timeStr = `${format(date, "HH.mm")} น.`;
  return { dateStr, timeStr };
};
const PAGE_SIZE = 10;

function Orders() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");

  // ✨ ระบบช่วงวันที่ (Date Range)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

  const [timeFilter, setTimeFilter] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const [printData, setPrintData] = useState<OrderMod[]>([]);

  //ดึงข้อมูลจาก URL (ถ้า URL เป็น 0 ให้ UI มองเป็น 1)
  const pageParam = searchParams.get("page");
  const initialPage = pageParam !== null ? Number(pageParam) + 1 : 1;
  // เก็บสถานะหน้าปัจจุบัน
  const [currentPage, setCurrentPage] = useState(initialPage);
  const { orders, totalPages, loading } = useSelector(
    (state: RootState) => state.moderator,
  );

  const periodValue =
    TIME_FILTER_MAP[timeFilter as keyof typeof TIME_FILTER_MAP];
  const formattedStartDate = filterStartDate
    ? format(filterStartDate, "yyyy-MM-dd")
    : undefined;

  const formattedEndDate = filterEndDate
    ? format(filterEndDate, "yyyy-MM-dd")
    : undefined;

  useEffect(() => {
    dispatch(
      fetchAllOrders({
        page: currentPage - 1,
        size: PAGE_SIZE,
        keyword: submittedSearchTerm || undefined,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        period: periodValue,
      }),
    );
  }, [
    dispatch,
    currentPage,
    submittedSearchTerm,
    formattedStartDate,
    formattedEndDate,
    periodValue,
  ]);

  useEffect(() => {
    const params: Record<string, string> = {
      page: String(currentPage - 1),
      size: String(PAGE_SIZE),
    };

    if (submittedSearchTerm) params.keyword = submittedSearchTerm;
    if (formattedStartDate) params.startDate = formattedStartDate;
    if (formattedEndDate) params.endDate = formattedEndDate;
    if (periodValue) params.period = periodValue;

    setSearchParams(params);
  }, [
    currentPage,
    submittedSearchTerm,
    formattedStartDate,
    formattedEndDate,
    periodValue,
    setSearchParams,
  ]);

  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: "ใบปะหน้าพัสดุ",
  });

  useEffect(() => {
    if (printData.length > 0) {
      const timer = setTimeout(() => {
        reactToPrintFn();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [printData, reactToPrintFn]);

  const handleSelectOrder = (orderNo: string) => {
    setSelectedOrders((prevSelectedOrders) =>
      prevSelectedOrders.includes(orderNo)
        ? prevSelectedOrders.filter((id) => id !== orderNo)
        : [...prevSelectedOrders, orderNo],
    );
  };

  const handleEnterPrintMode = () => {
    setSelectedOrders([]);
    setIsPrintMode(true);
  };

  const handleCancelPrintMode = () => {
    setSelectedOrders([]);
    setIsPrintMode(false);
  };

  const handleConfirmPrint = async () => {
    //selectedData รายการคำสั่งซื้อที่ผู้ใช้เลือกไว้
    const selectedData = orders.filter((order) =>
      selectedOrders.includes(order.orderNo),
    );
    if (selectedData.length === 0) return;

    if (selectedData.some((order) => order.status !== "PROCESSING")) {
      toast.error(
        "สามารถพิมพ์ใบปะหน้าได้เฉพาะคำสั่งซื้อสถานะ 'ที่ต้องจัดส่ง' เท่านั้น",
      );
      return;
    }

    try {
      const orderIds = selectedData.map((order) => order.id);
      const printedLabels = await dispatch(shippingOrder(orderIds)).unwrap();
      setPrintData(printedLabels);
    } catch {
      toast.error("ไม่สามารถอัปเดตสถานะการพิมพ์ใบปะหน้าได้");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-start text-left w-full">
      <div className="w-full flex flex-col items-start print:hidden">
        <HeaderAdmin
          title="จัดการคำสั่งซื้อ"
          subtitle="ตรวจสอบและจัดการรายการคำสั่งซื้อทั้งหมดในระบบ"
        />

        <div className="p-6 w-full text-[#374151] max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-3">
                {!isPrintMode ? (
                  <button
                    type="button"
                    onClick={handleEnterPrintMode}
                    className="h-[40px] px-4 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <span>🖨️</span>
                    ปริ้นใบปะหน้า
                  </button>
                ) : (
                  <>
                    <div className="h-[40px] cursor-pointer px-4 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                      <span>🖨️</span>
                      ปริ้นใบปะหน้าที่เลือก ({selectedOrders.length})
                    </div>
                    <button
                      type="button"
                      onClick={handleConfirmPrint}
                      disabled={selectedOrders.length === 0}
                      className="h-[40px] w-[100px] bg-blue-700 cursor-pointer hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                      ยืนยัน
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelPrintMode}
                      className="h-[40px] w-[100px] cursor-pointer rounded-lg border border-black text-gray-700 text-sm font-semibold font-['Anuphan'] hover:bg-gray-50 transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="ค้นหาโดย ชื่อ, เบอร์โทร (กด Enter)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSubmittedSearchTerm(searchTerm);
                        setCurrentPage(1);
                      }
                    }}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-64"
                  />

                  <div
                    className={`
                    relative text-sm font-['Anuphan'] cursor-pointer
                    ${startDate && endDate ? "w-full" : "w-[140px]"}
                  `}
                  >
                    <input
                      type="text"
                      data-test="select-date"
                      readOnly
                      placeholder="เลือกช่วงเวลา"
                      value={
                        startDate && endDate
                          ? `${format(startDate, "dd/MM/yyyy")} - ${format(
                              endDate,
                              "dd/MM/yyyy",
                            )}`
                          : ""
                      }
                      onClick={() => {
                        setIsDatePickerOpen(!isDatePickerOpen); // 🛠️ แก้ไขให้กดเปิด-ปิดได้
                      }}
                      className={`
                    relative border border-gray-300 rounded px-3 py-2 text-sm 
                    focus:outline-none focus:ring-1 focus:ring-blue-500 
                    ${startDate && endDate ? "w-full" : "w-[140px]"}
                    text-gray-700 bg-white cursor-pointer
                  `}
                    />

                    <CiCalendar
                      className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-500
                      pointer-events-none
                    "
                      size={18}
                    />

                    {isDatePickerOpen && (
                      <div
                        className="
                        absolute left-0 mt-2 z-50
                        bg-white border border-gray-200
                        shadow-xl rounded-2xl p-4
                      "
                      >
                        <DatePicker
                          selected={startDate}
                          onChange={(dates) => {
                            const [start, end] = dates as [
                              Date | null,
                              Date | null,
                            ];

                            setStartDate(start);
                            setEndDate(end);
                          }}
                          startDate={startDate}
                          endDate={endDate}
                          selectsRange
                          inline
                          monthsShown={2}
                          minDate={startDate || undefined}
                        />

                        <div className="flex justify-end gap-3 mt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setStartDate(null);
                              setEndDate(null);
                              setCurrentPage(1); // รีเซ็ตหน้ากลับไปหน้าแรกด้วย
                            }}
                            className="px-4 py-2 border rounded-lg cursor-pointer"
                          >
                            ล้างค่า
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setFilterStartDate(startDate);
                              setFilterEndDate(endDate);

                              setIsDatePickerOpen(false);
                              setCurrentPage(1); // ค้นหาปุ๊บ เริ่มที่หน้าแรกเสมอ
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
                          >
                            บันทึก
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex rounded border border-gray-200 overflow-hidden text-xs font-medium self-end md:self-auto ">
                  {["วันนี้", "สัปดาห์นี้", "เดือนนี้"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setTimeFilter(tab);
                        setCurrentPage(1); // เปลี่ยน Tab ก็ควรกลับไปหน้าแรก
                      }}
                      className={`px-4 py-2 border-r last:border-r-0 transition-colors cursor-pointer ${
                        timeFilter === tab
                          ? "bg-gray-100 text-black"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-800 mb-4">
              คำสั่งซื้อ
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-[#9CA3AF] text-[13px] font-medium">
                    <th className="py-3 text-gray-600 text-base font-normal font-['Anuphan']">
                      เลขที่คำสั่งซื้อ
                    </th>
                    <th className="py-3 text-gray-600 text-base font-normal font-['Anuphan']">
                      ชื่อผู้สั่งซื้อ
                    </th>
                    <th className="py-3 text-gray-600 text-base font-normal font-['Anuphan']">
                      เบอร์โทร
                    </th>
                    <th className="py-3 text-gray-600 text-base font-normal font-['Anuphan']">
                      วันที่สั่งซื้อ
                    </th>
                    <th className="py-3 text-gray-600 text-base font-normal font-['Anuphan']">
                      ยอดรวม
                    </th>
                    <th className="py-3 text-gray-600 text-base font-normal font-['Anuphan']">
                      สั่งจาก
                    </th>
                    <th className="py-3 text-gray-600 text-base font-normal font-['Anuphan']">
                      สถานะคำสั่งซื้อ
                    </th>
                    <th className="py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading && orders.length === 0 ? (
                    <OwnerSkeletons
                      type="mod-table"
                      rows={PAGE_SIZE}
                      columns={7}
                    />
                  ) : orders.length > 0 ?  (
                    orders.map((order) => {
                      const { dateStr, timeStr } = formatDateTime(
                        order.createdAt || "",
                      );
                      const isSelected = selectedOrders.includes(
                        String(order.orderNo),
                      );

                      return (
                        <tr
                          key={order.id || order.orderNo}
                          className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                            isPrintMode && isSelected ? "bg-blue-50" : ""
                          }`}
                        >
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              {isPrintMode && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSelectOrder(order.orderNo)
                                  }
                                  className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? "bg-blue-700 border-blue-700"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {isSelected && (
                                    <span className="text-white text-[10px]">
                                      ✓
                                    </span>
                                  )}
                                </button>
                              )}
                              <span className="text-gray-600 font-medium">
                                {order.orderNo}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-2 text-gray-800 font-medium">
                            {order.recipientName}
                          </td>
                          <td className="py-4 px-2 text-gray-500">
                            {order.phone}
                          </td>

                          <td className="py-4 px-2 text-gray-500 text-xs leading-relaxed">
                            {dateStr}
                            <br />
                            <span className="text-gray-400">{timeStr}</span>
                          </td>
                          <td className="py-4 px-2 font-bold text-gray-800">
                            ฿{" "}
                            {(order.total || 0).toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-4 px-2 text-gray-500">
                            {order.shippingFrom || "website"}
                          </td>
                          <td className="py-4 px-2">
                            <span
                              className={`inline-flex items-center px-3 py-[4px] rounded-full text-[11px] font-medium whitespace-nowrap ${
                                STATUS_STYLES[order.status] ||
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {STATUS_LABELS[order.status] || order.status}
                            </span>
                          </td>
                          <td className="py-4 text-right text-xs space-x-3 pr-2">
                            {order.is_printed && (
                              <span className="text-[#60A5FA] text-xs font-medium">
                                printed
                              </span>
                            )}
                            {isPrintMode ? (
                              <button
                                type="button"
                                onClick={() => handleSelectOrder(order.orderNo)}
                                className="text-blue-600 hover:underline font-medium cursor-pointer"
                              ></button>
                            ) : (
                              <button
                                type="button"
                                data-test={`menagemate-order-${order.orderNo}`}
                                onClick={() =>
                                  navigate(
                                    `/orders-management/${order.orderNo}`,
                                  )
                                }
                                className="text-blue-600 hover:underline font-medium cursor-pointer"
                              >
                                จัดการ
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-gray-400 font-medium"
                      >
                        ไม่มีรายการคำสั่งซื้อในระบบ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <div className="hidden">
        <InvoicePrint ref={printRef} data={printData} />
      </div>
    </div>
  );
}

export default Orders;
