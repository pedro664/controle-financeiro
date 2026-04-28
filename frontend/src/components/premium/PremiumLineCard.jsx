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
    <div className="w-full rounded-[20px] bg-[#0A0D10] p-5 flex flex-col gap-4" style={{ minHeight: 340 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
        </div>
        <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Line Chart */}
      <div className="flex-1 relative" style={{ minHeight: 140 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#DA004E" />
              <stop offset="37%" stopColor="#D500BF" />
              <stop offset="70%" stopColor="#4500D8" />
              <stop offset="100%" stopColor="#0685CD" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[25, 50, 75].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#1f2937" strokeWidth="0.3" />
          ))}
          {/* Area fill */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#lineGrad)"
            opacity="0.08"
          />
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dots */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * 100;
            const y = 100 - ((d.value || 0) / max) * 90 - 5;
            return (
              <circle key={i} cx={x} cy={y} r="1.5" fill="#fff" />
            );
          })}
        </svg>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5">
        {[
          { label: metric1?.label || "Mín", value: metric1?.value ?? 0 },
          { label: metric2?.label || "Méd", value: metric2?.value ?? 0 },
          { label: metric3?.label || "Máx", value: metric3?.value ?? 0 },
        ].map((m, i) => (
          <div key={i} className="text-center">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">{m.label}</p>
            <p className="text-white font-bold text-sm">{formatCurrency(m.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
