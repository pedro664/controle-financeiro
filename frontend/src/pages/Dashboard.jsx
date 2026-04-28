import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardHeader } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { formatCurrency, getStatusColor, getStatusLabel } from "../utils/formatters";
import {
  PremiumBarCard,
  PremiumLineCard,
  PremiumDonutCard,
  PremiumProgressCard,
  PremiumAnalyticsCard,
} from "../components/premium";
import { Wallet, TrendingDown, Clock, CheckCircle2, AlertCircle, PieChart } from "lucide-react";

export function Dashboard() {
  const [data, setData] = useState(null);
  const [seasonalData, setSeasonalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("2026-04");

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 5);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    Promise.all([
      api.get(`/dashboard?month=${month}`),
      api.get(`/analytics/seasonal?period=monthly&type=all&start_date=${startStr}&end_date=${endStr}`),
    ])
      .then(([dashRes, seasonalRes]) => {
        setData(dashRes);
        setSeasonalData(seasonalRes.data);
      })
      .catch((e) => console.error("Dashboard error:", e))
      .finally(() => setLoading(false));
  }, [month]);

  if (loading || !data) return <div className="flex h-[60vh] items-center justify-center text-emeraldApp-700 dark:text-emeraldApp-50">Carregando dashboard...</div>;

  const { summary, category_breakdown = [], top_expenses = [], top_category } = data;
  const periods = seasonalData?.periods || [];

  const analyticsLine1 = periods.map(p => ({
    label: p.label,
    value: p.categories.reduce((s, c) => c.name !== 'Receita' ? s : s + c.total, 0),
  }));
  const analyticsLine2 = periods.map(p => ({
    label: p.label,
    value: p.total,
  }));

  const barData = periods.slice(-6).map(p => ({
    label: p.label,
    value1: p.total,
    value2: p.categories.length > 1 ? p.categories[1]?.total || 0 : p.total * 0.6,
  }));

  const lineData = periods.map(p => ({
    label: p.label,
    value: p.total,
  }));

  const pieData = category_breakdown.slice(0, 6).map((c, i) => ({
    label: c.name,
    value: c.total,
  }));

  const progressData = top_expenses.slice(0, 5).map(e => ({
    label: e.name.length > 22 ? e.name.slice(0, 22) + "..." : e.name,
    value: e.value,
    max: top_expenses[0]?.value * 1.2 || 1,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">Visão Geral</h1>
          <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mt-1">Finanças de {month}</p>
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
          className="rounded-xl border border-emeraldApp-100 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-emeraldApp-900 dark:text-emeraldApp-50 shadow-sm dark:[color-scheme:dark] dark:placeholder:text-gray-400" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Saldo Livre" value={summary.free_balance} icon={Wallet} type="success" />
        <StatCard title="Renda Mensal" value={summary.monthly_income} icon={TrendingDown} />
        <StatCard title="Custos Fixos" value={summary.total_fixed_costs} icon={PieChart} />
        <StatCard title="Total Pago" value={summary.total_paid} icon={CheckCircle2} type="success" />
        <StatCard title="Total Pendente" value={summary.total_pending} icon={Clock} type="warning" />
        {top_category && <StatCard title="Maior Categoria" value={formatCurrency(top_category.total)} suffix={top_category.name} icon={AlertCircle} type="danger" />}
      </div>

      {/* Full-width Analytics */}
      {periods.length > 0 && (
        <PremiumAnalyticsCard
          title="Análise Financeira"
          subtitle="Receitas vs Despesas mensais"
          line1Data={analyticsLine1}
          line2Data={analyticsLine2}
          line1Color="#00674F"
          line2Color="#3EBB9E"
        />
      )}

      {/* Full-width Bar Chart */}
      {barData.length > 0 && (
        <PremiumBarCard
          title="Evolução Mensal"
          subtitle="Comparativo de gastos por período"
          data={barData}
          colors={["#00674F", "#3EBB9E"]}
        />
      )}

      {/* Full-width Line Chart */}
      {lineData.length > 0 && (
        <PremiumLineCard
          title="Tendência de Gastos"
          subtitle="Total acumulado por mês"
          data={lineData}
          metric1={{ label: "Mín", value: periods.reduce((m, p) => Math.min(m, p.total), Infinity) }}
          metric2={{ label: "Méd", value: periods.length > 0 ? periods.reduce((s, p) => s + p.total, 0) / periods.length : 0 }}
          metric3={{ label: "Máx", value: periods.reduce((m, p) => Math.max(m, p.total), 0) }}
        />
      )}

      {/* Donut + Progress side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumDonutCard
          title="Gastos por Categoria"
          subtitle="Distribuição percentual do mês"
          data={pieData}
        />
        <PremiumProgressCard
          title="Maiores Despesas"
          subtitle="Top 5 gastos do mês atual"
          data={progressData}
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader title="Top 5 Despesas" />
        <table className="w-full text-left">
          <thead><tr className="border-b border-emeraldApp-100 dark:border-gray-700">
            <th className="pb-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Despesa</th>
            <th className="pb-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Categoria</th>
            <th className="pb-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-right">Valor</th>
            <th className="pb-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-center">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-emeraldApp-100 dark:divide-gray-700">
            {top_expenses.slice(0, 5).map((ex) => (
              <tr key={ex.id} className="hover:bg-emeraldApp-50/70 dark:hover:bg-gray-800/70 transition-colors">
                <td className="py-4 font-medium">{ex.name}</td>
                <td className="py-4 text-emeraldApp-900/75 dark:text-emeraldApp-100/80">{ex.category}</td>
                <td className="py-4 font-bold text-right">{formatCurrency(ex.value)}</td>
                <td className="py-4 text-center"><Badge variant={getStatusColor(ex.status)}>{getStatusLabel(ex.status)}</Badge></td>
              </tr>
            ))}
            {top_expenses.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-emeraldApp-900/70 dark:text-emeraldApp-100/70">Nenhuma despesa</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
