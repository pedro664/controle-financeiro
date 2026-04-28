/**
 * Extract raw text from a PDF file (browser only)
 */
export async function extractTextFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

// ── Helper: detect statement year/month from header text ──
function detectReferenceYearMonth(text) {
  const patterns = [
    /(?:mês de|fatura do mês de|vencimento:?)\s*(\d{2})\s+([a-zçáéíóúãõ]+)/i,
    /(?:vencimento|fechamento):?\s*(\d{2})[\/-](\d{2})[\/-](\d{4})/i,
    /vencimento em\s*(\d{2})[\/-](\d{2})[\/-](\d{4})/i,
  ];

  const monthMap = {
    jan: 1, janero: 1, janeiro: 1,
    fev: 2, fevereiro: 2,
    mar: 3, marco: 3, março: 3,
    abr: 4, abril: 4,
    mai: 5, maio: 5,
    jun: 6, junho: 6,
    jul: 7, julho: 7,
    ago: 8, agosto: 8,
    set: 9, setembro: 9,
    out: 10, outubro: 10,
    nov: 11, novembro: 11,
    dez: 12, dezembro: 12,
  };

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[3] && match[3].length === 4) {
        return { year: parseInt(match[3], 10), month: parseInt(match[2], 10) };
      }
      if (match[2]) {
        const monthName = match[2].toLowerCase().trim();
        const month = monthMap[monthName];
        if (month) {
          const year = new Date().getFullYear();
          return { year, month };
        }
      }
    }
  }

  const fallback = text.match(/(\d{2})[\/](\d{2})[\/](\d{4})/);
  if (fallback) {
    return { year: parseInt(fallback[3], 10), month: parseInt(fallback[2], 10) };
  }

  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function resolveDate(day, month, refYear, refMonth) {
  let resolvedYear = refYear;
  if (month > refMonth) {
    resolvedYear = refYear - 1;
  }
  const date = new Date(resolvedYear, month - 1, day);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}

function parseValue(str) {
  const clean = str
    .replace(/R\$/i, '')
    .replace(/\s+/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const val = parseFloat(clean);
  return isNaN(val) ? null : val;
}

// ── Lines/entries to skip ──
const SKIP_KEYWORDS = [
  'subtotal', 'total geral', 'total da fatura', 'pagamento mínimo',
  'pagamento minimo', 'pagamento total', 'fatura anterior',
  'créditos e estornos', 'creditos e estornos', 'despesas do mês',
  'despesas do mes', 'pagamento recebido', 'total dos lançamentos',
  'total dos lancamentos', 'data estabelecimento valor',
  'transações nacionais', 'transacoes nacionais', 'picpay card',
  'final', 'mastercard', 'visa', 'hipercard', 'american express',
  'encargos', 'juros',
  'multa', 'limite disponível',
  'parcelamento', 'saques em espécie', 'anuidade', 'seguros',
  'importante:', 'o pagamento total', 'se você pagar',
  'saiba quais são', 'modalidades de pagamento', 'quita a sua fatura',
  'impostos', 'cálculo com base', 'total parcelado',
  'próximas faturas', 'valor consolidado', 'encargo financeiros',
  'demais despesas', 'saldo financiado', 'cet',
];

function shouldSkip(description) {
  const lower = description.toLowerCase();
  return SKIP_KEYWORDS.some(kw => lower.includes(kw));
}

function cleanDescription(description) {
  return description
    .replace(/dólar:\s*\d+[,.]\d+/gi, '')
    .replace(/dolar:\s*\d+[,.]\d+/gi, '')
    .replace(/câmbio do dia:\s*R?\$?\s*\d+[,.]?\d*/gi, '')
    .replace(/cambio do dia:\s*R?\$?\s*\d+[,.]?\d*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse Brazilian bank statement / credit card bill text into transactions.
 * Works with both line-broken and flat (single-line) PDF text extractions.
 */
export function parseTransactionsFromText(text) {
  const transactions = [];
  const { year: refYear, month: refMonth } = detectReferenceYearMonth(text);

  // Pre-process: remove international transaction metadata so only the numeric values remain
  // Example: "Dólar: 9,99 Câmbio do dia: R$ 5,4540" → ""
  text = text
    .replace(/dólar:\s*\d{1,3}(?:\.\d{3})*,\d{2}/gi, '')
    .replace(/dolar:\s*\d{1,3}(?:\.\d{3})*,\d{2}/gi, '')
    .replace(/câmbio do dia:\s*R?\$?\s*\d{1,3}(?:\.\d{3})?,?\d*/gi, '')
    .replace(/cambio do dia:\s*R?\$?\s*\d{1,3}(?:\.\d{3})?,?\d*/gi, '');

  // Main regex: DATA + DESCRIPTION + VALUE
  const normalRe = /(\d{2}\/\d{2}(?:\/\d{4})?)\s+(.+?)\s+(-?\d{1,3}(?:\.\d{3})*,\d{2})(?=\s|$|[^0-9,])/g;

  // Lookahead regex to find a second value after the first match (for international transactions)
  const secondValueRe = /^\s*(-?\d{1,3}(?:\.\d{3})*,\d{2})(?=\s|$|[^0-9,])/;

  const seenRanges = new Set();
  let match;

  while ((match = normalRe.exec(text)) !== null) {
    const rangeKey = `${match.index}-${match[0].length}`;
    if (seenRanges.has(rangeKey)) continue;
    seenRanges.add(rangeKey);

    let [, dateStr, description, valueStr] = match;

    // ── Check for international transaction with two values (US$ + R$)
    // After the first value, look ahead to see if there's a second numeric value
    // before the next date or end of string.
    const afterMatch = text.slice(match.index + match[0].length);
    const secondValMatch = afterMatch.match(secondValueRe);
    if (secondValMatch) {
      // Verify the second value isn't immediately followed by another date pattern
      const afterSecond = afterMatch.slice(secondValMatch[0].length).trim();
      const isNextDate = /^\d{2}\/\d{2}/.test(afterSecond);
      
      // Also make sure we don't accidentally pick up a year from a full date
      const secondValue = parseValue(secondValMatch[1]);
      const firstValue = parseValue(valueStr);
      
      if (secondValue !== null && firstValue !== null && Math.abs(secondValue) > 0) {
        // If there's no next date right after, or if the second value is clearly the R$ amount,
        // use the second (larger or last) value for international transactions.
        // For PicPay, the R$ value is always the last one.
        valueStr = secondValMatch[1];
        // Mark the extended range as seen so the second value isn't parsed as a separate transaction
        const extendedLength = match[0].length + secondValMatch[0].length;
        seenRanges.add(`${match.index}-${extendedLength}`);
      }
    }

    const value = parseValue(valueStr);
    if (value === null || Math.abs(value) === 0) continue;

    description = cleanDescription(description);
    if (shouldSkip(description)) continue;
    if (description.length < 2) continue;

    const dateParts = dateStr.split('/');
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    let year = dateParts[2] ? parseInt(dateParts[2], 10) : null;

    if (isNaN(day) || isNaN(month)) continue;

    let formattedDate;
    if (year) {
      if (year < 100) year += 2000;
      const d = new Date(year, month - 1, day);
      if (isNaN(d.getTime())) continue;
      formattedDate = d.toISOString().split('T')[0];
    } else {
      formattedDate = resolveDate(day, month, refYear, refMonth);
      if (!formattedDate) continue;
    }

    let type = 'saida';
    const descLower = description.toLowerCase();
    const isPayment = descLower.includes('pagamento') || descLower.includes('fatura');
    const isCredit = descLower.includes('crédito') || descLower.includes('credito') ||
                     descLower.includes('estorno') || descLower.includes('recebido');

    if (value < 0) {
      type = (isPayment || isCredit) ? 'entrada' : 'saida';
    } else {
      type = (isCredit && !isPayment) ? 'entrada' : 'saida';
    }

    transactions.push({
      date: formattedDate,
      description,
      value: Math.abs(value),
      type,
      raw: match[0],
    });
  }

  return transactions;
}

/**
 * Suggest a category based on transaction description
 */
export function suggestCategory(description, categories) {
  if (!categories || categories.length === 0) return null;
  
  const descLower = description.toLowerCase();
  
  const keywordMap = {
    'uber': 'Transporte',
    '99': 'Transporte',
    'taxi': 'Transporte',
    'combustivel': 'Transporte',
    'gasolina': 'Transporte',
    'posto': 'Transporte',
    'estacionamento': 'Transporte',
    'pedagio': 'Transporte',
    'supermercado': 'Alimentação',
    'mercado': 'Alimentação',
    'padaria': 'Alimentação',
    'restaurante': 'Alimentação',
    'lanche': 'Alimentação',
    'ifood': 'Alimentação',
    'rappi': 'Alimentação',
    'netflix': 'Assinaturas',
    'spotify': 'Assinaturas',
    'amazon prime': 'Assinaturas',
    'disney': 'Assinaturas',
    'hbo': 'Assinaturas',
    'apple': 'Assinaturas',
    'google': 'Assinaturas',
    'xbox': 'Assinaturas',
    'microsoft': 'Assinaturas',
    'eletricidade': 'Casa',
    'luz': 'Casa',
    'agua': 'Casa',
    'água': 'Casa',
    'internet': 'Casa',
    'telefone': 'Casa',
    'condominio': 'Casa',
    'aluguel': 'Casa',
    'farmacia': 'Saúde',
    'farmácia': 'Saúde',
    'hospital': 'Saúde',
    'medico': 'Saúde',
    'médico': 'Saúde',
    'dentista': 'Saúde',
    'plano de saude': 'Saúde',
    'remedio': 'Saúde',
    'remédio': 'Saúde',
    'fitness': 'Saúde',
    'academia': 'Saúde',
    'shopping': 'Lazer',
    'cinema': 'Lazer',
    'teatro': 'Lazer',
    'viagem': 'Lazer',
    'hotel': 'Lazer',
    'passagem': 'Lazer',
    'roupa': 'Vestuário',
    'calcado': 'Vestuário',
    'calçado': 'Vestuário',
    'cartao': 'Cartão',
    'cartão': 'Cartão',
    'fatura': 'Cartão',
    'escola': 'Educação',
    'curso': 'Educação',
    'faculdade': 'Educação',
    'universidade': 'Educação',
    'livro': 'Educação',
    'pet': 'Pets',
    'cachorro': 'Pets',
    'gato': 'Pets',
    'racão': 'Pets',
    'racao': 'Pets',
    'veterinario': 'Pets',
    'vet': 'Pets',
    'mercado livre': 'Compras',
    'mercadolivre': 'Compras',
    'amazon': 'Compras',
    'shopee': 'Compras',
    'shein': 'Vestuário',
    'aliexpress': 'Compras',
    'meli': 'Compras',
    'youtube': 'Assinaturas',
    'yt': 'Assinaturas',
  };
  
  for (const [keyword, categoryName] of Object.entries(keywordMap)) {
    if (descLower.includes(keyword)) {
      const match = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      if (match) return match;
    }
  }
  
  for (const cat of categories) {
    if (descLower.includes(cat.name.toLowerCase())) {
      return cat;
    }
  }
  
  return null;
}
