import { Button } from '../../../../../components/Button';
import Spinner from '../../../../../components/Spinner';
import { FileText } from 'lucide-react';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { RichTextEditor } from '../../../../../components/RichTextEditor';
import { useViewRecordApi } from '../hooks/useViewRecordApi';

export const InvoiceGenerator: React.FC = () => {
  const { state, setState } = useViewRecordState();
  const { generateInvoiceWithAI } = useViewRecordApi();

  if (!state.record?.extractedData) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {state.invoiceContent ? (
        <div className="flex-1 overflow-hidden p-4 pr-2">
          <div className="relative h-full">
            <RichTextEditor
              height="calc(100vh - 85px)"
              value={state.invoiceContent || ''}
              onChange={(newContent: string) => setState(prev => ({ ...prev, invoiceContent: newContent }))}
              placeholder="Your invoice content will appear here..."
            />
            {state.generatingInvoice && (
              <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
                <Spinner size={32} />
                <span className="ml-2 text-white">Regenerating Invoice...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <Button
            startIcon={state.generatingInvoice ? <Spinner size={20} /> : <FileText size={18} />}
            onClick={generateInvoiceWithAI}
            disabled={state.generatingInvoice}
          >
            {state.generatingInvoice ? 'Generating Invoice...' : 'Generate Invoice'}
          </Button>
        </div>
      )}
    </div>
  );
};
