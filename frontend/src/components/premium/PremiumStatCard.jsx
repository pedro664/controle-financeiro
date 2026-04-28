import { cn } from "../../utils/cn";
import { formatCurrency } from "../../utils/formatters";

export function PremiumStatCard({ title, value, icon: Icon, type = 'default', subtitle, className }) {
  const typeStyles = {
    success: 'bg-emeraldApp-100 text-emeraldApp-900 dark:bg-emerald-900/30 dark:text-emerald-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
    default: 'bg-emeraldApp-100 text-emeraldApp-900 dark:bg-gray-700 dark:text-emeraldApp-50',
  };

  return (
    <div className={cn("rounded-app border border-emeraldApp-100 bg-white p-5 shadow-card dark:bg-gray-900 dark:border-gray-700 dark:shadow-none flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-emeraldApp-900/75 dark:text-emeraldApp-100/80">{title}</span>
        {Icon && (
          <div className={cn("p-2 rounded-full", typeStyles[type] || typeStyles.default)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-emeraldApp-900 dark:text-emeraldApp-50">
          {typeof value === 'number' ? formatCurrency(value) : value}
        </p>
        {subtitle && <p className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60 mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-1.5 rounded-full bg-emeraldApp-50 dark:bg-gray-800 overflow-hidden">
        <div className="h-full rounded-full bg-emeraldApp-500 dark:bg-emerald-500 transition-all duration-700" style={{ width: "65%" }} />
      </div>
    </div>
  );
}
