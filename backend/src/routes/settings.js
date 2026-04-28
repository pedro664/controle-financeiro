import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsSchema } from '../schemas/index.js';

export const settingsRouter = Router();

// ── GET /api/settings ─────────────────────────────────────────────────
settingsRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No settings found, return defaults
      return res.json({
        data: {
          user_id: userId,
          monthly_income: 3600,
          currency: 'BRL',
          current_month: new Date().toISOString().slice(0, 7),
        },
      });
    }

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/settings ─────────────────────────────────────────────────
settingsRouter.put('/', validate(updateSettingsSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
      .from('settings')
      .upsert(
        { user_id: userId, ...req.body, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
