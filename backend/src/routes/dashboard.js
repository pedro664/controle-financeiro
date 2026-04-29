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

    // Get categories with limits
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('id, name, monthly_limit')
      .eq('user_id', userId);

    const categoryMap = new Map((categories || []).map((c) => [c.id, c]));

    // Get fixed costs
    const { data: fixedCosts } = await supabaseAdmin
      .from('fixed_costs')
      .select('*')
      .eq('user_id', userId)
      .order('value', { ascending: false });

    // Get variable transactions for the month
    const [year, mon] = month.split('-').map(Number);
    const lastDay = new Date(year, mon, 0).getDate();
    const startDate = `${month}-01`;
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    // ── Calculations ────────────────────────────────────────────────
    const activeCosts = (fixedCosts || []).filter((c) => c.status !== 'cancelado');
    const paidCosts = activeCosts.filter((c) => c.status === 'ok');
    const pendingCosts = activeCosts.filter((c) => c.status !== 'ok');

    const totalFixedCosts = activeCosts.reduce((sum, c) => sum + Number(c.value || 0), 0);
    const totalPaidFixed = paidCosts.reduce((sum, c) => sum + Number(c.value || 0), 0);
    const totalPendingFixed = pendingCosts.reduce((sum, c) => sum + Number(c.value || 0), 0);

    const variableExpenses = (transactions || []).filter((t) => t.type === 'saida');
    const totalVariableExpenses = variableExpenses.reduce((sum, t) => sum + Number(t.value || 0), 0);

    const totalSpent = totalFixedCosts + totalVariableExpenses;
    const totalPaid = totalPaidFixed;
    const totalPending = totalPendingFixed + totalVariableExpenses;

    const freeBalance = monthlyIncome - totalSpent;

    // ── Category breakdown with limits and status ────────────────────
    const categoryStats = new Map();

    // Initialize with all categories
    for (const cat of categories || []) {
      categoryStats.set(cat.name, {
        name: cat.name,
        total: 0,
        paid: 0,
        pending: 0,
        limit: Number(cat.monthly_limit || 0),
      });
    }

    // Add fixed costs
    for (const c of activeCosts) {
      const catName = categoryMap.get(c.category_id)?.name || 'Sem categoria';
      const stat = categoryStats.get(catName) || { name: catName, total: 0, paid: 0, pending: 0, limit: 0 };
      const val = Number(c.value || 0);
      stat.total += val;
      if (c.status === 'ok') stat.paid += val;
      else stat.pending += val;
      categoryStats.set(catName, stat);
    }

    // Add variable expenses
    for (const t of variableExpenses) {
      const catName = categoryMap.get(t.category_id)?.name || 'Sem categoria';
      const stat = categoryStats.get(catName) || { name: catName, total: 0, paid: 0, pending: 0, limit: 0 };
      const val = Number(t.value || 0);
      stat.total += val;
      stat.pending += val; // variable expenses are pending by default
      categoryStats.set(catName, stat);
    }

    const categoryBreakdown = Array.from(categoryStats.values())
      .map((c) => ({
        name: c.name,
        total: c.total,
        paid: c.paid,
        pending: c.pending,
        limit: c.limit,
        percent_of_limit: c.limit > 0 ? Math.round((c.total / c.limit) * 100) : 0,
      }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);

    const topCategory = categoryBreakdown[0] || null;

    // ── Top expenses (all expenses) ─────────────────────────────────
    const allExpensesList = [
      ...activeCosts.map((c) => ({
        id: c.id,
        name: c.name,
        category: categoryMap.get(c.category_id)?.name || 'Sem categoria',
        value: Number(c.value),
        status: c.status,
        type: 'fixed',
      })),
      ...variableExpenses.map((t) => ({
        id: t.id,
        name: t.description,
        category: categoryMap.get(t.category_id)?.name || 'Sem categoria',
        value: Number(t.value),
        status: t.status,
        type: 'variable',
      })),
    ].sort((a, b) => b.value - a.value);

    const topExpenses = allExpensesList.slice(0, 10);

    // ── Upcoming payments (pending fixed costs) ─────────────────────
    const upcomingPayments = pendingCosts
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map((c) => ({
        id: c.id,
        name: c.name,
        category: categoryMap.get(c.category_id)?.name || 'Sem categoria',
        value: Number(c.value),
        due_day: c.due_day,
        status: c.status,
      }));

    // ── Recent transactions ─────────────────────────────────────────
    const recentTransactions = (transactions || []).slice(0, 10).map((t) => ({
      id: t.id,
      date: t.date,
      description: t.description,
      category: categoryMap.get(t.category_id)?.name || 'Sem categoria',
      value: Number(t.value),
      type: t.type,
      status: t.status,
    }));

    res.json({
      month,
      summary: {
        monthly_income: monthlyIncome,
        free_balance: freeBalance,
        total_spent: totalSpent,
        total_fixed_costs: totalFixedCosts,
        total_variable_expenses: totalVariableExpenses,
        total_paid: totalPaid,
        total_pending: totalPending,
      },
      category_breakdown: categoryBreakdown,
      top_category: topCategory,
      top_expenses: topExpenses,
      upcoming_payments: upcomingPayments,
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
