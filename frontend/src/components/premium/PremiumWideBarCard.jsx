import { BarChart3 } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumWideBarCard({ title, subtitle, data = [], highlightIndex = -1 }) {
  const max = Math.max(...data.map(d => d.value || 0), 1);

  return (
    <div className="w-full rounded-[20px] bg-[#0A0D10] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gray-500" />
          <div>
            <h3 className="text-white font-semibold text-sm">{title}</h3>
            {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
        {data.map((item, i) => {
          const h = ((item.value || 0) / max) * 100;
          const isHighlight = i === highlightIndex;
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full flex justify-center" style={{ height: 110 }}>
                <div
                  className="w-5 rounded-t-md transition-all duration-700"
                  style={{
                    height: `${Math.max(h, 4)}%`,
                    backgroundColor: isHighlight ? "#00C4C9" : "#0B4357",
                    alignSelf: "flex-end",
                  }}
                />
              </div>
              <span className="text-gray-600 text-[9px] text-center leading-tight">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-gray-500 text-xs">Total</span>
        <span className="text-white font-bold">{formatCurrency(data.reduce((s, d) => s + (d.value || 0), 0))}</span>
      </div>
    </div>
  );
}
