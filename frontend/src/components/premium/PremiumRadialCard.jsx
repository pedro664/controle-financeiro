import { formatCurrency } from "../../utils/formatters";

export function PremiumRadialCard({ title, subtitle, rings = [] }) {
  const colors = ["#005F73", "#5ED500", "#4CC9F0", "#F72585", "#FFC300"];

  return (
    <div className="w-full rounded-[20px] bg-[#0A0D10] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="relative flex items-center justify-center" style={{ height: 200 }}>
        {rings.slice(0, 5).map((ring, i) => {
          const radius = 80 - i * 16;
          const circumference = 2 * Math.PI * radius;
          const pct = Math.min(((ring.value || 0) / (ring.max || 1)) * 100, 100);
          const dash = (pct / 100) * circumference;
          const color = ring.color || colors[i % colors.length];
          return (
            <svg key={i} className="absolute" width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r={radius} fill="none" stroke="#151A20" strokeWidth="8" />
              <circle
                cx="100" cy="100" r={radius}
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                className="transition-all duration-1000"
              />
            </svg>
          );
        })}
        {/* Center */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-white font-bold text-xl">{formatCurrency(rings[0]?.value || 0)}</span>
          <span className="text-gray-500 text-[10px]">{rings[0]?.label || "Total"}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {rings.slice(0, 5).map((ring, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ring.color || colors[i % colors.length] }} />
            <span className="text-gray-400 text-[10px]">{ring.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
