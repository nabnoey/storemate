import { Icon } from "@iconify/react";

function EmptyProduct() {
  return (
    <div
      className="
    w-full min-h-100 
    border-2 border-gray-200 
    rounded-4xl 
    flex flex-col 
    items-center justify-center
   "
    >
      <Icon icon="icon-park:ad-product" className="text-7xl" />

      <h3>ไม่พบรายการสินค้า</h3>
    </div>
  );
}

export default EmptyProduct;
