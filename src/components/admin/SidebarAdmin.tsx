import { useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  Truck,
  CircleDollarSign,
  Bell,
  Store,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/auth/authReducer";
import { TokenService } from "../../services/token.service";
import { toast } from "react-hot-toast";
import type { RootState } from "../../redux/store";
import { getProfile } from "../../redux/auth/authReducer";

function SidebarAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const isOwner = Array.isArray(user?.roles)
    ? user.roles.some(
        (role: any) => role === "ADMIN" || role?.roleName === "ADMIN",
      )
    : false;

  useEffect(() => {
    dispatch(getProfile() as any);
  }, [dispatch]);

  const handleLogout = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 items-center p-2">
          <span className="text-gray-800 font-medium text-base">
            คุณต้องการออกจากระบบใช่หรือไม่?
          </span>
          <div className="flex gap-3 mt-2">
            <button
              data-test="btn-confirm-logout-admin"
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                TokenService.removeToken();
                dispatch(logout());

                toast.dismiss();
                toast.success("ออกจากระบบสำเร็จ");
                navigate("/login");
              }}
              className="cursor-pointer px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              ออกจากระบบ
            </button>
            <button
              data-test="btn-cancel-logout-admin"
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
        id: "logout-confirm",
      },
    );
  };

  const menuClass = (paths: string[]) =>
    `cursor-pointer w-[204px] h-12 px-[10px] rounded-lg flex items-center gap-[10px] text-[16px] transition-all ${
      paths.some((path) => location.pathname.startsWith(path))
        ? "bg-blue-100 text-black"
        : "hover:bg-blue-100 hover:text-black"
    }`;
  return (
    <div className="w-[244px] shrink-0 h-screen sticky top-0 bg-white text-black p-5 flex flex-col justify-between border-r border-gray-500 print:hidden overflow-y-auto">
      <div>
        <div className="flex justify-center py-2">
          <img
            src={logo}
            className="w-[81px] h-[81px] object-contain"
            alt="Logo"
          />
        </div>

        <ul className="flex flex-col gap-3 px-0">
          <li>
            <button
              data-test="dashboard-button"
              className={menuClass([
                "/dashboard",
              ])}
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <LayoutDashboard size={18} />
              แดชบอร์ด
            </button>
          </li>
          <li>
            <button
              data-test="report-button"
              className={menuClass(["/analytic"])}
              onClick={() => navigate("/analytic")}
            >
              <TrendingUp size={18} />
              รายงานยอดขาย
            </button>
          </li>
          <li>
            <button
              data-test="stock-button"
              className={menuClass(["/stock"])}
              onClick={() => navigate("/stock")}
            >
              <Package size={18} />
              จัดการสินค้าในคลัง
            </button>
          </li>
          <li>
            <button
              data-test="orders-button"
              className={menuClass(["/orders"])}
              onClick={() => navigate("/orders-management")}
            >
              <Truck size={18} />
              จัดการคำสั่งซื้อ
            </button>
          </li>
          <li>
            <button
              data-test="refund-button"
              className={menuClass(["/refund"])}
              onClick={() => navigate("/refund")}
            >
              <CircleDollarSign size={18} />
              จัดการคำขอคืนเงิน
            </button>
          </li>

          <>
            {isOwner && (
              <li>
                <button
                  data-test="user-edit-button"
                  className={menuClass(["/user-management"])}
                  onClick={() => navigate("/user-management")}
                >
                  <Users size={18} />
                  จัดการผู้ใช้
                </button>
              </li>
            )}

            {isOwner && (
              
              <li>
                <button
                  data-test="store-edit-button"
                  className={menuClass(["/store-edit"])}
                  onClick={() => navigate("/store-edit")}
                >
                  <Settings size={18} />
                  ตั้งค่าร้านค้า
                </button>
              </li>
            )}
          </>
          <li>
            <button
              data-test="notification-button"
              className={menuClass(["/notify-management"])}
              onClick={() => navigate("/notify-management")}
            >
              <Bell size={18} />
              จัดการแจ้งเตือน
            </button>
          </li>
        </ul>
      </div>
      <div className="border-t border-gray-100 pt-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 p-3">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
              {user?.image_url || user?.image ? (
                <img
                  src={user.image_url || user.image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Users size={20} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>
          <div className="overflow-hidden">
            <p className="font-medium text-sm text-gray-900 truncate">
              {user?.name || "กำลังโหลด..."}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || "กำลังโหลด..."}
            </p>
          </div>
        </div>

        <button
          data-test="home-button"
          onClick={() => navigate("/")}
          className="cursor-pointer w-[204px] h-12 px-[10px] rounded-lg flex items-center gap-[10px] text-[16px] hover:bg-blue-100"
        >
          <Store size={18} />
          หน้าหลักร้านค้า
        </button>

        <button
          onClick={handleLogout}
          data-test="logout-button"
          className="cursor-pointer w-[204px] h-12 px-[10px] rounded-lg flex items-center gap-[10px] text-[16px] hover:bg-red-300"
        >
          <LogOut size={18} />
          ลงชื่อออกจากระบบ
        </button>
      </div>
    </div>
  );
}

export default SidebarAdmin;