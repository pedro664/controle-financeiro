import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

export const accountsRouter = Router();

accountsRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
});

accountsRouter.get('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();
    if (error || !data) throw new AppError('Conta não encontrada', 404);
    res.json({ data });
  } catch (err) { next(err); }
});

accountsRouter.post('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('accounts')
      .insert({ ...req.body, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (err) { next(err); }
});

accountsRouter.put('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('accounts')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    if (!data) throw new AppError('Conta não encontrada', 404);
    res.json({ data });
  } catch (err) { next(err); }
});

accountsRouter.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { error } = await supabaseAdmin
      .from('accounts')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .eq('user_id', userId);
    if (error) throw error;
    res.status(204).end();
  } catch (err) { next(err); }
});
