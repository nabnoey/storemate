import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import {
  getProfile,
  updateProfile,
  logout,
} from "../../redux/auth/authReducer";
import type { RootState } from "../../redux/store";
import ProfileSidebar from "../../components/user/ProfileSidebar";
// import Loading from "../../components/loading/Loading";
import { Icon } from "@iconify/react";

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(new Error(`Failed to load image at URL: ${url}`)),
    );
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any,
): Promise<{ url: string; blob: Blob }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No 2d context");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve({ url: URL.createObjectURL(blob), blob });
      },
      "image/jpeg",
      0.9,
    );
  });
}

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

const EditModal = ({
  isOpen,
  title,
  onClose,
  onSave,
  children,
}: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div
      className="
    fixed inset-0 z-[60]
    flex items-center justify-center
    bg-black/50 backdrop-blur-sm
    p-4
  "
    >
      <div
        className="
    bg-white
    w-[92%]
    max-w-[420px]
    rounded-xl
    shadow-2xl
    overflow-hidden
  "
      >
        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[#374151] text-[16px] sm:text-[18px] font-bold break-words">
              {title}
            </h3>
          </div>
        </div>
        <div className="px-4 py-4 flex-1 overflow-y-auto">{children}</div>
        <div className="px-4 pb-6 pt-4 mt-auto bg-white">
          <div
            data-test="edit-modal-actions"
            className="flex flex-row justify-between gap-3 w-full"
          >
            <button
              data-test="edit-modal-save-button"
              onClick={onSave}
              className="flex-1 cursor-pointer bg-[#10B981] text-white py-2.5 rounded text-[16px] font-normal leading-[24px] break-words hover:bg-green-600 transition-colors"
            >
              บันทึกข้อมูล
            </button>

            <button
              data-test="edit-modal-cancel-button"
              onClick={onClose}
              className="flex-1 cursor-pointer border border-gray-300 text-[#374151] bg-white py-2.5 rounded text-[16px] font-normal leading-[24px] break-words hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [tempData, setTempData] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
  });
  // const [loading, setLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUploadStep, setImageUploadStep] = useState<"upload" | "crop">(
    "upload",
  );
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageFileForUpload, setImageFileForUpload] = useState<Blob | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // setLoading(true);
    if (user) {
      setTempData({
        name: user.name,
        email: user.email || "",
        phone: user.phone || "",
        image: user.image_url || user.image || "",
      });
    }
    // setLoading(false);
  }, [user]);

  useEffect(() => {
    dispatch(getProfile() as any);
  }, [dispatch]);

  const openModal = (type: string) => setActiveModal(type);

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  const processFile = (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      toast.error("รองรับเฉพาะไฟล์ PNG, JPEG และ JPG");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setRawImageSrc(reader.result?.toString() || "");
      setImageUploadStep("crop");
    });
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleSaveCrop = async () => {
    // const toastId = toast.loading("กำลังอัปเดตรูปโปรไฟล์...");

    try {
      if (rawImageSrc && croppedAreaPixels) {
        const { url, blob } = await getCroppedImg(
          rawImageSrc,
          croppedAreaPixels,
        );

        setTempData({ ...tempData, image: url });
        setImageFileForUpload(blob);

        const formData = new FormData();
        const userData = {
          name: tempData.name,
          email: tempData.email,
          phone: tempData.phone,
        };

        formData.append("data", JSON.stringify(userData));
        formData.append("image", blob, "profile.jpeg");

        await dispatch(updateProfile(formData) as any).unwrap();
        await dispatch(getProfile() as any).unwrap();

        toast.success("แก้ไขข้อมูลโปรไฟล์สำเร็จ");

        setIsImageModalOpen(false);
        setRawImageSrc(null);
        setImageUploadStep("upload");
        setZoom(1);
      }
    } catch (error: any) {
      toast.error(
        typeof error === "string"
          ? error
          : "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      );
    }
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setRawImageSrc(null);
    setImageUploadStep("upload");
    setZoom(1);
  };

  const handleSave = async () => {
    try {
      if (activeModal === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(tempData.email)) {
          toast.error("กรุณากรอกอีเมลให้ถูกต้อง");
          return;
        }
      }

      if (tempData.phone && !/^0\d{9}$/.test(tempData.phone)) {
        toast.error("เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก");
        return;
      }

      const userData = {
        name: tempData.name,
        email: tempData.email,
        phone: tempData.phone,
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(userData));

      if (imageFileForUpload) {
        formData.append("image", imageFileForUpload, "profile.jpeg");
      }

      await dispatch(updateProfile(formData) as any).unwrap();

      if (tempData.email !== user.email) {
        toast.success("แก้ไขข้อมูลโปรไฟล์สำเร็จ");
        setActiveModal(null);

        setTimeout(() => {
          dispatch(logout());
          window.location.href = "/login";
        });
        return;
      }

      await dispatch(getProfile() as any).unwrap();

      toast.success("แก้ไขข้อมูลโปรไฟล์สำเร็จ");
      setActiveModal(null);
      setImageFileForUpload(null);
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        typeof error === "string"
          ? error
          : "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง";

      toast.error(errorMessage);
    }
  };

  const handleCloseModal = () => {
    if (user) {
      setTempData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        image: user.image_url || user.image || "",
      });
    }
    setActiveModal(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "null") return "-";

    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
  };

  // if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-white font-anuphan text-gray-950 pt-10 sm:pt-5 pb-20">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-5 pt-5 md:pt-6">
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

        <div className="md:hidden bg-white pt-2 pb-4">
          <div className="flex items-center gap-3">
            <button
              className="mt-[2px] text-black p-0 flex-shrink-0 -ml-2"
              onClick={() => navigate("/")}
            >
              <Icon icon="material-symbols:arrow-back" className="w-5 h-5" />
            </button>

            <div className="flex-1">
              <h1 className="text-[16px] leading-[28px] font-bold text-black">
                ข้อมูลของฉัน
              </h1>
              <p className="text-black text-[14px] font-anuphan font-normal leading-[24px] break-words mt-[2px]">
                จัดการข้อมูลส่วนตัวคุณเพื่อความปลอดภัยของบัญชีผู้ใช้นี้
              </p>
            </div>
          </div>

          <div className=" w-[calc(95%+16px)] border-t border-black mt-3 pt-1" />
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-6 items-start">
          <ProfileSidebar />

          <main className="flex flex-col w-full lg:min-w-[800px] min-h-[427px] bg-[#F9FAFB] md:bg-white rounded-[4px] shadow-[0_0_10px_rgba(0,0,0,0.05)] border-b md:border border-gray-200 px-4 py-3 md:py-6 gap-[9px] relative">
            <div className="hidden sm:hidden md:block w-full mb-6 md:mb-8">
              <h1 className="text-[20px] font-bold text-black">ข้อมูลของฉัน</h1>
              <p className="text-[14px] mt-1 text-black">
                จัดการข้อมูลส่วนตัวคุณเพื่อความปลอดภัยของบัญชีผู้ใช้นี้
              </p>
              <div className="w-full border-t border-black mt-5" />
            </div>
            <div className="flex flex-col sm:flex-col lg:flex-row lg:justify-between items-center lg:items-start w-full gap-6 lg:gap-0">
              <div className="flex flex-col items-center justify-start w-full sm:w-56 lg:w-64 shrink-0 order-1 lg:order-3 mb-4 lg:mb-0 mt-2 lg:mt-0">
                <div className="w-[150px] h-[150px] sm:w-[160px] sm:h-[160px] lg:w-32 lg:h-32 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm mb-4">
                  {" "}
                  {tempData.image ? (
                    <img
                      src={tempData.image}
                      data-test="profile-image"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon
                      data-test="default-profile-icon"
                      icon="lucide:user"
                      className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400"
                    />
                  )}
                </div>
                <button
                  data-test="btn-open-image-modal"
                  onClick={() => setIsImageModalOpen(true)}
                  className="cursor-pointer w-[110px] h-[44px] inline-flex items-center justify-center gap-[10px] bg-white border border-[#D9D9D9] rounded-[5px] p-[10px] text-[16px] leading-[24px] font-normal text-black font-anuphan mb-4 hover:bg-gray-50 transition-colors"
                >
                  เลือกรูป
                </button>
              </div>

              {/* Desktop Divider */}
              <div className="hidden md:hidden xl:block w-[1px] bg-gray-300 order-2 min-h-[250px] mx-4 lg:mx-8" />
              <div className="w-full flex-1 order-3 md:order-1 mt-4 md:mt-0 md:pr-10 lg:pr-16">
                <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-lg font-['Anuphan']">
                  <div className="flex items-center gap-4 sm:gap-8 w-full">
                    <div className="w-[100px] sm:w-[130px] text-right text-[14px] sm:text-[16px] text-black shrink-0">
                      ชื่อ - นามสกุล
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2 overflow-hidden">
                      <div
                        data-test="profile-name"
                        className="text-[14px] sm:text-[16px] text-black truncate"
                      >
                        {tempData.name}
                      </div>
                      <button
                        data-test="btn-change-name"
                        onClick={() => openModal("name")}
                        className="cursor-pointer shrink-0 flex items-center"
                      >
                        <span className="hidden sm:block text-blue-500 text-[16px]">
                          เปลี่ยน
                        </span>
                        <Icon
                          icon="material-symbols:chevron-right-rounded"
                          className="sm:hidden w-6 h-6 text-gray-600"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-8 w-full">
                    <div className="w-[100px] sm:w-[130px] text-right text-[14px] sm:text-[16px] text-black shrink-0">
                      อีเมล
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2 overflow-hidden">
                      <div
                        data-test="profile-email"
                        className="text-[14px] sm:text-[16px] text-black truncate"
                      >
                        {tempData.email.replace(
                          /(.)([^@]*)(@.*)/,
                          "$1******$3",
                        )}
                      </div>
                      <button
                        data-test="btn-change-email"
                        onClick={() => openModal("email")}
                        className="cursor-pointer shrink-0 flex items-center"
                      >
                        <span className="hidden sm:block text-blue-500 text-[16px]">
                          เปลี่ยน
                        </span>
                        <Icon
                          icon="material-symbols:chevron-right-rounded"
                          className="sm:hidden w-6 h-6 text-gray-600"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-8 w-full">
                    <div className="w-[100px] sm:w-[130px] text-right text-[14px] sm:text-[16px] text-black shrink-0">
                      เบอร์โทรศัพท์
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2 overflow-hidden">
                      <div
                        data-test="profile-phone"
                        className="text-[14px] sm:text-[16px] text-black truncate"
                      >
                        {tempData.phone
                          ? tempData.phone.replace(/^(.*)(.{2})$/, "********$2")
                          : "-"}
                      </div>
                      <button
                        data-test="btn-change-phone"
                        onClick={() => openModal("phone")}
                        className="cursor-pointer shrink-0 flex items-center"
                      >
                        <span className="hidden sm:block text-blue-500 text-[16px]">
                          เปลี่ยน
                        </span>
                        <Icon
                          icon="material-symbols:chevron-right-rounded"
                          className="sm:hidden w-6 h-6 text-gray-600"
                        />
                      </button>
                    </div>
                  </div>

                  {/* วันที่สมัคร */}
                  <div className="flex items-center gap-4 sm:gap-8 w-full">
                    <div className="w-[100px] sm:w-[130px] text-right text-[14px] sm:text-[16px] text-black shrink-0">
                      วันที่สมัคร
                    </div>
                    <div
                      data-test="profile-created-at"
                      className="flex-1 flex items-center justify-between gap-2 overflow-hidden"
                    >
                      <div className="text-[14px] sm:text-[16px] text-black truncate">
                        {user.createdAt && user.createdAt !== "null"
                          ? formatDate(user.createdAt)
                          : "-"}
                      </div>
                      <div className="w-[45px] shrink-0"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* --- Modals --- */}
        {isImageModalOpen && (
          <div
            data-test="image-modal"
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (
                e.target === e.currentTarget &&
                imageUploadStep === "upload"
              ) {
                closeImageModal();
              }
            }}
          >
            <div
              data-test="image-modal-content"
              className="bg-white rounded-xl shadow-2xl w-full max-w-[550px] overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ปรับแก้ให้ใช้ px-4 เสมอตาม EditModal ด้านบนเพื่อความสมมาตร */}
              <div className="px-4 pt-6 pb-4 border-b border-gray-100">
                {imageUploadStep === "upload" ? (
                  <div
                    data-test="image-upload-area"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border border-gray-200 rounded-xl bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-12 transition-colors w-full min-h-[260px] ${
                      isDragging ? "border-blue-500 bg-blue-50/50" : ""
                    }`}
                  >
                    <Icon
                      icon="lucide:upload"
                      data-test="upload-icon"
                      className={`w-12 h-12 mb-4 ${isDragging ? "text-blue-500" : "text-gray-700"}`}
                    />

                    <p className="text-gray-900 font-medium text-base">
                      ลากและวางไฟล์เพื่ออัปโหลด
                    </p>
                    <p className="text-gray-400 text-sm mt-1 mb-5">
                      PNG, JPEG, JPG up to 5 MB
                    </p>

                    <span className="text-gray-500 text-sm mb-4 font-normal">
                      หรือ
                    </span>

                    <button
                      data-test="btn-select-file"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium px-6 py-2.5 rounded-lg transition shadow-sm"
                    >
                      เลือกไฟล์
                    </button>

                    <input
                      data-test="file-input"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept=".jpg, .jpeg, .png"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div
                      data-test="cropped-image-container"
                      className="relative w-full h-[300px] bg-gray-100 rounded-lg overflow-hidden"
                    >
                      {rawImageSrc && (
                        <Cropper
                          image={rawImageSrc}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          cropShape="round"
                          showGrid={false}
                          onCropChange={setCrop}
                          onCropComplete={onCropComplete}
                          onZoomChange={setZoom}
                        />
                      )}
                    </div>

                    {/* แถบย่อ-ขยาย */}
                    <div className="w-full max-w-xs mt-6 flex items-center gap-4">
                      <span className="text-xs text-gray-500 font-medium">
                        0
                      </span>

                      <input
                        data-test="zoom-slider"
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                        style={{
                          background: `linear-gradient(to right, #2563EB 0%, #2563EB ${
                            ((zoom - 1) / (3 - 1)) * 100
                          }%, #E5E7EB ${
                            ((zoom - 1) / (3 - 1)) * 100
                          }%, #E5E7EB 100%)`,
                        }}
                      />

                      <span className="text-xs text-gray-500 font-medium">
                        100
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {imageUploadStep === "crop" && (
                <div className="px-4 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                  <button
                    data-test="btn-cancel-crop"
                    onClick={closeImageModal}
                    className="cursor-pointer px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-white transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    data-test="btn-save-crop"
                    onClick={handleSaveCrop}
                    className="cursor-pointer px-6 py-2 bg-[#00BFA5] text-white rounded-lg text-sm font-medium hover:bg-[#009E88] transition"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text Edit Modals */}
        <EditModal
          isOpen={activeModal === "name"}
          title="เปลี่ยน ชื่อ - นามสกุล"
          onClose={handleCloseModal}
          onSave={handleSave}
        >
          <div>
            <label
              htmlFor="name"
              className="text-sm text-gray-600 font-medium mb-1.5 block"
            >
              ชื่อ-นามสกุล
            </label>
            <input
              id="input-name"
              data-test="input-name"
              type="text"
              className="w-full border border-gray-300 px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
              value={tempData.name}
              onChange={(e) =>
                setTempData({ ...tempData, name: e.target.value })
              }
            />
          </div>
        </EditModal>

        <EditModal
          isOpen={activeModal === "email"}
          title="เปลี่ยนอีเมล"
          onClose={handleCloseModal}
          onSave={handleSave}
        >
          <div>
            <label
              htmlFor="email"
              className="text-sm text-black font-medium mb-1.5 block"
            >
              อีเมล
            </label>
            <input
              id="input-email"
              data-test="input-email"
              type="email"
              className="w-full border border-gray-300 px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
              value={tempData.email}
              onChange={(e) =>
                setTempData({ ...tempData, email: e.target.value })
              }
            />
          </div>
        </EditModal>

        <EditModal
          isOpen={activeModal === "phone"}
          title="เปลี่ยนเบอร์โทร"
          onClose={handleCloseModal}
          onSave={handleSave}
        >
          <div>
            <label
              htmlFor="phone"
              className="text-md text-gray-600 font-medium mb-1.5 block"
            >
              เบอร์โทร
            </label>
            <input
              id="input-phone"
              data-test="input-phone"
              type="text"
              maxLength={10}
              className="w-full border border-gray-300 px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
              value={tempData.phone}
              onChange={(e) =>
                setTempData({
                  ...tempData,
                  phone: e.target.value.replaceAll(/\D/g, ""),
                })
              }
            />
          </div>
        </EditModal>
      </div>
    </div>
  );
};

export default ProfilePage;
