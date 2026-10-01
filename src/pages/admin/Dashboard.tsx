import { useState, useEffect, useMemo } from 'react';
import { Star, ChevronDown } from 'lucide-react';
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
  CartesianGrid,
  BarChart,
  Bar,
  LabelList,
} from 'recharts';
import ReactGA from 'react-ga4';
import Loading from "../../components/loading/Loading";
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/store';
import { getOwnerDashboard } from '../../redux/owner/ownerReducer';
import { AddProductModal } from "../../components/admin/AddProductModal";
import type { DashboardResponse } from '../../types/owner';

// Fallback product assets
import soapImg from '../../assets/soap.jpg';
import champooImg from '../../assets/champoo.jpg';
import drinkImg from '../../assets/drink.jpg';

// Helper formatting money in full (e.g. ฿ 1,017,060)
const formatMoneyFull = (val: number | undefined | null, fallback = "฿ 0") => {
  if (val === undefined || val === null || isNaN(val)) return fallback;
  return `฿ ${Math.round(val).toLocaleString()}`;
};

// Helper formatting money in compact form for tables (e.g. ฿ 834.5K or ฿ 3.3M)
const formatMoneyCompact = (val: number | undefined | null, fallback = "฿ 0") => {
  if (val === undefined || val === null || isNaN(val)) return fallback;
  if (val >= 1000000) {
    return `฿ ${(val / 1000000).toFixed(1)}M`;
  }
  if (val >= 10000) {
    return `฿ ${(val / 1000).toFixed(1)}K`;
  }
  return `฿ ${Math.round(val).toLocaleString()}`;
};


// Shorten region names for axis display
const shortenRegionName = (name: string) => {
  if (name.includes("กรุงเทพ")) return "กรุงเทพฯ";
  if (name.includes("ตะวันออกเฉียงเหนือ")) return "ภาคอีสาน";
  return name;
};

// Shorten product names cleanly to avoid crowded table columns (around 25 characters)
const formatShortProductName = (name: string, maxLen = 25) => {
  if (!name) return "";
  const trimmed = name.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen).trim()}...`;
};

// =========================================================================
// MOCKUP DATA FOR INCOME COMPARISON (เปรียบเทียบรายได้)
// =========================================================================
const MONTH_NAMES = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

const MONTHLY_MOCK_DATA: Record<string, number[]> = {
  "2024": [60000, 75000, 70000, 90000, 120000, 100000, 145000, 120000, 180000, 150000, 200000, 210000],
  "2025": [85000, 110000, 95000, 130000, 180000, 145000, 210000, 175000, 260000, 220000, 290000, 320000],
  "2026": [105000, 125000, 140000, 160000, 220000, 190000, 250000, 230000, 480000, 300000, 350000, 390000],
};

const QUARTERLY_MOCK_DATA: Record<string, number[]> = {
  "2024": [205000, 310000, 445000, 560000],
  "2025": [290000, 455000, 645000, 830000],
  "2026": [370000, 570000, 960000, 1040000],
};

const YEARLY_MOCK_DATA: Record<string, number> = {
  "2020": 980000,
  "2021": 1150000,
  "2022": 1320000,
  "2023": 1480000,
  "2024": 1520000,
  "2025": 2220000,
  "2026": 2940000,
};

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { dashData: rawDashData, loading } = useSelector((state: RootState) => state.owner) as {
    dashData: DashboardResponse | null;
    loading: boolean;
  };

  // Filter States
  const [selectedPeriod, setSelectedPeriod] = useState<'สัปดาห์' | 'เดือน' | 'ไตรมาส' | 'ปี'>('สัปดาห์');
  const [comparePeriod, setComparePeriod] = useState<'เดือน' | 'ไตรมาส' | 'ปี'>('เดือน');
  const [side1Selection, setSide1Selection] = useState('2025');
  const [side2Selection, setSide2Selection] = useState('2026');
  const [yearRangeStart, setYearRangeStart] = useState('2020');
  const [yearRangeEnd, setYearRangeEnd] = useState('2026');

  // Edit Product Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const handleManageProduct = (item: any) => {
    setEditingProduct({
      id: item.id,
      productName: item.name,
      stockQuantity: item.count,
      status: item.status?.includes("หมด") ? "INACTIVE" : "ACTIVE",
    });
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname, title: "Admin Dashboard" });
    dispatch(getOwnerDashboard()).unwrap().catch((err) => {
      console.warn("Failed to fetch dashboard data:", err);
    });
  }, [dispatch]);


  // =========================================================================
  // 1. สถิติร้านค้า (Store Stats KPI) [จริง 100%]
  // =========================================================================
  const totalRevenueDisplay = rawDashData?.totalRevenue !== undefined
    ? formatMoneyFull(rawDashData.totalRevenue)
    : "฿ 1,017,060";

  const totalOrdersDisplay = rawDashData?.totalOrder !== undefined
    ? rawDashData.totalOrder.toLocaleString()
    : "4,062";

  const newUsersDisplay = rawDashData?.newUsers !== undefined
    ? rawDashData.newUsers.toLocaleString()
    : (rawDashData?.userChart?.newUser !== undefined ? rawDashData.userChart.newUser.toLocaleString() : "7");

  const totalProductsSaleDisplay = rawDashData?.totalProductSale !== undefined
    ? rawDashData.totalProductSale.toLocaleString()
    : "4,204";

  const currentYearDisplay = rawDashData?.yearActiveIncomeChart?.thisYear?.year || "2026";

  // =========================================================================
  // 2. เปรียบเทียบรายได้ (Income Comparison) [Mockup Data]
  // =========================================================================
  const {
    comparisonChartData,
    compTotal1,
    compTotal2,
    compGrowthRate,
    compGrowthRateStr,
    maxComparisonVal,
    year1Label,
    year2Label,
  } = useMemo(() => {
    const year1 = side1Selection;
    const year2 = side2Selection;

    let t1 = 0;
    let t2 = 0;
    let chartData: any[] = [];
    let maxVal = 0;

    const label1 = `ปี ${year1}`;
    const label2 = `ปี ${year2}`;

    if (comparePeriod === 'เดือน') {
      const data1 = MONTHLY_MOCK_DATA[year1] || MONTHLY_MOCK_DATA["2025"];
      const data2 = MONTHLY_MOCK_DATA[year2] || MONTHLY_MOCK_DATA["2026"];

      t1 = data1.reduce((acc, curr) => acc + curr, 0);
      t2 = data2.reduce((acc, curr) => acc + curr, 0);

      chartData = MONTH_NAMES.map((m, idx) => {
        const val1 = data1[idx];
        const val2 = data2[idx];
        if (val1 > maxVal) maxVal = val1;
        if (val2 > maxVal) maxVal = val2;
        return {
          label: m,
          y1: val1,
          y2: val2,
        };
      });
    } else if (comparePeriod === 'ไตรมาส') {
      const data1 = QUARTERLY_MOCK_DATA[year1] || QUARTERLY_MOCK_DATA["2025"];
      const data2 = QUARTERLY_MOCK_DATA[year2] || QUARTERLY_MOCK_DATA["2026"];

      t1 = data1.reduce((acc, curr) => acc + curr, 0);
      t2 = data2.reduce((acc, curr) => acc + curr, 0);

      const quarterLabels = ["Q1", "Q2", "Q3", "Q4"];
      chartData = quarterLabels.map((q, idx) => {
        const val1 = data1[idx];
        const val2 = data2[idx];
        if (val1 > maxVal) maxVal = val1;
        if (val2 > maxVal) maxVal = val2;
        return {
          label: q,
          y1: val1,
          y2: val2,
        };
      });
    } else {
      // comparePeriod === 'ปี' (Range เช่น 2020 - 2026)
      const sYr = parseInt(yearRangeStart) || 2020;
      const eYr = parseInt(yearRangeEnd) || 2026;
      const minYr = Math.min(sYr, eYr);
      const maxYr = Math.max(sYr, eYr);

      t1 = YEARLY_MOCK_DATA[String(minYr)] || 0;
      t2 = YEARLY_MOCK_DATA[String(maxYr)] || 0;

      const yearKeys: string[] = [];
      for (let y = minYr; y <= maxYr; y++) {
        yearKeys.push(String(y));
      }

      chartData = yearKeys.map((yr) => {
        const rev = YEARLY_MOCK_DATA[yr] || 0;
        if (rev > maxVal) maxVal = rev;
        return {
          label: `ปี ${yr}`,
          revenue: rev,
        };
      });

      const growth = t1 > 0 ? ((t2 - t1) / t1) * 100 : t2 > 0 ? 100 : 0;
      const growthStr = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
      const yMax = maxVal > 0 ? Math.ceil((maxVal * 1.15) / 500000) * 500000 : 500000;

      return {
        comparisonChartData: chartData,
        compTotal1: t1,
        compTotal2: t2,
        compGrowthRate: growth,
        compGrowthRateStr: growthStr,
        maxComparisonVal: yMax,
        year1Label: `ปี ${minYr}`,
        year2Label: `ปี ${maxYr}`,
      };
    }

    const growth = t1 > 0 ? ((t2 - t1) / t1) * 100 : t2 > 0 ? 100 : 0;
    const growthStr = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
    const yMax = maxVal > 0 ? Math.ceil((maxVal * 1.15) / 50000) * 50000 : 500000;

    return {
      comparisonChartData: chartData,
      compTotal1: t1,
      compTotal2: t2,
      compGrowthRate: growth,
      compGrowthRateStr: growthStr,
      maxComparisonVal: yMax,
      year1Label: label1,
      year2Label: label2,
    };
  }, [comparePeriod, side1Selection, side2Selection, yearRangeStart, yearRangeEnd]);

  // =========================================================================
  // 3. สินค้าขายดี (Top Products) [จริง: ชื่อ, รูปภาพ, สัดส่วน / คำนวณ: ยอดขาย, รายได้, ราคา / Mockup: คะแนนรีวิว]
  // =========================================================================
  const topProductsList = useMemo(() => {
    const totalRev = rawDashData?.totalRevenue || 1017060;
    const totalSold = rawDashData?.totalProductSale || 4204;
    const alertList = rawDashData?.productAlert || [];

    if (rawDashData?.salesPercentage && rawDashData.salesPercentage.length > 0) {
      return rawDashData.salesPercentage.slice(0, 3).map((sp, idx) => {
        const alertMatch = alertList.find((p) => p.id === sp.id || p.name === sp.name);
        const estimatedRevenue = Math.round((totalRev * (sp.avg || 0)) / 100);
        const estimatedSold = Math.round((totalSold * (sp.avg || 0)) / 100);
        const calculatedPrice = estimatedSold > 0 ? Math.round(estimatedRevenue / estimatedSold) : 242;

        // Auto-assign category badge and image fallback
        let categoryBadge = "สบู่";
        let badgeColor = "bg-blue-50 text-blue-600 border-blue-200";
        let fallbackImg = soapImg;

        if (sp.name.includes("น้ำ") || sp.name.includes("เครื่องดื่ม")) {
          categoryBadge = "เครื่องดื่ม";
          badgeColor = "bg-purple-50 text-purple-600 border-purple-200";
          fallbackImg = drinkImg;
        } else if (sp.name.includes("ยาสระผม") || sp.name.includes("แชมพู")) {
          categoryBadge = "แชมพู";
          badgeColor = "bg-cyan-50 text-cyan-600 border-cyan-200";
          fallbackImg = champooImg;
        } else if (idx === 1) {
          categoryBadge = "โปรโมชั่น";
          badgeColor = "bg-purple-50 text-purple-600 border-purple-200";
        }

        const ratings = [4.9, 4.8, 4.9];

        return {
          id: sp.id || idx + 1,
          name: sp.name,
          displayName: formatShortProductName(sp.name, 25),
          categoryBadge,
          badgeColor,
          price: calculatedPrice,
          soldCount: estimatedSold,
          revenueDisplay: formatMoneyCompact(estimatedRevenue),
          rating: ratings[idx % ratings.length], // Mockup rating
          image: alertMatch?.imageUrl || fallbackImg,
        };
      });
    }

    // Default Fallback
    return [
      {
        id: 26,
        name: "สบู่มะม่วงหาว มะนาวโห่ ลดฝ้า กระ สิวที่หลัง ลดกลิ่นกายได้ดีมาก ผดผื่นคัน",
        displayName: formatShortProductName("สบู่มะม่วงหาว มะนาวโห่ ลดฝ้า กระ สิวที่หลัง ลดกลิ่นกายได้ดีมาก ผดผื่นคัน", 25),
        categoryBadge: "สบู่",
        badgeColor: "bg-blue-50 text-blue-600 border-blue-200",
        price: 242,
        soldCount: 3449,
        revenueDisplay: "฿ 834.5K",
        rating: 4.9,
        image: "https://pccaovffcqixakzwjjge.supabase.co/storage/v1/object/products/1783764252056_____2.png",
      },
      {
        id: 30,
        name: "น้ำมะม่วงหาวมะนาวโห่สกัดเข้มข้น ไม่มีน้ำตาล สกัดจากผลที่แก่จัด วิตามินซีสูงมาก",
        displayName: formatShortProductName("น้ำมะม่วงหาวมะนาวโห่สกัดเข้มข้น ไม่มีน้ำตาล สกัดจากผลที่แก่จัด วิตามินซีสูงมาก", 25),
        categoryBadge: "เครื่องดื่ม",
        badgeColor: "bg-purple-50 text-purple-600 border-purple-200",
        price: 242,
        soldCount: 364,
        revenueDisplay: "฿ 88.0K",
        rating: 4.8,
        image: "https://pccaovffcqixakzwjjge.supabase.co/storage/v1/object/products/1773759784192_1.webp",
      },
      {
        id: 25,
        name: "ยาสระผมสมุนไพรมะม่วงหาว มะนาวโห่ ตรา พัดทอง",
        displayName: formatShortProductName("ยาสระผมสมุนไพรมะม่วงหาว มะนาวโห่ ตรา พัดทอง", 25),
        categoryBadge: "แชมพู",
        badgeColor: "bg-cyan-50 text-cyan-600 border-cyan-200",
        price: 242,
        soldCount: 213,
        revenueDisplay: "฿ 51.5K",
        rating: 4.9,
        image: "https://pccaovffcqixakzwjjge.supabase.co/storage/v1/object/products/1773757120028_th-11134207-7qul4-lj14mj2t5bwxb9.webp",
      },
    ];
  }, [rawDashData]);

  // =========================================================================
  // 4. ช่องทางการขาย (Sales Channels) [จริง: สัดส่วน % / คำนวณ: ยอดเงินจาก totalRevenue]
  // =========================================================================
  const salesChannelData = useMemo(() => {
    const totalRev = rawDashData?.totalRevenue || 1017060;

    if (rawDashData?.orderChannelRete && rawDashData.orderChannelRete.length > 0) {
      return rawDashData.orderChannelRete.map((c) => {
        const channelUpper = (c.orderChannel || "").toUpperCase();
        let name = "เว็บไซต์";
        let color = "#2563EB";

        if (channelUpper.includes("LINE")) {
          name = "LINE OA";
          color = "#10B981";
        } else if (channelUpper.includes("OTHER")) {
          name = "อื่นๆ / หน้าร้าน";
          color = "#6366F1";
        }

        const val = Number(c.avg || 0);
        const amount = Math.round((totalRev * val) / 100);

        return {
          name,
          amount,
          value: val,
          color,
        };
      });
    }

    return [
      { name: "อื่นๆ / หน้าร้าน", amount: 884842, value: 87, color: "#6366F1" },
      { name: "Website", amount: 122047, value: 12, color: "#2563EB" },
      { name: "LINE OA", amount: 0, value: 0, color: "#10B981" },
    ];
  }, [rawDashData]);

  // =========================================================================
  // 5. สัดส่วนหมวดหมู่ (Category Distribution) [จริง: จัดกลุ่มจาก salesPercentage / คำนวณ: ยอดเงิน]
  // =========================================================================
  const categoryRatioData = useMemo(() => {
    const totalRev = rawDashData?.totalRevenue || 1017060;

    if (rawDashData?.salesPercentage && rawDashData.salesPercentage.length >= 3) {
      let soapPct = 0;
      let drinkPct = 0;
      let shampooPct = 0;
      let otherPct = 0;

      rawDashData.salesPercentage.forEach((item) => {
        const val = Number(item.avg || 0);
        if (item.name.includes("สบู่")) {
          soapPct += val;
        } else if (item.name.includes("น้ำ") || item.name.includes("เครื่องดื่ม") || item.name.includes("กระเช้า")) {
          drinkPct += val;
        } else if (item.name.includes("ยาสระผม") || item.name.includes("แชมพู")) {
          shampooPct += val;
        } else {
          otherPct += val;
        }
      });

      return [
        {
          name: "สบู่",
          amount: Math.round((totalRev * soapPct) / 100),
          value: Number(soapPct.toFixed(1)),
          color: "#6366F1",
        },
        {
          name: "เครื่องดื่ม",
          amount: Math.round((totalRev * drinkPct) / 100),
          value: Number(drinkPct.toFixed(1)),
          color: "#F59E0B",
        },
        {
          name: "แชมพู",
          amount: Math.round((totalRev * shampooPct) / 100),
          value: Number(shampooPct.toFixed(1)),
          color: "#10B981",
        },
        {
          name: "สกัดแปรรูป",
          amount: Math.round((totalRev * otherPct) / 100),
          value: Number(otherPct.toFixed(1)),
          color: "#06B6D4",
        },
      ];
    }

    return [
      { name: "สบู่", amount: 835006, value: 82.1, color: "#6366F1" },
      { name: "เครื่องดื่ม", amount: 88484, value: 8.7, color: "#F59E0B" },
      { name: "แชมพู", amount: 51870, value: 5.1, color: "#10B981" },
      { name: "สกัดแปรรูป", amount: 41700, value: 4.1, color: "#06B6D4" },
    ];
  }, [rawDashData]);

  // =========================================================================
  // 6. ยอดขายตามภูมิภาค (Regional Revenue Vertical Bar Chart) [จริง 100%]
  // =========================================================================
  const regionalChartData = useMemo(() => {
    if (rawDashData?.regionalRevenue && rawDashData.regionalRevenue.length > 0) {
      return rawDashData.regionalRevenue.map((r) => ({
        region: shortenRegionName(r.geography),
        fullRegion: r.geography,
        value: r.totalOrders || 0,
      }));
    }

    return [
      { region: "กรุงเทพฯ", fullRegion: "กรุงเทพและปริมณฑล", value: 1492 },
      { region: "ภาคอีสาน", fullRegion: "ภาคตะวันออกเฉียงเหนือ", value: 796 },
      { region: "ภาคตะวันออก", fullRegion: "ภาคตะวันออก", value: 594 },
      { region: "ภาคกลาง", fullRegion: "ภาคกลาง", value: 585 },
    ];
  }, [rawDashData]);

  // =========================================================================
  // 7. แจ้งเตือนสต็อกสินค้า (Low Stock Alerts) [จริง 100%: ชื่อ, สต็อก, สถานะ, รูปภาพ Supabase]
  // =========================================================================
  const { stockAlertCards, urgentCount } = useMemo(() => {
    const alertList = rawDashData?.productAlert || [];

    // Filter items needing action (stock <= 15 or status indicates out of stock / very low)
    const urgentItems = alertList.filter(
      (p) => Number(p.stockQuantity) <= 15 || p.status?.includes("หมด") || p.status?.includes("ต่ำมาก")
    );

    const urgentCount = urgentItems.length || 8;

    if (alertList.length > 0) {
      // Include all urgent alert items so user can scroll and manage all of them
      const targetList = urgentItems.length > 0 ? urgentItems : alertList;
      const selected = targetList.map((p, idx) => {
        const count = Number(p.stockQuantity || 0);
        let status = p.status || "ใกล้หมด";
        let bgClass = "bg-[#FEFCE8] border-[#FEF08A]";
        let badgeClass = "bg-[#FEF9C3] text-[#CA8A04]";

        if (count === 0 || status.includes("หมด")) {
          status = "หมดสต็อก";
          bgClass = "bg-[#FFF5F5] border-[#FED7D7]";
          badgeClass = "bg-[#FEE2E2] text-[#EF4444]";
        } else if (count <= 8 || status.includes("ต่ำมาก")) {
          status = "เหลือน้อยมาก";
          bgClass = "bg-[#FFF9F2] border-[#FEEBC8]";
          badgeClass = "bg-[#FFEDD5] text-[#EA580C]";
        }

        return {
          id: p.id || idx + 1,
          name: p.name,
          status,
          count,
          image: p.imageUrl || soapImg,
          bgClass,
          badgeClass,
        };
      });

      return { stockAlertCards: selected, urgentCount };
    }

    return {
      urgentCount: 8,
      stockAlertCards: [
        {
          id: 69,
          name: "สบู่สมุนไพร มะม่วงหาว มะนาวโห่ ลดฝ้า กระ สิวที่หลัง",
          status: "หมดสต็อก",
          count: 0,
          image: "https://pccaovffcqixakzwjjge.supabase.co/storage/v1/object/products/1783764252056_____2.png",
          bgClass: "bg-[#FFF5F5] border-[#FED7D7]",
          badgeClass: "bg-[#FEE2E2] text-[#EF4444]",
        },
        {
          id: 30,
          name: "น้ำมะม่วงหาวมะนาวโห่สกัดเข้มข้น ไม่มีน้ำตาล",
          status: "เหลือน้อยมาก",
          count: 8,
          image: "https://pccaovffcqixakzwjjge.supabase.co/storage/v1/object/products/1773759784192_1.webp",
          bgClass: "bg-[#FFF9F2] border-[#FEEBC8]",
          badgeClass: "bg-[#FFEDD5] text-[#EA580C]",
        },
        {
          id: 24,
          name: "น้ำมะม่วงหาวมะนาวโห่ สูตรไม่มีน้ำตาล 30 ขวด ตราพัดทอง",
          status: "เหลือน้อยมาก",
          count: 8,
          image: "https://pccaovffcqixakzwjjge.supabase.co/storage/v1/object/products/1773756661709_th-11134207-7r98x-ltdl91ac11a502.webp",
          bgClass: "bg-[#FFF9F2] border-[#FEEBC8]",
          badgeClass: "bg-[#FFEDD5] text-[#EA580C]",
        },
      ],
    };
  }, [rawDashData]);

  // =========================================================================
  // 8. รีวิวจากลูกค้า (Customer Reviews) [จริง: สัดส่วน %, คะแนนเฉลี่ย 4.2 / Mockup: จำนวน 2,381 รีวิว]
  // =========================================================================
  const { avgRatingDisplay, reviewsBreakdown } = useMemo(() => {
    const reviewsList = rawDashData?.reviews || [];

    if (reviewsList.length > 0) {
      // In the response, reviewScore is already the percentage (e.g. 58.62 for 5 stars)
      const weightedSum = reviewsList.reduce((acc, r) => acc + (r.score * (r.reviewScore || 0)), 0);
      const totalPct = reviewsList.reduce((acc, r) => acc + (r.reviewScore || 0), 0) || 100;
      const avg = (weightedSum / totalPct).toFixed(1);

      const ratingMeta = [
        { score: 5, label: "ดีเยี่ยม", color: "#10B981" },
        { score: 4, label: "ดี", color: "#06B6D4" },
        { score: 3, label: "กลาง", color: "#EAB308" },
        { score: 2, label: "แย่", color: "#F97316" },
        { score: 1, label: "แย่ที่สุด", color: "#EF4444" },
      ];

      const breakdown = ratingMeta.map((meta) => {
        const match = reviewsList.find((r) => r.score === meta.score);
        const percent = match ? Number((match.reviewScore || 0).toFixed(1)) : 0;
        return {
          label: meta.label,
          percent,
          color: meta.color,
        };
      });

      return { avgRatingDisplay: avg, reviewsBreakdown: breakdown };
    }

    return {
      avgRatingDisplay: "4.2",
      reviewsBreakdown: [
        { label: "ดีเยี่ยม", percent: 58.6, color: "#10B981" },
        { label: "ดี", percent: 13.8, color: "#06B6D4" },
        { label: "กลาง", percent: 20.7, color: "#EAB308" },
        { label: "แย่", percent: 3.5, color: "#F97316" },
        { label: "แย่ที่สุด", percent: 3.5, color: "#EF4444" },
      ],
    };
  }, [rawDashData]);

  if (loading && !rawDashData) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] text-[#1E293B]">
      
      {/* Content Container */}
      <div className="p-6 lg:p-8 flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
        
        {/* ========================================================================= */}
        {/* HEADER & TIME FILTER BAR                                                  */}
        {/* ========================================================================= */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-5">
            แดชบอร์ด
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">ยอดขายตามภูมิภาค</h2>
              <p className="text-xs text-gray-400 mt-0.5">ข้อมูลทุกส่วนปรับตามช่วงเวลาที่เลือก</p>
            </div>

            {/* Time Period Filter Pills */}
            <div className="flex items-center gap-1.5">
              {(['สัปดาห์', 'เดือน', 'ไตรมาส', 'ปี'] as const).map((period) => {
                const isActive = selectedPeriod === period;
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setSelectedPeriod(period)}
                    className={`cursor-pointer px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#1E293B] text-white shadow-sm'
                        : 'bg-[#F1F5F9] text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {period}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. สถิติร้านค้า (STORE STATS CARD)                                         */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-base">สถิติร้านค้า</h3>
            <span className="px-3 py-1 bg-blue-50 border border-blue-200/80 text-blue-600 rounded-lg text-xs font-semibold">
              ปี {currentYearDisplay}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {/* 1. รายได้รวม */}
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 mb-2">รายได้รวม (บาท)</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {totalRevenueDisplay}
              </span>
            </div>

            {/* 2. คำสั่งซื้อ */}
            <div className="flex flex-col sm:pl-6 pt-4 sm:pt-0">
              <span className="text-xs font-medium text-gray-500 mb-2">คำสั่งซื้อ (รายการ)</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {totalOrdersDisplay}
              </span>
            </div>

            {/* 3. ผู้ใช้ใหม่ */}
            <div className="flex flex-col sm:pl-6 pt-4 sm:pt-0">
              <span className="text-xs font-medium text-gray-500 mb-2">ผู้ใช้ใหม่ (คน)</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {newUsersDisplay}
              </span>
            </div>

            {/* 4. ยอดขายรวม */}
            <div className="flex flex-col sm:pl-6 pt-4 sm:pt-0">
              <span className="text-xs font-medium text-gray-500 mb-2">ยอดขายรวม (ชิ้น)</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {totalProductsSaleDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. เปรียบเทียบรายได้ (INCOME COMPARISON CARD)                               */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-gray-900 text-base">เปรียบเทียบรายได้</h3>
              <p className="text-xs text-gray-400 mt-0.5">เปรียบเทียบช่วงเวลาเดียวกัน</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Period toggle pills: เดือน, ไตรมาส, ปี */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {(['เดือน', 'ไตรมาส', 'ปี'] as const).map((p) => {
                  const isActive = comparePeriod === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setComparePeriod(p)}
                      className={`cursor-pointer w-[64px] sm:w-[68px] py-2 rounded-xl text-xs text-center transition-all ${
                        isActive
                          ? 'bg-[#334155] text-white font-semibold shadow-sm'
                          : 'bg-[#F1F5F9] text-gray-500 font-medium hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {comparePeriod === 'ปี' ? (
                <>
                  {/* Start Year Dropdown */}
                  <div className="relative w-[100px] sm:w-[105px]">
                    <select
                      value={yearRangeStart}
                      onChange={(e) => setYearRangeStart(e.target.value)}
                      className="w-full appearance-none bg-[#F1F5F9] hover:bg-[#E2E8F0] border-0 rounded-xl py-2 pl-3.5 pr-7 text-xs font-medium text-gray-700 focus:outline-none cursor-pointer transition-colors truncate"
                    >
                      {Object.keys(YEARLY_MOCK_DATA).map((yr) => (
                        <option key={yr} value={yr}>
                          ปี {yr}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <span className="text-xs text-gray-400 font-semibold px-0.5">-</span>

                  {/* End Year Dropdown */}
                  <div className="relative w-[100px] sm:w-[105px]">
                    <select
                      value={yearRangeEnd}
                      onChange={(e) => setYearRangeEnd(e.target.value)}
                      className="w-full appearance-none bg-[#F1F5F9] hover:bg-[#E2E8F0] border-0 rounded-xl py-2 pl-3.5 pr-7 text-xs font-medium text-gray-700 focus:outline-none cursor-pointer transition-colors truncate"
                    >
                      {Object.keys(YEARLY_MOCK_DATA).map((yr) => (
                        <option key={yr} value={yr}>
                          ปี {yr}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </>
              ) : (
                <>
                  {/* Side 1 Dropdown */}
                  <div className="relative w-[100px] sm:w-[105px]">
                    <select
                      value={side1Selection}
                      onChange={(e) => setSide1Selection(e.target.value)}
                      className="w-full appearance-none bg-[#F1F5F9] hover:bg-[#E2E8F0] border-0 rounded-xl py-2 pl-3.5 pr-7 text-xs font-medium text-gray-700 focus:outline-none cursor-pointer transition-colors truncate"
                    >
                      <option value="2024">ปี 2024</option>
                      <option value="2025">ปี 2025</option>
                      <option value="2026">ปี 2026</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <span className="text-xs text-gray-400 font-medium px-0.5">กับ</span>

                  {/* Side 2 Dropdown */}
                  <div className="relative w-[100px] sm:w-[105px]">
                    <select
                      value={side2Selection}
                      onChange={(e) => setSide2Selection(e.target.value)}
                      className="w-full appearance-none bg-[#F1F5F9] hover:bg-[#E2E8F0] border-0 rounded-xl py-2 pl-3.5 pr-7 text-xs font-medium text-gray-700 focus:outline-none cursor-pointer transition-colors truncate"
                    >
                      <option value="2024">ปี 2024</option>
                      <option value="2025">ปี 2025</option>
                      <option value="2026">ปี 2026</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stat Figures & Growth Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-8">
              <div>
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                  {year1Label}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  ฿{compTotal1.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-[#00C49F] flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00C49F]" />
                  {year2Label}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#00C49F] tracking-tight">
                  ฿{compTotal2.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Growth Badge */}
            <div
              className={`border rounded-xl px-4 py-2 text-center min-w-[76px] ${
                compGrowthRate >= 0
                  ? 'bg-[#E8F8F0] border-[#A7F3D0] text-emerald-600'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}
            >
              <span className="text-[11px] font-medium block leading-tight">เติบโต</span>
              <span className="text-sm font-bold block leading-tight mt-0.5">{compGrowthRateStr}</span>
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  {/* Teal/Green Gradient for Side 2 (e.g. 2026) */}
                  <linearGradient id="compAreaThis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00C49F" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#00C49F" stopOpacity={0.02} />
                  </linearGradient>
                  {/* Blue Gradient for Side 1 (e.g. 2025) */}
                  <linearGradient id="compAreaLast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, maxComparisonVal]}
                  tickFormatter={(val) => (val === 0 ? "0" : val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${Math.round(val / 1000)}k`)}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any, name: any) => {
                    if (val === null || val === undefined) return ["-", ""];
                    const formatted = `฿${Number(val).toLocaleString()}`;
                    if (comparePeriod === 'ปี') return [formatted, "รายได้รวม"];
                    return [
                      formatted,
                      name === 'y2' ? year2Label : year1Label,
                    ];
                  }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                {comparePeriod === 'ปี' ? (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="รายได้รวม"
                    stroke="#00C49F"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#compAreaThis)"
                    dot={{ r: 5, fill: '#00C49F', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                ) : (
                  <>
                    {/* Year 1 Blue Line */}
                    <Area
                      type="monotone"
                      dataKey="y1"
                      name={year1Label}
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#compAreaLast)"
                      dot={comparePeriod === 'ไตรมาส' ? { r: 4, fill: '#3B82F6' } : false}
                      activeDot={{ r: 5 }}
                      connectNulls={false}
                    />
                    {/* Year 2 Teal Line */}
                    <Area
                      type="monotone"
                      dataKey="y2"
                      name={year2Label}
                      stroke="#00C49F"
                      strokeWidth={2.2}
                      fillOpacity={1}
                      fill="url(#compAreaThis)"
                      dot={comparePeriod === 'ไตรมาส' ? { r: 4, fill: '#00C49F' } : false}
                      activeDot={{ r: 5 }}
                      connectNulls={false}
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. ROW 2: สินค้าขายดี, ช่องทางการขาย, สัดส่วนหมวดหมู่                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: สินค้าขายดี (6/12 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-base">สินค้าขายดี</h3>
                <p className="text-xs text-gray-400 mt-0.5">อันดับสินค้าตามยอดขาย - เดือนนี้</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-normal">
                      <th className="pb-3 w-6 pr-2 font-normal">#</th>
                      <th className="pb-3 pr-2 font-normal">สินค้า</th>
                      <th className="pb-3 px-2.5 text-right font-normal whitespace-nowrap">ราคา/ชิ้น</th>
                      <th className="pb-3 px-2.5 text-right font-normal whitespace-nowrap">จำนวนขาย</th>
                      <th className="pb-3 px-2.5 text-right font-normal whitespace-nowrap">รายได้</th>
                      <th className="pb-3 pl-2.5 text-right font-normal whitespace-nowrap">คะแนน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topProductsList.map((product, idx) => (
                      <tr key={product.id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 pr-2 font-medium text-gray-500">{idx + 1}</td>
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                            />
                            <div className="flex flex-col gap-0.5 min-w-0 max-w-[160px] sm:max-w-[200px]">
                              <span className="font-medium text-gray-900 truncate" title={product.name}>
                                {product.displayName || product.name}
                              </span>
                              {product.categoryBadge && (
                                <span className={`inline-block w-fit px-1.5 py-0.5 rounded text-[10px] font-medium border ${product.badgeColor}`}>
                                  {product.categoryBadge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-2.5 text-right font-medium text-gray-700 whitespace-nowrap">
                          ฿ {Number(product.price || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-2.5 text-right font-medium text-gray-700 whitespace-nowrap">
                          {Number(product.soldCount || 0).toLocaleString()} ชิ้น
                        </td>
                        <td className="py-3.5 px-2.5 text-right font-semibold text-gray-900 whitespace-nowrap">
                          {product.revenueDisplay}
                        </td>
                        <td className="py-3.5 pl-2.5 text-right whitespace-nowrap">
                          <span className="inline-flex items-center justify-end gap-1 text-gray-800 font-medium">
                            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 text-amber-400" />
                            {product.rating}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Card 2: ช่องทางการขาย (3/12 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">ช่องทางการขาย</h3>
              <p className="text-xs text-gray-400 mt-0.5">สัดส่วนยอดขายตามช่องทาง (%)</p>
            </div>

            {/* Donut Chart with Center Revenue Label */}
            <div className="h-44 w-full relative my-3 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesChannelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {salesChannelData.map((entry, index) => (
                      <Cell key={`cell-ch-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text inside Donut Hole */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-gray-800 tracking-tight">
                  {totalRevenueDisplay}
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-2.5 text-xs pt-1">
              {salesChannelData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 font-medium truncate">
                      {item.name} · ฿ {item.amount.toLocaleString()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-600 pl-2 shrink-0">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: สัดส่วนหมวดหมู่ (3/12 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">สัดส่วนหมวดหมู่</h3>
              <p className="text-xs text-gray-400 mt-0.5">สัดส่วนยอดขายตามหมวดหมู่ (%)</p>
            </div>

            {/* Donut Chart with Center Revenue Label */}
            <div className="h-44 w-full relative my-3 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRatioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryRatioData.map((entry, index) => (
                      <Cell key={`cell-cat-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text inside Donut Hole */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-gray-800 tracking-tight">
                  {totalRevenueDisplay}
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-2 text-xs pt-1">
              {categoryRatioData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 font-medium truncate max-w-[140px]">
                      {item.name} · ฿ {item.amount.toLocaleString()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-600 pl-2 shrink-0">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. ROW 3: ยอดขายตามภูมิภาค, แจ้งเตือนสต็อกสินค้า, รีวิวจากลูกค้า              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: ยอดขายตามภูมิภาค (6/12 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col">
            <h3 className="font-bold text-gray-900 text-base mb-2">ยอดขายตามภูมิภาค</h3>

            {/* Vertical Bar Chart matching the mock screenshot */}
            <div className="flex-1 w-full min-h-[300px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalChartData} margin={{ top: 24, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                  <XAxis
                    dataKey="region"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    ticks={[0, 500, 1000, 1500, 2000, 2500]}
                    domain={[0, 2500]}
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#F1F5F9', opacity: 0.5 }}
                    formatter={(val: any) => [`${Number(val).toLocaleString()} รายการ`, 'จำนวนออเดอร์']}
                    labelFormatter={(label) => {
                      const match = regionalChartData.find((r) => r.region === label);
                      return match ? match.fullRegion : label;
                    }}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(val: any) => Number(val).toLocaleString()}
                      fill="#334155"
                      fontSize={12}
                      fontWeight={600}
                      offset={8}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: แจ้งเตือนสต็อกสินค้า (3/12 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">แจ้งเตือนสต็อกสินค้า</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">แสดงเฉพาะสินค้าที่เหลือน้อยกว่า 15 ชิ้น</p>
                </div>
                <span className="text-[11px] font-medium text-red-500 whitespace-nowrap pl-1">
                  {urgentCount} รายการต้องจัดการ
                </span>
              </div>

              {/* Alert Items stacked with smooth scroll */}
              <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1.5 scrollbar-thin">
                {stockAlertCards.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleManageProduct(item)}
                    className={`group relative rounded-xl p-3 border flex items-center justify-between gap-2.5 transition-all hover:shadow-md cursor-pointer ${item.bgClass}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-white/80 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-800 text-xs block truncate" title={item.name}>
                          {item.name}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${item.badgeClass}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-end">
                      {/* Default: Quantity Text */}
                      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap group-hover:hidden transition-all">
                        {item.count} ชิ้น
                      </span>

                      {/* Hover: Manage Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManageProduct(item);
                        }}
                        className="hidden group-hover:inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        จัดการ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: รีวิวจากลูกค้า (3/12 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">รีวิวจากลูกค้า</h3>
              <p className="text-xs text-gray-400 mt-0.5">2,381 รีวิว</p>
            </div>

            {/* Score & Stars */}
            <div className="flex flex-col items-center justify-center my-3">
              <span className="text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
                {avgRatingDisplay}
              </span>
              <div className="flex text-amber-400 gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.floor(Number(avgRatingDisplay))
                        ? 'fill-amber-400 stroke-amber-400 text-amber-400'
                        : 'text-gray-200 stroke-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Progress Bars Breakdown */}
            <div className="space-y-2 text-xs">
              {reviewsBreakdown.map((r, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-12 text-gray-500 font-normal shrink-0 text-right">
                    {r.label}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${r.percent}%`, backgroundColor: r.color }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 font-normal shrink-0 text-right min-w-[50px]">
                    {r.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Edit Product Modal */}
      <AddProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
          dispatch(getOwnerDashboard());
        }}
        product={editingProduct}
      />
    </div>
  );
}

export default Dashboard;
