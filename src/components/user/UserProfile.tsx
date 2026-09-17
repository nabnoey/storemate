import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { logout } from "../../redux/auth/authReducer";
import type { AppDispatch, RootState } from "../../redux/store";
import { TokenService } from "../../services/token.service";
import { toast } from "react-hot-toast";
//เพิ่มเพื่อลอง
import { fetchOrders } from "../../redux/orders/orderReducer";

interface UserProfileProps {
  variant?: "desktop" | "mobile";
  onCloseMenu?: () => void;
}

const UserProfile: React.FC<Readonly<UserProfileProps>> = ({
  variant = "desktop",
  onCloseMenu,
}) => {
  const user = useSelector((state: RootState) => state?.auth?.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const roles = user?.roles ?? [];
  //เพิ่มเพื่อลอง
  const { orders, loading } = useSelector((state: RootState) => state.orders);

  const isAdmin = roles.includes("ADMIN");
  const isModerator = roles.includes("MODERATOR");

  const canAccessBackoffice = isAdmin || isModerator;

  const handleAdminNavigation = () => {
    closeMenu();

    if (isAdmin) {
      navigate("/dashboard");
      return;
    }

    if (isModerator) {
      navigate("/dashboard");
      return;
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const closeMenu = () => {
    const elem = document.activeElement as HTMLElement;
    if (elem) {
      elem.blur();
    }
    if (onCloseMenu) {
      onCloseMenu();
    }
  };

  const handleNavigation = (path: string) => {
    closeMenu();
    navigate(path);
  };

  const handleLogout = () => {
    closeMenu();

    toast(
      (t) => (
        <div className="flex flex-col gap-3 items-center p-2">
          <span className="text-gray-800 font-medium text-base">
            คุณต้องการออกจากระบบใช่หรือไม่?
          </span>
          <div className="flex gap-3 mt-2">
            <button
              data-test="btn-confirm-logout"
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
              data-test="btn-cancel-logout"
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

  // --- แบบ MOBILE ---
  if (variant === "mobile") {
    return (
      <div className="flex items-center justify-between p-5 border-b border-gray-50 bg-white">
        <div className="flex items-center gap-3">
          <div
            data-test="btn-user-profile-mobile"
            className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200"
          >
            {user?.image_url || user?.image ? (
              <img
                src={user.image_url || user.image}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon
                icon="ph:user"
                width="24"
                height="24"
                className="text-black"
              />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-black">
          <button
            data-test="btn-edit-profile-mobile"
            type="button"
            onClick={() => handleNavigation("/profile")}
            className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-100 hover:text-[#0A157A] ${
              isActive("/profile") ? "bg-gray-100 text-[#0A157A]" : ""
            }`}
          >
            <Icon icon="ph:gear" width="26" height="26" />
          </button>
          <button
            data-test="btn-orders-mobile"
            type="button"
            onClick={() => handleNavigation("/orders?status=ALL")}
            className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-100 hover:text-[#0A157A] ${
              isActive("/orders?status=ALL") ? "bg-gray-100 text-[#0A157A]" : ""
            }`}
          >
            <Icon icon="radix-icons:clipboard" width="26" height="26" />
          </button>
          <button
            data-test="btn-logout-mobile"
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-lg cursor-pointer hover:bg-gray-100 hover:text-red-500 transition-colors"
          >
            <Icon
              icon="ph:sign-out"
              width="26"
              height="26"
              className="rotate-180"
            />
          </button>
        </div>
      </div>
    );
  }

  // --- แบบ DESKTOP ---
  return (
    <div
      className="dropdown dropdown-end lg:block hidden"
      data-test="user-profile-dropdown"
    >
      <button
        data-test="btn-user-profile"
        type="button"
        className="cursor-pointer outline-none"
      >
        <div className="cursor-pointer w-11 h-11 rounded-full overflow-hidden bg-gray-50 text-gray-500 flex items-center justify-center border border-gray-100 shadow-sm hover:bg-gray-100 transition-all">
          {user?.image_url || user?.image ? (
            <img
              src={user.image_url || user.image}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon
              icon="ph:user"
              width="28"
              height="28"
              className="text-black"
            />
          )}
        </div>
      </button>

      <div className="relative">
        <ul className="dropdown-content menu p-2 shadow-xl bg-white rounded-lg w-56 mt-4 border border-gray-100 z-[9999]">
          <li>
            <button
              data-test="btn-edit-profile"
              type="button"
              onClick={() => handleNavigation("/profile")}
              className={`flex w-full cursor-pointer items-center justify-start gap-[10px] p-[10px] transition-colors rounded-md text-left hover:bg-gray-100 ${
                isActive("/profile") ? "bg-gray-100" : ""
              }`}
            >
              <div className="relative flex items-center justify-center overflow-hidden">
                <Icon
                  icon="ph:gear"
                  width="20"
                  height="20"
                  className="text-black"
                />
              </div>
              <span className="break-words font-Anuphan text-[16px] font-semibold leading-[32px] text-black">
                แก้ไขโปรไฟล์
              </span>
            </button>
          </li>

          <hr className="my-1 border-gray-50" />

          <li>
            <button
              data-test="btn-orders"
              type="button"
              onMouseEnter={() => {
                //เพิ่มเพื่อลอง
                // 🛑 ต้องใส่ if ตรงนี้ครับ! เพื่อห้ามไม่ให้มันยิงซ้ำถ้ากำลังโหลด หรือมีข้อมูลแล้ว
                if (orders.length === 0 && !loading) {
                  dispatch(fetchOrders("ALL"));
                }
              }}
              onClick={() => handleNavigation("/orders?status=ALL")}
              className={`flex w-full cursor-pointer items-center justify-start gap-[10px] p-[10px] transition-colors rounded-md text-left hover:bg-gray-100 ${
                isActive("/orders?status=ALL") ? "bg-gray-100" : ""
              }`}
            >
              <div className="relative flex items-center justify-center overflow-hidden">
                <Icon
                  icon="radix-icons:clipboard"
                  width="20"
                  height="20"
                  className="text-black"
                />
              </div>
              <span className="break-words font-Anuphan text-[16px] font-semibold leading-[32px] text-black">
                การซื้อของฉัน
              </span>
            </button>
          </li>

          <hr className="my-1 border-gray-50" />

          {canAccessBackoffice && (
            <>
              <li>
                <button
                  type="button"
                  onClick={handleAdminNavigation}
                  className="flex w-full cursor-pointer items-center justify-start gap-[10px] p-[10px] transition-colors rounded-md text-left hover:bg-gray-100"
                >
                  <Icon
                    icon="ph:shield-check"
                    width="20"
                    height="20"
                    className="text-black"
                  />

                  <span className="font-Anuphan text-[16px] font-semibold leading-[32px] text-black">
                    ผู้ดูแลระบบ
                  </span>
                </button>
              </li>
            </>
          )}
          <li>
            <button
              data-test="btn-logout"
              type="button"
              onClick={handleLogout}
              className="group flex w-full cursor-pointer items-center justify-start gap-[10px] p-[10px] transition-colors rounded-md text-left hover:bg-gray-100"
            >
              <div className="relative flex items-center justify-center overflow-hidden">
                <Icon
                  icon="ph:sign-out"
                  width="20"
                  height="20"
                  className="rotate-180 text-[#1F2937] transition-colors text-semibold"
                />
              </div>
              <span className="break-words font-Anuphan text-[16px] font-semibold leading-[32px] text-[#1F2937] transition-colors">
                ลงชื่อออกจากระบบ
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserProfile;
