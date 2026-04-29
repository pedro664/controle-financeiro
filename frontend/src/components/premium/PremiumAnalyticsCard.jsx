import { useState } from "react";
import { formatCurrency } from "../../utils/formatters";

export function PremiumAnalyticsCard({
  title,
  subtitle,
  line1Data = [],
  line2Data = [],
  line1Color = "#00674F",
  line2Color = "#3EBB9E",
  line1Label = "Receitas",
  line2Label = "Despesas",
}) {
  const [active, setActive] = useState(null);

  const allValues = [...line1Data.map((d) => d.value || 0), ...line2Data.map((d) => d.value || 0)];
  const max = Math.max(...allValues, 1);
  const len = Math.max(line1Data.length, line2Data.length, 2);

  const makePoints = (data) =>
    data
      .map((d, i) => {
        const x = (i / (len - 1 || 1)) * 100;
        const y = 100 - ((d.value || 0) / max) * 80 - 10;
        return `${x},${y}`;
      })
      .join(" ");

  const p1 = makePoints(line1Data);
  const p2 = makePoints(line2Data);

  const dots1 = line1Data.map((d, i) => ({
    x: (i / (len - 1 || 1)) * 100,
    y: 100 - ((d.value || 0) / max) * 80 - 10,
    value: d.value,
    label: d.label,
  }));
  const dots2 = line2Data.map((d, i) => ({
    x: (i / (len - 1 || 1)) * 100,
    y: 100 - ((d.value || 0) / max) * 80 - 10,
    value: d.value,
    label: d.label,
  }));

  const dimLine = (line) => active && active.line !== line;

  const getMonthDetail = (idx) => {
    const inc = line1Data[idx]?.value || 0;
    const exp = line2Data[idx]?.value || 0;
    return { inc, exp, balance: inc - exp };
  };

  return (
    <div className="rounded-2xl border border-emeraldApp-100 bg-white p-7 shadow-card dark:bg-[#0B1120] dark:border-gray-800/60 dark:shadow-none flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-emeraldApp-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-sm text-emeraldApp-900/55 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-emeraldApp-900/70 dark:text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: line1Color }} />
            {line1Label}
          </span>
          <span className="flex items-center gap-1.5 text-emeraldApp-900/70 dark:text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: line2Color }} />
            {line2Label}
          </span>
        </div>
      </div>

      <div className="relative w-full" style={{ height: 340 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {[20, 40, 60, 80].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#E9FFF8"
              className="dark:stroke-gray-800"
              strokeWidth="0.4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <polyline
            points={p1}
            fill="none"
            stroke={line1Color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="transition-opacity duration-300"
            style={{ opacity: dimLine("line1") ? 0.25 : 1 }}
          />
          <polyline
            points={p2}
            fill="none"
            stroke={line2Color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="transition-opacity duration-300"
            style={{ opacity: dimLine("line2") ? 0.25 : 1 }}
          />
        </svg>

        {dots1.map((pos, i) => (
          <div
            key={`l1-${i}`}
            className="absolute"
            style={{ left: `calc(${pos.x}% - 5px)`, top: `calc(${pos.y}% - 5px)`, width: 10, height: 10 }}
            onMouseEnter={() => setActive({ line: "line1", idx: i })}
            onMouseLeave={() => setActive(null)}
          >
            <div
              className="w-full h-full rounded-full border-2 border-white dark:border-[#0B1120] cursor-pointer transition-all duration-200 hover:scale-150"
              style={{ backgroundColor: line1Color, opacity: dimLine("line1") ? 0.25 : 1 }}
            />
            {/* Tooltip acima do ponto */}
            {active?.line === "line1" && active?.idx === i && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                <div className="bg-emeraldApp-900 dark:bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                  <div className="font-semibold">{pos.label}</div>
                  <div>{line1Label}: {formatCurrency(pos.value)}</div>
                  {(() => {
                    const d = getMonthDetail(i);
                    return (
                      <>
                        <div>{line2Label}: {formatCurrency(d.exp)}</div>
                        <div className="pt-0.5 mt-0.5 border-t border-white/20">Saldo: {formatCurrency(d.balance)}</div>
                      </>
                    );
                  })()}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-emeraldApp-900 dark:bg-gray-800 rotate-45" />
              </div>
            )}
          </div>
        ))}

        {dots2.map((pos, i) => (
          <div
            key={`l2-${i}`}
            className="absolute"
            style={{ left: `calc(${pos.x}% - 5px)`, top: `calc(${pos.y}% - 5px)`, width: 10, height: 10 }}
            onMouseEnter={() => setActive({ line: "line2", idx: i })}
            onMouseLeave={() => setActive(null)}
          >
            <div
              className="w-full h-full rounded-full border-2 border-white dark:border-[#0B1120] cursor-pointer transition-all duration-200 hover:scale-150"
              style={{ backgroundColor: line2Color, opacity: dimLine("line2") ? 0.25 : 1 }}
            />
            {/* Tooltip acima do ponto */}
            {active?.line === "line2" && active?.idx === i && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                <div className="bg-emeraldApp-900 dark:bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                  <div className="font-semibold">{pos.label}</div>
                  <div>{line2Label}: {formatCurrency(pos.value)}</div>
                  {(() => {
                    const d = getMonthDetail(i);
                    return (
                      <>
                        <div>{line1Label}: {formatCurrency(d.inc)}</div>
                        <div className="pt-0.5 mt-0.5 border-t border-white/20">Saldo: {formatCurrency(d.balance)}</div>
                      </>
                    );
                  })()}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-emeraldApp-900 dark:bg-gray-800 rotate-45" />
              </div>
            )}
          </div>
        ))}

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
          {line1Data.map((d, i) => (
            <span key={i} className="text-[11px] text-emeraldApp-900/50 dark:text-gray-500">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
