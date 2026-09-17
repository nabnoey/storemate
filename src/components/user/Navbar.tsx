import { useState, useEffect, useRef } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import type { AppDispatch, RootState } from "../../redux/store";
import { useSelector, useDispatch } from "react-redux";
import { fetchCartThunk } from "../../redux/carts/CartReducer";
import UserProfile from "./UserProfile";
import logo from "../../assets/logo.png";
import { Icon } from "@iconify/react";
import { getProfile } from "../../redux/auth/authReducer";
import {
  fetchUserNotify,
  fetchNotificationCounts,
  markAsReadNotify,
} from "../../redux/notification/notificationReducer";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const location = useLocation();

  const isAuthentication = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const [inputValue, setInputValue] = useState("");

  const notifications = useSelector(
    (state: RootState) => state.notification.items,
  );

  const [openNotifyDropdown, setOpenNotifyDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = useSelector(
    (state: RootState) => state.notification.counts.ALL,
  );
  const previewNotifications = notifications.slice(0, 3);

  useEffect(() => {
    if (isAuthentication) {
      dispatch(fetchCartThunk());
      dispatch(getProfile());
      dispatch(fetchUserNotify("ALL"));
      dispatch(fetchNotificationCounts());
    }
  }, [dispatch, isAuthentication]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenNotifyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    if (window.innerWidth >= 1024) {
      setOpenNotifyDropdown(!openNotifyDropdown);
    } else {
      navigate("/notify");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleSubmitSearch = () => {
    navigate(`/search?keyword=${inputValue}`);
  };

  const [openSearch, setOpenSearch] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const cartItems = useSelector((state: RootState) => state.carts.items);

  const totalItems = cartItems?.length;

  const isActive = (path: string, searchParam: string = "") => {
    if (searchParam) {
      return (
        location.pathname === path && location.search.includes(searchParam)
      );
    }
    if (path === "/search") {
      return (
        location.pathname === path &&
        !location.search.includes("category=promotion")
      );
    }
    return location.pathname === path;
  };

  return (
    <nav className="flex items-center justify-between bg-white shadow-sm h-[73px] lg:h-[80px] px-4 lg:px-10 relative">
      {/* LOGO */}
      <div className="navbar-start right-5 flex items-center justify-start">
        <button onClick={() => navigate("/")}>
          <img
            src={logo}
            className="w-27 lg:w-38 mt-5 -ml-8 lg:mt-5 cursor-pointer"
            alt="Logo"
            data-test="logo"
          />
        </button>
      </div>

      {/* MENU DESKTOP */}
      <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-Anuphan text-black">
        <ul className="flex items-center gap-6 xl:gap-10 text-[16px] whitespace-nowrap">
          <li>
            <Link
              data-test="list-search"
              className={`cursor-pointer transition-colors duration-200 ${
                isActive("/search")
                  ? "text-blue-600 font-semibold"
                  : "text-black hover:text-blue-600"
              }`}
              to="/search"
            >
              สินค้า
            </Link>
          </li>
          <li>
            <Link
              data-test="list-promo"
              className={`cursor-pointer transition-colors duration-200 ${
                isActive("/search", "category=promotion")
                  ? "text-blue-600 font-semibold"
                  : "text-black hover:text-blue-600"
              }`}
              to={`/search?keyword=${keyword}&category=promotion`}
            >
              โปรโมชั่น
            </Link>
          </li>
          <li>
            <Link
              data-test="list-about"
              className={`cursor-pointer transition-colors duration-200 ${
                isActive("/about-us")
                  ? "text-blue-600 font-semibold"
                  : "text-black hover:text-blue-600"
              }`}
              to="/about-us"
            >
              เกี่ยวกับเรา
            </Link>
          </li>
          <li>
            <Link
              data-test="list-contact"
              className={`cursor-pointer transition-colors duration-200 ${
                isActive("/contact")
                  ? "text-blue-600 font-semibold"
                  : "text-black hover:text-blue-600"
              }`}
              to="/contact"
            >
              ติดต่อ
            </Link>
          </li>
        </ul>
      </div>

      {/* RIGHT */}
      <div className="flex items-center justify-end gap-3 lg:gap-5 flex-shrink-0 lg:w-1/4">
        {/* SEARCH */}
        <div className="relative flex items-center" data-test="search">
          <Icon
            icon="ph:magnifying-glass"
            width="24"
            height="24"
            className="cursor-pointer text-black hover:text-indigo-600 transition-colors z-50"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (openSearch) {
                handleSubmitSearch();
              } else {
                setOpenSearch(true);
              }
            }}
          />

          {openSearch && (
            <>
              <input
                type="text"
                data-test="search-input"
                placeholder="ค้นหาสินค้า..."
                value={inputValue}
                onChange={handleSearch}
                onFocus={() => setOpenSearch(true)}
                onBlur={() => {
                  setTimeout(() => {
                    setOpenSearch(false);
                  }, 150);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmitSearch();
                  }
                }}
                className="absolute right-8 -top-2 input input-bordered bg-white w-35 sm:w-40 md:w-48 h-10 text-[#74768f] z-50"
                autoFocus
              />
            </>
          )}
        </div>

        {isAuthentication ? (
          <>
            <div className="flex items-center gap-3 lg:gap-4 text-black">
              <button
                data-test="click-shop-cart"
                className="relative cursor-pointer p-1"
                onClick={() => navigate("/shopping-cart")}
              >
                <Icon
                  icon="ph:shopping-cart"
                  width="24"
                  height="24"
                  data-test="cart-shopping"
                  className="hover:text-indigo-600 transition-colors cursor-pointer"
                />

                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {totalItems}
                  </span>
                )}
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  data-test="click-notifications"
                  className="relative cursor-pointer p-1 block"
                  onClick={handleBellClick}
                >
                  <Icon
                    icon="ph:bell"
                    width="24"
                    height="24"
                    className="cursor-pointer hover:text-indigo-600 transition-colors"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}

                  {/* {newCount > 0 && (
                    <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {newCount}
                    </span>
                  )} */}
                </button>

                {openNotifyDropdown && (
                  // เพิ่ม hidden lg:block เข้าไปตรงนี้ เพื่อให้ไม่แสดงผลบน mobile แน่นอน
                  <div className="relative hidden lg:block">
                    <ul className="absolute -right-2 top-[28px] p-0 shadow-xl bg-white rounded-lg w-[340px] border border-gray-100 z-[9999] overflow-hidden list-none animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* ส่วนเนื้อหาแจ้งเตือน (Scrollable Content) */}
                      <div className="max-h-[300px] overflow-y-auto font-Anuphan">
                        {previewNotifications.length === 0 ? (
                          <div className="p-5 text-center text-gray-400 text-sm">
                            ไม่มีการแจ้งเตือนในขณะนี้
                          </div>
                        ) : (
                          previewNotifications.slice(0, 3).map((item) => (
                            <li key={item.id} className="block">
                              <button
                                type="button"
                                className="flex w-full items-start gap-3 p-3 text-left transition-colors border-b border-gray-50 hover:bg-gray-50 bg-white"
                                onClick={() => {
                                  dispatch(markAsReadNotify(item.id));
                                  setOpenNotifyDropdown(false);
                                  navigate("/notify");
                                }}
                              >
                                {/* กล่องข้อความ */}
                                <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                                  <span className="text-xs truncate text-gray-900 font-semibold">
                                    {item.title}
                                  </span>
                                  <span className="text-[11px] text-black line-clamp-1 leading-normal">
                                    {item.message}
                                  </span>
                                  <span className="text-[9px] text-black font-medium mt-0.5">
                                    {item.createdAt
                                      ? new Date(
                                          item.createdAt,
                                        ).toLocaleDateString("th-TH")
                                      : "-"}
                                  </span>
                                </div>
                              </button>
                            </li>
                          ))
                        )}
                      </div>

                      <li className="block">
                        <button
                          type="button"
                          className="cursor-pointer w-full bg-gray-200 text-black py-2.5 text-center text-xs font-bold font-Anuphan transition-colors block border-t border-gray-100"
                          onClick={() => {
                            setOpenNotifyDropdown(false);
                            navigate("/notify");
                          }}
                        >
                          ดูทั้งหมด
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <UserProfile />
          </>
        ) : (
          <div className="hidden lg:flex items-center gap-3">
            <button
              data-test="login-btn"
              className="bg-[#073A8D] hover:bg-[#052b6b] text-white w-24 h-10 rounded-[10px] text-sm transition-colors cursor-pointer"
              onClick={() => navigate("/login")}
            >
              เข้าสู่ระบบ
            </button>

            <button
              data-test="register-btn"
              className="border border-[#073A8D] text-[#073A8D] hover:bg-gray-50 w-28 h-10 rounded-[10px] text-sm transition-colors cursor-pointer"
              onClick={() => navigate("/register")}
            >
              สมัครสมาชิก
            </button>
          </div>
        )}

        <div className="flex-none lg:hidden ml-1">
          <button
            data-test="btn-open-menu"
            className="p-1 cursor-pointer"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <Icon
              icon="ph:list"
              width="26"
              height="26"
              className="text-gray-800"
            />
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {openMenu && (
        <div className="absolute top-[60px] right-4 w-[280px] sm:w-[320px] bg-white shadow-xl z-50 lg:hidden rounded-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in origin-top-right">
          {isAuthentication ? (
            <UserProfile
              variant="mobile"
              onCloseMenu={() => setOpenMenu(false)}
            />
          ) : (
            <div className="flex items-center justify-between gap-3 p-5 border-b border-gray-100">
              <button
                data-test="login-btn"
                className="flex-1 bg-[#0A157A] text-white py-2.5 rounded-xl font-bold text-sm cursor-pointer"
                onClick={() => {
                  navigate("/login");
                  setOpenMenu(false);
                }}
              >
                เข้าสู่ระบบ
              </button>

              <button
                data-test="register-btn"
                className="flex-1 border-2 border-[#0A157A] text-[#0A157A] py-2.5 rounded-xl font-bold text-sm cursor-pointer"
                onClick={() => {
                  navigate("/register");
                  setOpenMenu(false);
                }}
              >
                สมัครสมาชิก
              </button>
            </div>
          )}

          <div className="flex flex-col py-2">
            <Link
              data-test="list-product"
              to="/search"
              onClick={() => setOpenMenu(false)}
              className="cursor-pointer w-full text-left px-6 py-3.5 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              สินค้า
            </Link>
            <Link
              data-test="list-promo"
              to={`/search?category=promotion`}
              onClick={() => setOpenMenu(false)}
              className="cursor-pointer w-full text-left px-6 py-3.5 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              โปรโมชั่น
            </Link>
            <Link
              data-test="list-about"
              to="/about-us"
              onClick={() => setOpenMenu(false)}
              className="cursor-pointer w-full text-left px-6 py-3.5 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              เกี่ยวกับเรา
            </Link>
            <Link
              data-test="list-contact"
              to="/contact"
              onClick={() => setOpenMenu(false)}
              className="cursor-pointer w-full text-left px-6 py-3.5 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              ติดต่อ
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
