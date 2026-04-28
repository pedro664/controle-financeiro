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
  const [expenseSeasonal, setExpenseSeasonal] = useState(null);
  const [incomeSeasonal, setIncomeSeasonal] = useState(null);
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
      api.get(`/analytics/seasonal?period=monthly&type=saida&start_date=${startStr}&end_date=${endStr}`),
      api.get(`/analytics/seasonal?period=monthly&type=entrada&start_date=${startStr}&end_date=${endStr}`),
    ])
      .then(([dashRes, expenseRes, incomeRes]) => {
        setData(dashRes);
        setExpenseSeasonal(expenseRes.data);
        setIncomeSeasonal(incomeRes.data);
      })
      .catch((e) => console.error("Dashboard error:", e))
      .finally(() => setLoading(false));
  }, [month]);

  if (loading || !data) return <div className="flex h-[60vh] items-center justify-center text-emeraldApp-700 dark:text-emeraldApp-50">Carregando dashboard...</div>;

  const { summary, category_breakdown = [], top_expenses = [], top_category } = data;
  const expensePeriods = expenseSeasonal?.periods || [];
  const incomePeriods = incomeSeasonal?.periods || [];

  // Alinha os períodos — usa os labels de despesas como referência
  const allLabels = [...new Set([...expensePeriods.map(p => p.label), ...incomePeriods.map(p => p.label)])].sort();

  const analyticsLine1 = allLabels.map(label => {
    const p = incomePeriods.find(x => x.label === label);
    return { label, value: p?.total || 0 };
  });
  const analyticsLine2 = allLabels.map(label => {
    const p = expensePeriods.find(x => x.label === label);
    return { label, value: p?.total || 0 };
  });

  const barData = expensePeriods.map(p => ({
    label: p.label,
    value: p.total,
  }));

  const lineData = expensePeriods.map(p => ({
    label: p.label,
    value: p.total,
  }));

  const pieData = category_breakdown.slice(0, 6).map((c) => ({
    label: c.name,
    value: c.total,
  }));

  const progressData = top_expenses.slice(0, 5).map(e => ({
    label: e.name.length > 26 ? e.name.slice(0, 26) + "..." : e.name,
    value: e.value,
  }));

  const minExpense = expensePeriods.length > 0 ? Math.min(...expensePeriods.map(p => p.total)) : 0;
  const maxExpense = expensePeriods.length > 0 ? Math.max(...expensePeriods.map(p => p.total)) : 0;
  const avgExpense = expensePeriods.length > 0 ? expensePeriods.reduce((s, p) => s + p.total, 0) / expensePeriods.length : 0;

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

      {/* Full-width Analytics — Receitas vs Despesas reais */}
      {allLabels.length > 0 && (
        <PremiumAnalyticsCard
          title="Receitas vs Despesas"
          subtitle="Comparativo mensal real"
          line1Data={analyticsLine1}
          line2Data={analyticsLine2}
          line1Label="Receitas"
          line2Label="Despesas"
        />
      )}

      {/* Full-width Bar Chart — apenas despesas reais */}
      {barData.length > 0 && (
        <PremiumBarCard
          title="Gastos por Período"
          subtitle="Total de despesas mensais"
          data={barData}
        />
      )}

      {/* Full-width Line Chart — tendência de gastos */}
      {lineData.length > 0 && (
        <PremiumLineCard
          title="Tendência de Gastos"
          subtitle="Evolução dos últimos meses"
          data={lineData}
          metric1={{ label: "Mínimo", value: minExpense }}
          metric2={{ label: "Média", value: avgExpense }}
          metric3={{ label: "Máximo", value: maxExpense }}
        />
      )}

      {/* Donut + Progress side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumDonutCard
          title="Gastos por Categoria"
          subtitle="Top categorias do mês"
          data={pieData}
        />
        <PremiumProgressCard
          title="Maiores Despesas"
          subtitle="Top 5 custos fixos do mês"
          data={progressData}
          total={summary.monthly_income || 1}
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
