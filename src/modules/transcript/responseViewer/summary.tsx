import { AlertCircle, FileText } from 'lucide-react';
import Spinner from '../../../components/Spinner';

interface TranscriptSummaryProps {
    isProcessing: boolean;
    transcriptionData?: { content?: string; filename?: string };
    error?: string | null;
}

const TranscriptSummary = ({ isProcessing, transcriptionData, error }: TranscriptSummaryProps) => {
    const renderContent = () => {
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-6 gap-4">
                    <AlertCircle className="w-12 h-12 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-600">Error</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            );
        }

        if (isProcessing) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-6 gap-4 animate-pulse">
                    <Spinner />
                    <h4 className="text-lg font-semibold text-gray-900">Processing</h4>
                    <p className="text-gray-500">Extracting text from your audio...</p>
                </div>
            );
        }

        if (!transcriptionData?.content) {
            return (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center p-6">
                    <FileText className="w-12 h-12 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">No summary yet.</h3>
                    <p className="text-gray-500">Record and upload audio to see the summary here.</p>
                </div>
            );
        }

        return (
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <p className="whitespace-pre-line text-gray-700">{transcriptionData.content}</p>
                </div>
            </div>
        );
    };

    return renderContent();
};

export default TranscriptSummary;
