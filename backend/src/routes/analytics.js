import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

export const analyticsRouter = Router();

// ── Helpers ───────────────────────────────────────────────────────────
function getPeriodLabel(date, period) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const w = getWeekNumber(date);

  switch (period) {
    case 'weekly':   return `${y}-W${String(w).padStart(2, '0')}`;
    case 'monthly':  return `${y}-${m}`;
    case 'quarterly':return `${y}-Q${Math.ceil((date.getMonth() + 1) / 3)}`;
    case 'semesterly':return `${y}-S${date.getMonth() < 6 ? 1 : 2}`;
    case 'yearly':   return `${y}`;
    default:         return `${y}-${m}`;
  }
}

function getWeekNumber(date) {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
}

function parsePeriodLabel(label, period) {
  if (period === 'yearly') {
    const year = parseInt(label, 10);
    return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
  }
  if (period === 'semesterly') {
    const [year, s] = label.split('-S');
    const y = parseInt(year, 10);
    const sem = parseInt(s, 10);
    return { start: new Date(y, (sem - 1) * 6, 1), end: new Date(y, sem * 6, 0) };
  }
  if (period === 'quarterly') {
    const [year, q] = label.split('-Q');
    const y = parseInt(year, 10);
    const quarter = parseInt(q, 10);
    return { start: new Date(y, (quarter - 1) * 3, 1), end: new Date(y, quarter * 3, 0) };
  }
  if (period === 'monthly') {
    const [year, month] = label.split('-');
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    return { start: new Date(y, m - 1, 1), end: new Date(y, m, 0) };
  }
  if (period === 'weekly') {
    const [year, wk] = label.split('-W');
    const y = parseInt(year, 10);
    const w = parseInt(wk, 10);
    const jan1 = new Date(Date.UTC(y, 0, 1));
    const jan1Day = jan1.getUTCDay() || 7;
    const firstThu = new Date(Date.UTC(y, 0, 1 + (4 - jan1Day)));
    const start = new Date(firstThu.getTime() + (w - 1) * 7 * 86400000);
    const end = new Date(start.getTime() + 6 * 86400000);
    return { start, end };
  }
  return { start: new Date(0), end: new Date(0) };
}

function getDefaultDateRange(period) {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case 'weekly':    start.setDate(end.getDate() - 84); break;
    case 'monthly':   start.setMonth(end.getMonth() - 11); break;
    case 'quarterly': start.setMonth(end.getMonth() - 11); break;
    case 'semesterly':start.setMonth(end.getMonth() - 11); break;
    case 'yearly':    start.setFullYear(end.getFullYear() - 4); break;
    default:          start.setMonth(end.getMonth() - 11);
  }
  return { start, end };
}

// ── GET /api/analytics/seasonal ───────────────────────────────────────
analyticsRouter.get('/seasonal', async (req, res, next) => {
  try {
    const userId = req.userId;
    const period = req.query.period || 'monthly';
    const allowedPeriods = ['weekly', 'monthly', 'quarterly', 'semesterly', 'yearly'];
    if (!allowedPeriods.includes(period)) {
      throw new AppError('Período inválido. Use: weekly, monthly, quarterly, semesterly, yearly', 400);
    }

    const txType = req.query.type || 'saida';
    if (!['entrada', 'saida', 'all'].includes(txType)) {
      throw new AppError('Tipo inválido. Use: entrada, saida, all', 400);
    }

    let startDate, endDate;
    if (req.query.start_date && req.query.end_date) {
      startDate = new Date(req.query.start_date);
      endDate = new Date(req.query.end_date);
      if (isNaN(startDate) || isNaN(endDate)) {
        throw new AppError('Datas inválidas', 400);
      }
    } else {
      ({ start: startDate, end: endDate } = getDefaultDateRange(period));
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Fetch transactions in range (faturas do cartão — NÃO misturar com custos fixos)
    let query = supabaseAdmin
      .from('transactions')
      .select('date, value, type, category_id, categories!transactions_category_id_fkey(id, name)')
      .gte('date', startStr)
      .lte('date', endStr)
      .eq('user_id', userId);

    if (txType !== 'all') {
      query = query.eq('type', txType);
    }

    const { data: txs, error } = await query;
    if (error) throw error;

    // Aggregate by period and category
    const periodMap = new Map();
    const categoryTotals = new Map();
    let grandTotal = 0;

    for (const tx of (txs || [])) {
      const d = new Date(tx.date);
      const label = getPeriodLabel(d, period);
      const catName = tx.categories?.name || 'Sem categoria';
      const val = Number(tx.value) || 0;

      grandTotal += val;
      categoryTotals.set(catName, (categoryTotals.get(catName) || 0) + val);

      if (!periodMap.has(label)) {
        periodMap.set(label, { label, total: 0, categories: new Map() });
      }
      const p = periodMap.get(label);
      p.total += val;
      p.categories.set(catName, (p.categories.get(catName) || 0) + val);
    }

    // Convert to sorted array
    const periods = Array.from(periodMap.values())
      .map(p => ({
        label: p.label,
        total: Number(p.total.toFixed(2)),
        categories: Array.from(p.categories.entries())
          .map(([name, total]) => ({ name, total: Number(total.toFixed(2)) }))
          .sort((a, b) => b.total - a.total),
      }))
      .sort((a, b) => {
        const pa = parsePeriodLabel(a.label, period);
        const pb = parsePeriodLabel(b.label, period);
        return pa.start - pb.start;
      });

    const summary = {
      total_spent: Number(grandTotal.toFixed(2)),
      average_per_period: periods.length > 0 ? Number((grandTotal / periods.length).toFixed(2)) : 0,
      top_category: Array.from(categoryTotals.entries())
        .sort((a, b) => b[1] - a[1])[0] || ['', 0],
      periods_count: periods.length,
      transaction_count: txs?.length || 0,
    };

    if (summary.top_category[0]) {
      summary.top_category = { name: summary.top_category[0], total: Number(summary.top_category[1].toFixed(2)) };
    }

    res.json({
      data: {
        periods,
        summary,
        meta: { period, start_date: startStr, end_date: endStr, type: txType },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/analytics/fixed-costs ────────────────────────────────────
// Retorna o total mensal de custos fixos por categoria (separado das faturas)
analyticsRouter.get('/fixed-costs', async (req, res, next) => {
  try {
    const userId = req.userId;

    const { data: fixedCosts } = await supabaseAdmin
      .from('fixed_costs')
      .select('value, status, category_id, categories!fixed_costs_category_id_fkey(id, name)')
      .eq('user_id', userId)
      .neq('status', 'cancelado');

    const byCategory = new Map();
    let total = 0;
    let totalPaid = 0;
    let totalPending = 0;

    for (const c of (fixedCosts || [])) {
      const val = Number(c.value) || 0;
      const catName = c.categories?.name || 'Sem categoria';
      total += val;
      if (c.status === 'ok') totalPaid += val;
      else totalPending += val;

      const current = byCategory.get(catName) || { name: catName, total: 0, paid: 0, pending: 0 };
      current.total += val;
      if (c.status === 'ok') current.paid += val;
      else current.pending += val;
      byCategory.set(catName, current);
    }

    res.json({
      data: {
        total: Number(total.toFixed(2)),
        total_paid: Number(totalPaid.toFixed(2)),
        total_pending: Number(totalPending.toFixed(2)),
        count: (fixedCosts || []).length,
        by_category: Array.from(byCategory.values()).sort((a, b) => b.total - a.total),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/analytics/bills ──────────────────────────────────────────
// Retorna faturas de cartão agrupadas por mês de referência
analyticsRouter.get('/bills', async (req, res, next) => {
  try {
    const userId = req.userId;

    const { data: bills } = await supabaseAdmin
      .from('credit_card_bills')
      .select('reference_month, total_amount, total_paid, status')
      .eq('user_id', userId)
      .order('reference_month', { ascending: true });

    const periods = (bills || []).map((b) => ({
      label: b.reference_month,
      total: Number(b.total_amount) || 0,
      paid: Number(b.total_paid) || 0,
      status: b.status,
    }));

    const total = periods.reduce((s, p) => s + p.total, 0);

    res.json({
      data: {
        periods,
        summary: {
          total,
          count: periods.length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/analytics/projection ─────────────────────────────────────
analyticsRouter.get('/projection', async (req, res, next) => {
  try {
    const userId = req.userId;
    const months = Math.min(Math.max(parseInt(req.query.months) || 6, 1), 24);

    // Fixed costs
    const { data: fixedCosts } = await supabaseAdmin
      .from('fixed_costs')
      .select('value')
      .eq('user_id', userId)
      .in('status', ['ok', 'pendente']);
    const fixedTotal = (fixedCosts || []).reduce((s, c) => s + (Number(c.value) || 0), 0);

    // Monthly income
    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('monthly_income')
      .eq('user_id', userId)
      .single();
    const income = Number(settings?.monthly_income) || 0;

    // Variable expenses average (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const { data: variableTxs } = await supabaseAdmin
      .from('transactions')
      .select('date, value')
      .eq('user_id', userId)
      .eq('type', 'saida')
      .gte('date', threeMonthsAgo.toISOString().split('T')[0]);

    const variableTotal = (variableTxs || []).reduce((s, t) => s + (Number(t.value) || 0), 0);
    const variableAvg = variableTxs?.length > 0 ? variableTotal / 3 : 0;

    // Current balance
    const { data: accounts } = await supabaseAdmin
      .from('accounts')
      .select('balance')
      .eq('user_id', userId)
      .eq('is_active', true);
    let currentBalance = (accounts || []).reduce((s, a) => s + (Number(a.balance) || 0), 0);

    // Projections
    const projections = [];
    const now = new Date();
    for (let i = 1; i <= months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      currentBalance = currentBalance + income - fixedTotal - variableAvg;
      projections.push({
        label,
        income: Number(income.toFixed(2)),
        fixed: Number(fixedTotal.toFixed(2)),
        variable: Number(variableAvg.toFixed(2)),
        projected_balance: Number(Math.max(0, currentBalance).toFixed(2)),
      });
    }

    res.json({
      data: {
        current_balance: Number(((accounts || []).reduce((s, a) => s + (Number(a.balance) || 0), 0)).toFixed(2)),
        monthly_income: Number(income.toFixed(2)),
        fixed_costs_total: Number(fixedTotal.toFixed(2)),
        variable_average: Number(variableAvg.toFixed(2)),
        projections,
      },
    });
  } catch (err) {
    next(err);
  }
});
