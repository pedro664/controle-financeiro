import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { formatCurrency, getStatusColor, getStatusLabel } from "../utils/formatters";
import {
  PremiumBarCard,
  PremiumLineCard,
  PremiumDonutCard,
  PremiumProgressCard,
  PremiumAnalyticsCard,
} from "../components/premium";
import {
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

const COLORS = ['#00674F', '#3EBB9E', '#73E6CB', '#0A3C30', '#64748b', '#475569', '#1e293b'];
const DARK_COLORS = ['#3A0CA3', '#00C5C9', '#F72585', '#FFD600', '#00674F', '#3EBB9E', '#73E6CB'];

export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("2026-04");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    api.get(`/dashboard?month=${month}`)
      .then((res) => setData(res))
      .catch((e) => console.error("Dashboard error:", e))
      .finally(() => setLoading(false));
  }, [month]);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  if (loading || !data) return <div className="flex h-[60vh] items-center justify-center text-emeraldApp-700 dark:text-emeraldApp-50">Carregando dashboard...</div>;

  const { summary, category_breakdown = [], top_expenses = [], top_category } = data;
  const chartColors = isDark ? DARK_COLORS : COLORS;

  // Mock historical data for premium cards (would come from API in real implementation)
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  const barData = months.map((m, i) => ({
    label: m,
    value1: summary.monthly_income * (0.7 + Math.random() * 0.6),
    value2: summary.total_fixed_costs * (0.8 + Math.random() * 0.5),
  }));

  const lineData = months.map((m, i) => ({
    label: m,
    value: summary.free_balance * (0.5 + Math.random() * 1.0),
  }));

  const pieData = category_breakdown.slice(0, 4).map(c => ({
    label: c.name,
    value: c.total,
    color: DARK_COLORS[category_breakdown.indexOf(c) % DARK_COLORS.length],
  }));

  const progressData = top_expenses.slice(0, 5).map(e => ({
    label: e.name.length > 15 ? e.name.slice(0, 15) + "..." : e.name,
    value: e.value,
    max: top_expenses[0]?.value * 1.2 || 1,
  }));

  const analyticsLine1 = months.map((m, i) => ({
    label: m,
    value: summary.monthly_income * (0.8 + Math.random() * 0.4),
  }));
  const analyticsLine2 = months.map((m, i) => ({
    label: m,
    value: (summary.total_fixed_costs + summary.total_pending) * (0.7 + Math.random() * 0.5),
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emeraldApp-900 dark:text-white">Visão Geral</h1>
          <p className="text-emeraldApp-900/75 dark:text-gray-400 mt-1">Finanças de {month}</p>
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
          className="rounded-xl border border-emeraldApp-100 dark:border-gray-800 bg-white dark:bg-[#0A0D10] px-4 py-2 text-emeraldApp-900 dark:text-white shadow-sm dark:[color-scheme:dark]" />
      </div>

      {/* Analytics Hero */}
      <PremiumAnalyticsCard
        title="Análise Financeira"
        subtitle="Receitas vs Despesas mensais"
        line1Data={analyticsLine1}
        line2Data={analyticsLine2}
        line1Color="#666BF4"
        line2Color="#10ABFF"
      />

      {/* Premium Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PremiumBarCard
          title="Renda vs Custos"
          subtitle="Comparativo mensal"
          data={barData}
          colors={["#F72585", "#7209B7"]}
        />
        <PremiumLineCard
          title="Evolução do Saldo"
          subtitle="Tendência ao longo do tempo"
          data={lineData}
          metric1={{ label: "Mín", value: summary.total_pending }}
          metric2={{ label: "Méd", value: summary.free_balance }}
          metric3={{ label: "Máx", value: summary.monthly_income }}
        />
        <PremiumDonutCard
          title="Gastos por Categoria"
          subtitle="Distribuição percentual"
          data={pieData}
        />
      </div>

      {/* Progress + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PremiumProgressCard
          title="Maiores Despesas"
          subtitle="Top 5 gastos do mês"
          data={progressData}
        />

        <Card className="lg:col-span-2 flex flex-col dark:border-gray-800 dark:bg-[#0A0D10]">
          <CardHeader title="Gastos por Categoria" />
          <div className="flex-1 min-h-[300px]">
            {category_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={category_breakdown} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="total" nameKey="name">
                    {category_breakdown.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #1f2937', backgroundColor: '#0A0D10', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-gray-500">Sem dados</div>}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="dark:border-gray-800 dark:bg-[#0A0D10]">
        <CardHeader title="Top 5 Despesas" />
        <table className="w-full text-left">
          <thead><tr className="border-b border-emeraldApp-100 dark:border-gray-800">
            <th className="pb-3 font-semibold text-emeraldApp-900/75 dark:text-gray-400">Despesa</th>
            <th className="pb-3 font-semibold text-emeraldApp-900/75 dark:text-gray-400">Categoria</th>
            <th className="pb-3 font-semibold text-emeraldApp-900/75 dark:text-gray-400 text-right">Valor</th>
            <th className="pb-3 font-semibold text-emeraldApp-900/75 dark:text-gray-400 text-center">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-emeraldApp-100 dark:divide-gray-800">
            {top_expenses.slice(0, 5).map((ex) => (
              <tr key={ex.id} className="hover:bg-emeraldApp-50/70 dark:hover:bg-gray-800/50 transition-colors">
                <td className="py-4 font-medium dark:text-gray-200">{ex.name}</td>
                <td className="py-4 text-emeraldApp-900/75 dark:text-gray-400">{ex.category}</td>
                <td className="py-4 font-bold text-right dark:text-gray-200">{formatCurrency(ex.value)}</td>
                <td className="py-4 text-center"><Badge variant={getStatusColor(ex.status)}>{getStatusLabel(ex.status)}</Badge></td>
              </tr>
            ))}
            {top_expenses.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-500">Nenhuma despesa</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
