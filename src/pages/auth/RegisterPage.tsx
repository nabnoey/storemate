import { useState } from "react";
import { useDispatch } from "react-redux";
import { register } from "../../redux/auth/authReducer";
import type { AppDispatch } from "../../redux/store";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";

import logo from "../../assets/logo.png";
import Auth from "../../assets/Auth.png";

function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  // State สำหรับเปิด-ปิดรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("กรุณากรอกชื่อ-นามสกุล"),
    email: Yup.string()
      .email("กรุณากรอกอีเมลให้ถูกต้อง")
      .required("กรุณากรอกอีเมล"),
    phone: Yup.string()
      .matches(/^0\d{9}$/, "เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก")
      .required("กรุณากรอกเบอร์โทรศัพท์"),
    password: Yup.string()
      .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
      .max(128, "รหัสผ่านต้องไม่เกิน 128 ตัวอักษร")
      .matches(/[A-Z]/, "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัวอักษร")
      .matches(/[a-z]/, "รหัสผ่านต้องมีตัวตัวพิมพ์เล็กอย่างน้อย 1 ตัวอักษร")
      .matches(/\d/, "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัวเลข")
      .matches(
        /^[a-zA-Z0-9\u0400-\u04FF~!@#$%^&*_\-+=()[\]{}></\\|"'.,:;]+$/,
        "ตัวอักษรละติน/ซีริลลิก ตัวเลข หรือสัญลักษณ์เท่านั้น และห้ามเว้นวรรค",
      )
      .required("กรุณากรอกรหัสผ่าน"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน")
      .required("กรุณายืนยันรหัสผ่าน"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);

      const toastId = toast.loading("กำลังลงทะเบียน...");

      try {
        await dispatch(
          register({
            name: values.name,
            email: values.email.toLowerCase(),

            phone: values.phone,
            password: values.password,
            confirmPassword: values.confirmPassword,
          }),
        ).unwrap();

        toast.success("ลงทะเบียนสำเร็จ", { id: toastId });

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } catch (error: any) {
        let message = "เกิดข้อผิดพลาดในการสมัครสมาชิก";
        if (axios.isAxiosError(error)) {
          message = error.response?.data?.message ?? "Server error";
        } else if (error?.message) {
          message = error.message;
        } else if (typeof error === "string") {
          message = error;
        }

        toast.error(message, { id: toastId });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white lg:bg-gray-50/50">
      <div className="flex-grow flex items-center justify-center px-4 py-8 lg:py-0">
        <div className="pt-20 mb-20 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 w-full max-w-6xl">
          <div className="hidden lg:flex flex-col items-center justify-center">
            <img
              src={Auth}
              alt="Auth Illustration"
              className="w-[300px] sm:w-[400px] lg:w-[513px] h-auto lg:mt-[-150px] lg:mb-[-37.5px]"
            />
            <p className="text-black font-bold text-center text-2xl sm:text-3xl lg:text-3xl mt-4 lg:mt-[-160px] ml-4 lg:ml-5">
              สร้างบัญชี Storemate ของคุณ
            </p>
          </div>
          {/* Register Card */}
          <form
            id="register-form"
            onSubmit={formik.handleSubmit}
            className=" flex flex-col min-h-[calc(100vh-100px)] lg:min-h-fit bg-white lg:rounded-2xl lg:shadow-2xl w-full max-w-md lg:max-w-[450px] p-6 sm:p-8 relative"
          >
            <div className="absolute top-4 right-4 -mt-7.5">
              <img
                src={logo}
                alt="logo"
                className="w-35 sm:w-35 lg:w-40 h-auto"
              />
            </div>

            <h2 className="text-[30px] sm:text-[30px] s font-medium lg:font-medium mb-6 text-black text-left">
              สมัครสมาชิก
            </h2>

            <div className="mb-4">
              <label htmlFor="reg-input-name" className="label p-0 mb-1">
                <span className="font-medium lg:font-semibold text-[16px] text-black">
                  ชื่อ-นามสกุล
                </span>
                 
              </label>
              <input
                id="reg-input-name"
                data-test="reg-input-name"
                type="text"
                placeholder="ชื่อ-นามสกุล"
                disabled={loading}
                className={`input input-bordered w-full bg-white text-[#4B5563] border-[#4B5563] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
                  formik.touched.name && formik.errors.name
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
                {...formik.getFieldProps("name")}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.name}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="reg-input-email" className="label p-0 mb-1">
                <span className="font-medium lg:font-semibold text-[16px] text-black">
                  อีเมล
                </span>
              </label>
              <input
                id="reg-input-email"
                data-test="reg-input-email"
                type="email"
                placeholder="example@gmail.com"
                disabled={loading}
                className={`input input-bordered w-full bg-white text-[#4B5563] border-[#4B5563] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.email}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="reg-input-phone" className="label p-0 mb-1">
                <span className="font-medium lg:font-semibold text-[16px] text-black">
                  เบอร์โทร
                </span>
              </label>

              <input
                id="reg-input-phone"
                data-test="reg-input-phone"
                type="text"
                placeholder="เบอร์โทร"
                disabled={loading}
                className={`input input-bordered w-full bg-white text-[#4B5563] border-[#4B5563] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
                  formik.touched.phone && formik.errors.phone
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
                {...formik.getFieldProps("phone")}
              />
              {formik.touched.phone && formik.errors.phone && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.phone}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="reg-input-password" className="label p-0 mb-1">
                <span className="font-medium lg:font-semibold text-[16px] text-black">
                  รหัสผ่าน
                </span>
              </label>

              <div className="relative">
                <input
                  id="reg-input-password"
                  data-test="reg-input-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="รหัสผ่านอย่างน้อย 8 ตัว"
                  disabled={loading}
                  className={`input input-bordered w-full bg-white text-[#4B5563] border-[#4B5563] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed pr-10 ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  {...formik.getFieldProps("password")}
                />

                <button
                  data-test="btn-show-password"
                  type="button"
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-xs mt-1 whitespace-pre-line">
                  {formik.errors.password}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="reg-confirm-password" className="label p-0 mb-1">
                <span className="font-medium lg:font-semibold text-[16px] text-black">
                  ยืนยันรหัสผ่าน
                </span>
              </label>

              <div className="relative">
                <input
                  id="reg-input-confirm"
                  data-test="reg-input-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="ยืนยันรหัสผ่าน"
                  disabled={loading}
                  className={`input input-bordered w-full bg-white text-[#4B5563] border-[#4B5563] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed pr-10 ${
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  {...formik.getFieldProps("confirmPassword")}
                />

                <button
                  data-test="btn-show-confirm"
                  type="button"
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black  disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
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

            <div className="mt-auto flex flex-col gap-3 pb-0 pt-6">
              <button
                data-test="btn-register-submit"
                type="submit"
                disabled={loading}
                className="btn w-full h-[52px] bg-[#16A249] text-white text-lg font-bold border-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
              >
                {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
