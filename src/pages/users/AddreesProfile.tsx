import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import ProfileSidebar from "../../components/user/ProfileSidebar";
import { toast } from "react-hot-toast";
import {
  fetchAllAddresses,
  deleteAddress,
  addAdressDefault,
  addAddress,
  updateAddress,
  addressDropdown,
} from "../../redux/address/addressReducer";
import type { Address, DropdownItem } from "../../types/address";
import { Icon } from "@iconify/react";
import { useLocation } from "react-router-dom";
import ConfirmToast from "../../components/ConfirmToast";
import Skeletons from "../../components/loading/Skeletons";
// import Skeletons from "../../components/loading/Skeletons";

const AddressProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const addresses = useSelector((state: RootState) => state.address.addresses);
  const { provinces, districts, subdistricts,loading } = useSelector(
    (state: RootState) => state.address,
  );
  const [zipcodes, setZipcodes] = useState<{ id: number; name: string }[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [targetAddressId, setTargetAddressId] = useState<string | null>(null);
    const [updatingItems, setUpdatingItems] = useState<number[]>([]);
  const [isBlocking, setIsBlocking] = useState(false);
  const location = useLocation();

  const [formData, setFormData] = useState({
    streetAddress: "",
    subDistrict: 0,
    district: 0,
    province: 0,
    zipcode: "",
    zipcodeId: 0,
  });

  useEffect(() => {
    dispatch(fetchAllAddresses());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      streetAddress: e.target.value,
    }));
  };

  const fillAddressData = async (address: Address) => {
    const streetAddress = address.streetAddress;
    const provinceName = address.province;
    const districtName = address.district;
    const subDistrictName = address.subdistrict;

    setFormData((prev) => ({
      ...prev,
      streetAddress: streetAddress,
      // เราอาจจะเซ็ตพวกไอดีให้เป็น 0 ไว้ก่อนระหว่างรอโหลด
      province: 0,
      district: 0,
      subDistrict: 0,
    }));

    // จังหวัด
    const provinceRes: DropdownItem[] = await dispatch(
      addressDropdown({}),
    ).unwrap();

    const province = provinceRes.find((p) => p.name === provinceName)?.id ?? 0;

    setFormData((prev) => ({
      ...prev,
      // streetAddress,
      province,
    }));

    //อำเภอ
    const districtRes: DropdownItem[] = await dispatch(
      addressDropdown({
        provinceId: province,
        districtId: 0,
        subdistrictId: 0,
      }),
    ).unwrap();

    const district = districtRes.find((d) => d.name === districtName)?.id ?? 0;

    setFormData((prev) => ({
      ...prev,
      district,
    }));

    //ตำบล
    const subRes: DropdownItem[] = await dispatch(
      addressDropdown({
        provinceId: province,
        districtId: district,
        subdistrictId: 0,
      }),
    ).unwrap();

    const subDistrict = subRes.find((s) => s.name === subDistrictName)?.id || 0;

    setFormData((prev) => ({
      ...prev,
      subDistrict,
    }));

    const zipRes: DropdownItem[] = await dispatch(
      addressDropdown({
        provinceId: province,
        districtId: district,
        subdistrictId: subDistrict,
      }),
    ).unwrap();

    setZipcodes(zipRes);

    const zipcode = zipRes[0]?.name || "";
    const zipcodeId = zipRes[0]?.id || 0;

    setFormData((prev) => ({
      ...prev,
      subDistrict,
      zipcode,
      zipcodeId,
    }));
  };

  const openEditModal = async (address: Address) => {
    setIsEditMode(true);
    setTargetAddressId(String(address.id));
    await fillAddressData(address);
    setIsModalOpen(true);
  };

  const parseDropdownResponse = (
    response: DropdownItem[] | { data: DropdownItem[] },
  ) => {
    if (Array.isArray(response)) {
      return response;
    }

    return response.data;
  };

  const openAddModal = async () => {
    setIsEditMode(false);

    setFormData({
      streetAddress: "",
      subDistrict: 0,
      district: 0,
      province: 0,
      zipcode: "",
      zipcodeId: 0,
    });

    setZipcodes([]);

    // ดึงข้อมูลจังหวัดตอนกดปุ่ม
    await dispatch(
      addressDropdown({
        provinceId: 0,
        districtId: 0,
        subdistrictId: 0,
      }),
    );

    setIsModalOpen(true);
  };

  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const pId = Number(e.target.value);

    setFormData((prev) => ({
      ...prev,
      province: pId,
      district: 0,
      subDistrict: 0,
      zipcode: "",
      zipcodeId: 0,
    }));

    setZipcodes([]);

    await dispatch(
      addressDropdown({
        provinceId: pId,
        districtId: 0,
        subdistrictId: 0,
      }),
    ).unwrap();
  };

  const handleSaveAddress = async () => {
    const {
      streetAddress,
      subDistrict,
      district,
      province,
      zipcode,
      zipcodeId,
    } = formData;

    const fetchZipcodeInfo = async (zip: string, zipId: number) => {
      if (zip && zipId) {
        return { zipcode: zip, zipcodeId: zipId };
      }

      const zipResRaw = await dispatch(
        addressDropdown({
          provinceId: province,
          districtId: district,
          subdistrictId: subDistrict,
        }),
      ).unwrap();
      const zipRes = parseDropdownResponse(zipResRaw);
      return {
        zipcode: zipRes?.[0]?.name || "",
        zipcodeId: zipRes?.[0]?.id || 0,
      };
    };

    const { zipcodeId: finalZipcodeId } = await fetchZipcodeInfo(
      zipcode,
      zipcodeId,
    );

    if (
      !streetAddress ||
      !subDistrict ||
      !district ||
      !province ||
      !finalZipcodeId
    ) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const isEdit = isEditMode && targetAddressId;

    if (isEdit) {
      const currentAddress = addresses.find(
        (a) => a.id === Number(targetAddressId),
      );

      await dispatch(
        updateAddress({
          id: Number(targetAddressId),
          data: {
            streetAddress,
            zipcodeId: finalZipcodeId,
            isDefault: currentAddress?.isDefault || false,
          },
        }),
      );

      toast.success("แก้ไขที่อยู่สำเร็จ");
    } else {
      await dispatch(
        addAddress({
          streetAddress,
          zipcodeId: finalZipcodeId,
          isDefault: false,
        }),
      ).unwrap();

      toast.success("เพิ่มที่อยู่สำเร็จ");
    }
    dispatch(fetchAllAddresses());
    setIsModalOpen(false);
  };

  //ลบที่อยู่
  const handleDeleteAddress = async (addressId: number) => {
    if (addresses.length === 1) {
      toast.error(
        "ไม่สามารถลบได้ เนื่องจากต้องมีที่อยู่เริ่มต้นอย่างน้อย 1 รายการ",
      );
      return;
    }

    const confirmed = await confirmAction("คุณต้องการลบที่อยู่นี้ใช่หรือไม่?");

    if (!confirmed) return;

    await dispatch(deleteAddress(addressId));

    toast.success("ลบที่อยู่สำเร็จ");
  };


const handleSetDefault = async (addressId: number) => {
  if (isBlocking) return;
    if (updatingItems.includes(addressId)) return;

  // setIsBlocking(true);
  setUpdatingItems([addressId]);

  try {
    await dispatch(addAdressDefault(addressId)).unwrap();

    // await dispatch(fetchAllAddresses()).unwrap();

    toast.success("ตั้งค่าที่อยู่เริ่มต้นสำเร็จ");
  } catch {
    toast.error("ไม่สามารถตั้งค่าที่อยู่เริ่มต้นได้");
  } finally {
    setUpdatingItems([]);
    setIsBlocking(false);
  }
};

  const confirmAction = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setIsBlocking(true);

      toast(
        (t) => (
          <ConfirmToast
            t={t}
            message={message}
            onResolve={resolve}
            setIsBlocking={setIsBlocking}
          />
        ),
        {
          duration: Infinity,
          position: "top-center",
        },
      );
    });
  };
  return (
 <div className="min-h-screen bg-white font-anuphan text-gray-950 pt-10 sm:pt-5 pb-20">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-5 pt-5 md:pt-6">
        {/* 1. Breadcrumbs Nav (Desktop Only) */}
        <div className="hidden md:block">
           <nav className="hidden md:hidden lg:flex flex-wrap items-center text-md text-black mb-4 md:mb-8 font-medium">
                   <Link
                     data-test="click-home"
                     to="/"
                     className="transition-colors cursor-pointer"
                   >
                     หน้าหลัก
                   </Link>
                   <Icon
                     icon="material-symbols:chevron-right-rounded"
                     className="w-5 h-5 mx-1 text-black"
                   />
                   <Link to="/profile" className="transition-colors cursor-pointer">
                     โปรไฟล์
                   </Link>
                   <Icon
                     icon="material-symbols:chevron-right-rounded"
                     className="w-5 h-5 mx-1 text-black"
                   />
                   <span className="text-black">แก้ไขโปรไฟล์</span>
                 </nav>
        </div>

        {/* 2. Mobile Header Bar (Sticky Top) */}
        <div
          className="md:hidden bg-white sticky mt-8 z-40 px-4 py-3.5 border-b border-gray-200 flex items-center gap-3 shadow-sm cursor-pointer"
          data-test="mobile-header-bar"
        >
          <button
            className="text-black p-1 flex-shrink-0 -ml-1 rounded-full active:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => {
              if (location.state?.from === "payment") {
                navigate("/payment", {
                  state: {
                    items: location.state?.items,
                    isBuyNow: location.state?.isBuyNow,
                  },
                });
              } else {
                navigate("/profile");
              }
            }}
          >
            <Icon icon="material-symbols:arrow-back" className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">ที่อยู่ของฉัน</h1>
        </div>

        {/* Main Content Layout */}
<div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Sidebar (Desktop Only) */}
          <div className="hidden md:block shrink-0">
            <ProfileSidebar />
          </div>

          {/* Address List Container */}
<main className="flex flex-col flex-1 w-full lg:min-w-[800px] min-h-[427px] bg-[#F9FAFB] md:bg-white rounded-[4px] shadow-[0_0_10px_rgba(0,0,0,0.05)] border-b md:border border-gray-200 px-4 py-3 md:py-6 relative overflow-hidden">
            <div className="hidden md:flex justify-between items-center p-5 border-b border-gray-100">
              <h1 className="text-xl font-bold text-gray-900">ที่อยู่ของฉัน</h1>
              <button
                data-test="btn-add-address"
                onClick={openAddModal}
                className="bg-[#4285F4] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <span className="text-lg leading-none">+</span> เพิ่มที่อยู่ใหม่
              </button>
            </div>

            <div className="flex flex-col flex-1 divide-y divide-gray-100">
  {loading ? (
    <Skeletons />
  ) : addresses.length === 0 ? (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[350px]">
      <Icon
        icon="basil:location-outline"
        className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 mb-4"
      />

      <p className="text-lg sm:text-xl font-medium text-gray-500">
        ไม่มีข้อมูลที่อยู่ของคุณ
      </p>
    </div>
  ) : (
    addresses.map((address: Address) => (
      <div
        key={address.id}
        className="p-4 sm:p-5 flex flex-col gap-3 transition-colors hover:bg-gray-50/50"
      >
        
                    {/* แถวที่ 1: ข้อมูลผู้รับ & ปุ่มควบคุมหลัก */}
                    <div className="flex justify-between items-center w-full">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm sm:text-base">
                        <span
                          className="font-bold text-gray-900"
                          data-test="receiver-name"
                        >
                          {address.receiverName}
                        </span>
                        <span className="text-gray-300 hidden sm:inline">
                          |
                        </span>
                        <span
                          className="text-gray-500 font-medium"
                          data-test="receiver-phone"
                        >
                          {address.receiverPhone}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm shrink-0">
                        <button
                          data-test={`btn-edit-address-${address.id}`}
                          onClick={() => openEditModal(address)}
                          className="text-[#4285F4] hover:underline font-medium cursor-pointer"
                        >
                          แก้ไข
                        </button>
                        <span className="text-gray-200">|</span>
                        <button
                          data-test={`btn-delete-address-${address.id}`}
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-500 hover:underline font-medium cursor-pointer"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>

                    {/* แถวที่ 2: รายละเอียดที่อยู่ตัวเต็ม */}
                    <div
                      className="text-sm text-gray-600 leading-relaxed max-w-3xl"
                      data-test="address-detail"
                    >
                      {address.streetAddress} ต.{address.subdistrict} อ.
                      {address.district} จ.{address.province} {address.zipcode}
                    </div>

                    {/* แถวที่ 3: ป้ายบอกสถานะ และ ปุ่มตั้งเป็นค่าเริ่มต้น */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex flex-wrap gap-2">
                        {address.isDefault && (
                          <span className="px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-[#4285F4] border border-blue-200 rounded">
                            ค่าเริ่มต้น
                          </span>
                        )}
                        <span
                          className="px-2 py-0.5 text-[11px] font-medium bg-gray-50 text-gray-500 border border-gray-200 rounded"
                          data-test="receiver-address"
                        >
                          ที่อยู่ในการรับสินค้า
                        </span>
                      </div>

                      <button
                        data-test="btn-set-default"
                        disabled={address.isDefault}
                       onClick={() => handleSetDefault(address.id)}
  className={`shrink-0 px-3 py-1.5 border rounded-lg text-xs font-medium transition-all text-center w-full sm:w-auto ${
    address.isDefault
      ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100 cursor-pointer shadow-sm"
  }`}
>
  ตั้งเป็นค่าเริ่มต้น
</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>

        {/* 3. Mobile Add Address Sticky Button (Fixed Bottom) */}
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white p-4 border-t border-gray-200 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <button
            data-test="btn-add-address-mobile"
            onClick={openAddModal}
            className="w-full bg-[#4285F4] active:bg-blue-600 text-white py-3 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <span className="text-xl leading-none mt-[-2px]">+</span>{" "}
            เพิ่มที่อยู่ใหม่
          </button>
        </div>

        {/* 4. Overlay & Form Modal (Responsive Style matching the Image) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-100/80 md:bg-black/60 backdrop-blur-[1px] p-4 overflow-y-auto">
            {/* Backdrop ปิด Modal เมื่อคลิกด้านนอก (ทำงานบนจอใหญ่) */}
            <div
              className="hidden md:block absolute inset-0 transition-opacity cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            />

            {/* กล่องเนื้อหา Modal ที่ปรับแต่งตามภาพ */}
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl flex flex-col overflow-hidden transition-all duration-300 border border-gray-100 p-5">
              {/* ส่วนหัวแสดงหมุดตำแหน่งตรงกลางตามภาพ */}
              <div className="flex flex-col items-center justify-center pt-2 pb-4">
                <Icon
                  icon="material-symbols:location-on-outline-rounded"
                  className="w-14 h-14 text-gray-400"
                />
              </div>

              {/* หัวข้อฟอร์ม */}
              <div className="border-b border-gray-300 pb-1.5 mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  {isEditMode ? "แก้ไขข้อมูลที่อยู่" : "ที่อยู่ใหม่"}
                </h2>
              </div>

              {/* ส่วนฟอร์มข้อมูลภายใน */}
              <div className="flex-1 space-y-4">
                {/* Input รายละเอียดที่อยู่ */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">
                    ที่อยู่
                  </label>
                  <input
                    type="text"
                    id="streetAddress"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="บ้านเลขที่ / ถนน / ซอย"
                    className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white"
                  />
                </div>

                {/* แถวที่ 1: จังหวัด & อำเภอ (คงรูปเป็น 2 คอลัมน์บนโมบายล์ตามรูปภาพตัวอย่าง) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      จังหวัด
                    </label>
                    <div className="relative">
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleProvinceChange}
                        className="w-full h-11 rounded-lg px-3 pr-8 text-sm bg-gray-50 border border-gray-200 focus:bg-white focus:border-gray-400 outline-none appearance-none cursor-pointer transition-all text-gray-800"
                      >
                        <option value={0} hidden>
                          จังหวัด
                        </option>
                        {provinces.map((p: { id: number; name: string }) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <Icon
                        icon="material-symbols:keyboard-arrow-down-rounded"
                        className="absolute right-2 top-3 w-5 h-5 text-gray-500 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      อำเภอ
                    </label>
                    <div className="relative">
                      <select
                        name="district"
                        value={formData.district}
                        disabled={!formData.province}
                        onChange={async (
                          e: React.ChangeEvent<HTMLSelectElement>,
                        ) => {
                          const dId = Number(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            district: dId,
                            subDistrict: 0,
                            zipcode: "",
                            zipcodeId: 0,
                          }));
                          setZipcodes([]);
                          await dispatch(
                            addressDropdown({
                              provinceId: formData.province,
                              districtId: dId,
                              subdistrictId: 0,
                            }),
                          ).unwrap();
                        }}
                        className="w-full h-11 rounded-lg px-3 pr-8 text-sm bg-gray-50 border border-gray-200 focus:bg-white focus:border-gray-400 outline-none disabled:bg-gray-100 disabled:text-gray-400 appearance-none cursor-pointer transition-all text-gray-800"
                      >
                        <option value="" hidden>
                          อำเภอ
                        </option>
                        {districts.map((d: { id: number; name: string }) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <Icon
                        icon="material-symbols:keyboard-arrow-down-rounded"
                        className="absolute right-2 top-3 w-5 h-5 text-gray-500 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                {/* แถวที่ 2: ตำบล & รหัสไปรษณีย์ (คงรูปเป็น 2 คอลัมน์บนโมบายล์ตามรูปภาพตัวอย่าง) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      ตำบล
                    </label>
                    <div className="relative">
                      <select
                        name="subDistrict"
                        value={formData.subDistrict}
                        disabled={!formData.district}
                        onChange={async (
                          e: React.ChangeEvent<HTMLSelectElement>,
                        ) => {
                          const sId = Number(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            subDistrict: sId,
                            zipcode: "",
                          }));
                          const resRaw = await dispatch(
                            addressDropdown({
                              provinceId: formData.province,
                              districtId: formData.district,
                              subdistrictId: sId,
                            }),
                          ).unwrap();

                          const res = parseDropdownResponse(resRaw);
                          setZipcodes(res || []);

                          if (res?.length) {
                            setFormData((prev) => ({
                              ...prev,
                              zipcode: res?.[0]?.name || "",
                              zipcodeId: res?.[0]?.id || 0,
                            }));
                          }
                        }}
                        className="w-full h-11 rounded-lg px-3 pr-8 text-sm bg-gray-50 border border-gray-200 focus:bg-white focus:border-gray-400 outline-none disabled:bg-gray-100 disabled:text-gray-400 appearance-none cursor-pointer transition-all text-gray-800"
                      >
                        <option value="" hidden>
                          ตำบล
                        </option>
                        {subdistricts.map((s: { id: number; name: string }) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <Icon
                        icon="material-symbols:keyboard-arrow-down-rounded"
                        className="absolute right-2 top-3 w-5 h-5 text-gray-500 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      รหัสไปรษณีย์
                    </label>
                    <div className="relative">
                      <select
                        value={formData.zipcodeId}
                        disabled={!zipcodes.length}
                        onChange={(e) => {
                          const zId = Number(e.target.value);
                          const selected = zipcodes.find((z) => z.id === zId);

                          setFormData((prev) => ({
                            ...prev,
                            zipcodeId: zId,
                            zipcode: selected?.name || "",
                          }));
                        }}
                        className="w-full h-11 rounded-lg px-3 pr-8 text-sm bg-gray-50 border border-gray-200 focus:bg-white focus:border-gray-400 outline-none disabled:bg-gray-100 disabled:text-gray-400 appearance-none cursor-pointer transition-all text-gray-800"
                      >
                        <option value="" hidden>
                          รหัสไปรษณีย์
                        </option>
                        {zipcodes.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.name}
                          </option>
                        ))}
                      </select>
                      <Icon
                        icon="material-symbols:keyboard-arrow-down-rounded"
                        className="absolute right-2 top-3 w-5 h-5 text-gray-500 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ปุ่ม Action ท้าย Modal แสดงคู่กันซ้ายขวา (บันทึกสีเขียวอยู่ซ้าย, ยกเลิกอยู่ขวา ตามภาพ) */}
              <div className="mt-6 grid grid-cols-2 gap-3 bg-white">
                <button
                  data-test="btn-save-address"
                  onClick={handleSaveAddress}
                  className="w-full py-2 bg-[#0cc485] hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-md text-sm font-semibold shadow-sm transition-all cursor-pointer text-center"
                >
                  บันทึก
                </button>
                <button
                  data-test="btn-cancel-address"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 border border-gray-300 text-gray-600 rounded-md text-sm font-semibold bg-white hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer text-center"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Backdrop กันการคลิกซ้อนตอนบันทึกข้อมูล */}
        {isBlocking && (
          <div className="fixed inset-0 bg-black/10 z-[999] cursor-wait backdrop-blur-[0.5px]" />
        )}
      </div>
    </div>
  );
};

export default AddressProfile;
