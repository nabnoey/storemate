import { useRef, useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import {
  addProduct,
  editProduct,
  deleteProduct,
} from "../../redux/moderator/ModeratorReducer";
import {fetchProductById,fetchProducts} from "../../redux/products/productReducer"
import type {  AddProductModalProps,ProductFormValues} from "../../types/moderator/productMod";
import type { Product, ProductImage } from "../../types/product";
import { toast } from "react-hot-toast";

const CATEGORY_MAP: Record<string, number> = {
  โปรโมชั่น: 1,
  สบู่: 2,
  เครื่องดื่ม: 3,
  แชมพู: 4,
};

const STATUS_MAP: Record<string, number> = {
  ACTIVE: 1,
  INACTIVE: 2,
};

const normalizeCategory = (category: string | number | undefined): string => {
  if (!category) return "";
  const catStr = String(category).toLowerCase().trim();

   if (["1", "promotion"].includes(catStr)) return "โปรโมชั่น";
  if (["2", "soap"].includes(catStr)) return "สบู่";
  if (["3", "drinks"].includes(catStr)) return "เครื่องดื่ม";
  if (["4", "shampoo"].includes(catStr)) return "แชมพู";

  return String(category);
};

const normalizeStatus = (
  status?: string,
): "ACTIVE" | "INACTIVE" => {
  return status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
};


const ProductSchema = Yup.object().shape({
  productName: Yup.string().required("กรอกข้อมูลสินค้าไม่ครบถ้วน"),
  categoryName: Yup.string().required("กรอกข้อมูลสินค้าไม่ครบถ้วน"),
  price: Yup.number()
    .typeError("ราคาสินค้าควรเป็นตัวเลข")
    .min(0, "ราคาต้องไม่ต่ำกว่า 0")
    .required("กรอกข้อมูลสินค้าไม่ครบถ้วน"),
  stockQuantity: Yup.number()
    .typeError("จำนวนสินค้าควรเป็นตัวเลข")
    .min(0, "จำนวนต้องไม่ต่ำกว่า 0")
    .required("กรอกข้อมูลสินค้าไม่ครบถ้วน"),
  status: Yup.string().required("กรอกข้อมูลสินค้าไม่ครบถ้วน"),
  description: Yup.string().required("กรอกข้อมูลสินค้าไม่ครบถ้วน"),
});



export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State สำหรับจัดการรูปภาพหลายรูป
const [existingImages, setExistingImages] = useState<
  { id: number; url: string; imageName: string }[]
>([]);

  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>(
    [],
  );
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
 

  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const isEditMode = !!product;

  useEffect(() => {
    let isMounted = true;

   const fetchDetail = async () => {
  if (isOpen && isEditMode && product?.id) {

    const detail = await dispatch(
      fetchProductById(product.id)
    ).unwrap();

    if (isMounted) {
      setFullProduct(detail);

      if (detail.productImages?.length > 0) {
        setExistingImages(
          detail.productImages.map((img: ProductImage) => ({
            id: img.id,
            url: img.imageUrl,
            imageName: img.imageName,
          })),
        );
      }
  
        }
      } else if (!isOpen) {
        setExistingImages([]);
        setNewImages([]);
        setRemovedImageIds([]);
        setFullProduct(null);
      }
    };
    fetchDetail();

    

    return () => {
      isMounted = false;
    };
  }, [isOpen, isEditMode, product?.id]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    if (onSuccess) onSuccess();
    else onClose();
  };

const handleUploadClick = () => {
  const totalImages = existingImages.length + newImages.length;

  if (totalImages >= 5) {
    toast.error("สามารถเพิ่มรูปสินค้าได้สูงสุด 5 รูป");
    return;
  }

  fileInputRef.current?.click();
};

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

  const handleDelete = async () => {
    if (!product) return;
    const isConfirmed = await showConfirmToast(
      "คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?",
      true,
    );
    if (!isConfirmed) return;

    try {
      await dispatch(deleteProduct(product.id)).unwrap();
      toast.success("ลบสินค้าเรียบร้อยแล้ว");
      handleCloseModal();
    } catch{
      toast.error("ไม่สามารถลบสินค้าที่มีประวัติการสั่งซื้อได้");

      
    }
  };

  const isImagesDirty = newImages.length > 0 || removedImageIds.length > 0;

  const handleCancel = async (isDirty: boolean) => {
    if (!isDirty && !isImagesDirty) {
      onClose();
      return;
    }
    const isConfirmed = await showConfirmToast(
      "คุณต้องการละทิ้งการเปลี่ยนแปลงหรือไม่?",
    );
    if (isConfirmed) onClose();
  };

const handleFileChange = (files: FileList | null) => {
  if (!files) return;

  const validFiles: { file: File; preview: string }[] = [];

  Array.from(files).forEach((file) => {
    // ตรวจสอบประเภทและขนาดไฟล์
    if (
      !["image/png", "image/jpeg", "image/jpg"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      toast.error(`ไฟล์ ${file.name} ไม่รองรับ หรือขนาดใหญ่เกิน 5MB`);
      return;
    }

    // ตรวจสอบว่ารูปซ้ำกับรูปใหม่ที่เลือกไว้แล้วหรือไม่
    const isDuplicate = newImages.some(
      (img) =>
        img.file.name === file.name &&
        img.file.size === file.size &&
        img.file.lastModified === file.lastModified,
    );

    if (isDuplicate) {
      toast.error(`รูป ${file.name} ถูกเพิ่มไปแล้ว`);
      return;
    }

    validFiles.push({
      file,
      preview: URL.createObjectURL(file),
    });
  });

  // จำนวนรูปทั้งหมดหลังจากเพิ่มรูปใหม่
  const totalImages = existingImages.length + newImages.length;
  const remainingSlots = 5 - totalImages;

  // ถ้าไม่มีพื้นที่เหลือ
  if (remainingSlots <= 0) {
    toast.error("สามารถเพิ่มรูปสินค้าได้สูงสุด 5 รูป");
    return;
  }

  // ถ้าเลือกเกินจำนวนที่เหลือ
  if (validFiles.length > remainingSlots) {
    toast.error(
      `สามารถเพิ่มรูปได้อีก ${remainingSlots} รูปเท่านั้น (สูงสุด 5 รูป)`,
    );
  }

  // เพิ่มเฉพาะรูปที่ยังอยู่ในจำนวนที่กำหนด
  setNewImages((prev) => [
    ...prev,
    ...validFiles.slice(0, remainingSlots),
  ]);
};
  const handleRemoveExistingImage = (id: number) => {
  setRemovedImageIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  setExistingImages((prev) => prev.filter((img) => img.id !== id));
};

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const displayImages = [
    ...existingImages.map((img) => img.url),
    ...newImages.map((img) => img.preview),
  ];


  const formInitialValues: ProductFormValues  = {
    productName: product?.productName || "",
    categoryName: normalizeCategory(product?.category),
    price: product?.price ?? "",
    stockQuantity: product?.stockQuantity ?? "",
    status: normalizeStatus(
        
        product?.status,
    ),
    description: fullProduct?.description || product?.description || "",
  };

  const createRequest = (values: ProductFormValues) => ({
  productName: values.productName,
  categoryId: CATEGORY_MAP[values.categoryName],
  price: Number(values.price),
  stockQuantity: Number(values.stockQuantity),
  statusId: STATUS_MAP[values.status],
  description: values.description,
});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[600px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1e3a8a] px-6 py-5 text-center shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            {isEditMode ? "แก้ไขข้อมูลสินค้า" : "จัดการสินค้าในคลัง"}
          </h2>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <Formik
            enableReinitialize
            initialValues={formInitialValues}
            validationSchema={ProductSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                if (
                  isEditMode &&
                  !(await showConfirmToast(
                    "คุณแน่ใจหรือไม่ว่าต้องการแก้ไขสินค้านี้?", 
                  ))
                ) {
                  return;
                }

                if ( displayImages.length === 0) {
                  toast.error("กรุณาเพิ่มรูปภาพสินค้าอย่างน้อย 1 รูป");
                  return;
                }

                const formData = new FormData();
                const request = createRequest(values);

formData.append(
  "request",
  new Blob(
    [
      JSON.stringify(
        isEditMode
          ? {
              ...request,
              removeImages: removedImageIds,
            }
          : request
      ),
    ],
    { type: "application/json" }
  )
);

newImages.forEach((img) => {
  formData.append("files", img.file);
});

                if (isEditMode) {
                  await dispatch(
                    editProduct({ id: product.id, data: formData }),
                  ).unwrap();
                  toast.success("แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว");
                  dispatch(fetchProducts());
                } else {
                  await dispatch(addProduct(formData)).unwrap();
                  toast.success("เพิ่มสินค้าเรียบร้อยแล้ว", {duration: 3000});
                }
                handleCloseModal();
              } catch {
                toast.error(
                    (isEditMode
                      ? "เกิดข้อผิดพลาดในการแก้ไขสินค้า"
                      : "เกิดข้อผิดพลาดในการเพิ่มสินค้า")
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, dirty,values, setFieldValue }) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อสินค้า
                    </label>
                    <Field
                      type="text"
                      name="productName"
                      placeholder="ชื่อสินค้า"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                    />
                    <ErrorMessage
                      name="productName"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      หมวดหมู่
                    </label>
                    <Field
                      as="select"
                      name="categoryName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                    >
                      <option value="" disabled>
                        -- เลือกหมวดหมู่ --
                      </option>
                      <option value="โปรโมชั่น">โปรโมชั่น</option>
                      <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                      <option value="สบู่">สบู่</option>
                      <option value="แชมพู">แชมพู</option>
                    </Field>
                    <ErrorMessage
                      name="categoryName"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ราคาต่อชิ้น
                    </label>
                    <Field
                      type="number"
                      min={0}
                      name="price"
                      placeholder="ราคา"
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                    />
                    <ErrorMessage
                      name="price"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
  จำนวนคงเหลือ
  </label>
  <Field
    type="number"
    min={0}
    name="stockQuantity"
    placeholder="จำนวนสินค้า"
    onWheel={(e) => e.currentTarget.blur()}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400"
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // 1. อัปเดตค่าจำนวนสินค้าตามปกติ
      setFieldValue("stockQuantity", val);
      
      // 2. เช็คว่าถ้าค่าเป็น 0 ให้บังคับเปลี่ยนสถานะเป็น INACTIVE (ไม่พร้อมจำหน่าย)
      if (Number(val) === 0 && val !== "") {
        setFieldValue("status", "INACTIVE");
      } 
      // 3. (เสริม) ถ้ามีการเติมสต๊อก (มากกว่า 0) ให้กลับมาเป็น ACTIVE (พร้อมจำหน่าย) อัตโนมัติ
      else if (Number(val) > 0 && values.status === "INACTIVE") {
        setFieldValue("status", "ACTIVE");
      }
    }}
  />
  <ErrorMessage name="stockQuantity" component="div" className="text-red-500 text-xs mt-1" />
</div>
                </div>

                <div className="w-1/2 pr-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    สถานะสินค้า
                  </label>
                  <Field
                    as="select"
                    name="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                  >
                    <option value="ACTIVE">พร้อมจำหน่าย</option>
                    <option value="INACTIVE">ไม่พร้อมจำหน่าย</option>
                  </Field>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รายละเอียดสินค้า
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    placeholder="รายละเอียดสินค้า"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-700 placeholder-gray-400"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* ส่วนแสดงภาพแบบแยกส่วนเพื่อแก้ปัญหาเรื่องดัชนีเพี้ยน */}
                <div className="flex flex-col gap-4 mt-2 w-full">
                  {/* แสดงรูปภาพใบหลัก (ใบแรกจากอาเรย์ที่มีอยู่) */}
                  {displayImages.length > 0 && (
                    <div className="relative w-full max-w-[220px] h-[220px] mx-auto border border-gray-200 rounded-xl p-2 bg-white shadow-sm">
                      <img
                        src={displayImages[0]}
                        alt="Main Product"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 w-7 h-7 flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors"
                        onClick={() => {
                          if (existingImages.length > 0) {
                            handleRemoveExistingImage(existingImages[0].id);
                          } else {
                            handleRemoveNewImage(0);
                          }
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* แสดงลิสต์รายการ Thumbnails */}
                  <div className="flex flex-wrap gap-4 justify-center mt-2">
                    
                  {existingImages.slice(1).map((img) => {
                      return (
                        <div
                          key={`existing-${img.id}`}
                          className="relative w-24 h-24 border border-gray-200 rounded-lg p-1 bg-white shadow-sm"
                        >
                          <img
                            src={img.url}
                            alt="Thumbnail Existing"
                            className="w-full h-full object-contain rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] shadow-md hover:bg-red-600 transition-colors"
                            onClick={() => handleRemoveExistingImage(img.id)}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                    

                    {/* 2. วนแสดงรูปภาพใหม่ที่เพิ่งอัปโหลดเพิ่มเข้ามา */}
                    {newImages.map((img, index) => {
                      return (
                        <div
                          key={`new-${index}`}
                          className="relative w-24 h-24 border border-gray-200 rounded-lg p-1 bg-white shadow-sm"
                        >
                          <img
                            src={img.preview}
                            alt="Thumbnail New"
                            className="w-full h-full object-contain rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] shadow-md hover:bg-red-600 transition-colors"
                            onClick={() => handleRemoveNewImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* พื้นที่อัปโหลดรูปภาพ (Drag & Drop Zone) */}
                  <div
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors mt-2"
                    onClick={handleUploadClick}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileChange(e.dataTransfer.files);
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/png, image/jpg"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => handleFileChange(e.target.files)}
                    />
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500 mb-2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span className="text-gray-700 font-medium mb-1">
                      คลิกเพื่ออัพโหลดหรือลากวาง
                    </span>
                    <span className="text-gray-400 text-xs">
                      PNG, JPG up to 5 MB
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-center gap-4 pt-4 mt-6">
                  {isEditMode && (
                    <button
                      type="button"
                      data-test={`delete-product-${product?.id}`}
                      onClick={handleDelete}
                      className="px-6 py-2 bg-[#EF4444] hover:bg-red-600 text-white rounded-md font-medium transition-colors cursor-pointer"
                    >
                      ลบสินค้า
                    </button>
                  )}
                  <button
                    type="submit"
                    data-test={
                      isEditMode
                        ? `submit-product-${product?.id}`
                        : "submit-product-add"
                    }
                    disabled={
                      isSubmitting || (isEditMode && !dirty && !isImagesDirty)
                    }
                    className="px-8 py-2 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded-md font-medium transition-colors disabled:bg-gray-400 cursor-pointer"
                  >
                    {isEditMode ? "แก้ไขสินค้า" : "บันทึก"}
                  </button>
                  <button
                    type="button"
                    data-test="cancel-edit-product"
                    onClick={() => handleCancel(dirty)}
                    className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-medium transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};