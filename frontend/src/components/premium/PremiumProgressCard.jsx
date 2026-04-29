import { useState } from "react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumProgressCard({ title, subtitle, data = [], total = 1 }) {
  const [active, setActive] = useState(null);

  return (
    <div className="rounded-2xl border border-emeraldApp-100 bg-white p-7 shadow-card dark:bg-[#0B1120] dark:border-gray-800/60 dark:shadow-none flex flex-col gap-5" style={{ minHeight: 320 }}>
      <div>
        <h3 className="text-lg font-semibold text-emeraldApp-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-emeraldApp-900/55 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex flex-col gap-5 justify-center flex-1">
        {data.length === 0 && (
          <div className="flex items-center justify-center h-full text-emeraldApp-900/50 dark:text-gray-500 text-sm">
            Nenhuma despesa registrada
          </div>
        )}
        {data.map((item, i) => {
          const pct = Math.min(((item.value || 0) / total) * 100, 100);
          const isActive = active === i;

          return (
            <div
              key={i}
              className="flex flex-col gap-1.5 cursor-pointer group"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm transition-colors duration-200 ${isActive ? "text-emeraldApp-900 dark:text-white font-medium" : "text-emeraldApp-900/75 dark:text-gray-400"}`}>
                  {item.label}
                </span>
                <span className="text-sm font-medium text-emeraldApp-900 dark:text-gray-300">
                  {isActive ? `${Math.round(pct)}% · ${formatCurrency(item.value)}` : formatCurrency(item.value)}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-emeraldApp-50 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isActive ? "#10b981" : "#059669",
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
