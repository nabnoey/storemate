import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { forgotPasswordService } from "../../services/auth.service";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await forgotPasswordService(email);
      toast.success("เราได้ส่งลิงก์รีเซ็ตรหัสผ่านให้คุณแล้ว");
      setEmail("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const apiMessage = error.response?.data?.message?.toLowerCase() || "";

        if (
          status === 404 ||
          apiMessage.includes("not found") ||
          apiMessage.includes("user")
        ) {
          toast.error("ไม่พบผู้ใช้งาน");
        } else {
          toast.error(error.response?.data?.message || "ไม่สามารถส่งลิงก์ได้");
        }
      } else {
        toast.error("เกิดข้อผิดพลาดบางอย่าง");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white lg:bg-gray-50/50">
      <div className="flex-grow flex items-center justify-center px-4 py-8 lg:py-0">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 w-full max-w-6xl">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col min-h-[calc(100vh-100px)] lg:min-h-[310px] lg:h-[310px] bg-white lg:rounded-[5px] lg:shadow-2xl w-full max-w-md lg:max-w-[571px] p-6 sm:p-8 relative"
          >
            <h2 className="text-[30px] sm:text-[32px] font-medium font-jakarta mb-6 text-[#111827] text-center">
              กู้คืนรหัสผ่าน
            </h2>
            <div className="flex flex-col gap-2">
              <label htmlFor="reg-input-email">
                <span className="font-medium lg:font-semibold text-[16px] text-black">
                  อีเมล
                </span>
              </label>
              <input
                id="forgot-email"
                type="email"
                data-test="input-email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="input input-bordered w-full bg-white text-[#4B5563] border-[#4B5563] pr-10 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="mt-auto flex flex-col gap-3 pb-0 pt-6">
              <button
                data-test="submit-btn"
                type="submit"
                className="mx-auto btn bg-[#16A249] border-0 text-white mt-4 transition-colors disabled:opacity-50 w-full max-w-[368px] h-[52px] rounded-[8px] p-[10px] flex items-center justify-center gap-[10px]"
              >
                ยืนยัน
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
