import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { formatCurrency, formatDate } from "../utils/formatters";
import { CreditCard, Calendar, CheckCircle2, Trash2, AlertCircle, FileText, ChevronDown, ChevronUp, Wallet, Clock } from "lucide-react";
import { PremiumStatCard } from "../components/premium";

export function CreditCardBills() {
  const [bills, setBills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailBill, setDetailBill] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchBills();
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchBills() {
    setLoading(true);
    try {
      const res = await api.get('/credit-card-bills');
      setBills(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id) {
    setDetailLoading(true);
    try {
      const res = await api.get(`/credit-card-bills/${id}`);
      setDetailBill(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handlePay(id) {
    try {
      await api.patch(`/credit-card-bills/${id}/pay`);
      setBills(bills.map(b => b.id === id ? { ...b, status: 'paga', total_paid: b.total_amount } : b));
      if (detailBill?.id === id) {
        setDetailBill({ ...detailBill, status: 'paga', total_paid: detailBill.total_amount });
      }
    } catch (err) {
      alert(err.message || 'Erro ao pagar fatura');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta fatura? As transações vinculadas precisam ser excluídas primeiro.')) return;
    try {
      await api.delete(`/credit-card-bills/${id}`);
      setBills(bills.filter(b => b.id !== id));
      if (detailBill?.id === id) setDetailBill(null);
    } catch (err) {
      alert(err.message || 'Erro ao excluir fatura');
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'paga': return 'success';
      case 'atrasada': return 'danger';
      default: return 'warning';
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case 'paga': return 'Paga';
      case 'atrasada': return 'Atrasada';
      default: return 'Aberta';
    }
  }

  const totalBills = bills.reduce((s, b) => s + (b.total_amount || 0), 0);
  const paidBills = bills.filter(b => b.status === 'paga').reduce((s, b) => s + (b.total_amount || 0), 0);
  const pendingBills = bills.filter(b => b.status !== 'paga').reduce((s, b) => s + (b.total_amount || 0), 0);

  if (loading) return <div className="p-8 text-emeraldApp-700 dark:text-emeraldApp-50">Carregando faturas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">Faturas de Cartão</h1>
          <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mt-1">Controle suas faturas e pagamentos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PremiumStatCard title="Total em Faturas" value={totalBills} icon={CreditCard} color="#F72585" />
        <PremiumStatCard title="Pago" value={paidBills} icon={CheckCircle2} color="#3EBB9E" />
        <PremiumStatCard title="Em Aberto" value={pendingBills} icon={Clock} color="#FFC300" />
      </div>

      {bills.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emeraldApp-100 dark:bg-gray-700 text-emeraldApp-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">Nenhuma fatura</h3>
            <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mt-1">Importe um PDF na página "Importar PDF" para criar uma fatura.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill) => (
            <Card key={bill.id} className="relative overflow-hidden group hover:shadow-soft transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emeraldApp-100 dark:bg-gray-700 text-emeraldApp-900 dark:text-emeraldApp-50">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emeraldApp-900 dark:text-emeraldApp-50">{bill.card_name}</h3>
                    <p className="text-xs text-emeraldApp-900/70 dark:text-emeraldApp-100/70">{bill.reference_month}</p>
                  </div>
                </div>
                <Badge variant={getStatusBadge(bill.status)}>{getStatusLabel(bill.status)}</Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Total da fatura</span>
                  <span className="font-bold text-lg text-emeraldApp-900 dark:text-emeraldApp-50">{formatCurrency(bill.total_amount)}</span>
                </div>
                {bill.total_paid > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Pago</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(bill.total_paid)}</span>
                  </div>
                )}
                {bill.due_date && (
                  <div className="flex items-center gap-2 text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80">
                    <Calendar className="w-4 h-4" />
                    Vencimento: {formatDate(bill.due_date)}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-emeraldApp-100 dark:border-gray-700">
                <Button variant="outline" className="flex-1 text-xs" onClick={() => openDetail(bill.id)}>
                  <FileText className="w-4 h-4" /> Detalhes
                </Button>
                {bill.status !== 'paga' && (
                  <Button variant="secondary" className="flex-1 text-xs" onClick={() => handlePay(bill.id)}>
                    <CheckCircle2 className="w-4 h-4" /> Pagar
                  </Button>
                )}
                <button onClick={() => handleDelete(bill.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!detailBill} onClose={() => setDetailBill(null)} title={`Fatura ${detailBill?.card_name}`}>
        {detailLoading ? (
          <div className="py-8 text-center text-emeraldApp-700">Carregando...</div>
        ) : detailBill ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-emeraldApp-50 dark:bg-gray-800 rounded-xl p-4">
              <div>
                <p className="text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Mês de referência</p>
                <p className="font-bold text-emeraldApp-900 dark:text-emeraldApp-50">{detailBill.reference_month}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Status</p>
                <Badge variant={getStatusBadge(detailBill.status)}>{getStatusLabel(detailBill.status)}</Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Total</p>
                <p className="font-bold text-red-600">{formatCurrency(detailBill.total_amount)}</p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[40vh] overflow-y-auto rounded-xl border border-emeraldApp-100 dark:border-gray-700">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                  <tr className="border-b border-emeraldApp-100 dark:border-gray-700">
                    <th className="py-3 px-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Data</th>
                    <th className="py-3 px-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Descrição</th>
                    <th className="py-3 px-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Categoria</th>
                    <th className="py-3 px-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emeraldApp-100 dark:divide-gray-700">
                  {(detailBill.transactions || []).map((tx) => (
                    <tr key={tx.id} className="hover:bg-emeraldApp-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-3">{formatDate(tx.date)}</td>
                      <td className="py-3 px-3 font-medium">{tx.description}</td>
                      <td className="py-3 px-3">
                        <select
                          value={tx.category_id || ''}
                          onChange={async (e) => {
                            const newCatId = e.target.value || null;
                            try {
                              await api.put(`/transactions/${tx.id}`, { category_id: newCatId });
                              setDetailBill(prev => ({
                                ...prev,
                                transactions: prev.transactions.map(t =>
                                  t.id === tx.id
                                    ? { ...t, category_id: newCatId, categories: categories.find(c => c.id === newCatId) || null }
                                    : t
                                ),
                              }));
                            } catch (err) {
                              alert(err.message || 'Erro ao atualizar categoria');
                            }
                          }}
                          className="w-[140px] rounded-lg border border-emeraldApp-200 dark:border-gray-600 px-2 py-1 text-xs bg-white dark:bg-gray-900 dark:text-white dark:[color-scheme:dark]"
                        >
                          <option value="">Sem categoria</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className={`py-3 px-3 text-right font-bold ${tx.type === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(tx.value)}
                      </td>
                    </tr>
                  ))}
                  {(detailBill.transactions || []).length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-emeraldApp-900/70 dark:text-emeraldApp-100/70">Nenhuma transação vinculada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setDetailBill(null)}>Fechar</Button>
              {detailBill.status !== 'paga' && (
                <Button onClick={() => handlePay(detailBill.id)}>
                  <CheckCircle2 className="w-4 h-4" /> Marcar como Paga
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
