import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

export const attachmentsRouter = Router();

const BUCKET_NAME = 'attachments';

// Ensure bucket exists
async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (!buckets?.find(b => b.name === BUCKET_NAME)) {
    await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    });
  }
}
ensureBucket().catch(console.error);

attachmentsRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const transactionId = req.query.transaction_id;
    let query = supabaseAdmin.from('attachments').select('*').eq('user_id', userId);
    if (transactionId) query = query.eq('transaction_id', transactionId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
});

attachmentsRouter.post('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { transaction_id, file_name, file_type, file_size, base64_content } = req.body;

    if (!base64_content || !file_name) {
      throw new AppError('Arquivo e nome são obrigatórios', 400);
    }

    const buffer = Buffer.from(base64_content, 'base64');
    const path = `${userId}/${transaction_id || 'general'}/${Date.now()}_${file_name}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(path, buffer, { contentType: file_type, upsert: false });

    if (uploadError) throw new AppError(uploadError.message, 400);

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(path);

    const { data, error } = await supabaseAdmin
      .from('attachments')
      .insert({
        user_id: userId,
        transaction_id: transaction_id || null,
        file_name,
        file_type,
        file_size,
        storage_path: path,
        public_url: urlData.publicUrl,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data });
  } catch (err) { next(err); }
});

attachmentsRouter.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data: att, error: fetchError } = await supabaseAdmin
      .from('attachments')
      .select('storage_path')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !att) throw new AppError('Anexo não encontrado', 404);

    await supabaseAdmin.storage.from(BUCKET_NAME).remove([att.storage_path]);
    const { error } = await supabaseAdmin.from('attachments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) { next(err); }
});
