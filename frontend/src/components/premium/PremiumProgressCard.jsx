import { useState } from "react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumProgressCard({ title, subtitle, data = [], total = 1 }) {
  const [active, setActive] = useState(null);
  const maxItem = data.length > 0 ? Math.max(...data.map((d) => d.value || 0)) : 1;

  return (
    <div className="rounded-app border border-emeraldApp-100 bg-white p-6 shadow-card dark:bg-gray-900 dark:border-gray-700 dark:shadow-none flex flex-col gap-4" style={{ minHeight: 320 }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">{title}</h3>
          {subtitle && <p className="text-sm text-emeraldApp-900/60 dark:text-emeraldApp-100/60 mt-1">{subtitle}</p>}
        </div>
      </div>

      {/* Detail bar — altura fixa */}
      <div className="h-7 flex items-center">
        {active !== null ? (
          <div className="flex items-center gap-3 text-xs animate-in fade-in duration-150">
            <span className="font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">{data[active].label}</span>
            <span className="text-emeraldApp-900/40 dark:text-emeraldApp-100/40">|</span>
            <span className="text-emeraldApp-900/70 dark:text-emeraldApp-100/70">
              <span className="font-medium">{formatCurrency(data[active].value)}</span>
            </span>
            <span className="text-emeraldApp-900/40 dark:text-emeraldApp-100/40">|</span>
            <span className="text-emeraldApp-900/70 dark:text-emeraldApp-100/70">
              {Math.round(((data[active].value || 0) / total) * 100)}% da renda
            </span>
            <span className="text-emeraldApp-900/40 dark:text-emeraldApp-100/40">|</span>
            <span className="text-emeraldApp-900/70 dark:text-emeraldApp-100/70">
              {Math.round(((data[active].value || 0) / maxItem) * 100)}% do maior
            </span>
          </div>
        ) : (
          <span className="text-xs text-emeraldApp-900/50 dark:text-emeraldApp-100/50">
            Passe o mouse sobre uma barra para detalhes
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5 justify-center flex-1">
        {data.length === 0 && (
          <div className="flex items-center justify-center h-full text-emeraldApp-900/50 dark:text-emeraldApp-100/50 text-sm">
            Nenhuma despesa registrada
          </div>
        )}
        {data.map((item, i) => {
          const pctOfIncome = Math.min(((item.value || 0) / total) * 100, 100);
          const isActive = active === i;

          return (
            <div
              key={i}
              className="flex flex-col gap-1.5 cursor-pointer"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm transition-colors duration-200 ${isActive ? "text-emeraldApp-900 dark:text-emeraldApp-50 font-medium" : "text-emeraldApp-900/75 dark:text-emeraldApp-100/80"}`}>
                  {item.label}
                </span>
                <span className="text-sm font-medium text-emeraldApp-900 dark:text-emeraldApp-50">{formatCurrency(item.value)}</span>
              </div>
              <div className="h-3.5 rounded-full bg-emeraldApp-50 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-1.5"
                  style={{
                    width: `${pctOfIncome}%`,
                    backgroundColor: isActive ? "#00674F" : "#3EBB9E",
                  }}
                >
                  {pctOfIncome > 20 && (
                    <span className="text-[9px] font-bold text-white/90">{Math.round(pctOfIncome)}%</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
