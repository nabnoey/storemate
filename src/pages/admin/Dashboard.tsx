import { useEffect, useState } from 'react';
import HeaderAdmin from "../../components/admin/HeaderAdmin";
import { Star, ChevronRight, ShoppingBag, Users, Package, CircleDollarSign } from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import ReactGA from 'react-ga4';
import Loading from "../../components/loading/Loading";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/store';
import { getOwnerDashboard, getSalesAnalytics } from '../../redux/owner/ownerReducer';

// Import product assets for thumbnails
import soapImg from '../../assets/soap.jpg';
import soap1Img from '../../assets/soap1.jpg';
import champooImg from '../../assets/champoo.jpg';
import drinkMangoImg from '../../assets/drink_mango.jpg';
import soapPadthongImg from '../../assets/soap_padthong.webp';

// =========================================================================
// MOCKUP DATA DEFINITIONS (ข้อมูลจำลองสำหรับส่วนที่ยังไม่มี API สนับสนุน)
// =========================================================================

// MOCKUP: ข้อมูลกราฟย่อ (Sparkline) สำหรับผู้เข้าชมประจำวัน
const MOCK_VISITOR_SPARKLINE = [
  { value: 4500 }, { value: 5200 }, { value: 4800 }, { value: 6100 },
  { value: 5900 }, { value: 6400 }, { value: 6841 }
];

// MOCKUP: ข้อมูลกราฟย่อ (Sparkline) สำหรับผู้เข้าใช้ขณะนี้
const MOCK_ACTIVE_SPARKLINE = [
  { value: 380 }, { value: 420 }, { value: 390 }, { value: 460 },
  { value: 430 }, { value: 490 }, { value: 503 }
];

// MOCKUP: ข้อมูลกราฟย่อ (Sparkline) สำหรับผู้ใช้ใหม่วันนี้
const MOCK_NEW_USER_SPARKLINE = [
  { value: 600 }, { value: 750 }, { value: 710 }, { value: 880 },
  { value: 820 }, { value: 950 }, { value: 1024 }
];

// MOCKUP: ตัวเลขภาพรวมยอดขายและสถิติต่างๆ (ใช้เมื่อไม่มีข้อมูลจาก backend)
const MOCK_SUMMARY = {
  totalRevenue: 443000,
  totalOrders: 3220,
  newUsers: 842,
  productsSold: 5224,
  todayVisits: 6841,
  activeUsers: 503,
  todayNewUsers: 1024,
};

// MOCKUP: ข้อมูลยอดขายรายเดือน (สำหรับ Area Chart)
const MOCK_MONTHLY_REVENUE = [
  { month: 'ม.ค.', revenue: 32000 },
  { month: 'ก.พ.', revenue: 48000 },
  { month: 'มี.ค.', revenue: 42000 },
  { month: 'เม.ย.', revenue: 45000 },
  { month: 'พ.ค.', revenue: 60000 },
  { month: 'มิ.ย.', revenue: 58000 },
  { month: 'ก.ค.', revenue: 88000 },
];

// MOCKUP: ข้อมูลรายการคำสั่งซื้อล่าสุด
const MOCK_RECENT_ORDERS = [
  { id: '#ORD-7821', name: 'สมชาย วงศ์เจริญ', amount: 12800, status: 'จัดส่งแล้ว', statusColor: 'bg-emerald-100 text-emerald-700' },
  { id: '#ORD-7820', name: 'นภาพร สุขสม', amount: 5490, status: 'กำลังดำเนินการ', statusColor: 'bg-blue-100 text-blue-700' },
  { id: '#ORD-7819', name: 'วิชัย ประเสริฐ', amount: 3200, status: 'รอชำระ', statusColor: 'bg-amber-100 text-amber-700 font-medium' },
  { id: '#ORD-7818', name: 'มาลี ดีงาม', amount: 8750, status: 'จัดส่งแล้ว', statusColor: 'bg-emerald-100 text-emerald-700' },
];

// MOCKUP: ข้อมูลอันดับสินค้าขายดี (Top Selling Products)
const MOCK_TOP_PRODUCTS = [
  { id: 1, name: 'น้ำมันหอมระเหยใส่นุสทร', tag: 'เคลิ้มเคลิ้ม', price: 3000, soldCount: 1284, revenue: '฿3.9M', rating: 4.9, image: soapImg },
  { id: 2, name: 'สบู่น้ำมันหอมระเหยไม้', tag: 'โปรโมชั่น', price: 3000, soldCount: 986, revenue: '฿3.0M', rating: 4.8, image: soap1Img },
  { id: 3, name: 'น้ำมันหอมระเหยไม้ แพคเกจคลาสสิก', tag: 'เคลิ้มเคลิ้ม', price: 3500, soldCount: 754, revenue: '฿2.6M', rating: 4.9, image: champooImg },
];

// MOCKUP: ข้อมูลสัดส่วนหมวดหมู่สินค้า
const MOCK_CATEGORY_RATIOS = [
  { name: 'รองเท้า', value: 40, color: '#3b82f6' },
  { name: 'อิเล็กทรอนิกส์', value: 28, color: '#f59e0b' },
  { name: 'เสื้อผ้า', value: 20, color: '#06b6d4' },
  { name: 'อุปกรณ์เสริม', value: 12, color: '#8b5cf6' },
];

// MOCKUP: ข้อมูลยอดขายตามภูมิภาค
const MOCK_REGIONAL_SALES = [
  { region: 'กรุงเทพฯ', count: 1950, widthPercent: 95 },
  { region: 'เชียงใหม่', count: 580, widthPercent: 32 },
  { region: 'ขอนแก่น', count: 420, widthPercent: 23 },
  { region: 'ภาคใต้', count: 340, widthPercent: 18 },
  { region: 'ภาคอีสาน', count: 260, widthPercent: 14 },
];

// MOCKUP: ข้อมูลสถิติลูกค้า
const MOCK_CUSTOMER_STATS = {
  regular: 3841,
  new: 842,
  inactive30Days: 2190,
  avgOrderValue: 3847,
};

// MOCKUP: ข้อมูลสรุประดับดาวและรีวิวจากลูกค้า
const MOCK_REVIEWS_SUMMARY = {
  totalReviews: 2381,
  averageRating: 4.0,
  breakdown: [
    { label: 'ดีเยี่ยม', percent: 80, color: 'bg-emerald-500' },
    { label: 'ดี', percent: 60, color: 'bg-emerald-400' },
    { label: 'ปานกลาง', percent: 30, color: 'bg-amber-400' },
    { label: 'แย่', percent: 15, color: 'bg-orange-400' },
    { label: 'แย่ที่สุด', percent: 5, color: 'bg-red-400' },
  ],
};

// MOCKUP: ข้อมูลแจ้งเตือนระดับสต็อกสินค้า (4 สถานะ)
const MOCK_STOCK_ALERTS = [
  { id: 1, name: 'สบู่ มะม่วงมะนาวโห่', status: 'ปกติ', count: 50, badgeBg: 'bg-emerald-100 text-emerald-700', barBg: 'bg-emerald-500', barWidth: '100%', image: soapPadthongImg },
  { id: 2, name: 'สบู่ มะม่วงมะนาวโห่', status: 'ต่ำ', count: 35, badgeBg: 'bg-amber-100 text-amber-700', barBg: 'bg-amber-400', barWidth: '70%', image: soap1Img },
  { id: 3, name: 'สบู่ มะม่วงมะนาวโห่', status: 'ต่ำมาก', count: 15, badgeBg: 'bg-orange-100 text-orange-700', barBg: 'bg-orange-500', barWidth: '30%', image: champooImg },
  { id: 4, name: 'สบู่ มะม่วงมะนาวโห่', status: 'หมดสต็อก', count: 0, badgeBg: 'bg-red-100 text-red-700', barBg: 'bg-red-500', barWidth: '0%', image: drinkMangoImg },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "รอชำระ",
  PROCESSING: "กำลังดำเนินการ",
  RECEIVED: "ที่ต้องได้รับ",
  COMPLETED: "จัดส่งแล้ว",
  CANCELLED: "ยกเลิกแล้ว",
  REFUNDED: "คืนเงินแล้ว",
};

const getStatusColor = (status: string) => {
  if (!status) return 'bg-gray-100 text-gray-700';
  const s = status.toUpperCase();
  if (s.includes('COMPLETED') || s.includes('จัดส่งแล้ว') || s.includes('SUCCESS')) return 'bg-emerald-100 text-emerald-700';
  if (s.includes('PROCESSING') || s.includes('กำลังดำเนินการ')) return 'bg-blue-100 text-blue-700';
  if (s.includes('PENDING') || s.includes('รอชำระ') || s.includes('รอ')) return 'bg-amber-100 text-amber-700 font-medium';
  if (s.includes('REFUND') || s.includes('CANCEL') || s.includes('ยกเลิก')) return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { dashData, salesData } = useSelector((state: RootState) => state.owner);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname, title: "Admin Dashboard" });
    
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          dispatch(getOwnerDashboard()).unwrap().catch(() => null),
          dispatch(getSalesAnalytics()).unwrap().catch(() => null),
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);

  if (loading) {
    return <Loading />;
  }

  // =========================================================================
  // DATA PARSING (ดึงข้อมูลจริงจาก API หากมี หากไม่มีจะ fallback ใช้ MOCKUP)
  // =========================================================================

  // 1. Visitors / Active / New users stats
  // ข้อมูลจริง: dashData?.activeUsers, dashData?.newUsers, dashData?.weeklyActiveUsersChart
  // MOCKUP: ใช้ค่าจาก MOCK_SUMMARY กรณีไม่มีข้อมูลใน API
  const todayVisits = dashData?.todayVisits ?? (dashData?.activeUsers ? dashData.activeUsers * 12 : MOCK_SUMMARY.todayVisits);
  const activeUsersNow = dashData?.activeUsers ?? MOCK_SUMMARY.activeUsers;
  const newUsersToday = dashData?.newUsers ?? MOCK_SUMMARY.todayNewUsers;

  // 2. Summary KPI metrics
  // ข้อมูลจริง: salesData?.totalPrice, salesData?.totalOrder, dashData?.totalProductsSold
  // MOCKUP: ใช้ค่าจาก MOCK_SUMMARY กรณีไม่มีใน API
  const totalRevenueVal = salesData?.totalPrice || dashData?.totalPrice || MOCK_SUMMARY.totalRevenue; // MOCKUP fallback
  const totalOrdersVal = salesData?.totalOrder || dashData?.totalOrder || MOCK_SUMMARY.totalOrders; // MOCKUP fallback
  const newCustomersVal = dashData?.newUsers || MOCK_SUMMARY.newUsers; // MOCKUP fallback
  const productsSoldVal = dashData?.totalProductsSold || MOCK_SUMMARY.productsSold; // MOCKUP fallback

  // 3. Monthly Revenue Chart Data
  // ข้อมูลจริง: dashData?.monthlyRevenue || salesData?.monthlyRevenue
  // MOCKUP: MOCK_MONTHLY_REVENUE
  const monthlyRevenueData = (dashData?.monthlyRevenue || salesData?.monthlyRevenue || MOCK_MONTHLY_REVENUE).map((item: any) => ({
    month: item.month || item.name,
    revenue: Number(item.revenue || item.totalRevenue || item.value || 0),
  })); // MOCKUP: ข้อมูลรายได้รายเดือน fallback

  // 4. Recent Orders List
  // ข้อมูลจริง: dashData?.latestOrder
  // MOCKUP: MOCK_RECENT_ORDERS
  const recentOrdersList = (dashData?.latestOrder && dashData.latestOrder.length > 0)
    ? dashData.latestOrder.slice(0, 4).map((item: any) => ({
        id: item.orderNo || `#ORD-${item.id}`,
        name: item.recipientName || item.orderRecipient?.recipientName || item.name || "ไม่ระบุชื่อ",
        amount: Number(item.totalPrice || item.totalAmount || item.amount || 0),
        status: STATUS_LABELS[item.status] || item.status,
        statusColor: getStatusColor(item.status),
      }))
    : MOCK_RECENT_ORDERS; // MOCKUP: ข้อมูลคำสั่งซื้อล่าสุด fallback

  // 5. Top Selling Products
  // ข้อมูลจริง: dashData?.topProducts || dashData?.products
  // MOCKUP: MOCK_TOP_PRODUCTS
  const topProductsList = (dashData?.topProducts && dashData.topProducts.length > 0)
    ? dashData.topProducts.slice(0, 3).map((p: any, idx: number) => ({
        id: idx + 1,
        name: p.productName || p.name,
        tag: p.categoryName || p.tag || "สินค้าขายดี",
        price: Number(p.price || 3000),
        soldCount: p.soldQuantity || p.soldCount || 1000,
        revenue: `฿${((p.revenue || (p.price * p.soldQuantity)) / 1000000).toFixed(1)}M`,
        rating: p.rating || 4.9,
        image: p.imageUrl || soapImg,
      }))
    : MOCK_TOP_PRODUCTS; // MOCKUP: ข้อมูลสินค้าขายดี fallback

  // 6. Sales Channel Donut Chart
  // ข้อมูลจริง: dashData?.orderChannelRate || salesData?.orderChannelIncome
  // MOCKUP: Website 75%, LINE OA 25%
  const salesChannelData = (dashData?.orderChannelRate || salesData?.orderChannelIncome || []).length > 0
    ? (dashData?.orderChannelRate || salesData?.orderChannelIncome).map((c: any) => ({
        name: c.orderChannel || c.name,
        value: Number(c.avg || c.percentage || c.value || 0),
        color: (c.orderChannel || c.name || '').toLowerCase().includes('line') ? '#10b981' : '#3b82f6',
      }))
    : [
        { name: 'Website', value: 75, color: '#3b82f6' }, // MOCKUP
        { name: 'LINE OA', value: 25, color: '#10b981' },  // MOCKUP
      ];

  // 7. Category Proportion Donut Chart
  // ข้อมูลจริง: dashData?.categoryRatio
  // MOCKUP: MOCK_CATEGORY_RATIOS
  const categoryRatioData = (dashData?.categoryRatio && dashData.categoryRatio.length > 0)
    ? dashData.categoryRatio.map((cat: any, idx: number) => ({
        name: cat.categoryName || cat.name,
        value: Number(cat.percentage || cat.value),
        color: ['#3b82f6', '#f59e0b', '#06b6d4', '#8b5cf6'][idx % 4],
      }))
    : MOCK_CATEGORY_RATIOS; // MOCKUP: ข้อมูลสัดส่วนหมวดหมู่ fallback

  // 8. Regional Revenue Stats
  // ข้อมูลจริง: dashData?.regionalRevenue || salesData?.regionalRevenue
  // MOCKUP: MOCK_REGIONAL_SALES
  const regionalSalesData = (dashData?.regionalRevenue || salesData?.regionalRevenue || []).length > 0
    ? (dashData?.regionalRevenue || salesData?.regionalRevenue).slice(0, 5).map((r: any) => ({
        region: r.geography || r.region,
        count: Number(r.totalOrders || r.totalRevenue || r.count || 0),
        widthPercent: Math.min(100, Math.max(15, Number(r.totalOrders || r.count || 500) / 20)),
      }))
    : MOCK_REGIONAL_SALES; // MOCKUP: ข้อมูลยอดขายตามภูมิภาค fallback

  // 9. Customer Stats
  // ข้อมูลจริง: dashData?.customerStats
  // MOCKUP: MOCK_CUSTOMER_STATS
  const customerStats = dashData?.customerStats || MOCK_CUSTOMER_STATS; // MOCKUP fallback

  // 10. Reviews Summary
  // ข้อมูลจริง: dashData?.reviews
  // MOCKUP: MOCK_REVIEWS_SUMMARY
  const reviewsSummary = (dashData?.reviews && dashData.reviews.length > 0)
    ? {
        totalReviews: dashData.reviews.reduce((acc: number, r: any) => acc + (r.reviewScore || 0), 0) || 2381,
        averageRating: 4.0,
        breakdown: MOCK_REVIEWS_SUMMARY.breakdown,
      }
    : MOCK_REVIEWS_SUMMARY; // MOCKUP: ข้อมูลรีวิวจากลูกค้า fallback

  // 11. Low Stock Alerts Cards
  // ข้อมูลจริง: dashData?.products (กรองสินค้าที่สต็อกต่ำ)
  // MOCKUP: MOCK_STOCK_ALERTS
  const stockAlertCards = MOCK_STOCK_ALERTS; // MOCKUP: ข้อมูลแจ้งเตือนสต็อกสินค้าตามภาพตัวอย่าง

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Top Header Bar */}
      <HeaderAdmin title="แดชบอร์ด" />

      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 text-[#1E293B]">
        
        {/* ========================================================================= */}
        {/* SECTION 1: VISITOR STATS CARDS WITH SPARKLINE CHARTS                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: ผู้เข้าชม (วันนี้) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <span className="text-sm font-semibold text-gray-500 mb-1">ผู้เข้าชม (วันนี้)</span>
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {todayVisits.toLocaleString()}
              </span>
            </div>
            {/* Sparkline Chart */}
            <div className="h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_VISITOR_SPARKLINE} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#purpleGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: เข้าใช้ตอนนี้ */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <span className="text-sm font-semibold text-gray-500 mb-1">เข้าใช้ตอนนี้</span>
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {activeUsersNow.toLocaleString()}
              </span>
            </div>
            {/* Sparkline Chart */}
            <div className="h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_ACTIVE_SPARKLINE} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#emeraldGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3: ผู้ใช้ใหม่ (วันนี้) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <span className="text-sm font-semibold text-gray-500 mb-1">ผู้ใช้ใหม่ (วันนี้)</span>
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {newUsersToday.toLocaleString()}
              </span>
            </div>
            {/* Sparkline Chart */}
            <div className="h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_NEW_USER_SPARKLINE} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="purpleGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#purpleGradient2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: METRIC SUMMARY CARDS (4 CARDS)                                 */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Metric 1: รายได้รวม */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 block mb-1">รายได้รวม</span>
              <span className="text-xl font-bold text-gray-900">฿ {totalRevenueVal.toLocaleString()}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <CircleDollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 2: คำสั่งซื้อ */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 block mb-1">คำสั่งซื้อ</span>
              <span className="text-xl font-bold text-gray-900">{totalOrdersVal.toLocaleString()}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 3: ลูกค้าใหม่ */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 block mb-1">ลูกค้าใหม่</span>
              <span className="text-xl font-bold text-gray-900">{newCustomersVal.toLocaleString()}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 4: สินค้าที่ขาย */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 block mb-1">สินค้าที่ขาย</span>
              <span className="text-xl font-bold text-gray-900">{productsSoldVal.toLocaleString()}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: MONTHLY REVENUE CHART & RECENT ORDERS                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: รายได้รายเดือน Area Chart (8/12 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <h3 className="font-bold text-gray-800 text-base mb-6">รายได้รายเดือน</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(val) => `฿${val >= 1000 ? `${val / 1000}K` : val}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, 'รายได้']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: คำสั่งซื้อล่าสุด Recent Orders List (4/12 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-base">คำสั่งซื้อล่าสุด</h3>
              <button
                onClick={() => navigate("/orders-management")}
                className="text-xs text-gray-500 flex items-center hover:text-gray-700 transition-colors cursor-pointer border-none bg-transparent font-medium"
              >
                ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="divide-y divide-gray-50 flex-1 flex flex-col justify-around">
              {recentOrdersList.map((order: any, idx: number) => (
                <div key={idx} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-gray-800 text-sm">{order.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{order.id}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-gray-900 text-sm">฿ {order.amount.toLocaleString()}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: สินค้าขายดี, แหล่งที่ซื้อ, สัดส่วนหมวดหมู่                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* สินค้าขายดี (6/12 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 text-base">สินค้าขายดี</h3>
              <p className="text-xs text-gray-400">อันดับสินค้าตามยอดขาย · เดือนนี้</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-medium">
                    <th className="pb-3 w-8">#</th>
                    <th className="pb-3">สินค้า</th>
                    <th className="pb-3 text-right">ราคา/ชิ้น</th>
                    <th className="pb-3 text-right">จำนวนขาย</th>
                    <th className="pb-3 text-right">รายได้</th>
                    <th className="pb-3 text-right">คะแนน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topProductsList.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-semibold text-gray-400">{product.id}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-gray-800 line-clamp-1">{product.name}</span>
                            <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.2 rounded w-fit">
                              {product.tag}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium text-gray-600">฿{product.price.toLocaleString()}</td>
                      <td className="py-3 text-right font-bold text-gray-800">{product.soldCount.toLocaleString()} ชิ้น</td>
                      <td className="py-3 text-right font-bold text-gray-900">{product.revenue}</td>
                      <td className="py-3 text-right font-semibold text-amber-500">
                        ★ {product.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* แหล่งที่ซื้อ (3/12 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-base">แหล่งที่ซื้อ</h3>
              <p className="text-xs text-gray-400 mb-4">ตามช่องทางการขาย (%)</p>
            </div>

            <div className="h-44 w-full relative my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesChannelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {salesChannelData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {salesChannelData.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* สัดส่วนหมวดหมู่ (3/12 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-base">สัดส่วนหมวดหมู่</h3>
              <p className="text-xs text-gray-400 mb-4">ตามยอดขาย (%)</p>
            </div>

            <div className="h-44 w-full relative my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRatioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryRatioData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {categoryRatioData.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: ยอดขายตามภูมิภาค, สถิติลูกค้า, รีวิวจากลูกค้า                 */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ยอดขายตามภูมิภาค */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <h3 className="font-bold text-gray-800 text-base mb-6">ยอดขายตามภูมิภาค</h3>
            
            <div className="space-y-3.5 flex-1 justify-center flex flex-col">
              {regionalSalesData.map((r: any, idx: number) => (
                <div key={idx} className="flex items-center text-xs">
                  <span className="w-20 text-gray-600 font-medium shrink-0">{r.region}</span>
                  <div className="flex-1 bg-blue-50/60 rounded-r-full h-4 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-r-full transition-all duration-300"
                      style={{ width: `${r.widthPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Scale Axis */}
            <div className="flex justify-between text-[10px] text-gray-400 pt-4 border-t border-gray-50 mt-4 pl-20">
              <span>0</span>
              <span>500</span>
              <span>1000</span>
              <span>1500</span>
              <span>2000</span>
            </div>
          </div>

          {/* สถิติลูกค้า */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <h3 className="font-bold text-gray-800 text-base mb-6">สถิติลูกค้า</h3>
            
            <div className="space-y-4 flex-1">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium">ลูกค้าประจำ</span>
                  <span className="font-bold text-gray-800">{customerStats.regular.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium">ลูกค้าใหม่</span>
                  <span className="font-bold text-gray-800">{customerStats.new.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium">ลูกค้าไม่ได้ซื้อ &gt;30 วัน</span>
                  <span className="font-bold text-gray-800">{customerStats.inactive30Days.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-gray-300 h-2 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
            </div>

            {/* Bottom Average Order Metric */}
            <div className="pt-4 border-t border-gray-50 text-center mt-4">
              <span className="text-2xl font-extrabold text-gray-900 block">{customerStats.avgOrderValue.toLocaleString()}</span>
              <span className="text-xs text-gray-400 font-medium">ยอดเฉลี่ย/ออเดอร์</span>
            </div>
          </div>

          {/* รีวิวจากลูกค้า */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-base">รีวิวจากลูกค้า</h3>
              <p className="text-xs text-gray-400 mb-4">{reviewsSummary.totalReviews.toLocaleString()} รีวิว</p>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-extrabold text-gray-900">{reviewsSummary.averageRating.toFixed(1)}</span>
              <div className="flex text-amber-400 gap-0.5">
                <Star className="w-5 h-5 fill-amber-400 stroke-amber-400" />
                <Star className="w-5 h-5 fill-amber-400 stroke-amber-400" />
                <Star className="w-5 h-5 fill-amber-400 stroke-amber-400" />
                <Star className="w-5 h-5 fill-amber-400 stroke-amber-400" />
                <Star className="w-5 h-5 text-gray-200 stroke-gray-200" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {reviewsSummary.breakdown.map((r: any, idx: number) => (
                <div key={idx} className="flex items-center">
                  <span className="w-14 text-gray-500 font-medium shrink-0">{r.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden mx-2">
                    <div className={`${r.color} h-full rounded-full`} style={{ width: `${r.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* SECTION 6: แจ้งเตือนสต็อกสินค้า (LOW STOCK ALERT CARDS)                   */}
        {/* ========================================================================= */}
        <div>
          <h3 className="font-bold text-gray-800 text-base mb-4">แจ้งเตือนสต็อกสินค้า</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stockAlertCards.map((item: any) => (
              <div
                key={item.id}
                className={`rounded-2xl p-4 border flex flex-col justify-between gap-4 transition-all ${item.cardBg}`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/60 shadow-sm shrink-0"
                  />
                  <span className="font-semibold text-gray-800 text-sm line-clamp-2">{item.name}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.badgeBg}`}>
                      {item.status}
                    </span>
                    <span className="font-bold text-gray-900 text-sm">{item.count} ชิ้น</span>
                  </div>

                  {/* Stock Progress Bar */}
                  <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${item.barBg}`}
                      style={{ width: item.barWidth }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
