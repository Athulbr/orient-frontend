import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, FileText } from 'lucide-react';
import useTranscriptStore from '../../../zustand-store/transcriptStore';
import useTranscriptGroupStore from '../../../zustand-store/transcriptGroupStore';
import { downloadZipTxtFiles } from '../../../global-utils/zipHandler';
import Spinner from '../../../components/Spinner';
import { TabNavComponent } from '../../docsnap/record/components/TabNav/TabNav';
import TranscriptSummary from './summary';
import TranscriptCpt from './cpt';
import { Button } from '../../../components/Button';
import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';
import { useAlertStore } from '../../../components/alert/AlertStore';

interface TabIF {
    id?: string;
    title?: string;
}

interface ResponseViewerProps {
    isProcessing: boolean;
    transcriptionData: any[];
    error: string | null;
    tabs: TabIF[];
    titleName?: string;
    clearData?: () => void;
    onSubmit?: () => void;
}

const ResponseViewer = ({ isProcessing, transcriptionData, error, tabs, titleName, clearData, onSubmit }: ResponseViewerProps) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [title, setTitle] = useState<string>();
    const [cptCode, setCptCode] = useState<any>();
    const [summary, setSummary] = useState<any>();
    const [transcripts, setTranscripts] = useState<any>();
    const [submit, setSubmit] = useState(false);
    const { showAlert, closeAlert } = useAlertStore();
    const [exit, setExit] = useState<boolean>(false);

    const navigate = useNavigate();
    const { id } = useParams();
    const { updateTranscript, transcriptData, gettranscriptData } = useTranscriptStore();
    const extractedData = useTranscriptGroupStore((state: any) => state.extractedData);

    useEffect(() => {
        if (id) {
            gettranscriptData(id);
        }
    }, [id]);

    useEffect(() => {
        transcriptionData.forEach(item => {
            if (item.filename === 'cpt_codes.txt') setCptCode(item);
            if (item.filename === 'medical_analysis.txt') setSummary(item);
            if (item.filename === 'source_text.txt') setTranscripts(item);
        });
        setTitle(titleName?.toLowerCase());
    }, [transcriptionData, titleName, id]);

    const exportData = async (index: number) => {
        const fileName = index === 0 ? transcripts?.filename : index === 1 ? summary?.filename : cptCode?.filename;
        if (!fileName) return;
        await downloadZipTxtFiles(extractedData, fileName);
    };

    const renderContent = () => {
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-6 gap-4">
                    <AlertCircle className="w-12 h-12 text-red-600" />
                    <h3 className="text-red-600 font-semibold text-lg">Error</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            );
        }

        if (isProcessing) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-6 gap-4 animate-pulse">
                    <Spinner />
                    <h4 className="text-gray-800 font-medium">Processing</h4>
                    <p className="text-gray-500">Extracting text from your audio...</p>
                </div>
            );
        }

        if (!transcripts?.content) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-6 gap-4 h-full">
                    <FileText className="w-12 h-12 text-gray-400" />
                    <h3 className="text-lg font-semibold">No Transcription Yet</h3>
                    <p className="text-gray-600">Record and upload audio to see the transcription here.</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-6">
                <div className="max-h-[calc(100vh-153px)] overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white">
                    <p className="whitespace-pre-line text-gray-700">
                        {tabIndex === 0 ? transcripts?.content : tabIndex === 1 ? summary?.content : cptCode?.content}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col items-center justify-between">
            {/* Tabs */}
            <TabNavComponent tabs={tabs} onChange={setTabIndex} exportData={exportData} enableFlag={transcripts?.content} />

            {/* Tab Content */}
            {tabIndex === 0 && <div className="flex-1 w-full overflow-y-auto">{renderContent()}</div>}
            {tabIndex === 1 && <TranscriptSummary isProcessing={isProcessing} transcriptionData={summary} error={error} />}
            {tabIndex === 2 && <TranscriptCpt isProcessing={isProcessing} transcriptionData={cptCode} error={error} />}

            {/* Action Buttons */}
            {transcripts?.content && (
                <div className="w-full flex justify-end gap-3 p-3">
                    <Button
                        onClick={() => {
                            showAlert({
                                alertText: 'Are you sure you want to exit, Exit without saving will lose the edited data?',
                                primaryButtonText: 'Exit',
                                onPrimaryAction: async () => {
                                    setExit(true);
                                    closeAlert();
                                    navigate('/transcript/list');
                                }
                            });
                        }}
                    >
                        Close
                    </Button>
                    <Button onClick={onSubmit}>Save</Button>
                </div>
            )}

            {/* Submit Form */}
            {/* {submit && (
                <>
                    <UseFormbuilder
                        title="Transcription"
                        isOpen={submit}
                        className="w-[80vw]"
                        name="Transcription"
                        closeDialog={() => setSubmit(false)}
                        onSubmit={onSubmit}
                    />
                </>
            )} */}
        </div>
    );
};

export default ResponseViewer;
