-- Criar tabela de faturas de cartão de crédito
CREATE TABLE IF NOT EXISTS credit_card_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  filename TEXT NOT NULL,
  card_name TEXT DEFAULT 'Cartão',
  reference_month TEXT NOT NULL,
  due_date DATE,
  closing_date DATE,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'aberta',
  source_file_id UUID REFERENCES imported_files(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_credit_card_bills_user_id ON credit_card_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_bills_reference_month ON credit_card_bills(reference_month);
CREATE INDEX IF NOT EXISTS idx_credit_card_bills_status ON credit_card_bills(status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credit_card_bills_updated_at
BEFORE UPDATE ON credit_card_bills
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Política RLS (opcional, se usar RLS)
ALTER TABLE credit_card_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON credit_card_bills
  FOR ALL USING (true) WITH CHECK (true);
