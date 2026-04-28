import { useState } from "react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumLineCard({ title, subtitle, data = [], metric1, metric2, metric3 }) {
  const [active, setActive] = useState(null);
  const max = Math.max(...data.map((d) => d.value || 0), 1);

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * 100;
      const y = 100 - ((d.value || 0) / max) * 85 - 7;
      return `${x},${y}`;
    })
    .join(" ");

  const dots = data.map((d, i) => ({
    x: (i / (data.length - 1 || 1)) * 100,
    y: 100 - ((d.value || 0) / max) * 85 - 7,
    value: d.value,
    label: d.label,
  }));

  const prevValue = (idx) => (idx > 0 ? dots[idx - 1].value : dots[idx].value);
  const variation = (idx) => {
    const prev = prevValue(idx);
    if (prev === 0) return 0;
    return ((dots[idx].value - prev) / prev) * 100;
  };

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
            <span className="font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">{dots[active].label}</span>
            <span className="text-emeraldApp-900/40 dark:text-emeraldApp-100/40">|</span>
            <span className="text-emeraldApp-900/70 dark:text-emeraldApp-100/70">Total: <span className="font-medium">{formatCurrency(dots[active].value)}</span></span>
            {active > 0 && (
              <>
                <span className="text-emeraldApp-900/40 dark:text-emeraldApp-100/40">|</span>
                <span className={`font-medium ${variation(active) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {variation(active) >= 0 ? "↑" : "↓"} {Math.abs(variation(active)).toFixed(1)}%
                </span>
                <span className="text-emeraldApp-900/50 dark:text-emeraldApp-100/50">vs anterior</span>
              </>
            )}
          </div>
        ) : (
          <span className="text-xs text-emeraldApp-900/50 dark:text-emeraldApp-100/50">
            Passe o mouse sobre um ponto para detalhes
          </span>
        )}
      </div>

      <div className="relative w-full" style={{ height: 300 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00674F" />
              <stop offset="100%" stopColor="#3EBB9E" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#E9FFF8"
              className="dark:stroke-gray-800"
              strokeWidth="0.3"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <polygon points={`0,100 ${points} 100,100`} fill="url(#lineGrad)" opacity="0.08" />
          <polyline
            points={points}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {dots.map((pos, i) => (
          <div
            key={i}
            className="absolute cursor-pointer"
            style={{ left: `calc(${pos.x}% - 5px)`, top: `calc(${pos.y}% - 5px)`, width: 10, height: 10 }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <div className="w-full h-full rounded-full border-2 border-white dark:border-gray-900 bg-[#3EBB9E] transition-all duration-200 hover:scale-150" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emeraldApp-100 dark:border-gray-700">
        {[
          { label: metric1?.label || "Mín", value: metric1?.value ?? 0 },
          { label: metric2?.label || "Méd", value: metric2?.value ?? 0 },
          { label: metric3?.label || "Máx", value: metric3?.value ?? 0 },
        ].map((m, i) => (
          <div key={i} className="text-center">
            <p className="text-emeraldApp-900/60 dark:text-emeraldApp-100/60 text-xs uppercase tracking-wider mb-1">{m.label}</p>
            <p className="text-emeraldApp-900 dark:text-emeraldApp-50 font-bold text-base">{formatCurrency(m.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
