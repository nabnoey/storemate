import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../../redux/auth/authReducer";
import { toast } from "react-hot-toast";

import logo from "../../assets/logo.png";
import auth from "../../assets/Auth.png";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = Cookies.get("remember_email");

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("กำลังเข้าสู่ระบบ...");

    try {
      const token = await dispatch(
        login({
          email: email.toLowerCase(),
          password: password,
        }),
      ).unwrap();

      if (rememberMe) {
        Cookies.set("remember_email", email, {
          expires: 30,
        });
      } else {
        Cookies.remove("remember_email");
      }

      toast.dismiss();
      toast.success("เข้าสู่ระบบสำเร็จ", { id: toastId });

      setTimeout(() => {
        try {
          const decoded: any = jwtDecode(token);
          const userRoles = decoded.roles || [];
          const roles = userRoles.map((role: any) =>
            typeof role === "object" && role?.roleName ? role.roleName : role,
          );

          if (roles.includes("ADMIN")) {
            navigate("/dashboard");
          } else if (roles.includes("MODERATOR")) {
            navigate("/dashboard");
          } else {
            navigate("/");
          }
        } catch (decodeError) {
          navigate("/");
        }
      }, 1000);
    } catch (error: any) {
      let errorMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";

      const apiErrorMsg =
        error?.message?.toLowerCase() || typeof error === "string"
          ? error.toLowerCase()
          : "";
      if (apiErrorMsg.includes("suspend") || apiErrorMsg.includes("banned")) {
        errorMessage = "บัญชีนี้ถูกระงับการใช้งาน";
      }
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white lg:bg-gray-50/50">
      <div className="flex-grow flex items-center justify-center px-4 py-8 lg:py-0">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 w-full max-w-6xl">
          <div className="hidden lg:flex flex-col items-center justify-center">
            <img
              src={auth}
              alt="Auth Illustration"
              className="w-[300px] sm:w-[400px] lg:w-[513px] h-auto lg:mt-[-150px] lg:mb-[-37.5px]"
            />
            <p className="text-black font-bold text-center text-2xl sm:text-3xl lg:text-3xl mt-4 lg:mt-[-160px] ml-4 lg:ml-5">
              เข้าสู่ระบบเพื่อใช้เว็บไซต์
            </p>
          </div>
          {/* ฟอร์มเข้าสู่ระบบ */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col h-auto min-h-[469px] bg-white rounded-[5px] lg:shadow-2xl w-full max-w-[448px] p-6 sm:p-8 relative"
          >
            <div className="absolute top-4 right-4 -mt-7.5">
              <img
                src={logo}
                alt="logo"
                className="w-35 sm:w-35 lg:w-40 h-auto"
              />
            </div>

            <h2 className="text-[30px] sm:text-[32px] font-medium font-jakarta mb-6 text-[#111827] text-left">
              เข้าสู่ระบบ
            </h2>

            <div className="mb-4">
              <label htmlFor="email" className="label p-0 mb-1">
                <span className="font-medium lg:font-semibold text-[16px] text-black">
                  อีเมล
                </span>
              </label>
              <input
                id="email"
                data-test="email"
                disabled={loading}
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full bg-white text-[#4B5563] border-[#4B5563] pr-10 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="label p-0 mb-1">
                <span className="font-medium lg:font-semibold text-[16px] text-black">
                  รหัสผ่าน
                </span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  data-test="password"
                  disabled={loading}
                  type={showPassword ? "text" : "password"}
                  placeholder="รหัสผ่าน"
                  className="input input-bordered w-full bg-white text-[#4B5563] border-[#4B5563] pr-10 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  data-test="show-password"
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="mt-auto lg:mt-2 flex flex-col gap-5 pb-0 pt-3">
              <div className="flex items-center gap-3">
                <input
                  data-test="input-remember"
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 appearance-none rounded-full bg-gray-200 cursor-pointer checked:bg-blue-500 border-none"
                />
                <label
                  htmlFor="remember-me"
                  className="text-gray-500 text-[16px] cursor-pointer select-none"
                >
                  จดจำฉัน
                </label>
              </div>

              <button
                data-test="btn-submit"
                type="submit"
                disabled={loading}
                className="cursor-pointer btn w-full h-[48px] rounded-md bg-[#16A249] hover:bg-[#158d40] text-white text-[16px] font-bold border-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>

              <div className="flex flex-row justify-between items-center text-[13px] sm:text-sm w-full text-black">
                <button
                  data-test="btn-forgot-password"
                  type="button"
                  className="hover:underline cursor-pointer"
                  onClick={() => navigate("/forgot-password")}
                >
                  ลืมรหัสผ่าน
                </button>

                {/* ฝั่งขวา */}
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">ยังไม่มีบัญชี ?</span>
                  <button
                    data-test="btn-register"
                    type="button"
                    className="text-[#3B82F6] hover:underline cursor-pointer font-medium"
                    onClick={() => navigate("/register")}
                  >
                    สมัครสมาชิก
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
