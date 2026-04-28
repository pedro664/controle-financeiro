import { Card } from "./Card";
import { formatCurrency } from "../../utils/formatters";

export function StatCard({ title, value, icon: Icon, type = 'default', suffix }) {
  return (
    <Card className="flex items-start justify-between relative overflow-hidden group hover:shadow-soft transition-all duration-300">
      <div className="z-10">
        <p className="text-sm font-medium text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mb-2">{title}</p>
        <h4 className="text-2xl font-bold tracking-tight text-emeraldApp-900 dark:text-emeraldApp-50">
          {typeof value === 'number' ? formatCurrency(value) : value}
          {suffix && <span className="text-sm font-normal text-emeraldApp-900/75 dark:text-emeraldApp-100/80 ml-1">{suffix}</span>}
        </h4>
      </div>
      {Icon && (
        <div className={`p-3 rounded-full z-10 ${type === 'success' ? 'bg-emeraldApp-100 text-emeraldApp-900 dark:bg-gray-700 dark:text-emeraldApp-50' : type === 'danger' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : type === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-emeraldApp-100 text-emeraldApp-900 dark:bg-gray-700 dark:text-emeraldApp-50'}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-emeraldApp-50 dark:from-gray-800 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
    </Card>
  );
}
