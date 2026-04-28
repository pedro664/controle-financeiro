import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Forms";
import { formatCurrency } from "../utils/formatters";
import { Wallet, Plus, Pencil, Trash2, Loader2, Landmark, CreditCard, PiggyBank, Banknote, X } from "lucide-react";

const TYPE_OPTIONS = [
  { value: 'corrente', label: 'Conta Corrente', icon: Landmark },
  { value: 'poupanca', label: 'Poupança', icon: PiggyBank },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: CreditCard },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: CreditCard },
  { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { value: 'outro', label: 'Outro', icon: Wallet },
];

const TYPE_MAP = Object.fromEntries(TYPE_OPTIONS.map(o => [o.value, o]));

export function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'corrente', bank_name: '', balance: 0, color: '#00674F' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setLoading(true);
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openModal(account = null) {
    setEditing(account);
    setForm(account || { name: '', type: 'corrente', bank_name: '', balance: 0, color: '#00674F' });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/accounts/${editing.id}`, form);
      } else {
        await api.post('/accounts', form);
      }
      setModalOpen(false);
      fetchAccounts();
    } catch (err) {
      alert(err.message || 'Erro ao salvar conta');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Desativar esta conta?')) return;
    try {
      await api.delete(`/accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      alert(err.message || 'Erro ao desativar conta');
    }
  }

  if (loading) return <div className="p-8 text-emeraldApp-700">Carregando contas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">Contas Bancárias</h1>
          <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mt-1">Gerencie suas contas, cartões e carteiras</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4" /> Nova Conta
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emeraldApp-100 dark:bg-gray-700 text-emeraldApp-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">Nenhuma conta</h3>
            <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mt-1">Cadastre suas contas bancárias e cartões.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => {
            const TypeIcon = TYPE_MAP[acc.type]?.icon || Wallet;
            return (
              <Card key={acc.id} className="relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl text-white" style={{ backgroundColor: acc.color }}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emeraldApp-900 dark:text-emeraldApp-50">{acc.name}</h3>
                      <p className="text-xs text-emeraldApp-900/70 dark:text-emeraldApp-100/70">{acc.bank_name || TYPE_MAP[acc.type]?.label}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Saldo</p>
                  <p className="font-bold text-2xl text-emeraldApp-900 dark:text-emeraldApp-50">{formatCurrency(acc.balance)}</p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-emeraldApp-100 dark:border-gray-700">
                  <Button variant="outline" className="flex-1 text-xs" onClick={() => openModal(acc)}>
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </Button>
                  <button onClick={() => handleDelete(acc.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Conta' : 'Nova Conta'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Nome</label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Nubank" />
          </div>
          <div>
            <label className="text-xs font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Tipo</label>
            <Select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              options={TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Banco / Instituição</label>
            <Input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="Ex: Nu Pagamentos" />
          </div>
          <div>
            <label className="text-xs font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Saldo Inicial</label>
            <Input type="number" step="0.01" value={form.balance} onChange={e => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Cor</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded-lg border border-emeraldApp-200 dark:border-gray-600 cursor-pointer dark:bg-gray-800 dark:text-white" />
              <span className="text-sm text-emeraldApp-900/70 dark:text-emeraldApp-100/70">{form.color}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.name}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
