import { Settings } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumDonutCard({ title, subtitle, data = [] }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  const colors = ["#3A0CA3", "#00C5C9", "#F72585", "#FFD600"];
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
    <div className="w-full rounded-[20px] bg-[#0A0D10] p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
        </div>
        <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <Settings className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#151A20" strokeWidth="14" />
            {segments.map((s, i) => {
              const dash = (s.pct / 100) * circumference;
              const offset = -(s.start / 100) * circumference;
              return (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="14"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              );
            })}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white font-bold text-sm">{data.length}</span>
            <span className="text-gray-500 text-[9px]">itens</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 flex-1">
          {segments.slice(0, 4).map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                <span className="text-gray-400 text-xs truncate max-w-[80px]">{s.label}</span>
              </div>
              <span className="text-white text-xs font-medium">{formatCurrency(s.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
