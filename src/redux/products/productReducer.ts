import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Product,
  CategoryGroup,
  ProductDetail,
} from "../../types/product";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ProductService } from "../../services/product.service";

type ProductState = {
  items: Product[];
  groupedProducts: CategoryGroup[];
  search: string;
  searchResult: Product[];
  categories: string[];
  selectedProduct: ProductDetail | null;
  loading: boolean;
};

const initialState: ProductState = {
  items: [],
  groupedProducts: [],
  search: "",
  searchResult: [],
  categories: [],
  selectedProduct: null,
  loading: false,
};
// 1. ส่วนดึงข้อมูล (เหมือนไปสั่งของจากโรงงาน/API)
export const fetchProducts = createAsyncThunk("products/fetch", async () => {
  const response = await ProductService.getAllCategories();
  return response; // ข้อมูลที่ได้จะเป็น { soap: [...], drinks: [...] }
});

export const search = createAsyncThunk(
  "products/search",
  async ({
    keyword,
    categoryId,
    minPrice,
    maxPrice,
    page,
    size,
  }: {
    keyword: string;
    categoryId: number | null;
    minPrice: number;
    maxPrice: number;
    page: number;
    size: number;
  }) => {
    const response = await ProductService.searchProducts(
      keyword,
      categoryId,
      minPrice,
      maxPrice,
      page,
      size,
    );
    return response;
  },
);

export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (data: FormData) => {
    const response = await ProductService.addProduct(data);
    return response;
  },
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id: number) => {
    const response = await ProductService.getProductById(id);
    return response;
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // เพิ่มจำนวนสินค้าตอนกด +
    addQuantity: (state, action: PayloadAction<number>) => {
      const product = state.items.find((p) => p.id === action.payload);
      if (product && product.stockQuantity < 10) {
        product.stockQuantity += 1;
      }
    },

    // ลดจำนวนสินค้า
    removeQuantity: (state, action: PayloadAction<number>) => {
      const product = state.items.find((p) => p.id === action.payload);
      if (product && product.stockQuantity > 0) {
        product.stockQuantity -= 1;
      }
    },

    // คืนของเข้าสต็อก (ตอนลบจาก cart)
    returnQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>,
    ) => {
      const product = state.items.find((p) => p.id === action.payload.id);
      if (product) {
        product.stockQuantity += action.payload.quantity;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchProducts.fulfilled, (state, action) => {
        const groupedArray = Object.keys(action.payload).map((key) => ({
          categoryName: key,
          products: action.payload[key],
        })); //ผลลัพธ์ [{soap:[...]},]  // {soap:[...]}

        state.groupedProducts = groupedArray;
        state.items = groupedArray.flatMap((group) => group.products);
      });

    builder.addCase(search.fulfilled, (state, action) => {
      state.search = action.meta.arg.keyword; //คำค้นหาที่พิมพ์ส่งไปตั้งแต่แรก
      state.searchResult = action.payload.data; //รายการสินค้าที่หลังบ้านหาเจอและส่งกลับมาให้
      state.loading = false;
    });

    builder.addCase(addProduct.fulfilled, (state, action) => {
      const newProduct = {
        ...action.payload,
        id: Date.now(),
      };
      state.items.unshift(newProduct);
    });

    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.selectedProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state) => {
        state.loading = false;
        state.selectedProduct = null;
      });
  },
});

export const { addQuantity, removeQuantity, returnQuantity } =
  productsSlice.actions;

export default productsSlice.reducer;
