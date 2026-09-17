import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { changePasswordService } from "../../services/auth.service";
import { TokenService } from "../../services/token.service";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";

function ChangePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object({
    oldPassword: Yup.string().required("กรุณากรอกรหัสผ่านเดิม"),
    newPassword: Yup.string()
      .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
      .max(128, "รหัสผ่านต้องไม่เกิน 128 ตัวอักษร")
      .matches(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว")
      .matches(/[a-z]/, "ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว")
      .matches(/\d/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว")
      .matches(
        /^[a-zA-Z0-9\u0400-\u04FF~!@#$%^&*_\-+=()[\]{}></\\|"'.,:;]+$/,
        "ตัวอักษรละติน/ซีริลลิก ตัวเลข หรือสัญลักษณ์เท่านั้น และห้ามเว้นวรรค",
      )
      .required("กรุณากรอกรหัสผ่านใหม่"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน")
      .required("กรุณายืนยันรหัสผ่านใหม่"),
  });

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);

      try {
        await changePasswordService(
          values.oldPassword,
          values.newPassword,
          values.confirmPassword,
        );

        toast.success("เปลี่ยนรหัสผ่านสำเร็จ");

        formik.resetForm();

        setTimeout(() => {
          dispatch({ type: "LOGOUT" });
          TokenService.removeToken();
          navigate("/login");
        }, 1500);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const apiMessage = error.response?.data?.message?.toLowerCase() || "";
          const status = error.response?.status;

          if (
            status === 401 ||
            status === 400 ||
            apiMessage.includes("incorrect") ||
            apiMessage.includes("invalid") ||
            apiMessage.includes("old password") ||
            apiMessage.includes("match")
          ) {
            toast.error("รหัสผ่านปัจจุบันไม่ถูกต้อง");
          } else {
            toast.error(
              error.response?.data?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ",
            );
          }
        } else {
          toast.error("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
        }
      } finally {
        setLoading(false);
      }
    },
  });
  return (
    <div className="min-h-screen flex flex-col bg-white lg:bg-gray-50/50">
      <div className="flex-grow flex items-center justify-center px-4 py-8 lg:py-0">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 w-full max-w-6xl">
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col min-h-[calc(100vh-100px)] lg:min-h-[516px] lg:h-[516px] bg-white lg:rounded-[5px] lg:shadow-2xl w-full max-w-md lg:max-w-[571px] p-6 sm:p-8 relative"
          >
            <h2 className="text-[30px] sm:text-[32px] font-medium font-jakarta mb-6 text-[#111827] text-center">
              เปลี่ยนรหัสผ่าน
            </h2>

            {/* 1. รหัสผ่านเดิม */}
            <div className="mb-4">
              <label
                htmlFor="old-password"
                className="font-medium lg:font-medium font-anuphan text-[16px] text-[#1F2937]"
              >
                รหัสผ่านเดิม
              </label>
              <div className="relative">
                <input
                  id="old-password"
                  type={showOldPassword ? "text" : "password"}
                  data-test="old-password"
                  placeholder="อย่างน้อย 8 ตัว"
                  className={`input input-bordered w-full border bg-white text-[#4B5563] border-[#4B5563] pr-10 ${
                    formik.touched.oldPassword && formik.errors.oldPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  {...formik.getFieldProps("oldPassword")}
                />
                <button
                  data-test="toggle-old-password"
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black focus:outline-none"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              {formik.touched.oldPassword && formik.errors.oldPassword && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.oldPassword}
                </div>
              )}
            </div>

            {/* รหัสผ่านใหม่ */}
            <div className="mb-4">
              <label
                htmlFor="new-password"
                className="font-medium lg:font-medium font-anuphan -[16px] text-[#1F2937]"
              >
                รหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  data-test="new-password"
                  placeholder="อย่างน้อย 8 ตัว"
                  className={`input input-bordered w-full border bg-white text-[#4B5563] border-[#4B5563] pr-10 ${
                    formik.touched.newPassword && formik.errors.newPassword
                      ? "border-red-500  focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  {...formik.getFieldProps("newPassword")}
                />
                <button
                  data-test="toggle-new-password"
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black focus:outline-none"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <div className="text-red-500 text-xs mt-1 whitespace-pre-line">
                  {formik.errors.newPassword}
                </div>
              )}
            </div>

            {/* ยืนยันรหัสผ่านใหม่ */}
            <div className="mb-4">
              <label
                htmlFor="confirm-password"
                className="font-medium lg:font-medium font-anuphan text-[16px] text-[#1F2937]"
              >
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  data-test="confirm-password"
                  placeholder="อย่างน้อย 8 ตัว"
                  className={`input input-bordered w-full border bg-white text-[#4B5563] border-[#4B5563] pr-10 ${
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  {...formik.getFieldProps("confirmPassword")}
                />
                <button
                  data-test="show-confirm-password"
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <Eye size={20} />
                  ) : (
                    <EyeOff size={20} />
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.confirmPassword}
                  </div>
                )}
            </div>

            <div className="mt-auto lg:mt-2 flex flex-col gap-5 pb-0 pt-3">
              <button
                data-test="submit-btn"
                type="submit"
                disabled={loading}
                className="cursor-pointer btn w-full h-[48px] rounded-md bg-[#16A249] hover:bg-[#158d40] text-white text-[16px] font-bold border-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "กำลังเปลี่ยนรหัสผ่าน..." : "ยืนยัน"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
