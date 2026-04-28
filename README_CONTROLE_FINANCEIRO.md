# Controle Financeiro Pessoal

Sistema simples para gerenciar dinheiro, custos fixos, gastos variáveis, faturas, extratos e importação futura por PDF/OCR.

## 1. Objetivo do projeto

Criar uma solução pessoal para responder rapidamente:

- quanto eu recebo por mês;
- quanto já está comprometido com custos fixos;
- quanto ainda está livre;
- quais contas já foram pagas;
- quais contas estão pendentes;
- em quais categorias eu mais gasto;
- quais gastos vieram de faturas/extratos importados.

A solução deve permitir editar todos os dados depois, sem deixar valores travados no código.

---

## 2. Stack inicial recomendada

```txt
React + Vite
Tailwind CSS
Lucide React
LocalStorage na primeira versão
Supabase ou banco de dados depois
OCR/PDF depois da base manual funcionando
```

### Instalação inicial

```bash
npm create vite@latest controle-financeiro
cd controle-financeiro
npm install
npm install tailwindcss @tailwindcss/forms @tailwindcss/typography lucide-react
npx tailwindcss init -p
```

---

## 3. Style guide

### Fontes

```txt
Títulos/Header: Instrument Sans
Texto/Body: Geist
```

### Paleta

```txt
Verde escuro:   #00674F
Verde menta:    #73E6CB
Verde médio:    #3EBB9E
Verde profundo: #0A3C30
Fundo claro:    #F6FBF9
Branco:         #FFFFFF
```

### Visual

- Interface limpa e moderna.
- Cards arredondados.
- Muito espaço em branco.
- Dashboard com visual financeiro premium.
- Verde como cor principal.
- Tabelas simples, fáceis de editar.
- Status bem visíveis: `Ok`, `Pendente`, `Atrasado`, `Cancelado`.

---

## 4. Configuração do Tailwind

Arquivo: `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Instrument Sans"', 'sans-serif'],
        body: ['"Geist"', 'sans-serif'],
      },
      colors: {
        emeraldApp: {
          50: '#E9FFF8',
          100: '#C9F8EB',
          200: '#73E6CB',
          300: '#3EBB9E',
          700: '#00674F',
          900: '#0A3C30',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F6FBF9',
          dark: '#0A3C30',
        },
      },
      borderRadius: {
        app: '1.5rem',
      },
      boxShadow: {
        soft: '0 20px 40px rgba(10, 60, 48, 0.10)',
        card: '0 10px 30px rgba(10, 60, 48, 0.08)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

Arquivo: `src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-surface-soft text-emeraldApp-900 font-body;
}

h1,
h2,
h3,
h4 {
  @apply font-heading tracking-tight;
}
```

---

## 5. Estrutura de pastas

```txt
src/
 ├─ components/
 │   ├─ ui/
 │   │   ├─ Button.jsx
 │   │   ├─ Card.jsx
 │   │   ├─ Input.jsx
 │   │   ├─ Select.jsx
 │   │   ├─ Badge.jsx
 │   │   ├─ StatCard.jsx
 │   │   └─ UploadBox.jsx
 │   │
 │   ├─ finance/
 │   │   ├─ ExpenseTable.jsx
 │   │   ├─ TransactionTable.jsx
 │   │   ├─ CategoryPill.jsx
 │   │   └─ SummaryCards.jsx
 │
 ├─ pages/
 │   ├─ Dashboard.jsx
 │   ├─ FixedCosts.jsx
 │   ├─ Transactions.jsx
 │   ├─ Categories.jsx
 │   ├─ ImportPDF.jsx
 │   └─ Settings.jsx
 │
 ├─ data/
 │   ├─ initialCosts.js
 │   ├─ initialCategories.js
 │   └─ categoryRules.js
 │
 ├─ hooks/
 │   ├─ useLocalStorage.js
 │   ├─ useCosts.js
 │   ├─ useTransactions.js
 │   └─ useCategories.js
 │
 ├─ utils/
 │   ├─ formatCurrency.js
 │   ├─ calculateSummary.js
 │   ├─ generateId.js
 │   └─ normalizeText.js
 │
 ├─ App.jsx
 ├─ main.jsx
 └─ index.css
```

---

## 6. Dados iniciais da sua tabela de custos

Arquivo: `src/data/initialCosts.js`

```js
export const initialCosts = [
  { id: 1, name: 'Poupança', category: 'Reserva', value: 0, status: 'ok' },
  { id: 2, name: 'Bruce', category: 'Saúde/Pet', value: 223, status: 'pendente' },
  { id: 3, name: 'Energia', category: 'Casa/Contas', value: 180, status: 'pendente' },
  { id: 4, name: 'MEI', category: 'Casa/Contas', value: 85.6, status: 'pendente' },
  { id: 5, name: 'Disney+', category: 'Assinaturas', value: 66.9, status: 'ok' },
  { id: 6, name: 'Xbox', category: 'Assinaturas', value: 120, status: 'ok' },
  { id: 7, name: 'Spotify', category: 'Assinaturas', value: 41, status: 'ok' },
  { id: 8, name: 'Max', category: 'Assinaturas', value: 28, status: 'ok' },
  { id: 9, name: 'Prime Video', category: 'Assinaturas', value: 29.9, status: 'ok' },
  { id: 10, name: 'Crédito', category: 'Cartão', value: 40, status: 'pendente' },
  { id: 11, name: 'ChatGPT', category: 'Assinaturas', value: 24, status: 'pendente' },
  { id: 12, name: 'NBA League Pass', category: 'Assinaturas', value: 42, status: 'ok' },
  { id: 13, name: 'Uber', category: 'Transporte', value: 300, status: 'ok' },
  { id: 14, name: 'Extra', category: 'Outros', value: 25, status: 'pendente' },
  { id: 15, name: 'Basquete', category: 'Lazer/Esporte', value: 30, status: 'pendente' },
  { id: 16, name: 'Ifood', category: 'Alimentação', value: 5.95, status: 'ok' },
  { id: 17, name: 'Vô', category: 'Família', value: 100, status: 'pendente' },
  { id: 18, name: 'Cabelo', category: 'Pessoal', value: 40, status: 'pendente' },
  { id: 19, name: 'UFC Fight Pass', category: 'Assinaturas', value: 44.9, status: 'pendente' },
  { id: 20, name: 'Academia', category: 'Saúde/Pessoal', value: 106.66, status: 'pendente' },
  { id: 21, name: 'YouTube', category: 'Assinaturas', value: 16.9, status: 'pendente' },
  { id: 22, name: 'Google One', category: 'Assinaturas', value: 9.99, status: 'pendente' },
  { id: 23, name: 'KIMI', category: 'Assinaturas', value: 105, status: 'pendente' },
];
```

### Renda inicial estimada

Como sua tabela mostra `Total livre = R$ 1.935,20` e os custos somam `R$ 1.664,80`, a renda usada como base fica:

```txt
Renda mensal estimada = R$ 3.600,00
```

Arquivo: `src/data/initialSettings.js`

```js
export const initialSettings = {
  monthlyIncome: 3600,
  currency: 'BRL',
  currentMonth: '2026-04',
};
```

---

## 7. Categorias iniciais

Arquivo: `src/data/initialCategories.js`

```js
export const initialCategories = [
  { id: 1, name: 'Assinaturas', type: 'saida', monthlyLimit: 500 },
  { id: 2, name: 'Casa/Contas', type: 'saida', monthlyLimit: 400 },
  { id: 3, name: 'Transporte', type: 'saida', monthlyLimit: 350 },
  { id: 4, name: 'Alimentação', type: 'saida', monthlyLimit: 500 },
  { id: 5, name: 'Saúde/Pessoal', type: 'saida', monthlyLimit: 300 },
  { id: 6, name: 'Saúde/Pet', type: 'saida', monthlyLimit: 250 },
  { id: 7, name: 'Lazer/Esporte', type: 'saida', monthlyLimit: 200 },
  { id: 8, name: 'Família', type: 'saida', monthlyLimit: 200 },
  { id: 9, name: 'Reserva', type: 'saida', monthlyLimit: 500 },
  { id: 10, name: 'Cartão', type: 'saida', monthlyLimit: 600 },
  { id: 11, name: 'Outros', type: 'saida', monthlyLimit: 200 },
];
```

---

## 8. Funcionalidades do MVP

### Dashboard

Deve mostrar:

- saldo livre;
- renda mensal;
- custos fixos;
- gastos variáveis;
- total pago;
- total pendente;
- maior categoria de gasto;
- gráfico de donut por categoria;
- gráfico de barras por despesa.

### Custos fixos

Funcionalidades:

- adicionar custo;
- editar custo;
- excluir custo;
- alterar status;
- alterar categoria;
- pesquisar despesa;
- filtrar por status;
- filtrar por categoria.

### Gastos variáveis

Funcionalidades:

- adicionar lançamento manual;
- editar lançamento;
- excluir lançamento;
- classificar por categoria;
- filtrar por mês;
- filtrar por tipo: entrada ou saída.

### Categorias

Funcionalidades:

- criar categoria;
- editar categoria;
- excluir categoria;
- definir limite mensal;
- usar categoria em custos fixos e lançamentos.

### Importação PDF/OCR

Na primeira versão, pode ficar como tela visual. Depois implementar:

```txt
Upload PDF
↓
Ler texto do PDF
↓
Se não tiver texto, aplicar OCR
↓
Extrair lançamentos
↓
Sugerir categoria
↓
Enviar para revisão
↓
Confirmar lançamentos
```

---

## 9. Regras de negócio

### Status de despesas

```txt
ok = pago ou confirmado
pendente = ainda não pago
atrasado = passou do vencimento
cancelado = não entra no cálculo ativo
```

### Cálculo do resumo

```txt
Total de custos fixos = soma das despesas fixas ativas
Total pago = soma das despesas com status ok
Total pendente = soma das despesas que não estão ok nem canceladas
Saldo livre = renda mensal - custos fixos - gastos variáveis
```

### OCR nunca confirma automaticamente

Todo lançamento importado por PDF/OCR deve entrar como:

```txt
status = revisar
origem = pdf ou ocr
```

O usuário precisa revisar antes de confirmar.

---

## 10. Funções utilitárias

Arquivo: `src/utils/formatCurrency.js`

```js
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}
```

Arquivo: `src/utils/calculateSummary.js`

```js
export function sumValues(items) {
  return items.reduce((total, item) => total + Number(item.value || 0), 0);
}

export function calculateFixedCosts(costs) {
  return sumValues(costs.filter((item) => item.status !== 'cancelado'));
}

export function calculatePaid(costs) {
  return sumValues(costs.filter((item) => item.status === 'ok'));
}

export function calculatePending(costs) {
  return sumValues(
    costs.filter((item) => item.status !== 'ok' && item.status !== 'cancelado')
  );
}

export function calculateFreeBalance(monthlyIncome, fixedCosts, variableExpenses) {
  return Number(monthlyIncome || 0) - calculateFixedCosts(fixedCosts) - sumValues(variableExpenses);
}

export function groupByCategory(items) {
  return items.reduce((acc, item) => {
    const category = item.category || 'Sem categoria';
    acc[category] = (acc[category] || 0) + Number(item.value || 0);
    return acc;
  }, {});
}
```

Arquivo: `src/utils/generateId.js`

```js
export function generateId() {
  return crypto.randomUUID?.() || String(Date.now());
}
```

---

## 11. Hook de LocalStorage

Arquivo: `src/hooks/useLocalStorage.js`

```js
import { useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

---

## 12. Componentes base

### Button

Arquivo: `src/components/ui/Button.jsx`

```jsx
export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-emeraldApp-700 text-white hover:bg-emeraldApp-900',
    secondary: 'bg-emeraldApp-200 text-emeraldApp-900 hover:bg-emeraldApp-300',
    outline: 'border border-emeraldApp-700 text-emeraldApp-700 hover:bg-emeraldApp-50',
    ghost: 'text-emeraldApp-900 hover:bg-emeraldApp-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Card

Arquivo: `src/components/ui/Card.jsx`

```jsx
export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-app border border-emeraldApp-100 bg-white p-6 shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description }) {
  return (
    <div className="mb-5">
      <h3 className="text-xl font-bold text-emeraldApp-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-emeraldApp-900/60">{description}</p>}
    </div>
  );
}
```

### Badge

Arquivo: `src/components/ui/Badge.jsx`

```jsx
export function Badge({ children, variant = 'success' }) {
  const variants = {
    success: 'bg-emeraldApp-100 text-emeraldApp-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    neutral: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${variants[variant]}`}>
      {children}
    </span>
  );
}
```

---

## 13. Telas prioritárias

### Ordem de criação

```txt
1. Criar projeto React + Vite
2. Configurar Tailwind e fontes
3. Criar componentes UI
4. Criar dados iniciais
5. Criar Dashboard
6. Criar tela de custos fixos
7. Criar edição de custos fixos
8. Criar categorias editáveis
9. Criar gastos variáveis
10. Criar gráficos
11. Salvar tudo no LocalStorage
12. Criar tela visual de importação PDF
13. Implementar leitura real de PDF/OCR
```

---

## 14. Modelo das telas

### Dashboard

Cards principais:

```txt
Saldo livre
Renda mensal
Custos fixos
Pago
Pendente
Gastos variáveis
```

Seções:

```txt
Gráfico por categoria
Maiores despesas
Últimos lançamentos
Importar fatura/extrato
```

### Custos Fixos

Tabela:

```txt
Despesa | Categoria | Valor | Status | Ações
```

Ações:

```txt
Editar
Excluir
Marcar como Ok
Marcar como Pendente
```

### Importar PDF

Campos:

```txt
Tipo do arquivo: Extrato, Fatura, Comprovante
Banco/cartão: texto livre
Mês de referência
Upload do arquivo
Botão: Analisar PDF
```

Resultado esperado:

```txt
Tabela de lançamentos encontrados para revisão
```

---

## 15. Futuro banco de dados

Quando sair do LocalStorage, usar tabelas parecidas com estas:

### `fixed_costs`

```txt
id
user_id
name
category_id
value
status
due_day
notes
created_at
updated_at
```

### `transactions`

```txt
id
user_id
date
description
value
type
category_id
payment_method
origin
status
source_file_id
created_at
updated_at
```

### `categories`

```txt
id
user_id
name
type
monthly_limit
created_at
updated_at
```

### `category_rules`

```txt
id
user_id
keyword
category_id
created_at
updated_at
```

### `imported_files`

```txt
id
user_id
file_name
file_type
reference_month
status
created_at
```

---

## 16. Regras automáticas de categoria para PDF/OCR

Arquivo: `src/data/categoryRules.js`

```js
export const categoryRules = [
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
```

---

## 17. Checklist do MVP

### Base visual

- [ ] Projeto criado
- [ ] Tailwind configurado
- [ ] Fontes configuradas
- [ ] Paleta aplicada
- [ ] Componentes UI criados

### Financeiro manual

- [ ] Cadastrar custos fixos
- [ ] Editar custos fixos
- [ ] Excluir custos fixos
- [ ] Marcar status como ok/pendente
- [ ] Criar categorias
- [ ] Editar categorias
- [ ] Cadastrar gastos variáveis
- [ ] Calcular saldo livre
- [ ] Mostrar total pago
- [ ] Mostrar total pendente

### Dashboard

- [ ] Cards de resumo
- [ ] Tabela de despesas
- [ ] Gráfico por categoria
- [ ] Ranking de maiores despesas
- [ ] Filtro por mês

### Importação

- [ ] Tela visual de upload
- [ ] Tabela de revisão
- [ ] Status `revisar`
- [ ] Regras de categoria
- [ ] Leitura real de PDF
- [ ] OCR para PDF escaneado

---

