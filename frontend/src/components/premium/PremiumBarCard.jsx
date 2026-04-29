import { useState } from "react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumBarCard({ title, subtitle, data = [], color = "#10b981" }) {
  const [active, setActive] = useState(null);
  const max = Math.max(...data.map((d) => d.value || 0), 1);
  const total = data.reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div className="rounded-2xl border border-emeraldApp-100 bg-white p-7 shadow-card dark:bg-[#0B1120] dark:border-gray-800/60 dark:shadow-none flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-emeraldApp-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-sm text-emeraldApp-900/55 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="w-full flex items-end justify-between gap-3 px-1" style={{ height: 300 }}>
        {data.map((item, i) => {
          const h = ((item.value || 0) / max) * 100;
          const isActive = active === i;

          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end relative">
              {/* Tooltip acima da barra */}
              {isActive && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                  <div className="bg-emeraldApp-900 dark:bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap text-center">
                    <div className="font-semibold">{item.label}</div>
                    <div>{formatCurrency(item.value)}</div>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-emeraldApp-900 dark:bg-gray-800 rotate-45" />
                </div>
              )}

              <div
                className="w-full max-w-[36px] rounded-t-lg cursor-pointer transition-all duration-300"
                style={{
                  height: `${Math.max(h, 3)}%`,
                  backgroundColor: color,
                  opacity: active !== null && !isActive ? 0.25 : 1,
                  filter: isActive ? "brightness(1.15)" : "none",
                }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              />
              <span className="text-[11px] text-emeraldApp-900/50 dark:text-gray-500 font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-emeraldApp-100 dark:border-gray-800 flex items-baseline justify-between">
        <span className="text-sm text-emeraldApp-900/60 dark:text-gray-500">Total acumulado</span>
        <span className="text-emeraldApp-900 dark:text-white font-bold text-xl">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
