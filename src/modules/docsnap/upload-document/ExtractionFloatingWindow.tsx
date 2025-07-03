import { CheckCircle2, CircleAlert, CircleX } from 'lucide-react';
import { cn } from '../../../utils/twMerge';
import { useDocsnapStore } from '../../../zustand-store/DocsnapStore';
import ProgressBar from '../../../components/ProgressBar';

interface ExtractionFloatingWindowIF {
  test?: string;
}

const ExtractionFloatingWindow: React.FC<ExtractionFloatingWindowIF> = () => {
  const { extractionQueue, clearExtractionQueue } = useDocsnapStore();

  if (!extractionQueue.length) return null;

  const getStatusUI = (status: string) => {
    switch (status) {
      case 'Uploading':
        return <p className="rounded bg-amber-100 px-2 py-1 text-sm text-amber-500">Uploading</p>;
      case 'Running OCR':
        return (
          <div className="flex flex-col text-xs">
            <span className="text-amber-500">Running OCR</span>
            <div className="flex items-center gap-3">
              <ProgressBar value={40} />
              <span className="text-[10px] text-amber-500">40%</span>
            </div>
          </div>
        );
      case 'OCR Processing':
        return (
          <div className="flex flex-col text-xs">
            <span className="text-amber-500">OCR Processing</span>
            <div className="flex items-center gap-3">
              <ProgressBar value={70} className="min-w-20" />
              <span className="text-[10px] text-amber-500">70%</span>
            </div>
          </div>
        );
      case 'Complete':
        return <CheckCircle2 className="text-green-500" />;
      case 'failed':
        return <CircleAlert className="text-red-500" />;
      default:
        return <p className="rounded bg-amber-100 px-2 py-1 text-sm text-amber-500">Processing</p>;
    }
  };

  return (
    <div className="absolute right-4 bottom-4 z-10000 flex w-110 flex-col gap-2 rounded-lg border bg-white">
      <div className="flex w-full items-center justify-between border-b p-4 text-lg font-semibold">
        Extraction Status <CircleX size={20} className="cursor-pointer text-gray-500" onClick={clearExtractionQueue} />
      </div>
      <div className="flex flex-col gap-4 p-4">
        {extractionQueue.map((file: any, idx: number) => (
          <div key={idx} className={cn('flex items-center justify-between gap-2')}>
            <p className="truncate text-sm">{file.fileName}</p>
            {getStatusUI(file.status)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtractionFloatingWindow;
