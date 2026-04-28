import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Forms";
import { formatCurrency } from "../utils/formatters";
import { Plus, Edit2, Trash2, Tags } from "lucide-react";

const emptyForm = { name: '', type: 'saida', monthly_limit: '' };

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(cat) {
    setEditing(cat);
    setForm({ name: cat.name, type: cat.type, monthly_limit: cat.monthly_limit || '' });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, monthly_limit: form.monthly_limit ? Number(form.monthly_limit) : null };
    try {
      if (editing) {
        const res = await api.put(`/categories/${editing.id}`, payload);
        setCategories(categories.map(c => c.id === editing.id ? res.data : c));
      } else {
        const res = await api.post('/categories', payload);
        setCategories([...categories, res.data]);
      }
      setModalOpen(false);
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir categoria? Falhará se houver itens vinculados.')) return;
    try { await api.delete(`/categories/${id}`); setCategories(categories.filter(c => c.id !== id)); }
    catch (err) { alert(err.message); }
  }

  const typeOptions = [{ value: 'saida', label: 'Saída' }, { value: 'entrada', label: 'Entrada' }];

  if (loading) return <div className="p-8 text-emeraldApp-700">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">Categorias</h1>
          <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mt-1">Classificação de gastos</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-5 h-5" /> Nova Categoria</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Card key={cat.id} className="group relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${cat.type === 'saida' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-emeraldApp-900 dark:text-emeraldApp-50 text-lg">{cat.name}</h3>
                <span className="text-xs font-semibold uppercase text-emeraldApp-900/70 dark:text-emeraldApp-100/70">{cat.type}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-emeraldApp-100 dark:border-gray-700">
              <p className="text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mb-1">Limite Mensal</p>
              <p className="font-bold text-lg">{cat.monthly_limit ? formatCurrency(cat.monthly_limit) : 'Sem limite'}</p>
            </div>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Categoria' : 'Nova Categoria'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Select label="Tipo" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} options={typeOptions} />
          <Input label="Limite Mensal (R$) - Opcional" type="number" step="0.01" value={form.monthly_limit} onChange={e => setForm({ ...form, monthly_limit: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
