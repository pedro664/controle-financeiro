import { Settings } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumDonutCard({ title, subtitle, data = [] }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  const colors = ["#00674F", "#3EBB9E", "#73E6CB", "#0A3C30", "#64748b", "#475569"];
  let acc = 0;
  const segments = data.map((d, i) => {
    const pct = total > 0 ? (d.value / total) * 100 : 0;
    const start = acc;
    acc += pct;
    return { ...d, pct, start, color: d.color || colors[i % colors.length] };
  });

  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="rounded-app border border-emeraldApp-100 bg-white p-6 shadow-card dark:bg-gray-900 dark:border-gray-700 dark:shadow-none flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">{title}</h3>
          {subtitle && <p className="text-sm text-emeraldApp-900/60 dark:text-emeraldApp-100/60 mt-1">{subtitle}</p>}
        </div>
        <button className="p-1.5 rounded-lg hover:bg-emeraldApp-50 dark:hover:bg-gray-800 transition-colors">
          <Settings className="w-4 h-4 text-emeraldApp-900/50 dark:text-emeraldApp-100/50" />
        </button>
      </div>

      <div className="flex items-center gap-8" style={{ minHeight: 200 }}>
        <div className="relative w-44 h-44 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#E9FFF8" className="dark:stroke-gray-800" strokeWidth="12" />
            {segments.map((s, i) => {
              const dash = (s.pct / 100) * circumference;
              const offset = -(s.start / 100) * circumference;
              return (
                <circle
                  key={i} cx="50" cy="50" r={radius} fill="none" stroke={s.color} strokeWidth="12"
                  strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={offset}
                  strokeLinecap="round" className="transition-all duration-700"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-emeraldApp-900 dark:text-emeraldApp-50 font-bold text-xl">{data.length}</span>
            <span className="text-emeraldApp-900/50 dark:text-emeraldApp-100/50 text-xs">categorias</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {segments.slice(0, 6).map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
                <span className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-sm">{s.label}</span>
              </div>
              <span className="text-emeraldApp-900 dark:text-emeraldApp-50 text-sm font-medium">{formatCurrency(s.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
