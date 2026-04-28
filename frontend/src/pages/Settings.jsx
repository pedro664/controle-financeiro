import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Forms";
import { Save, Check } from "lucide-react";

export function Settings() {
  const [settings, setSettings] = useState({ monthly_income: 0, currency: 'BRL', current_month: '2026-04' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data || {})).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', {
        monthly_income: Number(settings.monthly_income),
        currency: settings.currency,
        current_month: settings.current_month
      });
      setSettings(res.data || res);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert('Erro ao salvar.'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="p-8 text-emeraldApp-700">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">Configurações</h1>
        <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mt-1">Parâmetros base do sistema</p>
      </div>
      <Card>
        <CardHeader title="Parâmetros Base" description="Usados nos cálculos do Dashboard" />
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Renda Mensal (R$)" type="number" step="0.01" value={settings.monthly_income}
              onChange={(e) => setSettings({ ...settings, monthly_income: e.target.value })} required />
            <Select label="Moeda" value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              options={[{ value: 'BRL', label: 'Real (R$)' }, { value: 'USD', label: 'Dólar (US$)' }, { value: 'EUR', label: 'Euro (€)' }]} />
            <Input label="Mês Vigente" type="month" value={settings.current_month}
              onChange={(e) => setSettings({ ...settings, current_month: e.target.value })} required />
          </div>
          <div className="pt-4 border-t border-emeraldApp-100 dark:border-gray-700 flex justify-end">
            <Button type="submit" disabled={saving} variant={saved ? 'secondary' : 'primary'}>
              {saved ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}</>}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
