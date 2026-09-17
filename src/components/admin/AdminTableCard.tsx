import { CiSearch } from "react-icons/ci";

type Props = {
  readonly title: string;
  readonly showAddButton?: boolean;
};

function AdminTableCard({ title, showAddButton }: Readonly<Props>) {
  return (
    <div className="bg-white border-white rounded-xl shadow-sm border p-6">
      {/* top bar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>

        {showAddButton && (
          <button className="btn btn-primary btn-sm w-[155px] h-[44px] bg-[#073A8D] text-[12px]">
            + เพิ่มสินค้า
          </button>
        )}
      </div>
      <label
        className="input bg-white border-gray-300 w-[373px] h-[46px]"
        aria-label="ค้นหาข้อมูล"
      >
        <svg
          className="h-[1em] opacity-50 "
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <CiSearch size={28} className="text-black font-bold" />
          </g>
        </svg>
        <input
          type="search"
          required
          placeholder="ค้นหาโดยชื่อสินค้า หรือ รหัสสินค้า"
        />
      </label>
    </div>
  );
}

export default AdminTableCard;
