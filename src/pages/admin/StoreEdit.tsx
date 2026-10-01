import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import HeaderAdmin from "../../components/admin/HeaderAdmin";
import { getStore, updateStore } from "../../redux/owner/ownerReducer";
import { addressDropdown } from "../../redux/address/addressReducer";
import { toast } from "react-hot-toast";
import type { AppDispatch, RootState } from "../../redux/store";
import type { Store } from "../../types/owner";
import { FiUpload } from "react-icons/fi";
import type { DropdownItem } from "../../types/address";

const StoreEditSchema = Yup.object().shape({
  storeName: Yup.string().required("กรุณากรอกชื่อร้านค้า"),
  email: Yup.string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .required("กรุณากรอกอีเมลร้านค้า"),
  phone: Yup.string().required("กรุณากรอกเบอร์โทรศัพท์"),
  streetAddress: Yup.string().required("กรุณากรอกที่อยู่"),
  province: Yup.string().required("กรุณาเลือกจังหวัด"),
  district: Yup.string().required("กรุณาเลือกอำเภอ"),
  subdistrict: Yup.string().required("กรุณาเลือกตำบล"),
  zipcode: Yup.string().required("กรุณาเลือกรหัสไปรษณีย์"),
});

function StoreEdit() {
  const dispatch = useDispatch<AppDispatch>();
  const { store } = useSelector((state: RootState) => state.owner);
  const { provinces, districts, subdistricts } = useSelector(
    (state: RootState) => state.address,
  );

  const [zipcodes, setZipcodes] = useState<{ id: number; name: string }[]>([]);
  const [selectedAddressIds, setSelectedAddressIds] = useState({
    provinceId: 0,
    districtId: 0,
    subdistrictId: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
useEffect(() => {
  if (!store) return;

  const loadZipcode = async () => {
    // หา provinceId
    const provinceRes = await dispatch(
      addressDropdown({
        provinceId: 0,
        districtId: 0,
        subdistrictId: 0,
      })
    ).unwrap();

    const provinceId = provinceRes.find(
      (p:DropdownItem) => p.name === store.province
    )?.id;

    // หา district
    const districtRes = await dispatch(
      addressDropdown({
        provinceId,
        districtId: 0,
        subdistrictId: 0,
      })
    ).unwrap();

    const districtId = districtRes.find(
      (d:DropdownItem) => d.name === store.district
    )?.id;

    // หา subdistrict
    const subdistrictRes = await dispatch(
      addressDropdown({
        provinceId,
        districtId,
        subdistrictId: 0,
      })
    ).unwrap();

    const subdistrictId = subdistrictRes.find(
      (s:DropdownItem) => s.name === store.subdistrict
    )?.id;

    // โหลด zipcode
    const zipcodeRes = await dispatch(
      addressDropdown({
        provinceId,
        districtId,
        subdistrictId,
      })
    ).unwrap();

    setZipcodes(zipcodeRes);
  };

  loadZipcode();
}, [store]);
  useEffect(() => {
    dispatch(getStore());
  }, [dispatch]);
  
   const showConfirmToast = (
      message: string,
      isDanger = false,
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        toast(
          (t) => (
            <div className="flex flex-col items-center justify-center text-center p-1 w-full min-w-[250px]">
              <p className="mb-4 text-gray-800 font-medium">{message}</p>
              <div className="flex justify-center gap-3 w-full">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    resolve(true);
                  }}
                  className={`px-5 py-1.5 text-white rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    isDanger
                      ? "bg-[#EF4444] hover:bg-red-600"
                      : "bg-[#003399] hover:bg-blue-800"
                  }`}
                >
                  ยืนยัน
                </button>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    resolve(false);
                  }}
                  className="px-5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          ),
          { duration: Infinity },
        );
      });
    };

   const handleCancel = async (
  isDirty: boolean,
  resetForm: () => void,
) => {
  if (!isDirty) {
    return;
  }

  const isConfirmed = await showConfirmToast(
    "คุณต้องการละทิ้งการเปลี่ยนแปลงหรือไม่?",
  );

  if (isConfirmed) {
    resetForm();
    setPreview(null);
    setZipcodes([]);
  }
};
  // ปรับ inputClass ให้ Responsive มากขึ้น และป้องกัน iOS Zoom (text-base บนมือถือ, text-sm บน PC)
  const inputClass =
    "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-gray-800 text-base md:text-sm placeholder-gray-400 bg-white transition-all duration-200";
  const labelClass =
    "block text-sm md:text-sm font-semibold text-gray-700 mb-1.5";
  const errorTextClass = "text-red-500 text-xs mt-1 font-medium";

  const initialValues = {
    id: store?.id || 0,
    storeName: store?.storeName || "",
    email: store?.email || "",
    phone: store?.phone || "",
    streetAddress: store?.streetAddress || "",
    province: store?.province || "",
    district: store?.district || "",
    subdistrict: store?.subdistrict || "",
    zipcode: store?.zipcode || "",
    promotionImage: store?.promotionImage || "",
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <HeaderAdmin
        title="ตั้งค่าร้านค้า"
        subtitle="จัดการข้อมูลและรูปลักษณ์ของร้านค้าของคุณ"
      />

      <div className="p-4 sm:p-6 text-[#374151]">
        <div className="bg-[#F8F9FA] rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto">

          <Formik
            enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={StoreEditSchema}
            onSubmit={(values) => {
              const selectedZip = zipcodes.find(
                (z) => z.name === values.zipcode,
              );

             const dataToSend: Store = {
              ...values,
              zipcode: selectedZip ? String(selectedZip.id) : values.zipcode,
              };
              dispatch(updateStore(dataToSend))
                .unwrap()
                .then(() => {
                  toast.success("บันทึกการตั้งค่าร้านค้าเรียบร้อยแล้ว");
                })
                .catch(() => {
                  toast.error("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
                });
            }}
          >
              {({
  setFieldValue,
  values,
  isSubmitting,
  handleBlur,
  handleChange,
  touched,
  errors,
  dirty,
  resetForm,
            }) => {
              const getSelectClass = (
                fieldName: keyof typeof initialValues,
              ) => {
                return `${inputClass} cursor-pointer appearance-none ${touched[fieldName] && errors[fieldName] ? "border-red-500 focus:ring-red-500/40 focus:border-red-500" : ""}`;
              };

              return (
                <Form className="space-y-8 md:space-y-10">
                  {/* ข้อมูลร้านค้า */}
                  <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-5 pb-2 border-b border-gray-200">
                      ข้อมูลร้านค้า
                    </h2>
                    <div className="space-y-5">
                      <div>
                        <label className={labelClass}>ชื่อร้านค้า</label>
                        <Field
                          type="text"
                          data-test="store-name-input"
                          name="storeName"
                          placeholder="ชื่อร้านค้า"
                          className={`${inputClass} ${touched.storeName && errors.storeName ? "border-red-500" : ""}`}
                        />
                        <ErrorMessage
                          name="storeName"
                          component="div"
                          className={errorTextClass}
                        />
                      </div>
                      {/* Grid responsive: มือถือ 1 คอลัมน์, จอใหญ่ 2 คอลัมน์ */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={labelClass}>อีเมลร้านค้า</label>
                          <Field
                            type="email"
                            data-test="store-email-input"
                            name="email"
                            placeholder="shop@example.com"
                            className={`${inputClass} ${touched.email && errors.email ? "border-red-500" : ""}`}
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className={errorTextClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            เบอร์โทรศัพท์ร้านค้า
                          </label>
                          <Field
                            type="text"
                            data-test="store-phone-input"
                            name="phone"
                            placeholder="099-999-9999"
                            className={`${inputClass} ${touched.phone && errors.phone ? "border-red-500" : ""}`}
                          />
                          <ErrorMessage
                            name="phone"
                            component="div"
                            className={errorTextClass}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ที่อยู่ร้านค้า */}
                  <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-5 pb-2 border-b border-gray-200">
                      ที่อยู่ร้านค้า
                    </h2>

                    <div className="mb-5">
                      <label className={labelClass}>
                        ที่อยู่ (บ้านเลขที่ / ถนน / ซอย)
                      </label>
                      <Field
                        type="text"
                        data-test="store-address-input"
                        name="streetAddress"
                        placeholder="บ้านเลขที่ / ถนน / ซอย"
                        className={`${inputClass} ${touched.streetAddress && errors.streetAddress ? "border-red-500" : ""}`}
                      />
                      <ErrorMessage
                        name="streetAddress"
                        component="div"
                        className={errorTextClass}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="relative">
                        <label className={labelClass}>จังหวัด</label>
                        <select
                          name="province"
                          data-test="province-select"
                          onFocus={() => {
                            if (provinces.length === 0) {
                              dispatch(
                                addressDropdown({
                                  provinceId: 0,
                                  districtId: 0,
                                  subdistrictId: 0,
                                }),
                              );
                            }
                          }}
                          value={values.province}
                          onChange={async (e) => {
                            const selectedName = e.target.value;
                            const pId =
                              provinces.find(
                                (p: { id: number; name: string }) =>
                                  p.name === selectedName,
                              )?.id || 0;

                            setFieldValue("province", selectedName);
                            setFieldValue("district", "");
                            setFieldValue("subdistrict", "");
                            setFieldValue("zipcode", "");

                            setSelectedAddressIds({
                              provinceId: pId,
                              districtId: 0,
                              subdistrictId: 0,
                            });
                            setZipcodes([]);

                            await dispatch(
                              addressDropdown({
                                provinceId: pId,
                                districtId: 0,
                                subdistrictId: 0,
                              }),
                            ).unwrap();
                          }}
                          onBlur={handleBlur}
                          className={getSelectClass("province")}
                        >
                          <option value="" hidden>
                            กรุณาเลือกจังหวัด
                          </option>

                          {/* เพิ่มบรรทัดนี้ลงไป เพื่อแสดงค่าปัจจุบัน */}
                          {provinces.length === 0 && store?.province && (
                            <option value={store.province}>
                              {store.province}
                            </option>
                          )}

                          {provinces.map((p: { id: number; name: string }) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <ErrorMessage
                          name="province"
                          component="div"
                          className={errorTextClass}
                        />
                      </div>

                      <div className="relative">
                        <label className={labelClass}>อำเภอ</label>
                        <select
                          name="district"
                          data-test="district-select"
                          value={values.district}
                          disabled={!selectedAddressIds.provinceId}
                          onChange={async (e) => {
                            const selectedName = e.target.value;
                            const dId =
                              districts.find(
                                (d: { id: number; name: string }) =>
                                  d.name === selectedName,
                              )?.id || 0;

                            setFieldValue("district", selectedName);
                            setFieldValue("subdistrict", "");
                            setFieldValue("zipcode", "");

                            setSelectedAddressIds((prev) => ({
                              ...prev,
                              districtId: dId,
                              subdistrictId: 0,
                            }));
                            setZipcodes([]);

                            if (dId) {
                              await dispatch(
                                addressDropdown({
                                  provinceId: selectedAddressIds.provinceId,
                                  districtId: dId,
                                  subdistrictId: 0,
                                }),
                              ).unwrap();
                            }
                          }}
                          onBlur={handleBlur}
                          className={`${getSelectClass("district")} disabled:bg-white disabled:text-gray-800`}
                        >
                          <option value="" hidden>
                            กรุณาเลือกอำเภอ
                          </option>
                          {districts.length === 0 && store?.district && (
                            <option value={store.district}>
                              {store.district}
                            </option>
                          )}
                          {districts.map((d: { id: number; name: string }) => (
                            <option key={d.id} value={d.name}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        <ErrorMessage
                          name="district"
                          component="div"
                          className={errorTextClass}
                        />
                      </div>

                      <div className="relative">
                        <label className={labelClass}>ตำบล</label>
                        <select
                          name="subdistrict"
                          data-test="subdistrict-select"
                          value={values.subdistrict}
                          disabled={!selectedAddressIds.districtId}
                          onChange={async (e) => {
                            const selectedName = e.target.value;
                            const sId =
                              subdistricts.find(
                                (s: { id: number; name: string }) =>
                                  s.name === selectedName,
                              )?.id || 0;

                            setFieldValue("subdistrict", selectedName);
                            setFieldValue("zipcode", "");

                            setSelectedAddressIds((prev) => ({
                              ...prev,
                              subdistrictId: sId,
                            }));

                            if (sId) {
                              const resRaw = await dispatch(
                                addressDropdown({
                                  provinceId: selectedAddressIds.provinceId,
                                  districtId: selectedAddressIds.districtId,
                                  subdistrictId: sId,
                                }),
                              ).unwrap();
                              const res = Array.isArray(resRaw)
                                ? resRaw
                                : resRaw?.data || [];
                              setZipcodes(res);

                              if (res?.length) {
                                setFieldValue("zipcode", res[0].name);
                              }
                            }
                          }}
                          onBlur={handleBlur}
                          className={`${getSelectClass("subdistrict")}  disabled:bg-white disabled:text-gray-800`}
                        >
                          <option value="" hidden>
                            กรุณาเลือกตำบล
                          </option>
                          {subdistricts.length === 0 && store?.subdistrict && (
                            <option value={store.subdistrict}>
                              {store.subdistrict}
                            </option>
                          )}
                          {subdistricts.map(
                            (s: { id: number; name: string }) => (
                              <option key={s.id} value={s.name}>
                                {s.name}
                              </option>
                            ),
                          )}
                        </select>
                        <ErrorMessage
                          name="subdistrict"
                          component="div"
                          className={errorTextClass}
                        />
                      </div>

                      <div className="relative">
                        <label className={labelClass}>รหัสไปรษณีย์</label>
                        <select
                          name="zipcode"
                          value={values.zipcode}
                          disabled={!zipcodes.length}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`${getSelectClass("zipcode")}  disabled:bg-white disabled:text-gray-800`}
                        >
                          <option value="" hidden>
                            กรุณาเลือกรหัสไปรษณีย์
                          </option>

                          {zipcodes.length === 0 && store?.zipcode && (
                            <option value={store.zipcode}>
                              {store.zipcode}
                            </option>
                          )}
                          {zipcodes.map((z: { id: number; name: string }) => {
                            return (
                              <option key={z.id} value={z.name}>
                                {z.name}
                              </option>
                            );
                          })}
                        </select>
                        <ErrorMessage
                          name="zipcode"
                          component="div"
                          className={errorTextClass}
                        />
                      </div>
                    </div>
                  </section>

                  {/* รูปพื้นหลัง */}
                  <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-5 pb-2 border-b border-gray-200">
                      รูปพื้นหลังร้านค้า
                    </h2>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/50 hover:border-blue-400 transition-all bg-white relative group"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) {
                          setFieldValue("promotionImage", file);
                          setPreview(URL.createObjectURL(file));
                        }
                      }}
                    >
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFieldValue("promotionImage", file);
                            setPreview(URL.createObjectURL(file));
                          }
                        }}
                      />

                      {preview || values.promotionImage ? (
                        <div className="text-center w-full">
                          <img
                            src={
                              preview ||
                              (typeof values.promotionImage === "string"
                                ? values.promotionImage
                                : "")
                            }
                            alt="Preview"
                            className="max-h-48 rounded-lg object-contain mx-auto mb-3 shadow-sm"
                          />
                          <p className="text-sm text-gray-600 truncate max-w-[250px] sm:max-w-xs mx-auto">
                            {typeof values.promotionImage === "object" &&
                            values.promotionImage !== null
                              ? (values.promotionImage as File).name
                              : "รูปภาพปัจจุบัน"}
                          </p>
                          <p
                            className="text-xs text-blue-500 mt-2 font-medium group-hover:text-blue-600 transition-colors"
                            data-test="click-change-img"
                          >
                            คลิกเพื่อเปลี่ยนรูปภาพใหม่
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                            <FiUpload className="text-gray-400 text-2xl group-hover:text-blue-500 transition-colors" />
                          </div>
                          <p className="text-base font-semibold text-gray-700 mb-1">
                            คลิกเพื่ออัพโหลด หรือ ลากไฟล์มาวาง
                          </p>
                          <p className="text-sm text-gray-500">
                            รองรับไฟล์ PNG, JPEG, JPG (สูงสุด 5 MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200 mt-8">
                    <button
                      type="button"
                      data-test="store-cancel-button"
                      className="w-full sm:w-auto px-8 py-3 sm:py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors shadow-sm order-2 sm:order-1 cursor-pointer"
                      onClick={() => handleCancel(dirty, resetForm)}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      data-test="store-save-button"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3 sm:py-2.5 bg-[#003399] hover:bg-blue-800 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 shadow-sm order-1 sm:order-2 cursor-pointer"
                    >
                      {"บันทึกการตั้งค่า"}
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default StoreEdit;
