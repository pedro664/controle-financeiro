import { formatCurrency } from "../../utils/formatters";

export function PremiumProgressCard({ title, subtitle, data = [] }) {
  return (
    <div className="rounded-app border border-emeraldApp-100 bg-white p-5 shadow-card dark:bg-gray-900 dark:border-gray-700 dark:shadow-none flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">{title}</h3>
          {subtitle && <p className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {data.map((item, i) => {
          const pct = Math.min(((item.value || 0) / (item.max || 1)) * 100, 100);
          return (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-xs">{item.label}</span>
                <span className="text-emeraldApp-900 dark:text-emeraldApp-50 text-xs font-medium">{formatCurrency(item.value)}</span>
              </div>
              <div className="h-2 rounded-full bg-emeraldApp-50 dark:bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-emeraldApp-500 dark:bg-emerald-500 transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
