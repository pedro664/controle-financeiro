import { useState } from "react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumDonutCard({ title, subtitle, data = [] }) {
  const [active, setActive] = useState(null);
  const total = data.reduce((s, d) => s + (d.value || 0), 0);

  // Paleta emerald sofisticada
  const colors = ["#10b981", "#34d399", "#6ee7b7", "#059669", "#14b8a6", "#2dd4bf"];

  let acc = 0;
  const segments = data.map((d, i) => {
    const pct = total > 0 ? (d.value / total) * 100 : 0;
    const start = acc;
    acc += pct;
    return { ...d, pct, start, color: d.color || colors[i % colors.length] };
  });

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const activeItem = active !== null ? segments[active] : null;

  return (
    <div className="rounded-2xl border border-emeraldApp-100 bg-white p-7 shadow-card dark:bg-[#0B1120] dark:border-gray-800/60 dark:shadow-none flex flex-col gap-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-emeraldApp-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-emeraldApp-900/55 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>

      {/* Total */}
      <div className="text-sm text-emeraldApp-900/50 dark:text-gray-500">
        Total: <span className="font-medium text-emeraldApp-900 dark:text-gray-300">{formatCurrency(total)}</span>
      </div>

      <div className="flex items-center gap-10">
        {/* Donut */}
        <div className="relative w-56 h-56 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Track */}
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="currentColor"
              className="text-gray-100 dark:text-gray-800"
              strokeWidth="10"
            />
            {/* Segments */}
            {segments.map((s, i) => {
              const dash = (s.pct / 100) * circumference;
              const offset = -(s.start / 100) * circumference;
              const isActive = active === i;
              return (
                <circle
                  key={i}
                  cx="50" cy="50" r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="10"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                  className="transition-all duration-500 cursor-pointer"
                  style={{
                    opacity: active !== null && !isActive ? 0.25 : 1,
                    filter: isActive ? `drop-shadow(0 0 6px ${s.color}66)` : "none",
                  }}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                />
              );
            })}
          </svg>

          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-emeraldApp-900 dark:text-white tracking-tight">
              {activeItem ? `${Math.round(activeItem.pct)}%` : formatCurrency(total)}
            </span>
            <span className="text-xs text-emeraldApp-900/45 dark:text-gray-500 mt-1">
              {activeItem ? activeItem.label : `${data.length} categorias`}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 flex-1">
          {segments.slice(0, 6).map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between cursor-pointer group"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                  style={{
                    backgroundColor: s.color,
                    transform: active === i ? "scale(1.4)" : "scale(1)",
                    boxShadow: active === i ? `0 0 8px ${s.color}44` : "none",
                  }}
                />
                <span className={`text-sm transition-colors duration-200 ${active === i ? "text-emeraldApp-900 dark:text-white font-medium" : "text-emeraldApp-900/65 dark:text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              <span className={`text-sm font-semibold tabular-nums transition-colors duration-200 ${active === i ? "text-emeraldApp-900 dark:text-white" : "text-emeraldApp-900 dark:text-gray-300"}`}>
                {formatCurrency(s.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
