import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { UserService } from "../../services/users.service";
import type { AddressState, Address } from "../../types/address";

const initialState: AddressState = {
  addresses: [],
  defaultAddress: null,
  provinces: [],
  districts: [],
  subdistricts: [],
  zipcodeId: [],
  loading: false,
};

export const addAddress = createAsyncThunk(
  "address/addAddress",
  async (data: Partial<Address>) => {
    const response = await UserService.addAddress(data);
    return response;
  },
);

export const fetchAllAddresses = createAsyncThunk(
  "address/fetchAllAddresses",
  async () => {
    const response = await UserService.fetchAllAddresses();
    return response;
  },
);

// แก้ไขที่อยู่
export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async ({ id, data }: { id: number; data: Partial<Address> }) => {
    const response = await UserService.updateAddress(id, data);
    return response;
  },
);

// ตั้งค่าที่อยู่เริ่มต้น (เพิ่มใหม่)
export const setDefaultAddressThunk = createAsyncThunk(
  "address/setDefaultAddress",
  async (id: number) => {
    await UserService.setDefaultAddress(id);
    return id;
  },
);

export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (id: number) => {
    const response = await UserService.deleteAddress(id);
    return response;
  },
);

export const addAdressDefault = createAsyncThunk(
  "address/addAddressDefault",
  async (id: number) => {
    const response = await UserService.setDefaultAddress(id);
    return response;
  },
);

export const fetchAddressDefault = createAsyncThunk(
  "address/fetchAddressDefault",
  async () => {
    const response = await UserService.fetchDefaultAddress();
    return response;
  },
);

export const addressDropdown = createAsyncThunk(
  "address/addressDropdown",
  async ({
    provinceId,
    districtId,
    subdistrictId,
  }: {
    provinceId?: number;
    districtId?: number;
    subdistrictId?: number;
  }) => {
    const response = await UserService.addressDropdown(
      provinceId,
      districtId,
      subdistrictId,
    );
    return response;
  },
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

    .addCase(fetchAllAddresses.pending, (state) => {
      state.loading = true;
    })   
    .addCase(fetchAllAddresses.fulfilled, (state, action) => {
       console.log("ALL ADDRESSES FROM API:", action.payload);
      state.addresses = action.payload;
      state.loading = false;
      state.defaultAddress = action.payload.find(
        (addr: Address) => addr.isDefault,
      );
    });

    builder.addCase(updateAddress.fulfilled, (state, action) => {
      const updated = action.payload;

      state.addresses = state.addresses.map((addr) =>
        addr.id === updated.id ? updated : addr,
      );

      if (updated.isDefault) {
        state.defaultAddress = updated;
      }
    });

    builder.addCase(addAddress.fulfilled, (state, action) => {
      state.addresses.push(action.payload);
      if (action.payload.isDefault) {
        state.defaultAddress = action.payload;
      }
    });

    builder.addCase(deleteAddress.fulfilled, (state, action) => {
      state.addresses = state.addresses.filter(
        (addr) => addr.id !== action.meta.arg,
      );
      if (state.defaultAddress?.id === action.meta.arg) {
        state.defaultAddress = state.addresses[0];

        if (state.defaultAddress) {
          state.defaultAddress.isDefault = true;
        }
      }
    });

    builder.addCase(addAdressDefault.fulfilled, (state, action) => {
  const defaultId = action.payload.id;

  state.addresses = state.addresses
    .map((addr) => ({
      ...addr,
      isDefault: addr.id === defaultId,
    }))
    .sort((a, b) => {
      if (a.isDefault === b.isDefault) return 0;
      return a.isDefault ? -1 : 1;
    });

  state.defaultAddress =
    state.addresses.find((addr) => addr.id === defaultId) ?? null;
});

    builder.addCase(fetchAddressDefault.fulfilled, (state, action) => {
      state.defaultAddress = action.payload;
    });

    builder.addCase(addressDropdown.fulfilled, (state, action) => {
      const raw = action.payload;
      console.log("API Response:", raw);
      const data = Array.isArray(raw) ? raw : raw.data;

      const { provinceId, districtId, subdistrictId } = action.meta.arg;

      if (!Array.isArray(data)) return;

      if (!provinceId) {
        state.provinces = data;
        state.districts = [];
        state.subdistricts = [];
        state.zipcodeId = [];
      } else if (provinceId && !districtId) {
        state.districts = data;
        state.subdistricts = [];
        state.zipcodeId = [];
      } else if (provinceId && districtId && !subdistrictId) {
        state.subdistricts = data;
        state.zipcodeId = [];
      } else if (provinceId && districtId && subdistrictId) {
        state.zipcodeId = data;
      }
    });
  },
});

export default addressSlice.reducer;
