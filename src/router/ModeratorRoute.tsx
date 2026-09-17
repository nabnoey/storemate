import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { jwtDecode } from "jwt-decode";
import { logout } from "../redux/auth/authReducer";

type Props = {
  children: React.ReactNode;
};

const ModeratorRoute = ({ children }: Props) => {
  const { isAuthenticated, token, user } = useSelector(
    (state: RootState) => state.auth,
  );


  const dispatch = useDispatch();

  let isTokenInvalid = false;

  if (token) {
    try {
      const decoded: { exp: number } = jwtDecode(token);


      if (decoded.exp * 1000 < Date.now()) {
        isTokenInvalid = true;
      }
    } catch {
      isTokenInvalid = true;
    }
  }

  useEffect(() => {
    if (isTokenInvalid) {
      dispatch(logout());
    }
  }, [isTokenInvalid, dispatch]);

  // ยังไม่ได้ login
  if (!isAuthenticated || !token || isTokenInvalid) {
    return <Navigate to="/login" replace />;
  }

  const isModerator = Array.isArray(user?.roles)
    ? user.roles.some(
        (role: any) =>
          role === "MODERATOR" ||
          role?.roleName === "MODERATOR"|| 
          role === "ADMIN" ||
          role?.roleName === "ADMIN",
          
      )
    : false;

  if (!isModerator) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ModeratorRoute;