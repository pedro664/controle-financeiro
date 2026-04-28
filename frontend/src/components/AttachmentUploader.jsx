import { useState, useRef } from "react";
import { api } from "../services/api";
import { Button } from "./ui/Button";
import { Paperclip, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";

export function AttachmentUploader({ transactionId, attachments = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setUploading(true);
    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });

      const res = await api.post('/attachments', {
        transaction_id: transactionId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        base64_content: base64,
      });

      onChange?.([...attachments, res.data]);
    } catch (err) {
      alert(err.message || 'Erro ao enviar arquivo');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleRemove(id) {
    if (!confirm('Remover anexo?')) return;
    try {
      await api.delete(`/attachments/${id}`);
      onChange?.(attachments.filter(a => a.id !== id));
    } catch (err) {
      alert(err.message || 'Erro ao remover anexo');
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          variant="outline"
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !transactionId}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
          Anexar
        </Button>
        {!transactionId && (
          <span className="text-xs text-emeraldApp-900/60 dark:text-emeraldApp-100/60">Salve a transação primeiro para anexar</span>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emeraldApp-50 dark:bg-gray-800 text-sm">
              {att.file_type?.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-emeraldApp-700" /> : <FileText className="w-4 h-4 text-emeraldApp-700" />}
              <a href={att.public_url} target="_blank" rel="noreferrer" className="text-emeraldApp-700 dark:text-emeraldApp-300 hover:underline truncate max-w-[150px]">
                {att.file_name}
              </a>
              <button onClick={() => handleRemove(att.id)} className="text-red-600 hover:text-red-800">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
