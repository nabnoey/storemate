import React from "react";
import type { StatusOrderTabsProps } from "../../types/orders";
import type { OrderStatus } from "../../types/orders";
import { statusConfig} from "../../utils/order";

const StatusOrderTabs: React.FC<StatusOrderTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
const tabs = Object.entries(statusConfig).map(([key, value]) => ({
  value: key as OrderStatus,
  label: value.tab,
}));
  

  return (
    <div className="flex border border-black rounded-sm overflow-hidden mb-6 text-sm text-center overflow-x-auto">
      {tabs.map((tab, index) => {
        const isActive = tab.value === activeTab;
        return (
          <div
            key={index}
            onClick={() => onTabChange(tab.value)}
            className={`flex-1 min-w-[120px] py-3 cursor-pointer transition-colors whitespace-nowrap px-2 ${
              isActive
                ? "bg-[#5B95F9] text-white font-medium"
                : "bg-white text-black"
            }`}
          >
            {tab.label}
          </div>
        );
      })}
    </div>
  );
};

export default StatusOrderTabs;
