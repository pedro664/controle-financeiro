import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardHeader } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { formatCurrency, getStatusColor, getStatusLabel } from "../utils/formatters";
import { Wallet, TrendingDown, Clock, CheckCircle2, AlertCircle, PieChart } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ['#00674F', '#3EBB9E', '#73E6CB', '#0A3C30', '#64748b', '#475569', '#1e293b'];

export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("2026-04");

  useEffect(() => {
    api.get(`/dashboard?month=${month}`)
      .then((res) => setData(res))
      .catch((e) => console.error("Dashboard error:", e))
      .finally(() => setLoading(false));
  }, [month]);

  if (loading || !data) return <div className="flex h-[60vh] items-center justify-center text-emeraldApp-700">Carregando dashboard...</div>;

  const { summary, category_breakdown = [], top_expenses = [], top_category } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">Visão Geral</h1>
          <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mt-1">Finanças de {month}</p>
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
          className="rounded-xl border border-emeraldApp-100 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-emeraldApp-900 dark:text-emeraldApp-50 shadow-sm dark:[color-scheme:dark] dark:placeholder:text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Saldo Livre" value={summary.free_balance} icon={Wallet} type="success" />
        <StatCard title="Renda Mensal" value={summary.monthly_income} icon={TrendingDown} />
        <StatCard title="Custos Fixos" value={summary.total_fixed_costs} icon={PieChart} />
        <StatCard title="Total Pago" value={summary.total_paid} icon={CheckCircle2} type="success" />
        <StatCard title="Total Pendente" value={summary.total_pending} icon={Clock} type="warning" />
        {top_category && <StatCard title="Maior Categoria" value={formatCurrency(top_category.total)} suffix={top_category.name} icon={AlertCircle} type="danger" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader title="Gastos por Categoria" />
          <div className="flex-1 min-h-[300px]">
            {category_breakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={category_breakdown} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="total" nameKey="name">
                      {category_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #E9FFF8', backgroundColor: '#fff', color: '#0A3C30', boxShadow: '0 10px 30px rgba(10,60,48,.08)' }} itemStyle={{ color: '#0A3C30' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </>
            ) : <div className="flex items-center justify-center h-full text-emeraldApp-900/70 dark:text-emeraldApp-100/70">Sem dados</div>}
          </div>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader title="Maiores Despesas" />
          <div className="flex-1 min-h-[300px]">
            {top_expenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top_expenses} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#E9FFF8" />
                  <XAxis type="number" tickFormatter={(v) => `R$${v}`} stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} width={120} />
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #E9FFF8', backgroundColor: '#fff', color: '#0A3C30' }} itemStyle={{ color: '#0A3C30' }} cursor={{ fill: '#F6FBF9' }} />
                  <Bar dataKey="value" fill="#3EBB9E" radius={[0, 4, 4, 0]} barSize={24}>
                    {top_expenses.map((e, i) => <Cell key={i} fill={e.status === 'ok' ? '#3EBB9E' : '#73E6CB'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-emeraldApp-900/70 dark:text-emeraldApp-100/70">Sem dados</div>}
          </div>
        </Card>
      </div>

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
