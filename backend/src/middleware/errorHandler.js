/**
 * Middleware centralizado de tratamento de erros.
 */

export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export function notFoundHandler(req, res, _next) {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
  });
}

export function errorHandler(err, _req, res, _next) {
  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(422).json({
      error: 'Dados inválidos',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Supabase errors
  if (err.code && err.message && err.details) {
    return res.status(400).json({
      error: err.message,
      code: err.code,
    });
  }

  // Unknown errors
  console.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
