import { useState, useEffect, useRef } from "react";
import { Download, Upload, Trash2, FileText, X } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Loading from "../../components/loading/Loading";
import HeaderAdmin from "../../components/admin/HeaderAdmin";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import { getSalesAnalytics, importSalesData } from "../../redux/owner/ownerReducer";

interface RegionTableRow {
  region: string;
  orders: number;
  revenue: number;
  customers: number;
  orderPercent: number;
  revenuePercent: number;
  customerPercent: number;
}

export default function Analytic() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = Array.isArray(user?.roles)
    ? user.roles.some(
        (role: any) => role === "ADMIN" || role?.roleName === "ADMIN",
      )
    : false;

  const dispatch = useDispatch<AppDispatch>();
  const { salesData, loading } = useSelector((state: RootState) => state.owner);
  
  const [filter, setFilter] = useState<"today" | "week" | "month">("today");

  // Import Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(getSalesAnalytics());
  }, [dispatch]);

  if (loading) {
    return <Loading />;
  }

  // --- Drag & Drop handlers ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const simulateProgress = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      simulateProgress();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      simulateProgress();
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) {
      toast.error("กรุณาเลือกไฟล์ก่อนยืนยัน");
      return;
    }
    if (isUploading) {
      toast.error("กรุณารอให้อัพโหลดไฟล์เสร็จสิ้น");
      return;
    }

    const toastId = toast.loading("กำลังนำเข้าข้อมูล...");
    setIsUploading(true);
    try {
      await dispatch(importSalesData(selectedFile)).unwrap();
      toast.success("นำเข้าข้อมูลสำเร็จ", { id: toastId });
      setIsModalOpen(false);
      handleRemoveFile();
      dispatch(getSalesAnalytics());
    } catch (error: any) {
      console.error("Error importing sales data:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาดในการนำเข้าข้อมูล";
      toast.error(errorMessage, { id: toastId });
      handleRemoveFile();
    }
  };

  const handleCancelImport = () => {
    setIsModalOpen(false);
    handleRemoveFile();
  };

  // --- Parse API Response ---
  const channelIncomeList = salesData?.orderChannelIncome || [];
  const channels = [...channelIncomeList]
    .sort((a: any, b: any) => Number(b.percentage ?? 0) - Number(a.percentage ?? 0))
    .map((item: any, idx: number) => {
      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
      return {
        name: item.orderChannel || "ไม่ระบุช่องทาง",
        value: Number(item.percentage ?? 0),
        color: colors[idx % colors.length],
      };
    });

  const apiRegionalOrders = salesData?.regionalOrders || [];
  const apiRegionalRevenue = salesData?.regionalRevenue || [];
  const apiRegionalUsers = salesData?.regionalUsers || [];

  const totalOrdersSum = apiRegionalOrders.reduce((sum: number, r: any) => sum + Number(r.totalOrder ?? 0), 0);
  const totalRevenueSum = apiRegionalOrders.reduce((sum: number, r: any) => sum + Number(r.totalRevenue ?? 0), 0);
  const totalCustomersSum = apiRegionalOrders.reduce((sum: number, r: any) => sum + Number(r.totalUser ?? 0), 0);

  const allGeographies = Array.from(
    new Set([
      ...apiRegionalOrders.map((r: any) => r.geography),
      ...apiRegionalRevenue.map((r: any) => r.geography),
      ...apiRegionalUsers.map((r: any) => r.geography),
    ])
  ).filter(Boolean) as string[];

  const parsedRegions: RegionTableRow[] = allGeographies.map((geography) => {
    const orderData = apiRegionalOrders.find((r: any) => r.geography === geography) || {};
    const revenueData = apiRegionalRevenue.find((r: any) => r.geography === geography) || {};
    const userData = apiRegionalUsers.find((r: any) => r.geography === geography) || {};

    const orders = Number(orderData.totalOrder ?? 0);
    const revenue = Number(orderData.totalRevenue ?? 0);
    const customers = Number(orderData.totalUser ?? 0);

    const orderPercent = totalOrdersSum > 0 ? (orders / totalOrdersSum) * 100 : 0;
    const revenuePercent = Number(revenueData.totalRevenuePercent ?? (totalRevenueSum > 0 ? (revenue / totalRevenueSum) * 100 : 0));
    const customerPercent = Number(userData.totalUserPercent ?? (totalCustomersSum > 0 ? (customers / totalCustomersSum) * 100 : 0));

    return {
      region: geography,
      orders,
      revenue,
      customers,
      orderPercent,
      revenuePercent,
      customerPercent,
    };
  });

  // Table defaults to sorting by revenue descending
  const orderedRegions = [...parsedRegions].sort((a, b) => b.revenue - a.revenue);

  const getRegionColor = (regionName: string) => {
    const mapping: { [key: string]: string } = {
      "ภาคตะวันออก": "#ef4444",
      "กรุงเทพและปริมณฑล": "#3b82f6",
      "ภาคใต้": "#1d4ed8",
      "ภาคเหนือ": "#eab308",
      "ภาคตะวันตก": "#8b5cf6",
      "ภาคตะวันออกเฉียงเหนือ": "#06b6d4",
      "ภาคกลาง": "#22c55e",
    };
    return mapping[regionName] || "#cbd5e1";
  };

  const ordersPieData = [...orderedRegions]
    .sort((a, b) => b.orderPercent - a.orderPercent)
    .map((r) => ({
      name: r.region,
      value: r.orderPercent,
      color: getRegionColor(r.region),
    }));

  const revenuePieData = [...orderedRegions]
    .sort((a, b) => b.revenuePercent - a.revenuePercent)
    .map((r) => ({
      name: r.region,
      value: r.revenuePercent,
      color: getRegionColor(r.region),
    }));

  const customersPieData = [...orderedRegions]
    .sort((a, b) => b.customerPercent - a.customerPercent)
    .map((r) => ({
      name: r.region,
      value: r.customerPercent,
      color: getRegionColor(r.region),
    }));

  const totalPriceVal = Number(salesData?.totalPrice ?? 0);
  const totalOrderVal = Number(salesData?.totalOrder ?? 0);

  return (
    <div className="flex flex-col bg-white min-h-screen text-black relative">
      {/* Title & Subtitle */}
      <HeaderAdmin 
        title="รายงานยอดขาย"
        subtitle="รายงานยอดขายและแนวโน้มการขายของคุณ"
      />

      <div className="p-8 flex flex-col gap-6">
        {/* KPI Summary Cards */}
        <div className="flex flex-wrap gap-6">
          {/* Card 1: ยอดขายรวม */}
          <div className="flex-1 min-w-[260px] max-w-[340px] bg-[#d2f4f1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col gap-2">
            <span className="text-[16px] font-semibold text-gray-800">ยอดขายรวม</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-gray-900">
                ฿ {totalPriceVal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Card 2: จำนวนคำสั่งซื้อ */}
          <div className="flex-1 min-w-[260px] max-w-[340px] bg-[#ffeed6] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col gap-2">
            <span className="text-[16px] font-semibold text-gray-800">จำนวนคำสั่งซื้อ</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-gray-900">
                {totalOrderVal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: นำเข้าข้อมูล (เฉพาะ Owner เท่านั้น) */}
        {isAdmin && (
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              นำเข้าข้อมูล
            </button>
          </div>
        )}

        {/* Row 1: Revenue Donut Chart & Regional Performance Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Channel Revenue Donut Card */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[420px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[18px] font-bold text-gray-800">รายได้</h3>
              <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50">
                <button
                  onClick={() => setFilter("today")}
                  className={`cursor-pointer px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    filter === "today"
                      ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  วันนี้
                </button>
                <button
                  onClick={() => setFilter("week")}
                  className={`cursor-pointer px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    filter === "week"
                      ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  สัปดาห์นี้
                </button>
                <button
                  onClick={() => setFilter("month")}
                  className={`cursor-pointer px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    filter === "month"
                      ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  เดือนนี้
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-[220px] relative">
              {channels.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Pie
                      data={channels}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {channels.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-gray-400 text-sm">ไม่มีข้อมูลช่องทางการขาย</span>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-4 px-2">
              {channels.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Performance Table Card */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[420px]">
            <div>
              <h3 className="text-[18px] font-bold text-gray-800 mb-6">ผลการขายตามพื้นที่</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                      <th className="pb-3 text-left">พื้นที่</th>
                      <th className="pb-3 text-right">คำสั่งซื้อ</th>
                      <th className="pb-3 text-right">รายได้</th>
                      <th className="pb-3 text-right">ลูกค้า</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orderedRegions.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 font-medium text-gray-800 text-left">{row.region}</td>
                        <td className="py-3.5 text-right font-medium text-gray-600">{row.orders.toLocaleString()}</td>
                        <td className="py-3.5 text-right font-bold text-gray-900">฿ {row.revenue.toLocaleString()}</td>
                        <td className="py-3.5 text-right font-medium text-gray-600">{row.customers.toLocaleString()}</td>
                      </tr>
                    ))}
                    {orderedRegions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400">
                          ไม่มีข้อมูลผลการขายตามพื้นที่
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Three Region Distribution Donut Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Distribution Chart 1: คำสั่งซื้อ (%) */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col items-center">
            <h4 className="text-[16px] font-bold text-gray-800 mb-6 text-center">คำสั่งซื้อ (%)</h4>
            <div className="w-full h-44 relative mb-6">
              {ordersPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Pie
                      data={ordersPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {ordersPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">ไม่มีข้อมูล</div>
              )}
            </div>
            <div className="w-full space-y-2.5 text-xs text-gray-600 px-2 mt-2">
              {ordersPieData.map((item) => {
                return (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-800">{item.value.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribution Chart 2: รายได้ (%) */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col items-center">
            <h4 className="text-[16px] font-bold text-gray-800 mb-6 text-center">รายได้ (%)</h4>
            <div className="w-full h-44 relative mb-6">
              {revenuePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Pie
                      data={revenuePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {revenuePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">ไม่มีข้อมูล</div>
              )}
            </div>
            <div className="w-full space-y-2.5 text-xs text-gray-600 px-2 mt-2">
              {revenuePieData.map((item) => {
                return (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-800">{item.value.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribution Chart 3: ลูกค้า (%) */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col items-center">
            <h4 className="text-[16px] font-bold text-gray-800 mb-6 text-center">ลูกค้า (%)</h4>
            <div className="w-full h-44 relative mb-6">
              {customersPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Pie
                      data={customersPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {customersPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">ไม่มีข้อมูล</div>
              )}
            </div>
            <div className="w-full space-y-2.5 text-xs text-gray-600 px-2 mt-2">
              {customersPieData.map((item) => {
                return (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-800">{item.value.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* --- File Import Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-[540px] w-full flex flex-col gap-6 relative border border-gray-100">
            {/* Close icon button */}
            <button
              onClick={handleCancelImport}
              className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Drag & Drop Zone */}
            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center gap-4 transition-all ${
                  dragActive
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200 hover:border-blue-400 hover:bg-gray-50/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                <div className="text-gray-500 hover:text-blue-500 transition-colors">
                  <Upload size={32} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[16px] font-semibold text-gray-700">ลากและวางไฟล์เพื่ออัพโหลด</span>
                  <span className="text-xs text-gray-400">xlsx , xls , csv up to 5 MB</span>
                </div>

                <span className="text-xs text-gray-400 font-medium">หรือ</span>

                <button
                  type="button"
                  onClick={handleChooseFileClick}
                  className="cursor-pointer bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold text-sm rounded-lg px-6 py-2.5 transition-all shadow-sm"
                >
                  เลือกไฟล์
                </button>
              </div>
            ) : (
              /* Upload Status/Preview Box */
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 bg-blue-50/40 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                    <div className="text-blue-500 p-2 bg-blue-100/60 rounded-lg">
                      <FileText size={24} />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <span className="text-sm font-semibold text-gray-700 truncate">
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)}Kb)
                      </span>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete file button */}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="cursor-pointer text-red-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={!selectedFile || isUploading}
                className="cursor-pointer bg-[#1d4ed8] hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg px-6 py-2.5 transition-all shadow-sm"
              >
                ยืนยัน
              </button>
              <button
                type="button"
                onClick={handleCancelImport}
                className="cursor-pointer border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg px-6 py-2.5 transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
