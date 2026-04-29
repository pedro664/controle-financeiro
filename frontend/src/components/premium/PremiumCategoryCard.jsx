import { useState } from "react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumCategoryCard({ title, subtitle, data = [] }) {
  const [active, setActive] = useState(null);

  return (
    <div className="rounded-2xl border border-emeraldApp-100 bg-white p-7 shadow-card dark:bg-[#0B1120] dark:border-gray-800/60 dark:shadow-none flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-semibold text-emeraldApp-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-emeraldApp-900/55 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex flex-col gap-4">
        {data.length === 0 && (
          <div className="text-sm text-emeraldApp-900/50 dark:text-gray-500 py-4">
            Nenhum gasto registrado este mês
          </div>
        )}
        {data.map((item, i) => {
          const isActive = active === i;
          const hasLimit = item.limit > 0;
          const pct = hasLimit ? Math.min(item.percent_of_limit, 100) : 0;
          const isOverBudget = hasLimit && item.total > item.limit;

          return (
            <div
              key={i}
              className="flex flex-col gap-2 cursor-pointer"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm transition-colors duration-200 ${isActive ? "text-emeraldApp-900 dark:text-white font-medium" : "text-emeraldApp-900/80 dark:text-gray-300"}`}>
                    {item.name}
                  </span>
                  {isOverBudget && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                      Estourado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasLimit && (
                    <span className={`text-xs ${isOverBudget ? "text-red-500 font-medium" : "text-emeraldApp-900/50 dark:text-gray-500"}`}>
                      {item.percent_of_limit}%
                    </span>
                  )}
                  <span className="text-sm font-semibold text-emeraldApp-900 dark:text-white tabular-nums">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              {hasLimit && (
                <div className="h-2 rounded-full bg-emeraldApp-50 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isOverBudget ? "#ef4444" : pct > 80 ? "#f59e0b" : "#10b981",
                    }}
                  />
                </div>
              )}

              {/* Detail on hover */}
              {isActive && (
                <div className="flex items-center gap-3 text-[11px] text-emeraldApp-900/60 dark:text-gray-500 animate-in fade-in duration-150">
                  {item.paid > 0 && (
                    <span>Pago: <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(item.paid)}</span></span>
                  )}
                  {item.pending > 0 && (
                    <span>Pendente: <span className="text-amber-600 dark:text-amber-400 font-medium">{formatCurrency(item.pending)}</span></span>
                  )}
                  {hasLimit && (
                    <span>Limite: {formatCurrency(item.limit)}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
