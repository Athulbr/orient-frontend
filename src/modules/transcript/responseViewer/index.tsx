import { useEffect, useMemo, useState } from 'react';
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
import { useAlertStore } from '../../../components/alert/AlertStore';
import SourcePage from './source';

interface TabIF {
    id?: string;
    title?: string;
}

interface ResponseViewerProps {
    isProcessing: boolean;
    transcriptionData: any[];
    error: string | null;
    titleName?: string;
    clearData?: () => void;
    onSubmit?: (data?: any[]) => void;
    setTranscriptionData?: (data: any[]) => void;
    setShowPreview?: (value: boolean) => void;
}

const ResponseViewer = ({
    isProcessing,
    transcriptionData,
    error,
    titleName,
    clearData,
    onSubmit,
    setShowPreview,
    setTranscriptionData
}: ResponseViewerProps) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [title, setTitle] = useState<string>();
    const [cptCode, setCptCode] = useState<any>();
    const [summary, setSummary] = useState<any>();
    const [transcripts, setTranscripts] = useState<any>();
    const [editedTranscript, setEditedTranscript] = useState<string>('');
    const [editedSummary, setEditedSummary] = useState<string>('');
    const [editedCpt, setEditedCpt] = useState<string>('');
    const [submit, setSubmit] = useState(false);
    const { showAlert, closeAlert } = useAlertStore();
    const [exit, setExit] = useState<boolean>(false);

    const tabs = useMemo(
        () => [
            { id: 'transcript', title: 'Transcription' },
            { id: 'summary', title: 'Summary' },
            { id: 'cpt', title: 'CPT' }
        ],
        []
    );

    const navigate = useNavigate();
    const { id } = useParams();
    const { updateTranscript, transcriptData, gettranscriptData } = useTranscriptStore();

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

    // Seed editable state when the data buckets are set
    useEffect(() => {
        if (transcripts?.content !== undefined) setEditedTranscript(transcripts.content);
    }, [transcripts]);
    useEffect(() => {
        if (summary?.content !== undefined) setEditedSummary(summary.content);
    }, [summary]);
    useEffect(() => {
        if (cptCode?.content !== undefined) setEditedCpt(cptCode.content);
    }, [cptCode]);

    const handleSave = async () => {
        const newData = [
            { filename: 'source_text.txt', content: editedTranscript ?? '' },
            { filename: 'medical_analysis.txt', content: editedSummary ?? '' },
            { filename: 'cpt_codes.txt', content: editedCpt ?? '' }
        ];
        setTranscriptionData?.(newData);
        onSubmit?.(newData);
    };

    return (
        <div className="h-full flex flex-col items-start justify-between p-2">
            <Button outlined onClick={() => setShowPreview?.(false)} className="md:hidden">
                Go to Record{' '}
            </Button>
            {/* Tabs */}
            <TabNavComponent tabs={tabs} onChange={setTabIndex} enableFlag={transcripts?.content} />

            {/* Tab Content */}
            {tabIndex === 0 && (
                <SourcePage isProcessing={isProcessing} transcriptionData={transcripts} error={error} value={editedTranscript} onChange={setEditedTranscript} />
            )}
            {tabIndex === 1 && (
                <TranscriptSummary isProcessing={isProcessing} transcriptionData={summary} error={error} value={editedSummary} onChange={setEditedSummary} />
            )}
            {tabIndex === 2 && (
                <TranscriptCpt isProcessing={isProcessing} transcriptionData={cptCode} error={error} value={editedCpt} onChange={setEditedCpt} />
            )}

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
                                    navigate('/audio-transcript/list');
                                }
                            });
                        }}
                    >
                        Close
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            )}
        </div>
    );
};

export default ResponseViewer;
