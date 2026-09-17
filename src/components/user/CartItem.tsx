import { useDispatch, useSelector } from "react-redux";
import type { Product } from "../../types/product";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  decrementCartItemThunk,
  incrementCartItemThunk,
  deleteCartItemThunk,
} from "../../redux/carts/CartReducer";
import { removeQuantity } from "../../redux/products/productReducer";
import { GiTrashCan } from "react-icons/gi";

type Props = {
  readonly item: Product & { stockQuantity: number };
};

function CartItem({ item }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const productInStock = useSelector((state: RootState) =>
    state.products.items.find((p) => p.id === item.id),
  );

  // ใช้ Optional chaining และ Nullish coalescing เพื่อความปลอดภัย
  const stock = productInStock?.stockQuantity ?? 0;

  const handleIncrease = () => {
    if (stock > 0) {
      dispatch(incrementCartItemThunk(item.id));
      dispatch(removeQuantity(item.id));
    }
  };

  const handleDecrease = () => {
    if (item.stockQuantity > 1) {
      dispatch(decrementCartItemThunk(item.id));
    }
  };

  const handleRemove = () => {

    dispatch(deleteCartItemThunk(item.id)); 
  };

  return (
    <div
      id={`cart-row-${item.id}`}
      className="flex items-center justify-between p-4 border-b last:border-b-0"
    >
      <div className="flex items-center gap-4 w-1/2">
        <img
          id={`cart-img-${item.id}`}
          src={
            item.imageUrl ||
            "https://scontent.fbkk12-1.fna.fbcdn.net/v/t39.30808-6/631033255_1486282403500023_4710477623864277946_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=13d280&_nc_ohc=LVsLjxBcDngQ7kNvwFmpYeP&_nc_oc=AdmHGAm1Ibg5tetmmBOuVUnoW_F2a1qp7KhZsXxMvcnSR7A5c33a3gZ1xUjWiQ_TpjoNQHOLqHy16moZpzcR1Kzo&_nc_zt=23&_nc_ht=scontent.fbkk12-1.fna&_nc_gid=byhROHe1c6lbVBOBQwjGhw&oh=00_AfvmSssPV69WDuHi2p-gcgpsU1WcdQhqEid0bw71o-2qmQ&oe=699E715D"
          }
          alt={item.productName}
          className="w-20 h-20 object-contain rounded"
        />
        <div>
          <h3
            id={`cart-title-${item.id}`}
            className="font-semibold line-clamp-2"
          >
            {item.productName}
          </h3>

          {stock > 0 ? (
            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs inline-block mt-1">
              พร้อมจำหน่าย
            </span>
          ) : (
            <span className="bg-red-100 text-red-500 px-3 py-1 rounded-full text-xs inline-block mt-1">
              ไม่พร้อมจำหน่าย
            </span>
          )}
          <p
            id={`cart-price-${item.id}`}
            className="text-sm text-gray-500 mr-auto "
          >
            ฿{item.price.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center border rounded-lg ">
          <button
            id={`btn-decrease-${item.id}`}
            onClick={handleDecrease}
            className="btn btn-ghost btn-sm"
            disabled={item.stockQuantity <= 1}
          >
            -
          </button>

          <span id={`cart-qty-${item.id}`} className="px-4 font-medium">
            {item.stockQuantity}
          </span>

          <button
            id={`btn-increase-${item.id}`}
            onClick={handleIncrease}
            className="btn btn-ghost btn-sm"
            disabled={stock <= 0}
          >
            +
          </button>
        </div>

        {/* Total Price per Item */}
        <p id={`cart-item-total-${item.id}`} className="font-semibold w-24 ">
          ฿{(item.price * item.stockQuantity).toFixed(2)}
        </p>
        <div></div>

        {/* Remove Button */}
        <button
          id={`btn-remove-${item.id}`}
          onClick={handleRemove}
          className="btn btn-circle btn-ghost btn-sm text-red-500 hover:bg-red-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <GiTrashCan size={22} className="" />
      </div>
    </div>
  );
}

export default CartItem;
