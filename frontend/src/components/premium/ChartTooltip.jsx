import { useState, useRef, useEffect } from "react";

export function ChartTooltip({ children, content, visible }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!visible || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const parent = ref.current.offsetParent;
    const parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
    setPos({
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top - 8,
    });
  }, [visible]);

  if (!visible || !content) return children;

  return (
    <>
      <div ref={ref} className="contents">
        {children}
      </div>
      <div
        className="absolute z-50 pointer-events-none transition-opacity duration-150"
        style={{
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -100%)",
          opacity: visible ? 1 : 0,
        }}
      >
        <div className="bg-emeraldApp-900 dark:bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
          {content}
          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-emeraldApp-900 dark:bg-gray-800 rotate-45" />
        </div>
      </div>
    </>
  );
}

export function useChartHover() {
  const [hovered, setHovered] = useState(null);
  return { hovered, setHovered };
}
