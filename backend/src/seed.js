import 'dotenv/config';
import { supabaseAdmin } from './lib/supabase.js';

/**
 * Script de seed — popula o banco com os dados iniciais do README.
 * Roda com: npm run seed
 */

const DEFAULT_USER = '00000000-0000-0000-0000-000000000001';

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ── 1. Settings ─────────────────────────────────────────────────
  console.log('⚙️  Criando configurações...');
  const { error: settingsErr } = await supabaseAdmin
    .from('settings')
    .upsert({
      user_id: DEFAULT_USER,
      monthly_income: 3600,
      currency: 'BRL',
      current_month: '2026-04',
    }, { onConflict: 'user_id' });

  if (settingsErr) throw settingsErr;
  console.log('   ✅ Configurações criadas\n');

  // ── 2. Categories ───────────────────────────────────────────────
  console.log('📁 Criando categorias...');
  const categoriesData = [
    { name: 'Assinaturas', type: 'saida', monthly_limit: 500 },
    { name: 'Casa/Contas', type: 'saida', monthly_limit: 400 },
    { name: 'Transporte', type: 'saida', monthly_limit: 350 },
    { name: 'Alimentação', type: 'saida', monthly_limit: 500 },
    { name: 'Saúde/Pessoal', type: 'saida', monthly_limit: 300 },
    { name: 'Saúde/Pet', type: 'saida', monthly_limit: 250 },
    { name: 'Lazer/Esporte', type: 'saida', monthly_limit: 200 },
    { name: 'Família', type: 'saida', monthly_limit: 200 },
    { name: 'Reserva', type: 'saida', monthly_limit: 500 },
    { name: 'Cartão', type: 'saida', monthly_limit: 600 },
    { name: 'Outros', type: 'saida', monthly_limit: 200 },
    { name: 'Pessoal', type: 'saida', monthly_limit: 200 },
  ];

  const { data: categories, error: catErr } = await supabaseAdmin
    .from('categories')
    .upsert(
      categoriesData.map((c) => ({ ...c, user_id: DEFAULT_USER })),
      { onConflict: 'user_id,name' }
    )
    .select();

  if (catErr) throw catErr;
  console.log(`   ✅ ${categories.length} categorias criadas\n`);

  // Build category map
  const catMap = {};
  categories.forEach((c) => { catMap[c.name] = c.id; });

  // ── 3. Fixed Costs ──────────────────────────────────────────────
  console.log('💰 Criando custos fixos...');
  const fixedCostsData = [
    { name: 'Poupança', category: 'Reserva', value: 0, status: 'ok' },
    { name: 'Bruce', category: 'Saúde/Pet', value: 223, status: 'pendente' },
    { name: 'Energia', category: 'Casa/Contas', value: 180, status: 'pendente' },
    { name: 'MEI', category: 'Casa/Contas', value: 85.6, status: 'pendente' },
    { name: 'Disney+', category: 'Assinaturas', value: 66.9, status: 'ok' },
    { name: 'Xbox', category: 'Assinaturas', value: 120, status: 'ok' },
    { name: 'Spotify', category: 'Assinaturas', value: 41, status: 'ok' },
    { name: 'Max', category: 'Assinaturas', value: 28, status: 'ok' },
    { name: 'Prime Video', category: 'Assinaturas', value: 29.9, status: 'ok' },
    { name: 'Crédito', category: 'Cartão', value: 40, status: 'pendente' },
    { name: 'ChatGPT', category: 'Assinaturas', value: 24, status: 'pendente' },
    { name: 'NBA League Pass', category: 'Assinaturas', value: 42, status: 'ok' },
    { name: 'Uber', category: 'Transporte', value: 300, status: 'ok' },
    { name: 'Extra', category: 'Outros', value: 25, status: 'pendente' },
    { name: 'Basquete', category: 'Lazer/Esporte', value: 30, status: 'pendente' },
    { name: 'Ifood', category: 'Alimentação', value: 5.95, status: 'ok' },
    { name: 'Vô', category: 'Família', value: 100, status: 'pendente' },
    { name: 'Cabelo', category: 'Pessoal', value: 40, status: 'pendente' },
    { name: 'UFC Fight Pass', category: 'Assinaturas', value: 44.9, status: 'pendente' },
    { name: 'Academia', category: 'Saúde/Pessoal', value: 106.66, status: 'pendente' },
    { name: 'YouTube', category: 'Assinaturas', value: 16.9, status: 'pendente' },
    { name: 'Google One', category: 'Assinaturas', value: 9.99, status: 'pendente' },
    { name: 'KIMI', category: 'Assinaturas', value: 105, status: 'pendente' },
  ];

  const fixedRows = fixedCostsData.map((item) => ({
    user_id: DEFAULT_USER,
    name: item.name,
    category_id: catMap[item.category],
    value: item.value,
    status: item.status,
  }));

  const { data: fixedCosts, error: fcErr } = await supabaseAdmin
    .from('fixed_costs')
    .insert(fixedRows)
    .select();

  if (fcErr) throw fcErr;
  console.log(`   ✅ ${fixedCosts.length} custos fixos criados\n`);

  // ── 4. Category Rules ───────────────────────────────────────────
  console.log('🏷️  Criando regras de categorização...');
  const rulesData = [
    { keyword: 'uber', category: 'Transporte' },
    { keyword: '99', category: 'Transporte' },
    { keyword: 'spotify', category: 'Assinaturas' },
    { keyword: 'disney', category: 'Assinaturas' },
    { keyword: 'prime video', category: 'Assinaturas' },
    { keyword: 'max', category: 'Assinaturas' },
    { keyword: 'youtube', category: 'Assinaturas' },
    { keyword: 'ifood', category: 'Alimentação' },
    { keyword: 'energia', category: 'Casa/Contas' },
    { keyword: 'academia', category: 'Saúde/Pessoal' },
    { keyword: 'cabelo', category: 'Pessoal' },
    { keyword: 'chatgpt', category: 'Assinaturas' },
    { keyword: 'google one', category: 'Assinaturas' },
  ];

  const ruleRows = rulesData.map((r) => ({
    user_id: DEFAULT_USER,
    keyword: r.keyword,
    category_id: catMap[r.category],
  }));

  const { data: rules, error: ruleErr } = await supabaseAdmin
    .from('category_rules')
    .upsert(ruleRows, { onConflict: 'user_id,keyword' })
    .select();

  if (ruleErr) throw ruleErr;
  console.log(`   ✅ ${rules.length} regras criadas\n`);

  console.log('═══════════════════════════════════════');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('═══════════════════════════════════════');
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
