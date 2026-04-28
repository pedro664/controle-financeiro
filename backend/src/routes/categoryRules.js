import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { validate } from '../middleware/validate.js';
import { createCategoryRuleSchema, updateCategoryRuleSchema } from '../schemas/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const categoryRulesRouter = Router();

categoryRulesRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('category_rules')
      .select('*, categories!category_rules_category_id_fkey(id, name)')
      .eq('user_id', userId)
      .order('keyword', { ascending: true });
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
});

categoryRulesRouter.post('/', validate(createCategoryRuleSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('category_rules').insert({ ...req.body, user_id: userId })
      .select('*, categories!category_rules_category_id_fkey(id, name)').single();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (err) { next(err); }
});

categoryRulesRouter.put('/:id', validate(updateCategoryRuleSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('category_rules')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select('*, categories!category_rules_category_id_fkey(id, name)').single();
    if (error) throw error;
    if (!data) throw new AppError('Regra não encontrada', 404);
    res.json({ data });
  } catch (err) { next(err); }
});

categoryRulesRouter.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { error } = await supabaseAdmin.from('category_rules').delete().eq('id', req.params.id).eq('user_id', userId);
    if (error) throw error;
    res.status(204).end();
  } catch (err) { next(err); }
});

// POST /api/category-rules/match — Suggest category based on description
categoryRulesRouter.post('/match', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { description } = req.body;
    if (!description) throw new AppError('Descrição é obrigatória', 400);

    const { data: rules } = await supabaseAdmin
      .from('category_rules')
      .select('*, categories!category_rules_category_id_fkey(id, name)')
      .eq('user_id', userId);

    const normalized = description.toLowerCase().trim();
    const match = (rules || []).find((r) => normalized.includes(r.keyword.toLowerCase()));

    res.json({
      data: match
        ? { matched: true, keyword: match.keyword, category: match.categories }
        : { matched: false, keyword: null, category: null },
    });
  } catch (err) { next(err); }
});
