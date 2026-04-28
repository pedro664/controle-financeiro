import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-emeraldApp-900/40 backdrop-blur-sm dark:bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-soft w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:shadow-none">
        <div className="flex items-center justify-between p-6 border-b border-emeraldApp-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-emeraldApp-50 transition-colors dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-emeraldApp-900/75 dark:text-emeraldApp-100/70" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
