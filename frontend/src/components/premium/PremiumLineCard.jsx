import { MoreHorizontal } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumLineCard({ title, subtitle, data = [], metric1, metric2, metric3 }) {
  const max = Math.max(...data.map(d => d.value || 0), 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100;
    const y = 100 - ((d.value || 0) / max) * 90 - 5;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="rounded-app border border-emeraldApp-100 bg-white p-5 shadow-card dark:bg-gray-900 dark:border-gray-700 dark:shadow-none flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">{title}</h3>
          {subtitle && <p className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60 mt-0.5">{subtitle}</p>}
        </div>
        <button className="p-1.5 rounded-lg hover:bg-emeraldApp-50 dark:hover:bg-gray-800 transition-colors">
          <MoreHorizontal className="w-4 h-4 text-emeraldApp-900/50 dark:text-emeraldApp-100/50" />
        </button>
      </div>

      <div className="flex-1 relative" style={{ minHeight: 120 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00674F" />
              <stop offset="100%" stopColor="#3EBB9E" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#E9FFF8" className="dark:stroke-gray-800" strokeWidth="0.3" />
          ))}
          <polygon points={`0,100 ${points} 100,100`} fill="url(#lineGrad)" opacity="0.08" />
          <polyline points={points} fill="none" stroke="url(#lineGrad)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * 100;
            const y = 100 - ((d.value || 0) / max) * 90 - 5;
            return <circle key={i} cx={x} cy={y} r="1.5" fill="#3EBB9E" />;
          })}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-emeraldApp-100 dark:border-gray-700">
        {[
          { label: metric1?.label || "Mín", value: metric1?.value ?? 0 },
          { label: metric2?.label || "Méd", value: metric2?.value ?? 0 },
          { label: metric3?.label || "Máx", value: metric3?.value ?? 0 },
        ].map((m, i) => (
          <div key={i} className="text-center">
            <p className="text-emeraldApp-900/60 dark:text-emeraldApp-100/60 text-[10px] uppercase tracking-wider mb-1">{m.label}</p>
            <p className="text-emeraldApp-900 dark:text-emeraldApp-50 font-bold text-sm">{formatCurrency(m.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
