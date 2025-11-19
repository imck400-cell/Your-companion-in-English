import React from 'react';
import { Copy, FileText, FileSpreadsheet, Printer } from 'lucide-react';
import { t } from '../utils/translations';
import { Language } from '../types';

interface Props {
  content: string;
  title?: string;
  data?: any[]; // Array of objects for CSV
  lang: Language;
}

const ExportToolbar: React.FC<Props> = ({ content, title = "LinguistAI-Export", data, lang }) => {
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert(lang === 'ar' ? 'تم النسخ!' : 'Copied!');
  };

  const handleTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCsv = () => {
    if (!data || data.length === 0) return;
    
    // Basic CSV generation
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    
    const element = document.createElement("a");
    const file = new Blob([csvContent], {type: 'text/csv'});
    element.href = URL.createObjectURL(file);
    element.download = `${title}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    // Create a hidden iframe or window to print just the content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <html dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    pre { white-space: pre-wrap; background: #f5f5f5; padding: 10px; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div>${content.replace(/\n/g, '<br>')}</div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
  };

  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse bg-slate-100 p-2 rounded-lg">
      <button onClick={handleCopy} className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded transition-colors" title={t('copy', lang)}>
        <Copy size={18} />
      </button>
      <button onClick={handleTxt} className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded transition-colors" title="TXT">
        <FileText size={18} />
      </button>
      {data && (
        <button onClick={handleCsv} className="p-2 text-slate-600 hover:text-green-600 hover:bg-white rounded transition-colors" title="Excel/CSV">
          <FileSpreadsheet size={18} />
        </button>
      )}
      <button onClick={handlePrint} className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded transition-colors" title="PDF/Print">
        <Printer size={18} />
      </button>
    </div>
  );
};

export default ExportToolbar;