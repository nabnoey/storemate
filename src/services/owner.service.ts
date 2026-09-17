import api from "./api";
import type { Store } from "../types/owner";

const getUserManagement = async (
  page?: number,
  size?: number,
  search?: string,
) => {
  const res = await api.get(`${import.meta.env.VITE_OWNER_API}/users`, {
    params: { page, size, search },
  });
  return res.data;
};

const getStore = async () => {
  const res = await api.get(`${import.meta.env.VITE_OWNER_API}/store`);
  return res.data;
};
const updateStore = async (data: Partial<Store>) => {
  const formData = new FormData();

  const requestPayload = {
    storeName: data.storeName,
    phone: data.phone,
    email: data.email,
    streetAddress: data.streetAddress,
    zipcodeId: data.zipcode,
  };

  formData.append("data", JSON.stringify(requestPayload));

  const imageFile = data.promotionImage;

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const res = await api.put(
    `${import.meta.env.VITE_OWNER_API}/store/${data.id}`,
    formData,
  );

  return res.data;
};

const updateUserRole = async (userId: number, roleName: string) => {
  const res = await api.put(
    `${import.meta.env.VITE_OWNER_API}/users/${userId}/roles`,
    { roleName },
  );
  return res.data;
};

const suspendUser = async (userId: number) => {
  const res = await api.put(
    `${import.meta.env.VITE_OWNER_API}/users/${userId}/suspend`,
  );
  return res.data;
};

const activeUser = async (userId: number) => {
  const res = await api.put(
    `${import.meta.env.VITE_OWNER_API}/users/${userId}/activate`,
  );
  return res.data;
};

export const ownerService = {
  getUserManagement,
  getStore,
  updateStore,
  updateUserRole,
  suspendUser,
  activeUser,
};
