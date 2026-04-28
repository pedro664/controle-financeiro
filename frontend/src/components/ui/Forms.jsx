import { cn } from "../../utils/cn";

export function Input({ className, label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">{label}</label>}
      <input
        className={cn(
          "w-full rounded-xl border border-emeraldApp-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-emeraldApp-900 dark:text-white shadow-sm transition-all placeholder:text-emeraldApp-900/55 dark:placeholder:text-gray-400 focus:border-emeraldApp-300 dark:focus:border-emeraldApp-500 focus:ring focus:ring-emeraldApp-200 dark:focus:ring-emeraldApp-800 focus:ring-opacity-50 dark:[color-scheme:dark]",
          error && "border-red-300 focus:border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Select({ className, label, error, options = [], ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">{label}</label>}
      <select
        className={cn(
          "w-full rounded-xl border border-emeraldApp-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-emeraldApp-900 dark:text-white shadow-sm transition-all focus:border-emeraldApp-300 dark:focus:border-emeraldApp-500 focus:ring focus:ring-emeraldApp-200 dark:focus:ring-emeraldApp-800 focus:ring-opacity-50 appearance-none dark:[color-scheme:dark]",
          error && "border-red-300 focus:border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      >
        <option value="" disabled hidden>Selecione...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
