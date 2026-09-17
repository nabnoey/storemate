import api from "./api";
import type { User } from "../types/user";
import type { Address  } from "../types/address";

//ดูหน้าโปรไฟล์ผู้ใช้
const getProfile = async () => {
  const res = await api.get(`${import.meta.env.VITE_USERS_API}/overview`);
  return res.data;
};

//แก้ไขโปรไฟล์ผู้ใช้
const updateProfile = async (data: Partial<User> | FormData) => {
  const res = await api.put(`${import.meta.env.VITE_USERS_API}/overview`, data);
  return res.data;
};

//ดึงข้อมูลที่อยู่ตาม ID
const fetchAddressUserId = async (id: number) => {
  const res = await api.get(
    `${import.meta.env.VITE_USERS_API}/addresses/${id}`,
  );
  return res.data;
};

//แก้ไขที่อยู่ผู้ใช้งาน
const updateAddress = async (id: number, data: Partial<User>) => {
  const res = await api.put(
    `${import.meta.env.VITE_USERS_API}/addresses/${id}`,
    data,
  );
  return res.data;
};

//ลบที่อยู่ผู้ใช้งาน
const deleteAddress = async (id: number) => {
  const res = await api.delete(
    `${import.meta.env.VITE_USERS_API}/addresses/${id}`,
  );
  return res.data;
};

//ตั้งค่าที่อยู่เป็นค่าเริ่มต้น
const setDefaultAddress = async (id: number) => {
  const res = await api.patch(
    `${import.meta.env.VITE_USERS_API}/addresses/${id}`,
  );
  return res.data;
};

//ดึงรายการที่อยู่ทั้งหมดของผู้ใช้
const fetchAllAddresses = async () => {
  const res = await api.get(`${import.meta.env.VITE_USERS_API}/addresses`);
  return res.data;
};

//เพิ่มที่อยู่ใหม่
const addAddress = async (data: Partial<Address> ) => {
  const res = await api.post(
    `${import.meta.env.VITE_USERS_API}/addresses`,
    data,
  );
  return res.data;
};

//ดึงที่อยู่เริ่มต้นของผู้ใช้
const fetchDefaultAddress = async () => {
  const res = await api.get(
    `${import.meta.env.VITE_USERS_API}/addresses/default`,
  );
  return res.data;
};


const addressDropdown = async (
  provinceId?: number,
  districtId?: number,
  subdistrictId?: number
) => {
  const params: Record<string, number> = {};

  if (provinceId) {
    params.provinceId = provinceId;
  }

  if (districtId) {
    params.districtId = districtId;
  }

  if (subdistrictId) {
    params.subdistrictId = subdistrictId;
  }

  const res = await api.get(
    `${import.meta.env.VITE_USERS_API}/address-dropdown`,
    { params }
  );

  return res.data;
};


export const UserService = {
  getProfile,
  updateProfile,
  fetchAddressUserId,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  fetchAllAddresses,
  addAddress,
  fetchDefaultAddress,
  addressDropdown,
};
