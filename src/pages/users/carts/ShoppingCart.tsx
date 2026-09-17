import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../redux/store";
import {
  deleteCartItemThunk,
  incrementCartItemThunk,
  decrementCartItemThunk,
  fetchCartThunk,
  setSelectedItems as setReduxSelectedItems,
} from "../../../redux/carts/CartReducer";

import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";
import ConfirmToast from "../../../components/ConfirmToast";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const cartItems = useSelector(
  (state: RootState) => state.carts.items,
);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  //ล็อคสินค้าที่กำลังอัพเดทจำนวนสินค้า เพื่อไม่ให้กดซ้ำ
  const [updatingItems, setUpdatingItems] = useState<number[]>([]);
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    dispatch(fetchCartThunk());
  }, [dispatch]);



  // เอาไว้กรองสินค้าที่มีสถานะ พร้อมจำหน่าย
const availableItems = useMemo(
  () => cartItems.filter((item) => item.productStatus === "ACTIVE"),
  [cartItems],
);

 //เลือกสินค้าที่ พร้อมจำหน่าย 
  const isAllSelected = useMemo(() => {
    return (
      availableItems.length > 0 &&
      selectedItems.length === availableItems.length
    );
  }, [availableItems.length, selectedItems.length]);

 //สินค้าในรถเข็นที่ผู้ใช้เลือกไว้ 
const selectedCartItems = useMemo(() => {
  return cartItems.filter((item) =>
    selectedItems.includes(item.productId)
  );
}, [cartItems, selectedItems]);

  const subtotal = useMemo(() => {
    return selectedCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }, [selectedCartItems]);


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
        { duration: Infinity, position: "top-center" },
      );
    });
  };


  //เลือกสินค้า
  const toggleSelect = (productId: number) => {
    setSelectedItems((prev) =>
      prev.includes(productId) 
        ? prev.filter((id) => id !== productId) 
        : [...prev, productId],
    );
  };

  //เลือกสินค้าทั้งหมด หรือ ยกเลิกการเลือกทั้งหมด
  const toggleSelectAll = () => {
    setSelectedItems(
      isAllSelected ? [] : availableItems.map((item) => item.productId),
    );
  };

  const handleRemoveItem = async (productId: number) => {
    const isConfirmed = await confirmAction("คุณต้องการลบสินค้านี้ใช่หรือไม่?");
    if (!isConfirmed) return;

    dispatch(deleteCartItemThunk(productId));
    setSelectedItems((prev) => prev.filter((id) => id !== productId));
    toast.success("ลบสินค้าแล้ว");
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) {
      toast.error("กรุณาเลือกสินค้าก่อน");
      return;
    }

    const isConfirmed = await confirmAction(
      "คุณต้องการลบสินค้าทั้งหมดนี้ใช่หรือไม่?",
    );
    if (!isConfirmed) return;

    //Promise ทุกตัวใน array ทำงานเสร็จทั้งหมด แล้วค่อยทำคำสั่งต่อไป
    await Promise.all(
      selectedItems.map((id) => dispatch(deleteCartItemThunk(id))),
    );

    setSelectedItems([]);
    toast.success("ลบสินค้าสำเร็จ");
  };

  const handleIncreaseQuantity = async (
  productId: number,
  quantity: number,
  stockQuantity: number,
) => {
  // ถ้ากำลังยิง API อยู่ ห้ามกดซ้ำ
  if (updatingItems.includes(productId)) return;

  // ถึงจำนวนสูงสุดแล้ว
  if (quantity >= stockQuantity) {
    toast.error(
      "ขออภัย สินค้าชิ้นนี้มีจำนวนจำกัดในคลังไม่สามารถเพิ่มได้",
    );
    return;
  }

  setUpdatingItems((prev) => [...prev, productId]);

  try {
    await dispatch(
      incrementCartItemThunk(productId),
    ).unwrap();
  } finally {
    setUpdatingItems((prev) =>
      prev.filter((id) => id !== productId),
    );
  }
};

  const handleDecreaseQuantity = async (
  productId: number,
  quantity: number,
) => {
  // ถ้าสินค้านี้กำลังยิง API อยู่ ห้ามยิงซ้ำ
  if (updatingItems.includes(productId)) return;

  // quantity = 1 → ลบสินค้า
  if (quantity === 1) {
    const isConfirmed = await confirmAction(
      "คุณต้องการลบสินค้านี้ใช่หรือไม่?",
    );

    if (!isConfirmed) return;

    setUpdatingItems((prev) => [...prev, productId]);

    try {
      await dispatch(deleteCartItemThunk(productId)).unwrap();

      setSelectedItems((prev) =>
        prev.filter((id) => id !== productId),
      );

      toast.success("ลบสินค้าแล้ว");
    } finally {
      setUpdatingItems((prev) =>
        prev.filter((id) => id !== productId),
      );
    }

    return;
  }

  // quantity > 1 → decrement
  setUpdatingItems((prev) => [...prev, productId]);

  try {
    await dispatch(decrementCartItemThunk(productId)).unwrap();
  } finally {
    setUpdatingItems((prev) =>
      prev.filter((id) => id !== productId),
    );
  }
};



  return (
    <div className="min-h-screen bg-white py-6 sm:py-12 px-4 font-anuphan">
      <nav className="flex flex-wrap items-center text-md text-black mb-6 md:mb-8 font-medium ml-4 md:ml-10 lg:ml-20 py-1">
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
        <span className="text-black">รถเข็น</span>
      </nav>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden p-4 sm:p-8 md:p-12">
          <div className="mb-6 md:mb-10">
            <div className="flex items-center gap-3">
              <Icon
                icon="lucide:shopping-cart"
                className="w-7 h-7 sm:w-8 sm:h-8 text-black"
              />
              <h1 className="text-2xl sm:text-[36px] font-bold text-black">
                รถเข็น
              </h1>
            </div>

            <p className="text-base sm:text-[20px] font-normal text-black mt-1">
              สินค้าในรถเข็น
            </p>

            <div className="hidden md:block w-full border-b border-black mt-4" />
          </div>

          {cartItems.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-md sm:text-xl font-bold text-gray-700">
                  สินค้าในรถเข็น
                </span>
                <button
                  onClick={() => handleRemoveSelected()}
                  className="text-md text-black hover:text-red-500 transition-colors cursor-pointer"
                >
                  ลบออกทั้งหมด
                </button>
              </div>
              <div className="max-h-[250px] overflow-y-auto mb-10 pr-2 ">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 py-4 border-b border-gray-50 last:border-0"
                  >
                    {/* โซนซ้าย: Checkbox + รูปภาพ + ชื่อสินค้า */}
                    <div className="flex items-start md:items-center gap-3 w-full md:w-auto md:flex-1">
                      <div className="flex items-center pt-2 md:pt-0">
                        <input
                          type="checkbox"
                          disabled={item.productStatus !== "ACTIVE"}
                          checked={selectedItems.includes(item.productId)}
                          onChange={() => toggleSelect(item.productId)}
                          data-test={`checkbox-product-${item.productId}`}
                          className="w-5 h-5 appearance-none rounded-full border border-gray-300 cursor-pointer checked:bg-blue-500 checked:border-blue-500"
                        />
                      </div>

                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden not-last:p-1 flex-shrink-0">
                        <img
                          src={item.imageUrl || ""}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0 px-2">
                        <h3 className="text-[16px] font-medium text-gray-800 leading-snug mb-2 line-clamp-2">
                          {item.productName}
                        </h3>

                        <span
                          className={`text-[10px] px-2 py-1 rounded-md font-md inline-block ${
                            item.productStatus === "ACTIVE"

                              ? "bg-green-50 text-green-500"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {item.productStatus  === "ACTIVE"
                            ? "พร้อมจำหน่าย"
                            : "ไม่พร้อมจำหน่าย"}
                        </span>
                      </div>

                      {/* ปุ่มลบสำหรับ Mobile (โชว์เฉพาะหน้าจอเล็ก ขวาบน) */}
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="md:hidden text-gray-400 hover:text-red-500 p-2 cursor-pointer"
                      >
                        <Icon icon="lucide:trash-2" width="18" height="18" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto pl-8 md:pl-0 gap-4">
                      <div className="hidden md:block text-md font-medium text-black w-20 text-center">
                        ฿ {item.price}
                      </div>

                      <div className="flex items-center border border-gray-200 rounded-md h-9 bg-white overflow-hidden flex-shrink-0">
                        <button
                          data-test="decrease-product"
                          onClick={() =>
                            handleDecreaseQuantity(
                              item.productId,
                              item.quantity,
                            )
                          }
                          disabled={item.productStatus !== "ACTIVE" || updatingItems.includes(item.productId)}
                            className="px-2 text-black flex items-center justify-center h-full cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                          <Icon icon="lucide:minus" width="14" height="14" />
                        </button>
                        <span
                          className="w-8 text-center text-sm font-bold text-black"
                          data-test="item-quantity"
                        >
                          {item.quantity}
                        </span>
                       <button
  data-test="increase-product"
  onClick={() =>
    handleIncreaseQuantity(
      item.productId,
      item.quantity,
      item.stockQuantity,
    )
  }
  disabled={item.productStatus !== "ACTIVE" || updatingItems.includes(item.productId)}
  className="px-2 text-black flex items-center justify-center h-full cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed"
>
  <Icon icon="lucide:plus" width="14" height="14" />
</button>
                      </div>

                      <div className="text-blue-500 font-md w-20 md:w-24 text-right md:text-center"
                      data-test="subtotal-product">
                        ฿{(item.subTotal.toLocaleString())}
                      </div>

                      {/* ปุ่มลบสำหรับ Desktop */}
                      <button
                        data-test="btn-remove-item"
                        onClick={() => handleRemoveItem(item.productId)}
                        className="hidden md:block text-black hover:text-red-500 p-2 cursor-pointer"
                      >
                        <Icon icon="lucide:trash-2" width="18" height="18" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ส่วนสรุปยอดและสั่งซื้อ */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pt-8 border-t border-gray-300 gap-6">
                <div className="flex items-center gap-3">
                  <input
                    data-test="radio-all-product"
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 appearance-none rounded-full border border-gray-300 cursor-pointer checked:bg-blue-500 checked:border-blue-500"
                  />
                  <span className="text-md text-black font-normal">
                    เลือกทั้งหมด
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full lg:w-auto">
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 text-gray-700 font-medium">
                    <span className="text-md text-gray-700 font-medium text-lg sm:text-base">
                      รวม ( {selectedItems.length} ) สินค้า
                    </span>
                    <span className="text-blue-500 font-md text-xl sm:text-lg"
                    data-test="total-price">
                      ฿ {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <button
                    data-test="btn-payment"
                    disabled={selectedItems.length === 0}
                    onClick={() => {
                      dispatch(setReduxSelectedItems(selectedCartItems));
                      navigate("/payment");
                    }}
                    className="w-full sm:w-auto bg-[#4a89f3] text-white px-8 py-3 sm:py-2.5 rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-200 transition-all shadow-sm cursor-pointer"
                  >
                    สั่งซื้อสินค้า
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-[60vh] md:min-h-0 bg-white">
              {/* 🟢 ส่วนหลัก (ไอคอน + ข้อความ) */}
              <div className="flex-1 md:flex-none flex flex-col items-center justify-center py-16 sm:py-28">
                <Icon
                  icon="famicons:cart-outline"
                  className="w-50 h-50 sm:w-70 sm:h-70 text-black mb-6"
                />
                <p className="text-[20px] sm:text-[30px] font-medium text-[#111827] mb-6 md:mb-6">
                  ไม่มีสินค้าในรถเข็น
                </p>

                <button
                  onClick={() => navigate("/search")}
                  data-test="btn-add-product"
                  className="hidden md:flex bg-[#4a89f3] hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold items-center gap-2 transition-colors text-sm shadow-sm cursor-pointer"
                >
                  เลือกซื้อสินค้า
                  <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                </button>
              </div>

              <div className="md:hidden p-4 bg-white border-t border-gray-100 mt-auto">
                <button
                  onClick={() => navigate("/search")}
                  className="w-full py-3 bg-[#4a89f3] hover:bg-blue-600 text-white rounded-md text-[15px] font-medium transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  เลือกซื้อสินค้า
                  <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {isBlocking && (
        <div className="fixed inset-0 bg-black/40 z-[999] pointer-events-auto" />
      )}
    </div>
  );
};

export default ShoppingCart;