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
  PremiumCategoryCard,
} from "../components/premium";
import { Wallet, TrendingDown, Clock, CheckCircle2, AlertCircle, PieChart, CreditCard } from "lucide-react";

export function Dashboard() {
  const [data, setData] = useState(null);
  const [billsData, setBillsData] = useState(null);
  const [fixedCostsData, setFixedCostsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("2026-04");

  useEffect(() => {
    Promise.all([
      api.get(`/dashboard?month=${month}`),
      api.get(`/analytics/bills`),
      api.get(`/analytics/fixed-costs`),
    ])
      .then(([dashRes, billsRes, fixedRes]) => {
        setData(dashRes);
        setBillsData(billsRes.data);
        setFixedCostsData(fixedRes.data);
      })
      .catch((e) => console.error("Dashboard error:", e))
      .finally(() => setLoading(false));
  }, [month]);

  if (loading || !data) return <div className="flex h-[60vh] items-center justify-center text-emeraldApp-700 dark:text-emeraldApp-50">Carregando dashboard...</div>;

  const { summary, category_breakdown = [], top_expenses = [], top_category, upcoming_payments = [] } = data;
  const billPeriods = billsData?.periods || [];
  const fixedCosts = fixedCostsData || { total: 0, total_paid: 0, total_pending: 0, by_category: [] };

  // Dados das faturas do cartão (por mês de referência da fatura)
  const barData = billPeriods.map(p => ({
    label: p.label,
    value: p.total,
  }));

  const lineData = billPeriods.map(p => ({
    label: p.label,
    value: p.total,
  }));

  // Dados dos custos fixos — TODAS as categorias para o donut calcular o total certo
  const fixedPieData = (fixedCosts.by_category || []).map((c) => ({
    label: c.name,
    value: c.total,
  }));

  const fixedProgressData = (fixedCosts.by_category || []).slice(0, 5).map(c => ({
    label: c.name,
    value: c.total,
  }));

  const minBill = billPeriods.length > 0 ? Math.min(...billPeriods.map(p => p.total)) : 0;
  const maxBill = billPeriods.length > 0 ? Math.max(...billPeriods.map(p => p.total)) : 0;
  const avgBill = billPeriods.length > 0 ? billPeriods.reduce((s, p) => s + p.total, 0) / billPeriods.length : 0;

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Custos Fixos/Mês" value={fixedCosts.total} icon={PieChart} type="warning" />
        <StatCard title="Fatura Cartão" value={summary.total_variable_expenses} icon={CreditCard} type="danger" />
        <StatCard title="Saldo Livre" value={summary.free_balance} icon={Wallet} type={summary.free_balance >= 0 ? "success" : "danger"} />
        <StatCard title="Maior Categoria" value={formatCurrency(top_category?.total || 0)} suffix={top_category?.name || "—"} icon={AlertCircle} type="danger" />
      </div>

      {/* Row 1: Faturas do cartão (BarChart) + Custos fixos (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {barData.length > 0 && (
          <PremiumBarCard
            title="Faturas do Cartão"
            subtitle="Valor total das faturas por mês de referência"
            data={barData}
          />
        )}
        <PremiumDonutCard
          title="Custos Fixos por Categoria"
          subtitle="Distribuição mensal dos custos fixos"
          data={fixedPieData}
        />
      </div>

      {/* Row 2: Tendência das faturas (LineChart) + Custos fixos detalhados (CategoryCard) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lineData.length > 0 && (
          <PremiumLineCard
            title="Tendência das Faturas"
            subtitle="Evolução do valor das faturas"
            data={lineData}
            metric1={{ label: "Mínima", value: minBill }}
            metric2={{ label: "Média", value: avgBill }}
            metric3={{ label: "Máxima", value: maxBill }}
          />
        )}
        <PremiumCategoryCard
          title="Custos Fixos por Categoria"
          subtitle="Comparativo com limite mensal"
          data={category_breakdown}
        />
      </div>

      {/* Row 3: Top categorias fixas + Próximos pagamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumProgressCard
          title="Maiores Custos Fixos"
          subtitle="Top categorias de despesa fixa"
          data={fixedProgressData}
          total={fixedCosts.total || 1}
        />

        {/* Upcoming payments */}
        <Card>
          <CardHeader title="Pagamentos Pendentes" />
          {upcoming_payments.length === 0 ? (
            <div className="py-8 text-center text-emeraldApp-900/60 dark:text-emeraldApp-100/60 text-sm">
              Nenhum pagamento pendente
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {upcoming_payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-emeraldApp-50/70 dark:hover:bg-gray-800/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.status === 'ok' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                      {p.due_day || '—'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emeraldApp-900 dark:text-emeraldApp-50">{p.name}</p>
                      <p className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60">{p.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={p.status === 'ok' ? 'success' : 'warning'}>
                      {p.status === 'ok' ? 'Pago' : 'Pendente'}
                    </Badge>
                    <span className="text-sm font-bold text-emeraldApp-900 dark:text-emeraldApp-50">{formatCurrency(p.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Table: Top despesas fixas */}
      <Card>
        <CardHeader title="Top 10 Despesas Fixas" />
        <table className="w-full text-left">
          <thead><tr className="border-b border-emeraldApp-100 dark:border-gray-700">
            <th className="pb-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Despesa</th>
            <th className="pb-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Categoria</th>
            <th className="pb-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-right">Valor</th>
            <th className="pb-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-center">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-emeraldApp-100 dark:divide-gray-700">
            {top_expenses.slice(0, 10).map((ex) => (
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
