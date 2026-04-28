import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { validate, validateQuery } from '../middleware/validate.js';
import {
  createFixedCostSchema,
  updateFixedCostSchema,
  updateFixedCostStatusSchema,
  fixedCostsFilterSchema,
} from '../schemas/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const fixedCostsRouter = Router();

// ── GET /api/fixed-costs ──────────────────────────────────────────────
fixedCostsRouter.get('/', validateQuery(fixedCostsFilterSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page, limit, status, category_id, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('fixed_costs')
      .select('*, categories!fixed_costs_category_id_fkey(id, name)', { count: 'exact' })
      .eq('user_id', userId);

    if (status) query = query.eq('status', status);
    if (category_id) query = query.eq('category_id', category_id);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, count, error } = await query
      .order('name', { ascending: true })
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

// ── GET /api/fixed-costs/:id ──────────────────────────────────────────
fixedCostsRouter.get('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('fixed_costs')
      .select('*, categories!fixed_costs_category_id_fkey(id, name)')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError('Custo fixo não encontrado', 404);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/fixed-costs ─────────────────────────────────────────────
fixedCostsRouter.post('/', validate(createFixedCostSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('fixed_costs')
      .insert({ ...req.body, user_id: userId })
      .select('*, categories!fixed_costs_category_id_fkey(id, name)')
      .single();

    if (error) throw error;
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/fixed-costs/:id ──────────────────────────────────────────
fixedCostsRouter.put('/:id', validate(updateFixedCostSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('fixed_costs')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select('*, categories!fixed_costs_category_id_fkey(id, name)')
      .single();

    if (error) throw error;
    if (!data) throw new AppError('Custo fixo não encontrado', 404);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/fixed-costs/:id/status ─────────────────────────────────
fixedCostsRouter.patch('/:id/status', validate(updateFixedCostStatusSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('fixed_costs')
      .update({ status: req.body.status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select('*, categories!fixed_costs_category_id_fkey(id, name)')
      .single();

    if (error) throw error;
    if (!data) throw new AppError('Custo fixo não encontrado', 404);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/fixed-costs/:id ───────────────────────────────────────
fixedCostsRouter.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { error } = await supabaseAdmin
      .from('fixed_costs')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId);

    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ── POST /api/fixed-costs/bulk-status ─────────────────────────────────
fixedCostsRouter.post('/bulk-status', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('IDs são obrigatórios', 400);
    }

    const validStatuses = ['ok', 'pendente', 'atrasado', 'cancelado'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Status inválido', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('fixed_costs')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', userId)
      .select('*, categories!fixed_costs_category_id_fkey(id, name)');

    if (error) throw error;
    res.json({ data, updated: data.length });
  } catch (err) {
    next(err);
  }
});
