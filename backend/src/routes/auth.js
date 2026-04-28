import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

// ── POST /api/auth/register ───────────────────────────────────────────
authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('Email e senha são obrigatórios', 400);
    }
    if (password.length < 6) {
      throw new AppError('A senha deve ter pelo menos 6 caracteres', 400);
    }

    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: { data: { full_name: email.split('@')[0] } },
    });

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      data: {
        user: data.user,
        session: data.session,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('Email e senha são obrigatórios', 400);
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new AppError(error.message, 401);

    res.json({
      data: {
        user: data.user,
        session: data.session,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────
authRouter.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace('Bearer ', '').trim();
    const { error } = await supabaseAdmin.auth.admin.signOut(token);
    if (error) throw new AppError(error.message, 400);
    res.json({ data: { message: 'Logout realizado com sucesso' } });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    res.json({ data: { user: req.user } });
  } catch (err) {
    next(err);
  }
});
