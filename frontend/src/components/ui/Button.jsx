import { cn } from "../../utils/cn";

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-emeraldApp-700 text-white hover:bg-emeraldApp-900 dark:bg-emeraldApp-500 dark:hover:bg-emeraldApp-400',
    secondary: 'bg-emeraldApp-200 text-emeraldApp-900 dark:text-emeraldApp-50 hover:bg-emeraldApp-300 border border-emeraldApp-300 dark:bg-emeraldApp-800 dark:border-emeraldApp-700 dark:hover:bg-emeraldApp-700',
    outline: 'border border-emeraldApp-700 text-emeraldApp-700 hover:bg-emeraldApp-50 dark:bg-gray-800 dark:border-emeraldApp-400 dark:text-emeraldApp-300 dark:hover:bg-gray-800',
    ghost: 'text-emeraldApp-900 dark:text-emeraldApp-50 hover:bg-emeraldApp-100 dark:bg-gray-700 dark:hover:bg-gray-800',
    danger: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500',
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
