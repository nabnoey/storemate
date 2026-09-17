import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { jwtDecode } from "jwt-decode";
import { logout } from "../redux/auth/authReducer";

type Props = {
  children: React.ReactNode;
};

const AdminRoute = ({ children }: Props) => {
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch();

  let isTokenInvalid = false;
  let isAdmin = false;

  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        isTokenInvalid = true; // Token หมดอายุ
      } else {
        const userRoles = decoded.roles || [];
        isAdmin = userRoles.some(
          (r: any) => r === "ADMIN" || r?.roleName === "ADMIN",
        );
      }
    } catch (error) {
      console.warn("ไม่สามารถถอดรหัส Token ได้:", error);
      isTokenInvalid = true; // ถอดรหัสไม่ได้
    }
  }

  useEffect(() => {
    if (isTokenInvalid) {
      dispatch(logout());
    }
  }, [isTokenInvalid, dispatch]);

  // กรณียังไม่ได้ล็อกอิน หรือ Token มีปัญหา ให้เตะกลับไปหน้า Login
  if (!isAuthenticated || !token || isTokenInvalid) {
    return <Navigate to="/login" replace />;
  }

  // กรณีล็อกอินแล้ว แต่ไม่ใช่ Admin ให้เตะกลับไปหน้าแรก (Home)
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
