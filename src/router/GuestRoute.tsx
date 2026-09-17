import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

type Props = {
  children: React.ReactNode;
};

const GuestRoute = ({ children }: Props) => {
  const { user, token } = useSelector((state: RootState) => state.auth);

  if (user && token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default GuestRoute;
