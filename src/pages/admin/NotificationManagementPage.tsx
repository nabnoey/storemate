import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  fetchOwnerNotify,
  createNotify,
  deleteNotify,
} from "../../redux/notification/notificationReducer";
import HeaderAdmin from "../../components/admin/HeaderAdmin";
import OwnerSkeletons from "../../components/loading/OwnerSkeletons";

interface NotificationFormData {
  subject: string;
  message: string;
  recipients: string;
}

const NotificationManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    items: notifications,
    isLoading,
    totalPages,
  } = useSelector((state: RootState) => state.notification);
  const [searchParams, setSearchParams] = useSearchParams();

  const keywordParam = searchParams.get("keyword") || "";
  const page = Number(searchParams.get("page") ?? 0);
  const size = Number(searchParams.get("size") ?? 10);
  const [searchKeyword] = useState(keywordParam);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState<NotificationFormData>({
    subject: "",
    message: "",
    recipients: "ทั้งหมด",
  });

  const userRoles =
    useSelector((state: RootState) => state.auth.user?.roles) || [];

  const isOwner = userRoles.includes("ADMIN") || userRoles.includes("OWNER");
  const isModifier = userRoles.includes("MODERATOR");

  useEffect(() => {
    if (isOwner || isModifier) {
      dispatch(
        fetchOwnerNotify({
          keyword: searchKeyword,
          page,
          size,
        }),
      );

      const params: Record<string, string> = {
        page: String(page),
        size: "10",
      };

      if (searchKeyword) {
        params.keyword = searchKeyword;
      }

      setSearchParams(params);
    }
  }, [dispatch, page, searchKeyword, isOwner, isModifier, setSearchParams]);

  const getRecipientConfig = (sendTo: string) => {
    if (sendTo?.includes("MODERATOR")) {
      return {
        label: "พนักงาน",
        className: "bg-blue-50 text-blue-600 border border-blue-100",
      };
    }
    if (sendTo?.includes("CUSTOMER")) {
      return {
        label: "ผู้ใช้งาน",
        className: "bg-green-50 text-green-600 border border-green-100",
      };
    }
    return {
      label: "ทั้งหมด",
      className: "bg-white border border-gray-300 text-black",
    };
  };

  const handleDelete = (id: number): void => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 items-center p-2">
          <span className="text-gray-800 font-medium text-base">
            คุณต้องการลบการแจ้งเตือนนี้ใช่หรือไม่?
          </span>

          <div className="flex gap-3 mt-2">
            <button
              data-test={`btn-confirm-delete-${id}`}
              type="button"
              onClick={async () => {
                try {
                  toast.dismiss(t.id);
                  await dispatch(deleteNotify(id)).unwrap();

                  dispatch(
                    fetchOwnerNotify({
                      keyword: searchKeyword,
                      page,
                      size,
                    }),
                  );
                  toast.success("ลบการแจ้งเตือนเรียบร้อยแล้ว");
                  // refreshNotificationList();
                } catch (error) {
                  toast.error("เกิดข้อผิดพลาด ไม่สามารถลบข้อมูลได้");
                }
              }}
              className="cursor-pointer px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              ยืนยันการลบ
            </button>

            <button
              data-test={`btn-cancel-delete-${id}`}
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-200"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        id: `delete-notification-${id}`,
      },
    );
  };

  const TOPIC_MAP = {
    ทั้งหมด: "ALL",
    ผู้ใช้งาน: "CUSTOMER",
    พนักงาน: "MODERATOR",
  } as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { subject, message, recipients } = formData;

    if (!subject.trim() || !message.trim()) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (message.length > 250) {
      toast.error("รายละเอียดต้องไม่เกิน 250 ตัวอักษร");
      return;
    }

    try {
      const mappedSendTo =
        TOPIC_MAP[recipients as keyof typeof TOPIC_MAP] || "ALL";

      await dispatch(
        createNotify({
          title: subject,
          message: message,
          sendTo: mappedSendTo,
        }),
      ).unwrap();

      await dispatch(
        fetchOwnerNotify({
          keyword: searchKeyword,
          page,
          size: 10,
        }),
      );

      toast.success("ส่งการแจ้งเตือนสำเร็จ");

      setFormData({ subject: "", message: "", recipients: "ทั้งหมด" });
      setIsModalOpen(false);

      // refreshNotificationList();
    } catch (error: any) {
      toast.error(error?.message || "เกิดข้อผิดพลาดในการส่งแจ้งเตือน");
    }
  };

  const handleCancel = (): void => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 items-center p-2">
          <span className="text-gray-800 font-medium text-base">
            คุณต้องการละทิ้งการแจ้งเตือนนี้หรือไม่?
          </span>

          <div className="flex gap-3 mt-2">
            <button
              data-test="btn-confirm-cancel-modal"
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                setIsModalOpen(false);
                setFormData({
                  subject: "",
                  message: "",
                  recipients: "ทั้งหมด",
                });
              }}
              className="cursor-pointer px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              ยืนยันการยกเลิก
            </button>

            <button
              data-test="btn-dismiss-cancel-modal"
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-200"
            >
              ย้อนกลับ
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        id: "cancel-notification-modal",
      },
    );
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);

    params.set("page", String(newPage));
    params.set("size", String(size));

    if (searchKeyword) {
      params.set("keyword", searchKeyword);
    }

    setSearchParams(params);
  };

  if (!isOwner && !isModifier) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 font-prompt p-4 text-center">
        <Icon
          icon="lucide:shield-alert"
          width="64"
          height="64"
          className="text-red-500 mb-4"
        />
        <h1 className="text-xl font-bold text-gray-800 mb-2">
          คุณไม่มีสิทธิ์เข้าถึง
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          เฉพาะผู้บริหารและพนักงานที่ได้รับอนุญาตเท่านั้น
        </p>
        <button
          data-test="btn-back-to-store"
          onClick={() => (window.location.href = "/store")}
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm transition-all"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const maxVisiblePages = 5;

  let startPage = Math.max(1, page + 1 - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const visiblePages = Array.from(
    { length: Math.max(0, endPage - startPage + 1) },
    (_, i) => startPage + i,
  );

  return (
    <div className="flex h-screen bg-white font-anuphan">
      <main className="flex-1 flex flex-col overflow-hidden">
        <HeaderAdmin
          title="จัดการแจ้งเตือน"
          subtitle="การแจ้งเตือนไปยังผู้ใช้งาน และลบการแจ้งเตือนที่ไม่ต้องการ"
        />

        <div className="p-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-end items-end mb-6">
              {isOwner && (
                <button
                  data-test="btn-open-create-noti"
                  onClick={() => setIsModalOpen(true)}
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium flex items-center transition-all shadow-md shadow-blue-100"
                >
                  <Icon
                    icon="mdi:bell"
                    width="18"
                    height="18"
                    className="mr-2"
                  />
                  สร้างการแจ้งเตือน
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-left text-[16px] font-medium text-black border-b border-gray-100">
                    <th className="pb-4 font-medium pl-2 w-[45%]">หัวข้อ</th>
                    <th className="pb-4 font-medium text-center w-[20%]">
                      ผู้รับ
                    </th>
                    <th className="pb-4 font-medium text-center w-[20%]">
                      วันที่ส่ง
                    </th>
                    {isOwner && <th className="pb-4 font-medium w-[15%]"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <OwnerSkeletons
                      type="mod-table"
                      rows={6}
                      columns={isOwner ? 4 : 3}
                    />
                  ) : notifications && notifications.length > 0 ? (
                    notifications.map((noti) => {
                      const recipient = getRecipientConfig(noti.sendTo);
                      return (
                        <tr
                          data-test={`row-noti-${noti.id}`}
                          key={noti.id}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="py-4 pl-2 pr-4">
                            {/* เผื่อเช็คเทสข้อมูลตามยูสเคส */}
                            <p
                              data-test={`cell-title-${noti.id}`}
                              className="text-[16px] font-medium text-[#0F172A] truncate"
                              title={noti.title}
                            >
                              {noti.title}
                            </p>
                            {/* เผื่อเช็คเทสข้อมูลตามยูสเคส */}
                            <p
                              data-test={`cell-message-${noti.id}`}
                              className="text-[14px] text-[#6B7280] mt-0.5 line-clamp-2"
                              title={noti.message}
                            >
                              {noti.message}
                            </p>
                          </td>
                          {/* เผื่อเช็คเทสข้อมูลตามยูสเคส */}
                          <td
                            data-test={`cell-recipient-${noti.id}`}
                            className="py-4 text-center"
                          >
                            <span
                              className={`text-[10px] px-3 py-1 rounded-full font-medium ${recipient.className}`}
                            >
                              {recipient.label}
                            </span>
                          </td>
                          {/* เผื่อเช็คเทสข้อมูลตามยูสเคส */}
                          <td
                            className="py-4 text-center text-[16px] text-black"
                            data-test={`cell-date-${noti.id}`}
                          >
                            {noti.createdAt
                              ? new Date(noti.createdAt).toLocaleDateString(
                                  "th-TH",
                                )
                              : "-"}
                          </td>

                          {isOwner && (
                            <td className="py-4 pr-2 text-right">
                              <div className="flex justify-end">
                                <button
                                  data-test={`btn-open-delete-${noti.id}`}
                                  onClick={() => handleDelete(noti.id)}
                                  title="ลบการแจ้งเตือน"
                                  className="cursor-pointer flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 bg-white text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  ลบ
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        data-test="noti-empyt"
                        colSpan={isOwner ? 4 : 3}
                        className="py-20 text-center text-gray-400 text-sm"
                      >
                        {searchKeyword
                          ? "ไม่พบหัวข้อการแจ้งเตือน"
                          : "ไม่พบรายการแจ้งเตือนในระบบ"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t border-gray-100 text-sm">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => updatePage(page - 1)}
                  className={`border border-gray-300 rounded-md px-4 py-1.5 font-medium transition-colors ${
                    page === 1
                      ? "text-gray-300 cursor-not-allowed border-gray-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  ก่อนหน้า
                </button>

                <div className="flex font-normal font-['Anuphan'] items-center gap-1">
                  {visiblePages.length > 0 ? (
                    visiblePages.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => updatePage(pageNumber - 1)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center font-medium transition-colors ${
                          pageNumber === page + 1
                            ? "text-blue-500 font-bold bg-transparent"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))
                  ) : (
                    <button
                      type="button"
                      className="w-8 h-8 text-blue-500 font-bold"
                    >
                      1
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => updatePage(page + 1)}
                  className={`border border-gray-300 rounded-md px-4 py-1.5 font-medium transition-colors ${
                    page >= totalPages - 1 || totalPages === 0
                      ? "text-gray-300 cursor-not-allowed border-gray-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  ต่อไป
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 py-8 px-6 text-center">
              <h2 className="text-white text-[48px] font-bold tracking-tight">
                สร้างการแจ้งเตือน
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[16px] font-medium text-black uppercase tracking-wider mb-2">
                  หัวข้อการแจ้งเตือน
                </label>
                <input
                  data-test="input-subject"
                  type="text"
                  name="subject"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md outline-none text-sm transition-all text-[#BDBDBD]"
                  placeholder="เช่น โปรโมชั่นเดือนพฤษภาคม..."
                  value={formData.subject}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-[16px] font-medium text-black uppercase tracking-wider mb-2">
                  รายละเอียด
                </label>
                <textarea
                  data-test="input-message"
                  name="message"
                  maxLength={250}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md outline-none text-sm transition-all h-28 resize-none text-[#BDBDBD]"
                  placeholder="เช่น ลดราคา"
                  value={formData.message}
                  onChange={handleChange}
                />

                <p className="text-xs text-gray-400 mt-1 text-right">
                  {formData.message.length}/250 ตัวอักษร
                </p>
              </div>

              <div className="pt-1">
                <div className="mb-2">
                  <select
                    data-test="select-recipients"
                    name="recipients"
                    className="bg-gray-100 border-none text-gray-600 text-xs rounded-md px-3 py-2 outline-none cursor-pointer"
                    value={formData.recipients}
                    onChange={handleChange}
                  >
                    <option value="ทั้งหมด">ส่งทั้งหมด</option>
                    <option value="พนักงาน">พนักงาน</option>
                    <option value="ผู้ใช้งาน">ผู้ใช้งาน</option>
                  </select>
                </div>

                <div className="flex justify-end items-center gap-2">
                  <button
                    data-test="btn-submit-create"
                    type="submit"
                    className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-medium transition-all"
                  >
                    ส่งการแจ้งเตือน
                  </button>

                  <button
                    data-test="btn-cancel-create"
                    type="button"
                    onClick={handleCancel}
                    className="cursor-pointer bg-white border border-black text-black px-6 py-2 rounded-full text-xs font-medium transition-all"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagementPage;
