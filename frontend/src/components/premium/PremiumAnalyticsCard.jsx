import { formatCurrency } from "../../utils/formatters";

export function PremiumAnalyticsCard({ title, subtitle, line1Data = [], line2Data = [], line1Color = "#666BF4", line2Color = "#10ABFF" }) {
  const allValues = [...line1Data.map(d => d.value || 0), ...line2Data.map(d => d.value || 0)];
  const max = Math.max(...allValues, 1);
  const len = Math.max(line1Data.length, line2Data.length, 2);

  const makePoints = (data) =>
    data.map((d, i) => {
      const x = (i / (len - 1 || 1)) * 100;
      const y = 100 - ((d.value || 0) / max) * 85 - 10;
      return `${x},${y}`;
    }).join(" ");

  const p1 = makePoints(line1Data);
  const p2 = makePoints(line2Data);

  return (
    <div className="w-full rounded-[20px] bg-white dark:bg-[#0A0D10] border border-emeraldApp-100 dark:border-gray-800 p-5 flex flex-col gap-4 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-emeraldApp-900 dark:text-white font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-emeraldApp-900/60 dark:text-gray-500 text-xs mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: line1Color }} />
            <span className="text-gray-500 text-[10px]">Receitas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: line2Color }} />
            <span className="text-gray-500 text-[10px]">Despesas</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: 220 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {/* Grid */}
          {[20, 40, 60, 80].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={"#f3f4f6"} className="dark:stroke-gray-800" strokeWidth="0.4" />
          ))}
          {/* Lines */}
          <polyline points={p1} fill="none" stroke={line1Color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={p2} fill="none" stroke={line2Color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          {/* Dots */}
          {line1Data.map((d, i) => {
            const x = (i / (len - 1 || 1)) * 100;
            const y = 100 - ((d.value || 0) / max) * 85 - 10;
            return <circle key={`l1-${i}`} cx={x} cy={y} r="1.2" fill={line1Color} />;
          })}
          {line2Data.map((d, i) => {
            const x = (i / (len - 1 || 1)) * 100;
            const y = 100 - ((d.value || 0) / max) * 85 - 10;
            return <circle key={`l2-${i}`} cx={x} cy={y} r="1.2" fill={line2Color} />;
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
          {line1Data.map((d, i) => (
            <span key={i} className="text-[9px] text-gray-400">{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
