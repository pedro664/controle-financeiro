import { formatCurrency } from "../../utils/formatters";

export function PremiumAnalyticsCard({ title, subtitle, line1Data = [], line2Data = [], line1Color = "#00674F", line2Color = "#3EBB9E" }) {
  const allValues = [...line1Data.map(d => d.value || 0), ...line2Data.map(d => d.value || 0)];
  const max = Math.max(...allValues, 1);
  const len = Math.max(line1Data.length, line2Data.length, 2);

  const makePoints = (data) =>
    data.map((d, i) => {
      const x = (i / (len - 1 || 1)) * 100;
      const y = 100 - ((d.value || 0) / max) * 80 - 10;
      return `${x},${y}`;
    }).join(" ");

  const p1 = makePoints(line1Data);
  const p2 = makePoints(line2Data);

  return (
    <div className="rounded-app border border-emeraldApp-100 bg-white p-6 shadow-card dark:bg-gray-900 dark:border-gray-700 dark:shadow-none flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">{title}</h3>
          {subtitle && <p className="text-sm text-emeraldApp-900/60 dark:text-emeraldApp-100/60 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line1Color }} />
            <span className="text-emeraldApp-900/70 dark:text-emeraldApp-100/70 text-xs">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line2Color }} />
            <span className="text-emeraldApp-900/70 dark:text-emeraldApp-100/70 text-xs">Despesas</span>
          </div>
        </div>
      </div>

      <div className="relative w-full" style={{ height: 360 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {[20, 40, 60, 80].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#E9FFF8" className="dark:stroke-gray-800" strokeWidth="0.4" />
          ))}
          <polyline points={p1} fill="none" stroke={line1Color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={p2} fill="none" stroke={line2Color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          {line1Data.map((d, i) => {
            const x = (i / (len - 1 || 1)) * 100;
            const y = 100 - ((d.value || 0) / max) * 80 - 10;
            return <circle key={`l1-${i}`} cx={x} cy={y} r="1.8" fill={line1Color} />;
          })}
          {line2Data.map((d, i) => {
            const x = (i / (len - 1 || 1)) * 100;
            const y = 100 - ((d.value || 0) / max) * 80 - 10;
            return <circle key={`l2-${i}`} cx={x} cy={y} r="1.8" fill={line2Color} />;
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {line1Data.map((d, i) => (
            <span key={i} className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60">{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
