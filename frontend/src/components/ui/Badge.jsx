import { cn } from "../../utils/cn";

export function Badge({ children, variant = 'success', className }) {
  const variants = {
    success: 'bg-emeraldApp-100 text-emeraldApp-900 dark:bg-gray-700 dark:text-emeraldApp-50',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    neutral: 'bg-slate-200 text-slate-800 dark:bg-gray-700 dark:text-gray-200',
  };

  return (
    <span className={cn("inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold", variants[variant], className)}>
      {children}
    </span>
  );
}
