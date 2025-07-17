import { useState } from 'react';
import { RichTextEditor } from '../../../../../components/RichTextEditor';
import { purchaseOrder } from '../utils';
import { Button } from '../../../../../components/Button';
import Spinner from '../../../../../components/Spinner';
import { FileText } from 'lucide-react';

export const InvoiceGenerator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const generateInvoice = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/generate-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ purchaseOrder }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setContent(data.invoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error generating invoice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center overflow-hidden p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {content ? (
        <div className="flex flex-1 flex-col overflow-y-auto">
          <RichTextEditor className="h-full" initialContent={content} onChange={setContent} theme={theme} placeholder="Start writing your invoice..." />
        </div>
      ) : (
        <Button startIcon={isLoading ? <Spinner size={20} /> : <FileText size={18} />} onClick={generateInvoice} disabled={isLoading}>
          {isLoading ? 'Generating Invoice...' : 'Generate Invoice'}
        </Button>
      )}
    </div>
  );
};
