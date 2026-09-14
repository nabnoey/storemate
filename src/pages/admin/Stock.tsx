import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import HeaderAdmin from "../../components/admin/HeaderAdmin";
import { CiSearch } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { AddProductModal } from "../../components/admin/AddProductModal";
import { getproducts } from "../../redux/moderator/ModeratorReducer";
// import {fetchProducts } from "../../redux/products/productReducer";
import type { ProductMod } from "../../types/moderator/productMod";
import { Pagination } from "../../components/admin/Pagination";
import OwnerSkeletons from "../../components/loading/OwnerSkeletons";

const categoryMap: Record<string | number, string> = {
  Promotion: "โปรโมชั่น",
  Drinks: "เครื่องดื่ม",
  Soap: "สบู่",
  Shampoo: "แชมพู",
};

function Stock() {
const { products, totalPages, loading } = useSelector(
  (state: RootState) => state.moderator
);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("keyword") || "",
  );
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState(
    searchParams.get("keyword") || "",
  );

  const pageParam = searchParams.get("page");
  const initialPage = pageParam !== null ? Number(pageParam) + 1 : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const PAGE_SIZE = 10;

  const dispatch = useDispatch<AppDispatch>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductMod | null>(
    null,
  );

  useEffect(() => {
    dispatch(
      getproducts({
        page: currentPage - 1,
        size: PAGE_SIZE,
        keyword: submittedSearchTerm,
      }),
    );
  }, [dispatch, currentPage, submittedSearchTerm]);

  useEffect(() => {
    const params: Record<string, string> = {
    page: String(currentPage - 1),
      size: String(PAGE_SIZE),
    };
    if (submittedSearchTerm) {
      params.keyword = submittedSearchTerm;
    }
    setSearchParams(params);
  }, [currentPage, setSearchParams, submittedSearchTerm]);
  
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (product: ProductMod) => {
    setSelectedProduct(product);
    setIsAddModalOpen(true);
  };
  const handleCloseModal = () => {
  setIsAddModalOpen(false);
  setSelectedProduct(null);
};

const handleProductSuccess = () => {
  setIsAddModalOpen(false);
  setSelectedProduct(null);

  dispatch(
    getproducts({
      page: currentPage - 1,
      size: PAGE_SIZE,
      keyword: submittedSearchTerm,
    }),
  );

  // dispatch(fetchProducts())
};

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col w-full p-0 overflow-y-auto">
      <HeaderAdmin
        title="จัดการสินค้าในคลัง"
        subtitle="เพิ่ม แก้ไข ลบสินค้า ปรับสถานะสินค้า และจัดการจำนวนสินค้าคงเหลือ"
      />

      <div className="p-6 text-[#374151]">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-[#374151]">
            ค้นหาสินค้า
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-[400px]">
              <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] text-xl font-bold" />
              <input
                type="text"
                value={searchTerm}
                placeholder="ค้นหาโดยชื่อสินค้า หรือ รหัสสินค้า"
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSubmittedSearchTerm(searchTerm);
                    setCurrentPage(1);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-600"
              />
            </div>
            <button
              type="button"
              onClick={handleAddProduct}
              className="bg-indigo-800 transition-colors text-gray-200 px-5 py-2 rounded-md flex items-center gap-2 text-sm font-medium cursor-pointer "
            >
              <span>+</span> เพิ่มสินค้า
            </button>
          </div>
        </div>

        {/* ส่วนตารางสินค้า */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm overflow-x-auto text-black">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[#374151] border-b border-gray-200">
                <th className="pb-4 font-normal whitespace-nowrap">
                  รหัสสินค้า
                </th>
                <th className="pb-4 font-normal whitespace-nowrap pl-5">
                  ชื่อสินค้า
                </th>
                <th className="pb-4 font-normal whitespace-nowrap pr-15">
                  หมวดหมู่
                </th>
                <th className="pb-4 font-normal whitespace-nowrap pr-10">
                  ราคา
                </th>
                <th className="pb-4 font-normal whitespace-nowrap pr-18">
                  จำนวนคงเหลือ
                </th>
                <th className="pb-4 font-normal whitespace-nowrap  -translate-x-8">
                  สถานะสินค้า
                </th>
                <th className="pb-4 font-normal whitespace-nowrap"></th>
              </tr>
            </thead>

            <tbody>
                {loading && products.length === 0 ? (
    <OwnerSkeletons 
     type="mod-table"
                      rows={PAGE_SIZE}
                      columns={6}/>
  ) : products.length > 0 ? (
    products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 whitespace-nowrap">
                      <button
                        type="button"
                        className="text-gray-500 cursor-pointer bg-transparent border-none p-0 text-left "
                      >
                        {product.productNo}
                      </button>
                    </td>
                    <td className="py-4 pl-5 max-w-[350px] break-words line-clamp-2">
                      {product.productName}
                    </td>
                    <td className="py-4">
                      {categoryMap[String(product.category)] || "-"}
                    </td>
                    <td className="py-4">฿ {product.price}</td>
                    <td className="py-4 pl-6">{product.stockQuantity}</td>
                    <td className="py-4  -translate-x-9">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          product.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {product.status === "ACTIVE"
                          ? "พร้อมจำหน่าย"
                          : "ไม่พร้อมจำหน่าย"}
                      </span>
                    </td>
                    <td className="py-4">
                      <button
                        type="button"
                        data-test={`menagemate-product-${product.id}`}
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-500 hover:text-blue-700 hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                      >
                        จัดการ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    ไม่พบรายการสินค้าที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        <AddProductModal
  isOpen={isAddModalOpen}
  onClose={handleCloseModal}
  onSuccess={handleProductSuccess}
  product={selectedProduct}
/>
      </div>
    </div>
  );
}

export default Stock;
