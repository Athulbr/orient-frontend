import { FileText, AlertCircle } from 'lucide-react';
import Spinner from '../../../components/Spinner';
import { TranscriptionData } from '../interface';

interface TranscriptCptProps {
    isProcessing: boolean;
    transcriptionData?: TranscriptionData;
    error: string | null;
}

const TranscriptCpt = ({ isProcessing, transcriptionData, error }: TranscriptCptProps) => {
    const renderContent = () => {
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
                    <AlertCircle className="w-12 h-12 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-600">Error</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            );
        }

        if (isProcessing) {
            return (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center p-6 animate-pulse">
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
                    <h3 className="text-lg font-semibold text-gray-900">No CPT codes yet.</h3>
                    <p className="text-gray-500">Record and upload audio to see the CPT codes here.</p>
                </div>
            );
        }

        return (
            // <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
            //     <div className=" border border-gray-200 rounded-lg p-4 bg-white">
            //         <p className="whitespace-pre-line text-gray-700">{transcriptionData.content}</p>
            //     </div>
            // </div>
                                <p className="overflow-y-auto flex-1 whitespace-pre-line text-gray-700">{transcriptionData.content}</p>

        );
    };

    return renderContent();
};

export default TranscriptCpt;
