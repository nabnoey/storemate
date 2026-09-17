type UserFilterBarProps = {
  readonly searchTerm: string;
  readonly onSearchChange: (value: string) => void;
  readonly onSearchSubmit: () => void;
  readonly roleFilter: string;
  readonly onRoleChange: (value: string) => void;
  readonly statusFilter: string;
  readonly onStatusChange: (value: string) => void;
};

export default function UserFilterBar({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
}: UserFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-end justify-between mb-6">
      {/* ─── ช่องค้นหา ─── */}
      <div className="flex-1 w-full">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          ค้นหาชื่อผู้ใช้งาน
        </label>
        <div className="relative flex items-center">
          <input
            id="search-input"
            type="text"
            placeholder="ค้นหาโดย ชื่อ หรือ อีเมล แล้วกด Enter หรือปุ่มค้นหา"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearchSubmit();
              }
            }}
            className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <button
            type="button"
            onClick={onSearchSubmit}
            className="absolute right-2 p-1.5 text-gray-400 hover:text-blue-600 rounded-md transition-colors cursor-pointer"
            title="ค้นหา"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── ตัวกรอง ─── */}
      <div className="flex gap-4 w-full md:w-auto">
        <div className="w-1/2 md:w-40">
          <label className="block text-xs text-gray-500 mb-1.5">ทั้งหมด</label>
          <select
            data-test="role-filter"
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="">บทบาท</option>
            <option value="ADMIN">เจ้าของร้าน</option>
            <option value="MODERATOR">พนักงาน</option>
            <option value="USER">ผู้ใช้งาน</option>
          </select>
        </div>

        <div className="w-1/2 md:w-40">
          <label className="block text-xs text-gray-500 mb-1.5">ทั้งหมด</label>
          <select
            data-test="status-filter"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="">สถานะบัญชี</option>
            <option value="active">ใช้งานได้</option>
            <option value="suspended">ระงับการใช้งาน</option>
          </select>
        </div>
      </div>
    </div>
  );
}