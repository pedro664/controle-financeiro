import { MoreHorizontal } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumProgressCard({ title, subtitle, data = [] }) {
  return (
    <div className="w-full rounded-[20px] bg-[#0A0D10] p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
        </div>
        <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Progress bars */}
      <div className="flex flex-col gap-3.5">
        {data.map((item, i) => {
          const pct = Math.min(((item.value || 0) / (item.max || 1)) * 100, 100);
          return (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">{item.label}</span>
                <span className="text-white text-xs font-medium">{formatCurrency(item.value)}</span>
              </div>
              <div className="h-2 rounded-full bg-[#151A20] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: item.gradient || "linear-gradient(90deg, #00F5A0, #00D9F5)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
