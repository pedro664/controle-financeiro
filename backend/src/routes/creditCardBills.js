import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { validate } from '../middleware/validate.js';
import { createCreditCardBillSchema, updateCreditCardBillSchema } from '../schemas/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const creditCardBillsRouter = Router();

// ── GET /api/credit-card-bills ─────────────────────────────────────────
creditCardBillsRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('credit_card_bills')
      .select('*')
      .eq('user_id', userId)
      .order('reference_month', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
});

// ── GET /api/credit-card-bills/:id ─────────────────────────────────────
creditCardBillsRouter.get('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data: bill, error } = await supabaseAdmin
      .from('credit_card_bills')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();
    if (error) throw new AppError('Fatura não encontrada', 404);

    const { data: txs } = await supabaseAdmin
      .from('transactions')
      .select('*, categories!transactions_category_id_fkey(id, name)')
      .eq('source_file_id', bill.source_file_id)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    res.json({ data: { ...bill, transactions: txs || [] } });
  } catch (err) { next(err); }
});

// ── POST /api/credit-card-bills ────────────────────────────────────────
creditCardBillsRouter.post('/', validate(createCreditCardBillSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('credit_card_bills')
      .insert({ ...req.body, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (err) { next(err); }
});

// ── PUT /api/credit-card-bills/:id ─────────────────────────────────────
creditCardBillsRouter.put('/:id', validate(updateCreditCardBillSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('credit_card_bills')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    if (!data) throw new AppError('Fatura não encontrada', 404);
    res.json({ data });
  } catch (err) { next(err); }
});

// ── PATCH /api/credit-card-bills/:id/pay ───────────────────────────────
creditCardBillsRouter.patch('/:id/pay', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data: bill, error: fetchError } = await supabaseAdmin
      .from('credit_card_bills')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();
    if (fetchError || !bill) throw new AppError('Fatura não encontrada', 404);

    // Mark bill as paid
    const { data, error } = await supabaseAdmin
      .from('credit_card_bills')
      .update({ status: 'paga', total_paid: bill.total_amount })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;

    // Create a payment transaction if it doesn't exist yet
    const { data: existingPayment } = await supabaseAdmin
      .from('transactions')
      .select('id')
      .eq('source_file_id', bill.source_file_id)
      .eq('user_id', userId)
      .ilike('description', '%pagamento de fatura%')
      .maybeSingle();

    if (!existingPayment) {
      await supabaseAdmin.from('transactions').insert({
        date: new Date().toISOString().split('T')[0],
        description: `Pagamento fatura ${bill.card_name} - ${bill.reference_month}`,
        value: bill.total_amount,
        type: 'saida',
        status: 'ok',
        origin: 'manual',
        source_file_id: bill.source_file_id,
        user_id: userId,
      });
    }

    res.json({ data });
  } catch (err) { next(err); }
});

// ── DELETE /api/credit-card-bills/:id ──────────────────────────────────
creditCardBillsRouter.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    // Check for linked transactions
    const { data: bill } = await supabaseAdmin
      .from('credit_card_bills')
      .select('source_file_id')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();

    if (bill?.source_file_id) {
      const { count } = await supabaseAdmin
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('source_file_id', bill.source_file_id)
        .eq('user_id', userId);
      if ((count || 0) > 0) {
        throw new AppError('Exclua as transações vinculadas primeiro.', 409);
      }
    }

    const { error } = await supabaseAdmin
      .from('credit_card_bills')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId);
    if (error) throw error;
    res.status(204).end();
  } catch (err) { next(err); }
});
