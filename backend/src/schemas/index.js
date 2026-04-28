import { z } from 'zod';

// ── Status enum ───────────────────────────────────────────────────────
export const ExpenseStatus = z.enum(['ok', 'pendente', 'atrasado', 'cancelado']);
export const TransactionType = z.enum(['entrada', 'saida']);
export const TransactionOrigin = z.enum(['manual', 'pdf', 'ocr']);
export const TransactionStatus = z.enum(['ok', 'pendente', 'atrasado', 'cancelado', 'revisar']);
export const CategoryType = z.enum(['entrada', 'saida']);
export const ImportFileType = z.enum(['extrato', 'fatura', 'comprovante']);
export const ImportFileStatus = z.enum(['pendente', 'processando', 'concluido', 'erro']);

// ── Categories ────────────────────────────────────────────────────────
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  type: CategoryType.default('saida'),
  monthly_limit: z.number().min(0).nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ── Fixed Costs ───────────────────────────────────────────────────────
export const createFixedCostSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  category_id: z.string().uuid('ID de categoria inválido'),
  value: z.number().min(0, 'Valor deve ser positivo'),
  status: ExpenseStatus.default('pendente'),
  due_day: z.number().int().min(1).max(31).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const updateFixedCostSchema = createFixedCostSchema.partial();

export const updateFixedCostStatusSchema = z.object({
  status: ExpenseStatus,
});

// ── Transactions ──────────────────────────────────────────────────────
export const createTransactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  description: z.string().min(1, 'Descrição é obrigatória').max(500),
  value: z.number().min(0, 'Valor deve ser positivo'),
  type: TransactionType.default('saida'),
  category_id: z.string().uuid('ID de categoria inválido').nullable().optional(),
  payment_method: z.string().max(100).nullable().optional(),
  origin: TransactionOrigin.default('manual'),
  status: TransactionStatus.default('ok'),
  source_file_id: z.string().uuid().nullable().optional(),
  account_id: z.string().uuid().nullable().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

// ── Settings ──────────────────────────────────────────────────────────
export const updateSettingsSchema = z.object({
  monthly_income: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  current_month: z.string().regex(/^\d{4}-\d{2}$/, 'Mês inválido (YYYY-MM)').optional(),
});

// ── Category Rules ────────────────────────────────────────────────────
export const createCategoryRuleSchema = z.object({
  keyword: z.string().min(1, 'Palavra-chave é obrigatória').max(200),
  category_id: z.string().uuid('ID de categoria inválido'),
});

export const updateCategoryRuleSchema = createCategoryRuleSchema.partial();

// ── Imported Files ────────────────────────────────────────────────────
export const createImportedFileSchema = z.object({
  file_name: z.string().min(1).max(500),
  file_type: ImportFileType,
  reference_month: z.string().regex(/^\d{4}-\d{2}$/, 'Mês inválido (YYYY-MM)'),
  bank_name: z.string().max(200).nullable().optional(),
});

// ── Credit Card Bills ─────────────────────────────────────────────────
export const createCreditCardBillSchema = z.object({
  filename: z.string().min(1).max(500),
  card_name: z.string().max(200).default('Cartão'),
  reference_month: z.string().regex(/^\d{4}-\d{2}$/, 'Mês inválido (YYYY-MM)'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable().optional(),
  closing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable().optional(),
  total_amount: z.number().min(0).default(0),
  total_paid: z.number().min(0).default(0),
  status: z.enum(['aberta', 'paga', 'atrasada']).default('aberta'),
  source_file_id: z.string().uuid().nullable().optional(),
  account_id: z.string().uuid().nullable().optional(),
});

export const updateCreditCardBillSchema = createCreditCardBillSchema.partial();

// ── Query filters ─────────────────────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const fixedCostsFilterSchema = paginationSchema.extend({
  status: ExpenseStatus.optional(),
  category_id: z.string().uuid().optional(),
  search: z.string().optional(),
});

export const transactionsFilterSchema = paginationSchema.extend({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  type: TransactionType.optional(),
  category_id: z.string().uuid().optional(),
  status: TransactionStatus.optional(),
  origin: TransactionOrigin.optional(),
});
