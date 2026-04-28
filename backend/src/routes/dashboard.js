import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

export const dashboardRouter = Router();

// ── GET /api/dashboard?month=2026-04 ──────────────────────────────────
dashboardRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    // Get settings
    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    const monthlyIncome = settings?.monthly_income || 3600;

    // Get fixed costs
    const { data: fixedCosts } = await supabaseAdmin
      .from('fixed_costs')
      .select('*, categories!fixed_costs_category_id_fkey(id, name)')
      .eq('user_id', userId)
      .order('value', { ascending: false });

    // Get variable transactions for the month
    const [year, mon] = month.split('-').map(Number);
    const lastDay = new Date(year, mon, 0).getDate();
    const startDate = `${month}-01`;
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('*, categories!transactions_category_id_fkey(id, name)')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    // ── Calculations ────────────────────────────────────────────────
    const activeCosts = (fixedCosts || []).filter((c) => c.status !== 'cancelado');
    const paidCosts = activeCosts.filter((c) => c.status === 'ok');
    const pendingCosts = activeCosts.filter((c) => c.status !== 'ok');

    const totalFixedCosts = activeCosts.reduce((sum, c) => sum + Number(c.value || 0), 0);
    const totalPaid = paidCosts.reduce((sum, c) => sum + Number(c.value || 0), 0);
    const totalPending = pendingCosts.reduce((sum, c) => sum + Number(c.value || 0), 0);

    const variableExpenses = (transactions || []).filter((t) => t.type === 'saida');
    const variableIncome = (transactions || []).filter((t) => t.type === 'entrada');

    const totalVariableExpenses = variableExpenses.reduce((sum, t) => sum + Number(t.value || 0), 0);
    const totalVariableIncome = variableIncome.reduce((sum, t) => sum + Number(t.value || 0), 0);

    const freeBalance = monthlyIncome - totalFixedCosts - totalVariableExpenses + totalVariableIncome;

    // ── Group by category ───────────────────────────────────────────
    const allExpenses = [
      ...activeCosts.map((c) => ({
        category: c.categories?.name || 'Sem categoria',
        value: Number(c.value || 0),
      })),
      ...variableExpenses.map((t) => ({
        category: t.categories?.name || 'Sem categoria',
        value: Number(t.value || 0),
      })),
    ];

    const byCategory = allExpenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.value;
      return acc;
    }, {});

    const categoryBreakdown = Object.entries(byCategory)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const topCategory = categoryBreakdown[0] || null;

    // ── Top expenses ────────────────────────────────────────────────
    const topExpenses = [...activeCosts]
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        name: c.name,
        category: c.categories?.name || 'Sem categoria',
        value: Number(c.value),
        status: c.status,
      }));

    // ── Recent transactions ─────────────────────────────────────────
    const recentTransactions = (transactions || []).slice(0, 10).map((t) => ({
      id: t.id,
      date: t.date,
      description: t.description,
      category: t.categories?.name || 'Sem categoria',
      value: Number(t.value),
      type: t.type,
      status: t.status,
    }));

    res.json({
      month,
      summary: {
        monthly_income: monthlyIncome,
        free_balance: freeBalance,
        total_fixed_costs: totalFixedCosts,
        total_paid: totalPaid,
        total_pending: totalPending,
        total_variable_expenses: totalVariableExpenses,
        total_variable_income: totalVariableIncome,
      },
      category_breakdown: categoryBreakdown,
      top_category: topCategory,
      top_expenses: topExpenses,
      recent_transactions: recentTransactions,
      counts: {
        fixed_costs: (fixedCosts || []).length,
        transactions: (transactions || []).length,
      },
    });
  } catch (err) {
    next(err);
  }
});
