import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../services/api";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Forms";
import { extractTextFromPDF, parseTransactionsFromText, suggestCategory } from "../services/pdfParser";
import { formatCurrency, formatDate } from "../utils/formatters";
import { UploadCloud, FileText, Trash2, Check, X, FileUp, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

function detectCardName(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('picpay')) return 'PicPay';
  if (lower.includes('nubank')) return 'Nubank';
  if (lower.includes('inter')) return 'Inter';
  if (lower.includes('itau') || lower.includes('itaú')) return 'Itaú';
  if (lower.includes('bradesco')) return 'Bradesco';
  if (lower.includes('santander')) return 'Santander';
  if (lower.includes('c6')) return 'C6 Bank';
  if (lower.includes('neon')) return 'Neon';
  if (lower.includes('next')) return 'Next';
  return 'Cartão';
}

function detectReferenceMonth(transactions) {
  if (!transactions || transactions.length === 0) return null;
  // Find the most common month among transactions
  const monthCounts = {};
  for (const tx of transactions) {
    if (tx.date) {
      const month = tx.date.slice(0, 7);
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
  }
  const entries = Object.entries(monthCounts);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function ImportPDF() {
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [extractedTxs, setExtractedTxs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/imported-files'),
      api.get('/categories')
    ]).then(([filesRes, catsRes]) => {
      setFiles(filesRes.data || []);
      setCategories(catsRes.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const processFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setErrorMsg('Por favor, selecione um arquivo PDF válido.');
      return;
    }
    setErrorMsg(null);
    setExtracting(true);
    setSelectedFile(file);

    try {
      const text = await extractTextFromPDF(file);
      const parsed = parseTransactionsFromText(text);

      if (parsed.length === 0) {
        setErrorMsg('Nenhuma transação encontrada no PDF. Verifique se é um extrato bancário.');
        setExtracting(false);
        return;
      }

      // Enrich with category suggestions
      const enriched = parsed.map((tx, idx) => {
        const cat = suggestCategory(tx.description, categories);
        return {
          id: `temp-${idx}`,
          date: tx.date,
          description: tx.description,
          value: tx.value,
          type: tx.type,
          category_id: cat?.id || '',
          category_name: cat?.name || '',
          status: 'pendente',
          origin: 'pdf',
          selected: true,
        };
      });

      setExtractedTxs(enriched);
      setPreviewOpen(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao ler o PDF. Tente outro arquivo.');
    } finally {
      setExtracting(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  }, [categories]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const toggleSelection = (id) => {
    setExtractedTxs(prev => prev.map(tx => tx.id === id ? { ...tx, selected: !tx.selected } : tx));
  };

  const updateTx = (id, field, value) => {
    setExtractedTxs(prev => prev.map(tx => {
      if (tx.id !== id) return tx;
      const updated = { ...tx, [field]: value };
      if (field === 'category_id') {
        const cat = categories.find(c => c.id === value);
        updated.category_name = cat?.name || '';
      }
      return updated;
    }));
  };

  const removeTx = (id) => {
    setExtractedTxs(prev => prev.filter(tx => tx.id !== id));
  };

  const handleImport = async () => {
    const toImport = extractedTxs.filter(tx => tx.selected);
    if (toImport.length === 0) {
      setErrorMsg('Selecione pelo menos uma transação para importar.');
      return;
    }
    setImporting(true);
    setErrorMsg(null);

    try {
      // 1. Register the file
      const fileRes = await api.post('/imported-files', {
        file_name: selectedFile.name,
        file_type: 'fatura',
        reference_month: detectReferenceMonth(extractedTxs) || new Date().toISOString().slice(0, 7),
        bank_name: detectCardName(selectedFile.name),
      });
      const fileId = fileRes.data?.id;

      // 2. Bulk insert transactions
      const payload = toImport.map(tx => ({
        date: tx.date,
        description: tx.description,
        value: tx.value,
        type: tx.type,
        category_id: tx.category_id || null,
        status: tx.status,
        origin: 'pdf',
        source_file_id: fileId,
      }));

      await api.post('/transactions/bulk', { transactions: payload });

      // 3. Create credit card bill automatically
      const billPayload = {
        filename: selectedFile.name,
        card_name: detectCardName(selectedFile.name),
        reference_month: detectReferenceMonth(extractedTxs) || new Date().toISOString().slice(0, 7),
        total_amount: toImport.filter(tx => tx.type === 'saida').reduce((s, tx) => s + tx.value, 0),
        status: 'aberta',
        source_file_id: fileId,
      };
      try {
        await api.post('/credit-card-bills', billPayload);
      } catch (err) {
        console.error('Erro ao criar fatura:', err);
      }

      // 4. Update file status
      if (fileId) {
        await api.patch(`/imported-files/${fileId}/status`, { status: 'concluido' });
      }

      // 5. Refresh history
      const historyRes = await api.get('/imported-files');
      setFiles(historyRes.data || []);

      setPreviewOpen(false);
      setExtractedTxs([]);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao importar transações.');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteFile = async (id) => {
    if (!confirm('Excluir este registro de importação?')) return;
    try {
      await api.delete(`/imported-files/${id}`);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      alert(err.message || 'Erro ao excluir.');
    }
  };

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const typeOptions = [{ value: 'saida', label: 'Saída' }, { value: 'entrada', label: 'Entrada' }];
  const statusOptions = [{ value: 'pendente', label: 'Pendente' }, { value: 'ok', label: 'Pago' }];
  const selectedTxs = extractedTxs.filter(tx => tx.selected);
  const selectedCount = selectedTxs.length;
  const totalGastos = selectedTxs.filter(tx => tx.type === 'saida').reduce((s, tx) => s + tx.value, 0);
  const totalCreditos = selectedTxs.filter(tx => tx.type === 'entrada').reduce((s, tx) => s + tx.value, 0);
  const saldoImportacao = totalGastos - totalCreditos;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">Importação Automática</h1>
        <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mt-1">Otimize a entrada de dados via PDF</p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {errorMsg}
          <button onClick={() => setErrorMsg(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Upload de Arquivo" />
          <div
            className={`border-2 border-dashed rounded-2xl p-16 flex flex-col items-center text-center transition-colors cursor-pointer group ${
              dragActive ? 'border-emeraldApp-700 bg-emeraldApp-50 dark:bg-gray-800' : 'border-emeraldApp-200 dark:border-gray-600 bg-emeraldApp-50/30 dark:bg-gray-800/30 hover:bg-emeraldApp-50 dark:hover:bg-gray-800'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            {extracting ? (
              <>
                <div className="w-20 h-20 bg-emeraldApp-100 dark:bg-gray-700 text-emeraldApp-700 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Loader2 className="w-10 h-10 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50 mb-2">Lendo PDF...</h3>
                <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 max-w-sm">Extraindo transações do arquivo.</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-emeraldApp-100 dark:bg-gray-700 text-emeraldApp-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50 mb-2">Clique ou arraste seu PDF aqui</h3>
                <p className="text-emeraldApp-900/75 dark:text-emeraldApp-100/80 max-w-sm mb-6">Leitura automática dos lançamentos com sugestão de categorias.</p>
                <Button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <FileUp className="w-4 h-4" /> Selecionar Arquivo
                </Button>
              </>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Como funciona?" />
            <div className="space-y-4">
              {[
                ['1','Upload','Envie o PDF do banco.'],
                ['2','Extração','Dados são lidos automaticamente.'],
                ['3','Revisão','Confira e aprove as categorias.']
              ].map(([n,t,d])=>(
                <div key={n} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emeraldApp-100 dark:bg-gray-700 text-emeraldApp-700 flex items-center justify-center font-bold shrink-0">{n}</div>
                  <div><h4 className="font-bold text-emeraldApp-900 dark:text-emeraldApp-50">{t}</h4><p className="text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80">{d}</p></div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Histórico" />
            {loading ? (
              <div className="flex items-center justify-center py-8 text-emeraldApp-700"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando...</div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-emeraldApp-900/70 dark:text-emeraldApp-100/70 flex flex-col items-center">
                <FileText className="w-10 h-10 mb-2 opacity-50" />
                Nenhum arquivo processado.
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {files.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-emeraldApp-50/50 dark:bg-gray-800/50 hover:bg-emeraldApp-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-emeraldApp-900 dark:text-emeraldApp-50 truncate">{f.filename}</p>
                      <p className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60">{formatDate(f.created_at)} • {(f.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={f.status === 'concluido' ? 'success' : f.status === 'erro' ? 'danger' : 'warning'}>
                        {f.status === 'concluido' ? 'Concluído' : f.status === 'erro' ? 'Erro' : f.status === 'processando' ? 'Processando' : 'Pendente'}
                      </Badge>
                      <button onClick={() => handleDeleteFile(f.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={previewOpen} onClose={() => { setPreviewOpen(false); setExtractedTxs([]); setSelectedFile(null); }} title="Revisar Transações Extraídas">
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-emeraldApp-50 dark:bg-gray-800 rounded-xl p-4">
            <div>
              <p className="text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Arquivo</p>
              <p className="font-semibold text-emeraldApp-900 dark:text-emeraldApp-50">{selectedFile?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Selecionadas</p>
              <p className="font-bold text-emeraldApp-900 dark:text-emeraldApp-50">{selectedCount} de {extractedTxs.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Total de gastos</p>
              <p className="font-bold text-red-600">{formatCurrency(totalGastos)}</p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[50vh] overflow-y-auto rounded-xl border border-emeraldApp-100 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                <tr className="border-b border-emeraldApp-100 dark:border-gray-700">
                  <th className="py-3 px-3 w-10"><input type="checkbox" checked={selectedCount === extractedTxs.length && extractedTxs.length > 0} onChange={(e) => setExtractedTxs(prev => prev.map(tx => ({ ...tx, selected: e.target.checked })))} className="rounded border-emeraldApp-200 dark:border-gray-600 dark:bg-gray-800" /></th>
                  <th className="py-3 px-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Data</th>
                  <th className="py-3 px-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Descrição</th>
                  <th className="py-3 px-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Categoria</th>
                  <th className="py-3 px-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-right">Valor</th>
                  <th className="py-3 px-3 font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80 text-center">Tipo</th>
                  <th className="py-3 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emeraldApp-100 dark:divide-gray-700">
                {extractedTxs.map((tx) => (
                  <tr key={tx.id} className={`hover:bg-emeraldApp-50/50 dark:hover:bg-gray-800/50 transition-colors ${!tx.selected ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-3"><input type="checkbox" checked={tx.selected} onChange={() => toggleSelection(tx.id)} className="rounded border-emeraldApp-200 dark:border-gray-600 dark:bg-gray-800" /></td>
                    <td className="py-3 px-3">
                      <input type="date" value={tx.date} onChange={e => updateTx(tx.id, 'date', e.target.value)} className="w-[110px] rounded-lg border border-emeraldApp-100 dark:border-gray-700 px-2 py-1 text-xs bg-white dark:bg-gray-900 dark:text-white dark:[color-scheme:dark] dark:placeholder:text-gray-400" />
                    </td>
                    <td className="py-3 px-3">
                      <input type="text" value={tx.description} onChange={e => updateTx(tx.id, 'description', e.target.value)} className="w-full min-w-[140px] rounded-lg border border-emeraldApp-100 dark:border-gray-700 px-2 py-1 text-xs bg-white dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400" />
                    </td>
                    <td className="py-3 px-3">
                      <select value={tx.category_id} onChange={e => updateTx(tx.id, 'category_id', e.target.value)} className="w-[130px] rounded-lg border border-emeraldApp-100 dark:border-gray-700 px-2 py-1 text-xs bg-white dark:bg-gray-900 dark:text-white dark:[color-scheme:dark]">
                        <option value="">Sem categoria</option>
                        {catOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <input type="number" step="0.01" value={tx.value} onChange={e => updateTx(tx.id, 'value', parseFloat(e.target.value) || 0)} className="w-[90px] rounded-lg border border-emeraldApp-100 dark:border-gray-700 px-2 py-1 text-xs bg-white dark:bg-gray-900 text-right dark:text-white dark:placeholder:text-gray-400" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <select value={tx.type} onChange={e => updateTx(tx.id, 'type', e.target.value)} className="rounded-lg border border-emeraldApp-100 dark:border-gray-700 px-2 py-1 text-xs bg-white dark:bg-gray-900 dark:text-white dark:[color-scheme:dark]">
                        {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <button onClick={() => removeTx(tx.id)} className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => { setPreviewOpen(false); setExtractedTxs([]); setSelectedFile(null); }}>Cancelar</Button>
            <Button onClick={handleImport} disabled={importing || selectedCount === 0}>
              {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</> : <><Check className="w-4 h-4" /> Importar {selectedCount} transação{selectedCount !== 1 ? 'ões' : ''}</>}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
