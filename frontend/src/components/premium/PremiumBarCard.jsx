import { MoreHorizontal } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumBarCard({ title, subtitle, data = [], colors = ["#3EBB9E", "#00674F"] }) {
  const max = Math.max(...data.flatMap(d => [d.value1 || 0, d.value2 || 0]), 1);

  return (
    <div className="rounded-app border border-emeraldApp-100 bg-white p-6 shadow-card dark:bg-gray-900 dark:border-gray-700 dark:shadow-none flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">{title}</h3>
          {subtitle && <p className="text-sm text-emeraldApp-900/60 dark:text-emeraldApp-100/60 mt-1">{subtitle}</p>}
        </div>
        <button className="p-1.5 rounded-lg hover:bg-emeraldApp-50 dark:hover:bg-gray-800 transition-colors">
          <MoreHorizontal className="w-4 h-4 text-emeraldApp-900/50 dark:text-emeraldApp-100/50" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[0] }} />
          <span className="text-emeraldApp-900/70 dark:text-emeraldApp-100/70 text-xs">Atual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[1] }} />
          <span className="text-emeraldApp-900/70 dark:text-emeraldApp-100/70 text-xs">Anterior</span>
        </div>
      </div>

      <div className="w-full flex items-end justify-between gap-3 px-2" style={{ height: 280 }}>
        {data.map((item, i) => {
          const h1 = ((item.value1 || 0) / max) * 100;
          const h2 = ((item.value2 || 0) / max) * 100;
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="flex items-end gap-1 w-full justify-center" style={{ height: 240 }}>
                <div className="w-5 rounded-t-md transition-all duration-700" style={{ height: `${Math.max(h1, 4)}%`, backgroundColor: colors[0] }} />
                <div className="w-5 rounded-t-md transition-all duration-700" style={{ height: `${Math.max(h2, 4)}%`, backgroundColor: colors[1] }} />
              </div>
              <span className="text-emeraldApp-900/60 dark:text-emeraldApp-100/60 text-xs font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-emeraldApp-100 dark:border-gray-700">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-emeraldApp-900/60 dark:text-emeraldApp-100/60">Total do período</span>
          <span className="text-emeraldApp-900 dark:text-emeraldApp-50 font-bold text-xl">
            {formatCurrency(data.reduce((s, d) => s + (d.value1 || 0) + (d.value2 || 0), 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
