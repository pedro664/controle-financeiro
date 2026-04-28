import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { validate } from '../middleware/validate.js';
import { createImportedFileSchema } from '../schemas/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const importedFilesRouter = Router();

importedFilesRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('imported_files').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
});

importedFilesRouter.get('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('imported_files').select('*').eq('id', req.params.id).eq('user_id', userId).single();
    if (error) throw new AppError('Arquivo não encontrado', 404);
    const { data: txs } = await supabaseAdmin
      .from('transactions').select('*, categories!transactions_category_id_fkey(id, name)')
      .eq('source_file_id', req.params.id).eq('user_id', userId).order('date', { ascending: false });
    res.json({ data: { ...data, transactions: txs || [] } });
  } catch (err) { next(err); }
});

importedFilesRouter.post('/', validate(createImportedFileSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('imported_files').insert({ ...req.body, status: 'pendente', user_id: userId }).select().single();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (err) { next(err); }
});

importedFilesRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { status } = req.body;
    if (!['pendente','processando','concluido','erro'].includes(status))
      throw new AppError('Status inválido', 400);
    const { data, error } = await supabaseAdmin
      .from('imported_files').update({ status }).eq('id', req.params.id).eq('user_id', userId).select().single();
    if (error) throw error;
    if (!data) throw new AppError('Arquivo não encontrado', 404);
    res.json({ data });
  } catch (err) { next(err); }
});

importedFilesRouter.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { count } = await supabaseAdmin
      .from('transactions').select('id', { count: 'exact', head: true })
      .eq('source_file_id', req.params.id)
      .eq('user_id', userId);
    if ((count || 0) > 0) throw new AppError('Exclua as transações vinculadas primeiro.', 409);
    const { error } = await supabaseAdmin.from('imported_files').delete().eq('id', req.params.id).eq('user_id', userId);
    if (error) throw error;
    res.status(204).end();
  } catch (err) { next(err); }
});
