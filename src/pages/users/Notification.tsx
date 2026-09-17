import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Pagination } from "../../components/admin/Pagination";

import type { AppDispatch, RootState } from "../../redux/store";
import {
  fetchUserNotify,
  markAsReadNotify,
  markAllAsReadNotify,
  fetchNotificationCounts,
} from "../../redux/notification/notificationReducer";
import { Icon } from "@iconify/react";
import ProfileSidebar from "../../components/user/ProfileSidebar";
import type {
  NotificationType,
  ClientNotification,
} from "../../types/notification";
import NotificationSkeleton from "../../components/loading/NotificationSkeleton";

const NotificationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [activeFilter, setActiveFilter] = useState<NotificationType>("ALL");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth?.isAuthenticated ?? true,
  );
  const rawNotifications = useSelector(
    (state: RootState) => state.notification.items,
  );
  console.log(rawNotifications);
  const isLoading = useSelector(
    (state: RootState) => state.notification.isLoading,
  );

  const counts = useSelector((state: RootState) => state.notification.counts);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(fetchNotificationCounts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchUserNotify(activeFilter));
  }, [dispatch, activeFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [...rawNotifications].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;

    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return dateB - dateA;
  });

  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);

  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const filters: {
    id: NotificationType;
    label: string;
    count: number;
  }[] = [
    {
      id: "ALL",
      label: "ทั้งหมด",
      count: counts.ALL,
    },
    {
      id: "ORDERED",
      label: "คำสั่งซื้อ",
      count: counts.ORDERED,
    },
    {
      id: "REFUNDED",
      label: "คำขอคืนเงิน",
      count: counts.REFUNDED,
    },
    {
      id: "STORE",
      label: "ร้านค้า",
      count: counts.STORE,
    },
  ];

  const activeFilterData =
    filters.find((f) => f.id === activeFilter) || filters[0];

  const extractOrderNo = (message: string) => {
    const match = message.match(/ออร์เดอร์เลขที่\s([A-Z0-9-]+)/);
    return match ? match[1] : null;
  };

  const handleNotificationClick = async (item: ClientNotification) => {
    // ถ้ายังไม่อ่าน ค่อย mark as read
    if (!item.read) {
      await dispatch(markAsReadNotify(item.id));
      dispatch(fetchNotificationCounts());
    }

    // ดึง orderNo จากข้อความ
    const orderNo = extractOrderNo(item.message);

    // ถ้ามี orderNo ให้ไปหน้ารายละเอียดคำสั่งซื้อ
    if (orderNo) {
      navigate(`/orders/${orderNo}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsReadNotify());
    dispatch(fetchNotificationCounts());
  };

  return (
    <div className="min-h-screen bg-white font-anuphan text-gray-900 pt-5 sm:pt-5 pb-20">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-5 pt-5 md:pt-6">
        <nav className="hidden md:hidden lg:flex flex-wrap items-center text-md text-black mb-4 md:mb-8 font-medium">
          <Link
            data-test="click-home"
            to="/"
            className="transition-colors cursor-pointer"
          >
            หน้าหลัก
          </Link>
          <Icon
            icon="material-symbols:chevron-right-rounded"
            className="w-5 h-5 mx-1 text-black"
          />
          <Link to="/profile" className="transition-colors cursor-pointer">
            โปรไฟล์
          </Link>
          <Icon
            icon="material-symbols:chevron-right-rounded"
            className="w-5 h-5 mx-1 text-black"
          />
          <span className="text-black">การแจ้งเตือน</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="hidden lg:block w-[280px] flex-shrink-0">
            <ProfileSidebar />
          </div>

          <main className="flex-1 w-full bg-white md:rounded-lg md:shadow-sm md:border border-gray-200 px-4 py-4 md:py-8 min-h-[500px]">
            <div className="md:hidden flex items-start gap-3 pb-3 border-b border-gray-300 mb-4">
              <button
                className="mt-1 text-black p-0 flex-shrink-0"
                onClick={() => navigate(-1)}
                data-test="btn-mobile-back"
              >
                <Icon icon="material-symbols:arrow-back" className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-[18px] leading-[28px] font-bold text-black">
                  การแจ้งเตือน
                </h1>
                <p className="text-gray-600 text-[14px] font-normal mt-1">
                  ดูการแจ้งเตือนทั้งหมดของคุณ
                </p>
              </div>
            </div>

            <div className="hidden md:block w-full mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-[22px] font-bold text-black">
                    การแจ้งเตือน
                  </h1>
                  <p className="text-[15px] mt-1 text-gray-600">
                    ดูการแจ้งเตือนทั้งหมดของคุณ
                  </p>
                </div>

                <button
                  onClick={handleMarkAllAsRead}
                  disabled={counts.ALL === 0}
                  className={`mt-7 flex items-center gap-2 rounded-xl px-4 py-2 text-base font-medium transition ${
                    counts.ALL === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#DCEAFE] text-[#3B82F6] hover:bg-[#cfe0fb]"
                  }`}
                >
                  <Icon
                    icon="material-symbols:done-all-rounded"
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">อ่านทั้งหมด</span>
                </button>
              </div>

              <div className="border-t border-black mt-5" />
            </div>

            <div className="flex flex-col md:flex-row gap-6 lg:gap-10 w-full">
              {/* Desktop Filters */}
              <div className="hidden md:flex flex-col gap-1 w-[200px] flex-shrink-0">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    data-test={`filter-desktop-${filter.id}`}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-md transition-colors text-[15px] cursor-pointer w-full text-start ${
                      activeFilter === filter.id
                        ? "bg-[#F3F4F6] text-blue-600 font-bold"
                        : "text-gray-700 hover:bg-gray-50 font-medium"
                    }`}
                  >
                    <span>{filter.label}</span>
                    {filter.count > 0 && (
                      <span className="bg-[#EF4444] text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                        {filter.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Mobile Filters */}
              <div
                className="md:hidden relative w-full mb-2"
                ref={filterMenuRef}
              >
                <button
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  data-test="btn-mobile-filter"
                  className="w-full flex items-center justify-between bg-[#F9FAFB] border border-gray-200 px-4 py-3 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold text-[15px]">
                      {activeFilterData.label}
                    </span>

                    {activeFilterData.count > 0 && (
                      <span className="bg-[#EF4444] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {activeFilterData.count}
                      </span>
                    )}
                  </div>
                  <Icon
                    icon="ic:baseline-menu"
                    className="w-6 h-6 text-gray-600"
                  />
                </button>

                {isMobileFilterOpen && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 shadow-lg rounded-md z-10 overflow-hidden">
                    {filters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setActiveFilter(filter.id);
                          setIsMobileFilterOpen(false);
                        }}
                        data-test={`filter-mobile-${filter.id}`}
                        className={`flex items-center justify-between w-full px-4 py-3 text-start border-b last:border-b-0 ${
                          activeFilter === filter.id
                            ? "bg-blue-50/50 text-blue-600 font-bold"
                            : "text-gray-700"
                        }`}
                      >
                        <span>{filter.label}</span>

                        {filter.count > 0 && (
                          <span className="bg-[#EF4444] text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                            {filter.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications List */}
              <div className="flex-1 flex flex-col gap-3 w-full">
                {isLoading ? (
                  <>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <NotificationSkeleton key={index} />
                    ))}
                  </>
                ) : notifications.length > 0 ? (
                  <>
                    {paginatedNotifications.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        data-test="notification-ดitem"
                        className={`w-full text-start p-4 rounded-lg flex flex-col gap-1 border transition-all ${
                          !item.read
                            ? "bg-[#EBF2FE] border-blue-100"
                            : "bg-white border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        <h3
                          className={`text-[15px] md:text-[16px] ${
                            !item.read
                              ? "font-bold text-gray-900"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {item.title}
                        </h3>

                        <p
                          className={`text-[14px] mt-0.5 leading-relaxed ${
                            !item.read ? "text-gray-700" : "text-gray-500"
                          }`}
                        >
                          {item.message}
                        </p>

                        <p className="text-[13px] text-gray-500 mt-1.5">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("th-TH")
                            : "-"}
                        </p>
                      </button>
                    ))}

                    {totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    )}
                  </>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-100"
                    data-test="empty-state"
                  >
                    <Icon
                      icon="solar:bell-broken"
                      className="w-16 h-16 text-black mb-4"
                    />

                    <p className="text-xl font-bold text-gray-800">
                      ไม่มีการแจ้งเตือนในหมวดหมู่นี้
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
