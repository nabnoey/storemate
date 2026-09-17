import { Outlet } from "react-router";
import SidebarAdmin from "../components/admin/SidebarAdmin";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar ซ้าย */}
      <SidebarAdmin />

      {/* Content ขวา */}
      <div className="flex-1 p-0">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
