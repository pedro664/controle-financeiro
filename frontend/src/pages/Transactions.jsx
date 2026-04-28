import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Forms";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "../utils/formatters";
import { Plus, Edit2, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react";

const emptyForm = { date: '', description: '', value: '', type: 'saida', category_id: '', status: 'pendente', origin: 'manual' };

export function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("2026-04");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/transactions?limit=100&month=${month}`),
      api.get('/categories')
    ]).then(([txRes, catsRes]) => {
      setTransactions(txRes.data || []);
      setCategories(catsRes.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [month]);

  function openCreate() { setEditing(null); setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] }); setModalOpen(true); }
  function openEdit(tx) {
    setEditing(tx);
    setForm({ date: tx.date, description: tx.description, value: tx.value, type: tx.type, category_id: tx.category_id || '', status: tx.status, origin: tx.origin });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, value: Number(form.value) };
    try {
      if (editing) {
        const res = await api.put(`/transactions/${editing.id}`, payload);
        setTransactions(transactions.map(t => t.id === editing.id ? res.data : t));
      } else {
        const res = await api.post('/transactions', payload);
        setTransactions([res.data, ...transactions]);
      }
      setModalOpen(false);
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta transação?')) return;
    try { await api.delete(`/transactions/${id}`); setTransactions(transactions.filter(t => t.id !== id)); }
    catch (err) { alert(err.message); }
  }

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const typeOptions = [{ value: 'saida', label: 'Saída (Gasto)' }, { value: 'entrada', label: 'Entrada (Receita)' }];
  const statusOptions = [{ value: 'pendente', label: 'Pendente' }, { value: 'ok', label: 'Pago' }, { value: 'revisar', label: 'Revisar' }];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">Transações Variáveis</h1>
          <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mt-1">Gastos extras e recebimentos</p>
        </div>
        <div className="flex gap-4">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-emeraldApp-100 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-emeraldApp-900 dark:text-emeraldApp-50 shadow-sm dark:[color-scheme:dark] dark:placeholder:text-gray-400" />
          <Button onClick={openCreate}><Plus className="w-5 h-5" /> Lançamento</Button>
        </div>
      </div>

      <Card>
        <CardHeader title={`Transações de ${formatDate(month)}`} />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-emeraldApp-100 dark:border-gray-700 bg-emeraldApp-50/50 dark:bg-gray-800/50">
              <th className="py-4 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 w-32">Data</th>
              <th className="py-4 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Descrição</th>
              <th className="py-4 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Categoria</th>
              <th className="py-4 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-right">Valor</th>
              <th className="py-4 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-center">Status</th>
              <th className="py-4 px-4 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-right">Ações</th>
            </tr></thead>
            <tbody className="divide-y divide-emeraldApp-100 dark:divide-gray-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-emeraldApp-50/70 dark:hover:bg-gray-800/70 transition-colors">
                  <td className="py-4 px-4 text-emeraldApp-900/90 dark:text-emeraldApp-50/90">{formatDate(tx.date)}</td>
                  <td className="py-4 px-4 font-medium">
                    <span className="flex items-center gap-2">
                      {tx.type === 'entrada' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                      {tx.description}
                    </span>
                  </td>
                  <td className="py-4 px-4"><span className="bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-gray-200 px-2 py-1 rounded-md text-xs">{tx.categories?.name || '—'}</span></td>
                  <td className={`py-4 px-4 font-bold text-right ${tx.type === 'entrada' ? 'text-emerald-600' : ''}`}>
                    {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(tx.value)}
                  </td>
                  <td className="py-4 px-4 text-center"><Badge variant={getStatusColor(tx.status)}>{getStatusLabel(tx.status)}</Badge></td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(tx)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(tx.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && transactions.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-emeraldApp-100 dark:bg-gray-700 text-emeraldApp-700 rounded-full flex items-center justify-center mx-auto mb-4"><Wallet className="w-8 h-8" /></div>
              <h3 className="text-lg font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">Nenhuma transação</h3>
              <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mt-1">Nenhum lançamento neste mês.</p>
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Transação' : 'Novo Lançamento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Data" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
          <Input label="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          <Input label="Valor (R$)" type="number" step="0.01" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required />
          <Select label="Tipo" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} options={typeOptions} />
          <Select label="Categoria" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} options={catOptions} />
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={statusOptions} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
