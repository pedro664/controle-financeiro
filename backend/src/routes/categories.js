import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const categoriesRouter = Router();

// ── GET /api/categories ───────────────────────────────────────────────
categoriesRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/categories/:id ───────────────────────────────────────────
categoriesRouter.get('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError('Categoria não encontrada', 404);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/categories ──────────────────────────────────────────────
categoriesRouter.post('/', validate(createCategorySchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ ...req.body, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/categories/:id ──────────────────────────────────────────
categoriesRouter.put('/:id', validate(updateCategorySchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new AppError('Categoria não encontrada', 404);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/categories/:id ────────────────────────────────────────
categoriesRouter.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    // Check if category is in use
    const { count: fixedCount } = await supabaseAdmin
      .from('fixed_costs')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', req.params.id)
      .eq('user_id', userId);

    const { count: txCount } = await supabaseAdmin
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', req.params.id)
      .eq('user_id', userId);

    if ((fixedCount || 0) + (txCount || 0) > 0) {
      throw new AppError(
        'Não é possível excluir uma categoria que está sendo usada por despesas ou transações',
        409
      );
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId);

    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
