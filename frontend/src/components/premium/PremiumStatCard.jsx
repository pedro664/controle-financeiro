import { formatCurrency } from "../../utils/formatters";

export function PremiumStatCard({ title, value, icon: Icon, color = "#3EBB9E", subtitle }) {
  return (
    <div className="w-full rounded-[20px] bg-[#0A0D10] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-white/5">
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        )}
      </div>
      <div>
        <p className="text-white font-bold text-2xl tracking-tight">
          {typeof value === 'number' ? formatCurrency(value) : value}
        </p>
        {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-1 rounded-full bg-[#151A20] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: "65%", backgroundColor: color }}
        />
      </div>
    </div>
  );
}
