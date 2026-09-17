import HeaderAdmin from "../../components/admin/HeaderAdmin";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  getUserManagement,
  updateUserRole,
  suspendUser,
  activeUser,
} from "../../redux/owner/ownerReducer";
import type { User, UserRole } from "../../types/owner";
import UserFilterBar from "../../components/admin/UserFilterBar";
import { Pagination } from "../../components/admin/Pagination";

// ─── Pagination config ───
const ITEMS_PER_PAGE = 10;

/** แปลง role จาก API เป็นภาษาไทย */
const ROLE_LABEL_MAP: Record<UserRole, string> = {
  OWNER: "เจ้าของร้าน",
  ADMIN: "เจ้าของร้าน",
  MODERATOR: "พนักงาน",
  USER: "ผู้ใช้งาน",
};

const getRoleLabel = (role: UserRole): string => {
  if (!role) return "-";
  return ROLE_LABEL_MAP[role] || "-";
};

const getRoleBadgeClass = (role: UserRole): string => {
  if (!role) return "bg-[#F3F4F6] text-[#4B5563]";
  const norm = role.replace("ROLE_", "");
  switch (norm) {
    case "OWNER":
    case "ADMIN":
      return "bg-[#F3E8FF] text-[#7E22CE]";
    case "MODERATOR":
      return "bg-[#EFF6FF] text-[#1D4ED8]";
    default:
      return "bg-[#F3F4F6] text-[#4B5563]";
  }
};

/** สี Badge ตามสถานะ */
const getStatusBadge = (suspended: boolean) => {
  if (suspended) {
    return {
      label: "ระงับการใช้งาน",
      className:
        "px-3 py-1 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#DC2626]",
    };
  }
  return {
    label: "ใช้งานได้",
    className:
      "px-3 py-1 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#2E7D32]",
  };
};

function UserManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { users, totalPages } = useSelector((state: RootState) => state.owner);
  const pageParam = searchParams.get("page");
  const initialPage = pageParam !== null ? Number(pageParam) + 1 : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  // อ่านค่า keyword จาก URL มาเป็นสถานะเริ่มต้น
  const [searchTerm, setSearchTerm] = useState(() => {
    return searchParams.get("search") || "";
  });
  const [activeKeyword, setActiveKeyword] = useState(() => {
    return searchParams.get("search") || "";
  });

  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      // role: selectedUser?.role?.replace("ROLE_", "") === "OWNER"
      //   ? "ADMIN"
      //   : (selectedUser?.role?.replace("ROLE_", "") || "USER"),
      role: selectedUser?.role?.replace("ROLE_", "") || "USER",
      suspended: selectedUser?.suspended ? "suspended" : "active",
    },
    onSubmit: async (values) => {
      if (!selectedUser) return;

      try {
        const currentRole = selectedUser.role.replace("ROLE_", "") || "USER";
        const currentSuspended = selectedUser.suspended
          ? "suspended"
          : "active";

        const roleChanged = values.role !== currentRole;
        const suspendChanged = values.suspended !== currentSuspended;

        if (!roleChanged && !suspendChanged) {
          setSelectedUser(null);
          return;
        }

        const promises: Promise<any>[] = [];

        // 1. Update Role
        if (roleChanged) {
          promises.push(
            dispatch(
              updateUserRole({
                userId: selectedUser.id,
                roleName: values.role as UserRole,
              }),
            ).unwrap(),
          );
        }

        // 2. Update Status
        if (suspendChanged) {
          if (values.suspended === "suspended") {
            promises.push(dispatch(suspendUser(selectedUser.id)).unwrap());
          } else {
            promises.push(dispatch(activeUser(selectedUser.id)).unwrap());
          }
        }

        await Promise.all(promises);

        // 3. Show success toast and close modal
        if (roleChanged && suspendChanged) {
          toast.success("อัปเดตบทบาทและสถานะสำเร็จ");
        } else if (roleChanged) {
          toast.success("อัปเดตบทบาทสำเร็จ");
        } else if (suspendChanged) {
          toast.success("อัปเดตสถานะสำเร็จ");
        }

        setSelectedUser(null);
      } catch (error) {
        console.error("Update error:", error);
        toast.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      }
    },
  });

  const setSearchParamsRef = useRef(setSearchParams);

  useEffect(() => {
    setSearchParamsRef.current = setSearchParams;
  }, [setSearchParams]);

  // ฟังก์ชันเขียนค่าลง URL
  const updateSearchParams = useCallback(() => {
    const params: Record<string, string> = {
      page: String(currentPage - 1),
      size: String(ITEMS_PER_PAGE),
    };

    setSearchParamsRef.current(params, { replace: true });
  }, []);

  useEffect(() => {
    updateSearchParams();
  }, [currentPage, activeKeyword, updateSearchParams]);

  // เรียกดึงข้อมูลจาก API เมื่อ activeKeyword หรือหน้า (currentPage) มีการเปลี่ยนแปลง
  useEffect(() => {
    dispatch(
      getUserManagement({
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
        search: activeKeyword.trim(),
      }),
    );
  }, [dispatch, currentPage, activeKeyword]);

  // ฟังก์ชันกดค้นหาจากปุ่ม หรือ Enter
  const handleSearchSubmit = () => {
    setCurrentPage(1);
    setActiveKeyword(searchTerm);
  };

  const displayedUsers = useMemo(() => {
    let result: User[] = [...users];

    if (roleFilter) {
      const matchRoles: string[] = [roleFilter, `ROLE_${roleFilter}`];
      if (roleFilter === "ADMIN" || roleFilter === "OWNER") {
        matchRoles.push("ADMIN");
      }
      result = result.filter((u) => matchRoles.includes(u.role));
    }

    if (statusFilter === "active") {
      result = result.filter((u) => !u.suspended);
    } else if (statusFilter === "suspended") {
      result = result.filter((u) => u.suspended);
    }

    const ROLE_PRIORITY_LOCAL: Record<string, number> = {
      OWNER: 0,
      ADMIN: 0,
      MODERATOR: 1,
      USER: 2,
    };

    result.sort((a, b) => {
      const normA = (a.role || "").toUpperCase().replace("ROLE_", "").trim();
      const normB = (b.role || "").toUpperCase().replace("ROLE_", "").trim();
      const priorityA = ROLE_PRIORITY_LOCAL[normA] ?? 99;
      const priorityB = ROLE_PRIORITY_LOCAL[normB] ?? 99;
      return priorityA - priorityB;
    });

    return result;
  }, [users, roleFilter, statusFilter]);

  // ใช้จำนวนหน้าทั้งหมดจาก Redux (ที่ได้จาก Backend)
  const totalDisplayPages = totalPages || 0;

  const paginatedUsers = displayedUsers;
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setCurrentPage(1);
      setActiveKeyword("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <HeaderAdmin
        title="จัดการผู้ใช้"
        subtitle="จัดการบัญชีผู้ใช้ บทบาท และสิทธิ์การเข้าถึง"
      />

      <div className="p-6 text-[#374151]">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <UserFilterBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            roleFilter={roleFilter}
            onRoleChange={(value) => {
              setRoleFilter(value);
              setCurrentPage(1);
            }}
            statusFilter={statusFilter}
            onStatusChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          />

          {/* ─── Table ─── */}
          <div className="overflow-x-auto relative">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-sm font-medium">
                  <th className="pb-3 font-medium">ชื่อ - นามสกุล</th>
                  <th className="pb-3 font-medium">อีเมล</th>
                  <th className="pb-3 font-medium">เบอร์โทร</th>
                  <th className="pb-3 font-medium">บทบาท</th>
                  <th className="pb-3 font-medium">สถานะ</th>
                  <th className="pb-3 text-right" />
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const status = getStatusBadge(user.suspended);
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-4 font-normal text-gray-900">
                          {user.name}
                        </td>
                        <td className="py-4 text-gray-500">{user.email}</td>
                        <td className="py-4 text-gray-500">
                          {user.phone ?? "-"}
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            data-test={`management-button-${user.id}`}
                            type="button"
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors cursor-pointer"
                          >
                            จัดการ
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage} // บวก 1 เพื่อให้ Pagination โชว์เริ่มที่หน้า 1
            totalPages={totalDisplayPages}
            onPageChange={(newPage) => handlePageChange(newPage)} // ลบ 1 คืนตอนส่งค่ากลับให้ State
          />
        </div>
      </div>

      {/* ─── Modal จัดการผู้ใช้ ─── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] overflow-hidden transform transition-all">
            <div className="bg-[#3B82F6] p-6 text-center">
              <h3 className="text-white text-xl font-bold tracking-wide">
                บัญชีผู้ใช้
              </h3>
            </div>

            <form onSubmit={formik.handleSubmit} className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      ชื่อ - นามสกุล
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedUser.name}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      อีเมล
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedUser.email}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedUser.phone ?? "-"}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        บทบาทปัจจุบัน
                      </label>
                      <select
                        name="role"
                        value={formik.values.role}
                        onChange={formik.handleChange}
                        className={`w-full px-2 py-2 border-none rounded-lg text-xs font-medium focus:outline-none cursor-pointer ${
                          formik.values.role === "ADMIN" ||
                          formik.values.role === "OWNER"
                            ? "bg-[#F3E8FF] text-[#7E22CE]"
                            : formik.values.role === "MODERATOR"
                              ? "bg-[#EFF6FF] text-[#1D4ED8]"
                              : "bg-[#F3F4F6] text-[#4B5563]"
                        }`}
                      >
                        <option value="ADMIN">เจ้าของร้าน</option>
                        <option value="MODERATOR">พนักงาน</option>
                        <option value="USER">ผู้ใช้งาน</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        สถานะบัญชีผู้ใช้
                      </label>
                      <select
                        name="suspended"
                        value={formik.values.suspended}
                        onChange={formik.handleChange}
                        className={`w-full px-2 py-2 border-none rounded-lg text-xs font-medium focus:outline-none cursor-pointer ${
                          formik.values.suspended === "suspended"
                            ? "bg-[#FEE2E2] text-[#DC2626]"
                            : "bg-[#E8F5E9] text-[#2E7D32]"
                        }`}
                      >
                        <option value="active">ใช้งานได้</option>
                        <option value="suspended">ระงับการใช้งาน</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="px-8 py-2 bg-[#10B981] hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  บันทึกการตั้งค่า
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-8 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
