import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { resetPasswordService } from "../../services/auth.service";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ตั้งค่าเงื่อนไขการตรวจสอบ (Validation Schema) ให้เหมือนหน้าอื่นๆ
  const validationSchema = Yup.object({
    password: Yup.string()
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
      .oneOf([Yup.ref("password")], "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน")
      .required("กรุณายืนยันรหัสผ่านใหม่"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (!token) {
        toast.error("ไม่พบข้อมูล Token ยืนยันตัวตน");
        return;
      }

      setLoading(true);

      try {
        await resetPasswordService(
          token,
          values.password,
          values.confirmPassword,
        );

        toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
        formik.resetForm();

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const apiMessage = error.response?.data?.message?.toLowerCase() || "";
          const status = error.response?.status;

          if (
            status === 401 ||
            status === 400 ||
            apiMessage.includes("expire") ||
            apiMessage.includes("invalid")
          ) {
            toast.error("ลิงก์หมดอายุ กรุณารีเซ็ตรหัสผ่านใหม่อีกครั้ง");
          } else {
            toast.error(
              error.response?.data?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้",
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
    <div className="min-h-screen flex justify-center items-center bg-white p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[571px] p-6 sm:p-8">
        <h2 className="text-2xl sm:text-[36px] font-semibold mb-6 text-black text-center">
          กู้คืนรหัสผ่าน
        </h2>

        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-4 text-black"
        >
          {/* 1. รหัสผ่านเดิม */}
          <div className="flex flex-col gap-1">
            <label htmlFor="old-password" className="text-sm">
              รหัสผ่านเดิม
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                data-test="new-password"
                placeholder="อย่างน้อย 8 ตัว"
                className={`input input-bordered w-full border bg-white text-[#4B5563] focus:border-[#6B7280] pr-10 ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500  focus:border-red-500"
                    : "border-gray-300"
                }`}
                {...formik.getFieldProps("password")}
              />
              <button
                data-test="toggle-new-password"
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-xs mt-1 whitespace-pre-line">
                {formik.errors.password}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirm-password" className="text-sm">
              ยืนยันรหัสผ่านใหม่
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                data-test="confirm-password"
                placeholder="อย่างน้อย 8 ตัว"
                className={`input input-bordered w-full border bg-white text-[#4B5563] focus:border-[#6B7280] pr-10 ${
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                {...formik.getFieldProps("confirmPassword")}
              />
              <button
                data-test="toggle-confirm-password"
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <div className="text-red-500 text-xs">
                  {formik.errors.confirmPassword}
                </div>
              )}
          </div>

          <button
            data-test="submit-btn"
            type="submit"
            disabled={loading}
            className="btn w-full sm:w-[368px] sm:mx-auto h-[52px] bg-[#16A249] hover:bg-[#12863c] text-white text-[20px] font-bold border-none mt-4 transition-colors disabled:opacity-50"
          >
            {loading ? "กำลังดำเนินการ..." : "ยืนยัน"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
