import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from './errorHandler.js';

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de autenticação não fornecido', 401);
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      throw new AppError('Token inválido ou expirado', 401);
    }

    req.userId = data.user.id;
    req.user = data.user;
    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data.user) {
        req.userId = data.user.id;
        req.user = data.user;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}
