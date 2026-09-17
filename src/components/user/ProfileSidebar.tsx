import { useState } from "react";
import { useSelector,useDispatch } from "react-redux";
//เพิ่มเพื่อลอง
import { fetchOrders } from "../../redux/orders/orderReducer";
import {
  useNavigate,
  useLocation,
  Link,
  
} from "react-router-dom"; //เพิ่มเพื่อลอง เดี๋ยวเติม SearchParams กลับด้วย
import { Icon } from "@iconify/react";
//เพิ่มเพื่อลอง เดี๋ยวลบ Appdispatch ด้วย
import type {AppDispatch, RootState } from "../../redux/store";

const ProfileSidebar = () => {
  const user = useSelector((state: RootState) => state?.auth?.user);
  const navigate = useNavigate();
  //เพิ่มเพื่อลอง
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  // const [searchParams] = useSearchParams();
  //เพิ่มเพื่อลอง
  const { orders, loading } = useSelector((state: RootState) => state.orders);

  // const status: string = searchParams.get("status") || "ALL";
  const [isProfileOpen, setIsProfileOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  const getMainMenuClass = (path: string) => {
    const baseClass =
      "w-full text-left px-4 py-2.5 text-[15px] font-medium transition-colors block cursor-pointer rounded-md";
    return isActive(path)
      ? `${baseClass} text-[#4285F4] bg-blue-50/50`
      : `${baseClass} text-black hover:text-[#4285F4]`;
  };

  const getSubMenuClass = (path: string) => {
    const baseClass =
      "w-full text-left pl-9 pr-4 py-2 text-[14px] transition-colors block cursor-pointer rounded-md";
    return isActive(path)
      ? `${baseClass} text-[#4285F4] font-medium`
      : `${baseClass} text-black hover:text-[#4285F4]`;
  };

  const MenuContent = () => (
    <div className="flex flex-col space-y-0.5">
      <div>
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-[15px] font-medium text-gray-900 hover:text-[#4285F4] transition-colors cursor-pointer"
        >
          <span>โปรไฟล์ของฉัน</span>
          <Icon
            icon={isProfileOpen ? "ph:chevron-up" : "ph:chevron-down"}
            width="16"
            className="text-gray-500"
          />
        </button>

        {isProfileOpen && (
          <div className="flex flex-col space-y-0.5 mt-0.5 animate-in slide-in-from-top-1 fade-in duration-150">
            <button
              data-test="btn-profile-menu-profile"
              className={getSubMenuClass("/profile")}
              onClick={() => navigate("/profile")}
            >
              โปรไฟล์
            </button>
            <button
              data-test="btn-profile-menu-address"
              className={getSubMenuClass("/address-profile")}
              onClick={() => navigate("/address-profile")}
            >
              จัดการที่อยู่
            </button>
            <button
              data-test="btn-profile-menu-password"
              className={getSubMenuClass("/change-password")}
              onClick={() => navigate("/change-password")}
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        )}
      </div>

      {/* <Link
        data-test="btn-profile-menu-history"
        to={`/orders?status=${status}`}
        className={getMainMenuClass("/orders")}
      >
        การซื้อของฉัน
      </Link> */}

   <Link
  data-test="btn-profile-menu-history"
  to="/orders"
  className={getMainMenuClass("/orders")}
  onMouseEnter={() => {
    if (orders.length === 0 && !loading) {
      dispatch(fetchOrders("ALL"));
    }
  }}
>
  การซื้อของฉัน
</Link>

      <Link
        data-test="btn-profile-menu-notify"
        to={`/notify`}
        className={getMainMenuClass("/notify")}
      >
        การแจ้งเตือน
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 font-['Anuphan'] w-full md:w-[260px] shrink-0">
      <div className="md:hidden w-full bg-[#F8F9FA] border border-gray-100 rounded-xl shadow-sm p-3">
        <MenuContent />
      </div>

      <aside className="hidden md:flex flex-col gap-4 w-full">
        <div className="bg-[#F8F9FA] rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-white overflow-hidden border border-gray-200 rounded-full flex items-center justify-center shrink-0">
            {user?.image_url || user?.image ? (
              <img
                src={user.image_url || user.image}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon icon="ph:user" width="24" className="text-gray-400" />
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <p
              id="sidebar-text-name"
              className="font-medium text-gray-900 text-[15px] truncate"
            >
              {user?.name || "กำลังโหลด..."}
            </p>
          </div>
        </div>

        <div className="bg-[#F8F9FA] rounded-xl shadow-sm border border-gray-100 p-3">
          <MenuContent />
        </div>
      </aside>
    </div>
  );
};

export default ProfileSidebar;
