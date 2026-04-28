import { MoreHorizontal } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumBarCard({ title, subtitle, data = [], colors = ["#3EBB9E", "#00674F"] }) {
  const max = Math.max(...data.flatMap(d => [d.value1 || 0, d.value2 || 0]), 1);

  return (
    <div className="rounded-app border border-emeraldApp-100 bg-white p-5 shadow-card dark:bg-gray-900 dark:border-gray-700 dark:shadow-none flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">{title}</h3>
          {subtitle && <p className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60 mt-0.5">{subtitle}</p>}
        </div>
        <button className="p-1.5 rounded-lg hover:bg-emeraldApp-50 dark:hover:bg-gray-800 transition-colors">
          <MoreHorizontal className="w-4 h-4 text-emeraldApp-900/50 dark:text-emeraldApp-100/50" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors[0] }} />
          <span className="text-emeraldApp-900/60 dark:text-emeraldApp-100/60 text-[10px] uppercase tracking-wider">Atual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors[1] }} />
          <span className="text-emeraldApp-900/60 dark:text-emeraldApp-100/60 text-[10px] uppercase tracking-wider">Anterior</span>
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between gap-2 px-1" style={{ minHeight: 140 }}>
        {data.map((item, i) => {
          const h1 = ((item.value1 || 0) / max) * 100;
          const h2 = ((item.value2 || 0) / max) * 100;
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="flex items-end gap-[3px] w-full justify-center" style={{ height: 120 }}>
                <div className="w-3 rounded-t-sm transition-all duration-700" style={{ height: `${Math.max(h1, 4)}%`, backgroundColor: colors[0] }} />
                <div className="w-3 rounded-t-sm transition-all duration-700" style={{ height: `${Math.max(h2, 4)}%`, backgroundColor: colors[1] }} />
              </div>
              <span className="text-emeraldApp-900/50 dark:text-emeraldApp-100/50 text-[10px]">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-emeraldApp-100 dark:border-gray-700">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60">Total do período</span>
          <span className="text-emeraldApp-900 dark:text-emeraldApp-50 font-bold text-lg">
            {formatCurrency(data.reduce((s, d) => s + (d.value1 || 0) + (d.value2 || 0), 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
