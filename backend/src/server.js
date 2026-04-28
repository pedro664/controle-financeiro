import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { categoriesRouter } from './routes/categories.js';
import { fixedCostsRouter } from './routes/fixedCosts.js';
import { transactionsRouter } from './routes/transactions.js';
import { settingsRouter } from './routes/settings.js';
import { dashboardRouter } from './routes/dashboard.js';
import { importedFilesRouter } from './routes/importedFiles.js';
import { creditCardBillsRouter } from './routes/creditCardBills.js';
import { categoryRulesRouter } from './routes/categoryRules.js';
import { analyticsRouter } from './routes/analytics.js';
import { authRouter } from './routes/auth.js';
import { accountsRouter } from './routes/accounts.js';
import { attachmentsRouter } from './routes/attachments.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting ─────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
});
app.use(limiter);

// ── Body parsing & logging ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// ── Health check ──────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Public routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ── Protected routes ──────────────────────────────────────────────────
app.use('/api/categories', requireAuth, categoriesRouter);
app.use('/api/fixed-costs', requireAuth, fixedCostsRouter);
app.use('/api/transactions', requireAuth, transactionsRouter);
app.use('/api/settings', requireAuth, settingsRouter);
app.use('/api/dashboard', requireAuth, dashboardRouter);
app.use('/api/imported-files', requireAuth, importedFilesRouter);
app.use('/api/category-rules', requireAuth, categoryRulesRouter);
app.use('/api/credit-card-bills', requireAuth, creditCardBillsRouter);
app.use('/api/analytics', requireAuth, analyticsRouter);
app.use('/api/accounts', requireAuth, accountsRouter);
app.use('/api/attachments', requireAuth, attachmentsRouter);

// ── Error handling ────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   Controle Financeiro API                    ║
  ║   Rodando em http://localhost:${PORT}           ║
  ║   Ambiente: ${process.env.NODE_ENV || 'development'}                   ║
  ╚══════════════════════════════════════════════╝
  `);
});

export default app;
