import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Forms";
import { formatCurrency, getStatusColor, getStatusLabel } from "../utils/formatters";
import { Plus, Edit2, Trash2, Check, Clock, TrendingDown, CheckCircle2, AlertCircle } from "lucide-react";
import { PremiumStatCard, PremiumProgressCard } from "../components/premium";

const emptyForm = { name: '', value: '', category_id: '', status: 'pendente', due_day: '' };

export function FixedCosts() {
  const [costs, setCosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    Promise.all([
      api.get('/fixed-costs?limit=100'),
      api.get('/categories')
    ]).then(([costsRes, catsRes]) => {
      setCosts(costsRes.data || []);
      setCategories(catsRes.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(cost) {
    setEditing(cost);
    setForm({ name: cost.name, value: cost.value, category_id: cost.category_id, status: cost.status, due_day: cost.due_day || '' });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, value: Number(form.value), due_day: form.due_day ? Number(form.due_day) : null };
    try {
      if (editing) {
        const res = await api.put(`/fixed-costs/${editing.id}`, payload);
        setCosts(costs.map(c => c.id === editing.id ? res.data : c));
      } else {
        const res = await api.post('/fixed-costs', payload);
        setCosts([res.data, ...costs]);
      }
      setModalOpen(false);
    } catch (err) { alert(err.message); }
  }

  async function handleStatusChange(id, currentStatus) {
    const newStatus = currentStatus === 'ok' ? 'pendente' : 'ok';
    try {
      const res = await api.patch(`/fixed-costs/${id}/status`, { status: newStatus });
      setCosts(costs.map(c => c.id === id ? res.data : c));
    } catch (err) { console.error(err); }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este custo fixo?')) return;
    try { await api.delete(`/fixed-costs/${id}`); setCosts(costs.filter(c => c.id !== id)); }
    catch (err) { alert(err.message); }
  }

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const statusOptions = [{ value: 'ok', label: 'Pago' }, { value: 'pendente', label: 'Pendente' }, { value: 'atrasado', label: 'Atrasado' }, { value: 'cancelado', label: 'Cancelado' }];

  if (loading) return <div className="p-8 text-emeraldApp-700">Carregando...</div>;

  const totalCosts = costs.reduce((s, c) => s + (c.value || 0), 0);
  const paidCosts = costs.filter(c => c.status === 'ok').reduce((s, c) => s + (c.value || 0), 0);
  const pendingCosts = costs.filter(c => c.status === 'pendente').reduce((s, c) => s + (c.value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">Custos Fixos</h1>
          <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mt-1">Despesas recorrentes</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-5 h-5" /> Novo Custo</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PremiumStatCard title="Total" value={totalCosts} icon={TrendingDown} color="#F72585" />
        <PremiumStatCard title="Pago" value={paidCosts} icon={CheckCircle2} color="#3EBB9E" />
        <PremiumStatCard title="Pendente" value={pendingCosts} icon={AlertCircle} color="#FFC300" />
      </div>

      <Card className="dark:border-gray-800 dark:bg-[#0A0D10]">
        <CardHeader title="Todos os Custos Fixos" />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-emeraldApp-100 dark:border-gray-700 bg-emeraldApp-50/50 dark:bg-gray-800/50">
              <th className="py-4 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Despesa</th>
              <th className="py-4 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Categoria</th>
              <th className="py-4 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Vencimento</th>
              <th className="py-4 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-right">Valor</th>
              <th className="py-4 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-center">Status</th>
              <th className="py-4 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-right">Ações</th>
            </tr></thead>
            <tbody className="divide-y divide-emeraldApp-100 dark:divide-gray-700">
              {costs.map((cost) => (
                <tr key={cost.id} className="group hover:bg-emeraldApp-50/70 dark:hover:bg-gray-800/70 transition-colors">
                  <td className="py-4 px-4 font-medium">{cost.name}</td>
                  <td className="py-4 px-4 text-emeraldApp-900/75 dark:text-emeraldApp-100/80">
                    <span className="bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-gray-200 px-2 py-1 rounded-md text-xs">{cost.categories?.name}</span>
                  </td>
                  <td className="py-4 px-4 text-emeraldApp-900/75 dark:text-emeraldApp-100/80">{cost.due_day ? `Dia ${cost.due_day}` : '—'}</td>
                  <td className="py-4 px-4 font-bold text-right">{formatCurrency(cost.value)}</td>
                  <td className="py-4 px-4 text-center">
                    <button onClick={() => handleStatusChange(cost.id, cost.status)} className="hover:scale-105 transition-transform">
                      <Badge variant={getStatusColor(cost.status)}>{getStatusLabel(cost.status)}</Badge>
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleStatusChange(cost.id, cost.status)}
                        className={`p-2 rounded-lg transition-colors ${cost.status === 'ok' ? 'bg-yellow-100 text-yellow-700' : 'bg-emeraldApp-100 dark:bg-gray-700 text-emeraldApp-700'}`}>
                        {cost.status === 'ok' ? <Clock className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openEdit(cost)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(cost.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {costs.length === 0 && <div className="text-center py-10 text-emeraldApp-900/70 dark:text-emeraldApp-100/70">Nenhum custo fixo.</div>}
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Custo Fixo' : 'Novo Custo Fixo'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Valor (R$)" type="number" step="0.01" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required />
          <Select label="Categoria" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} options={catOptions} required />
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={statusOptions} />
          <Input label="Dia de Vencimento" type="number" min="1" max="31" value={form.due_day} onChange={e => setForm({ ...form, due_day: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
