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

  return (
    <div className="rounded-2xl border border-emeraldApp-100 bg-white p-7 shadow-card dark:bg-[#0B1120] dark:border-gray-800/60 dark:shadow-none flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-emeraldApp-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-sm text-emeraldApp-900/55 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
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
            className="absolute"
            style={{ left: `calc(${pos.x}% - 5px)`, top: `calc(${pos.y}% - 5px)`, width: 10, height: 10 }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <div className="w-full h-full rounded-full border-2 border-white dark:border-[#0B1120] bg-[#3EBB9E] cursor-pointer transition-all duration-200 hover:scale-150" />
            {/* Tooltip acima do ponto */}
            {active === i && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                <div className="bg-emeraldApp-900 dark:bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap text-center">
                  <div className="font-semibold">{pos.label}</div>
                  <div>{formatCurrency(pos.value)}</div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-emeraldApp-900 dark:bg-gray-800 rotate-45" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emeraldApp-100 dark:border-gray-800">
        {[
          { label: metric1?.label || "Mín", value: metric1?.value ?? 0 },
          { label: metric2?.label || "Méd", value: metric2?.value ?? 0 },
          { label: metric3?.label || "Máx", value: metric3?.value ?? 0 },
        ].map((m, i) => (
          <div key={i} className="text-center">
            <p className="text-emeraldApp-900/60 dark:text-gray-500 text-xs uppercase tracking-wider mb-1">{m.label}</p>
            <p className="text-emeraldApp-900 dark:text-white font-bold text-base">{formatCurrency(m.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
