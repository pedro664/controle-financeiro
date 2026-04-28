import { useState } from "react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumBarCard({ title, subtitle, data = [], color = "#00674F" }) {
  const [active, setActive] = useState(null);
  const max = Math.max(...data.map((d) => d.value || 0), 1);
  const total = data.reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div className="rounded-app border border-emeraldApp-100 bg-white p-6 shadow-card dark:bg-gray-900 dark:border-gray-700 dark:shadow-none flex flex-col gap-4">
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
            <span className="text-emeraldApp-900/70 dark:text-emeraldApp-100/70">Total: <span className="font-medium">{formatCurrency(data[active].value)}</span></span>
            <span className="text-emeraldApp-900/40 dark:text-emeraldApp-100/40">|</span>
            <span className="text-emeraldApp-900/70 dark:text-emeraldApp-100/70">
              {Math.round(((data[active].value || 0) / max) * 100)}% do pico
            </span>
            <span className="text-emeraldApp-900/40 dark:text-emeraldApp-100/40">|</span>
            <span className="text-emeraldApp-900/70 dark:text-emeraldApp-100/70">
              {Math.round(((data[active].value || 0) / total) * 100)}% do total
            </span>
          </div>
        ) : (
          <span className="text-xs text-emeraldApp-900/50 dark:text-emeraldApp-100/50">
            Passe o mouse sobre uma barra para detalhes
          </span>
        )}
      </div>

      <div className="w-full flex items-end justify-between gap-2 px-1" style={{ height: 300 }}>
        {data.map((item, i) => {
          const h = ((item.value || 0) / max) * 100;
          const isActive = active === i;

          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
              {/* Valor acima da barra no hover */}
              <div className="h-5 flex items-end justify-center">
                <span
                  className="text-[10px] font-semibold text-emeraldApp-900 dark:text-emeraldApp-50 transition-all duration-200"
                  style={{ opacity: isActive ? 1 : 0, transform: isActive ? "translateY(0)" : "translateY(4px)" }}
                >
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div
                className="w-full max-w-[40px] rounded-t-md cursor-pointer transition-all duration-300"
                style={{
                  height: `${Math.max(h, 3)}%`,
                  backgroundColor: color,
                  opacity: active !== null && !isActive ? 0.3 : 1,
                  filter: isActive ? "brightness(1.12)" : "none",
                }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              />
              <span className="text-[11px] text-emeraldApp-900/50 dark:text-emeraldApp-100/50 font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-emeraldApp-100 dark:border-gray-700 flex items-baseline justify-between">
        <span className="text-sm text-emeraldApp-900/60 dark:text-emeraldApp-100/60">Total acumulado</span>
        <span className="text-emeraldApp-900 dark:text-emeraldApp-50 font-bold text-xl">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
