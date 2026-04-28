import { cn } from "../../utils/cn";

export function Card({ children, className = '' }) {
  return (
    <div className={cn("rounded-app border border-emeraldApp-100 bg-white p-6 shadow-card dark:bg-gray-900 dark:border-gray-700 dark:shadow-none", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h3 className="text-xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">{title}</h3>
        {description && <p className="mt-1 text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
