import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { validate, validateQuery } from '../middleware/validate.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionsFilterSchema,
} from '../schemas/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const transactionsRouter = Router();

// ── GET /api/transactions ─────────────────────────────────────────────
transactionsRouter.get('/', validateQuery(transactionsFilterSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page, limit, month, type, category_id, status, origin } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('transactions')
      .select('*, categories!transactions_category_id_fkey(id, name)', { count: 'exact' })
      .eq('user_id', userId);

    if (month) {
      const startDate = `${month}-01`;
      const [year, mon] = month.split('-').map(Number);
      const lastDay = new Date(year, mon, 0).getDate();
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
      query = query.gte('date', startDate).lte('date', endDate);
    }

    if (type) query = query.eq('type', type);
    if (category_id) query = query.eq('category_id', category_id);
    if (status) query = query.eq('status', status);
    if (origin) query = query.eq('origin', origin);

    const { data, count, error } = await query
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/transactions/:id ─────────────────────────────────────────
transactionsRouter.get('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*, categories!transactions_category_id_fkey(id, name)')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError('Transação não encontrada', 404);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/transactions ────────────────────────────────────────────
transactionsRouter.post('/', validate(createTransactionSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert({ ...req.body, user_id: userId })
      .select('*, categories!transactions_category_id_fkey(id, name)')
      .single();

    if (error) throw error;
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/transactions/bulk ───────────────────────────────────────
transactionsRouter.post('/bulk', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new AppError('Lista de transações é obrigatória', 400);
    }

    if (transactions.length > 500) {
      throw new AppError('Máximo de 500 transações por vez', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert(transactions.map((t) => ({ ...t, user_id: userId })))
      .select('*, categories!transactions_category_id_fkey(id, name)');

    if (error) throw error;
    res.status(201).json({ data, inserted: data.length });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/transactions/:id ─────────────────────────────────────────
transactionsRouter.put('/:id', validate(updateTransactionSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select('*, categories!transactions_category_id_fkey(id, name)')
      .single();

    if (error) throw error;
    if (!data) throw new AppError('Transação não encontrada', 404);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/transactions/:id ──────────────────────────────────────
transactionsRouter.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { error } = await supabaseAdmin
      .from('transactions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId);

    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
