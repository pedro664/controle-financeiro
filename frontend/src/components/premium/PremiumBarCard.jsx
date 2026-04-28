import { MoreHorizontal } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumBarCard({ title, subtitle, data = [], colors = ["#F72585", "#7209B7"] }) {
  const max = Math.max(...data.flatMap(d => [d.value1 || 0, d.value2 || 0]), 1);

  return (
    <div className="w-full rounded-[20px] bg-[#0A0D10] p-5 flex flex-col gap-4" style={{ minHeight: 340 }}>
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

      {/* Legend */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors[0] }} />
          <span className="text-gray-400 text-[10px] uppercase tracking-wider">Atual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors[1] }} />
          <span className="text-gray-400 text-[10px] uppercase tracking-wider">Anterior</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-end justify-between gap-2 px-1">
        {data.map((item, i) => {
          const h1 = ((item.value1 || 0) / max) * 100;
          const h2 = ((item.value2 || 0) / max) * 100;
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="flex items-end gap-[3px] w-full justify-center" style={{ height: 160 }}>
                <div
                  className="w-3 rounded-t-sm transition-all duration-700"
                  style={{ height: `${Math.max(h1, 4)}%`, backgroundColor: colors[0] }}
                />
                <div
                  className="w-3 rounded-t-sm transition-all duration-700"
                  style={{ height: `${Math.max(h2, 4)}%`, backgroundColor: colors[1] }}
                />
              </div>
              <span className="text-gray-600 text-[10px]">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="pt-3 border-t border-white/5">
        <div className="flex items-baseline justify-between">
          <span className="text-gray-500 text-xs">Total do período</span>
          <span className="text-white font-bold text-lg">
            {formatCurrency(data.reduce((s, d) => s + (d.value1 || 0) + (d.value2 || 0), 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
