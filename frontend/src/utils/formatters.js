import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}

export function formatDate(dateString) {
  if (!dateString) return '';
  // Se for YYYY-MM
  if (dateString.length === 7) {
    const [year, month] = dateString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return format(date, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase());
  }
  
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy');
  } catch {
    return dateString;
  }
}

export function getStatusColor(status) {
  switch (status) {
    case 'ok':
    case 'pago':
    case 'concluido':
      return 'success';
    case 'pendente':
    case 'processando':
    case 'revisar':
      return 'warning';
    case 'atrasado':
    case 'erro':
      return 'danger';
    case 'cancelado':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function getStatusLabel(status) {
  const labels = {
    ok: 'Pago',
    pendente: 'Pendente',
    atrasado: 'Atrasado',
    cancelado: 'Cancelado',
    revisar: 'Revisar',
    processando: 'Processando',
    concluido: 'Concluído',
    erro: 'Erro'
  };
  return labels[status] || status;
}
