// 1. กำหนด Type ของข้อมูล User
export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  image: string | null;
}

// 2. กำหนด Type ของ AuthState ทั้งหมด
export interface AuthState {
  token: string;
  isAuthenticated: boolean;
  user: Profile; // มีข้อมูล User เสมอ (ตาม InitialState)
}

const auth = localStorage.getItem("auth") || sessionStorage.getItem("auth");

const authData = auth ? JSON.parse(auth) : null;

// 3. ค่าเริ่มต้น
export const authInitialState: AuthState = {
  token: authData?.token || "",
  isAuthenticated: Boolean(authData),
  user: {
    firstName: "บุญรักษา",
    lastName: "วินานนท์",
    email: "Boon*********@gmail.com",
    phone: "0812345688",
    address: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กทม. 10110",
    joinDate: "13/2/2026",
    image: null,
  },
};
