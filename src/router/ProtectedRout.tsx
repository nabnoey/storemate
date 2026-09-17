import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { jwtDecode } from "jwt-decode";
import { logout } from "../redux/auth/authReducer";

type Props = {
  children: React.ReactNode;
};

const ProtectedRout = ({ children }: Props) => {
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch();
  let isTokenInvalid = false;
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        isTokenInvalid = true; // Token หมดอายุ
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

  if (!isAuthenticated || !token || isTokenInvalid) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRout;
