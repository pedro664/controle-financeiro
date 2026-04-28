import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { formatCurrency } from "../utils/formatters";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { BarChart3, Calendar, TrendingDown, TrendingUp, PieChart as PieIcon, Loader2, AlertTriangle } from "lucide-react";

const PERIOD_OPTIONS = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semesterly', label: 'Semestral' },
  { value: 'yearly', label: 'Anual' },
];

const TYPE_OPTIONS = [
  { value: 'saida', label: 'Gastos' },
  { value: 'entrada', label: 'Receitas' },
  { value: 'all', label: 'Todos' },
];

const COLORS = ['#00674F', '#3EBB9E', '#85E6C0', '#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4', '#134E4A', '#115E59'];

function getDefaultDates(period) {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case 'weekly': start.setDate(end.getDate() - 84); break;
    case 'monthly': start.setMonth(end.getMonth() - 11); break;
    case 'quarterly': start.setMonth(end.getMonth() - 11); break;
    case 'semesterly': start.setMonth(end.getMonth() - 11); break;
    case 'yearly': start.setFullYear(end.getFullYear() - 4); break;
    default: start.setMonth(end.getMonth() - 11);
  }
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function SeasonalBalance() {
  const [period, setPeriod] = useState('monthly');
  const [txType, setTxType] = useState('saida');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [projection, setProjection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projLoading, setProjLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const defaults = getDefaultDates(period);
    setStartDate(defaults.start);
    setEndDate(defaults.end);
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [seasonalRes, projRes] = await Promise.all([
        api.get('/analytics/seasonal', {
          params: { period, type: txType, start_date: startDate, end_date: endDate },
        }),
        api.get('/analytics/projection', { params: { months: 6 } }),
      ]);
      setData(seasonalRes.data);
      setProjection(projRes.data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) fetchData();
  }, []); // initial load

  const allCategories = useMemo(() => {
    if (!data?.periods) return [];
    const cats = new Set();
    data.periods.forEach(p => p.categories.forEach(c => cats.add(c.name)));
    return Array.from(cats);
  }, [data]);

  const barData = useMemo(() => {
    if (!data?.periods) return [];
    return data.periods.map(p => {
      const row = { label: p.label, total: p.total };
      allCategories.forEach(cat => {
        row[cat] = p.categories.find(c => c.name === cat)?.total || 0;
      });
      return row;
    });
  }, [data, allCategories]);

  const pieData = useMemo(() => {
    if (!data?.periods) return [];
    const totals = new Map();
    data.periods.forEach(p => {
      p.categories.forEach(c => {
        totals.set(c.name, (totals.get(c.name) || 0) + c.total);
      });
    });
    return Array.from(totals.entries())
      .map(([name, total]) => ({ name, total: Number(total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">Balanço Sazonal</h1>
        <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mt-1">Análise de gastos e receitas ao longo do tempo</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Período</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border border-emeraldApp-200 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white min-w-[130px] dark:[color-scheme:dark]"
            >
              {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Tipo</label>
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
              className="rounded-lg border border-emeraldApp-200 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white min-w-[130px] dark:[color-scheme:dark]"
            >
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">De</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-emeraldApp-200 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white dark:[color-scheme:dark] dark:placeholder:text-gray-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Até</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-emeraldApp-200 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white dark:[color-scheme:dark] dark:placeholder:text-gray-400"
            />
          </div>
          <Button onClick={fetchData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            Atualizar
          </Button>
        </div>
      </Card>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {!data && !loading && !error && (
        <div className="text-center py-12 text-emeraldApp-900/60 dark:text-emeraldApp-100/60">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Selecione o período e clique em Atualizar para visualizar o balanço.</p>
        </div>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emeraldApp-100 dark:bg-gray-700 text-emeraldApp-700 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60">Total no Período</p>
                  <p className="text-xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">{formatCurrency(data.summary.total_spent)}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emeraldApp-100 dark:bg-gray-700 text-emeraldApp-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60">Média por Período</p>
                  <p className="text-xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">{formatCurrency(data.summary.average_per_period)}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emeraldApp-100 dark:bg-gray-700 text-emeraldApp-700 flex items-center justify-center">
                  <PieIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60">Maior Categoria</p>
                  <p className="text-xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">{data.summary.top_category?.name || '-'}</p>
                  <p className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60">{formatCurrency(data.summary.top_category?.total || 0)}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emeraldApp-100 dark:bg-gray-700 text-emeraldApp-700 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60">Transações</p>
                  <p className="text-xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">{data.summary.transaction_count}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Area Chart */}
          <Card>
            <CardHeader title="Evolução ao Longo do Tempo" />
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.periods} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00674F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00674F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" tickFormatter={(v) => `R$${v}`} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#00674F" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Projection Chart */}
          {projection && (
            <Card>
              <CardHeader title="Projeção de Saldo (Próximos 6 meses)" />
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projection.projections} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" tickFormatter={(v) => `R$${v}`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="projected_balance" name="Saldo Projetado" stroke="#00674F" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="income" name="Renda" stroke="#3EBB9E" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="fixed" name="Custos Fixos" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {projection.projections.some(p => p.projected_balance <= 0) && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Atenção: em {projection.projections.find(p => p.projected_balance <= 0)?.label} seu saldo projetado ficará negativo.
                </div>
              )}
            </Card>
          )}

          {/* Stacked Bar Chart + Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader title="Gastos por Categoria e Período" />
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#6B7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" tickFormatter={(v) => `R$${v}`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {allCategories.slice(0, 8).map((cat, i) => (
                      <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i % COLORS.length]} radius={i === 0 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader title="Distribuição Total" />
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="total"
                      nameKey="name"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Periods Table */}
          <Card>
            <CardHeader title="Detalhamento por Período" />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emeraldApp-100 dark:border-gray-700">
                    <th className="py-3 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Período</th>
                    <th className="py-3 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-right">Total</th>
                    <th className="py-3 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Principais Categorias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emeraldApp-100 dark:divide-gray-700">
                  {data.periods.map((p) => (
                    <tr key={p.label} className="hover:bg-emeraldApp-50/50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-medium text-emeraldApp-900 dark:text-emeraldApp-50">{p.label}</td>
                      <td className="py-3 px-4 text-right font-bold text-emeraldApp-900 dark:text-emeraldApp-50">{formatCurrency(p.total)}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.categories.slice(0, 3).map(c => (
                            <span key={c.name} className="inline-flex items-center px-2 py-0.5 rounded-md bg-emeraldApp-100 dark:bg-gray-700 text-emeraldApp-800 text-xs">
                              {c.name}: {formatCurrency(c.total)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
