import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AudioRecorder from './audioRecorder';
import ResponseViewer from './responseViewer/index';
import useTranscriptGroupStore from '../../zustand-store/transcriptGroupStore';
import useTranscriptStore from '../../zustand-store/transcriptStore';
import PageContainer from '../../components/PageContainer';
import PageNameComponent from '../../components/PageName';
import { ResizableContainer } from '../docsnap/template/update-template/components/ResizableContainer';
import { Button } from '../../components/Button';
import { Upload } from 'lucide-react';
import { getCurrentDateTime } from '../../global-utils/convert-date-format';

interface PropsIF {
    update?: boolean;
}

interface TabIF {
    id?: string;
    title?: string;
}

interface TranscriptItem {
    filename: string;
    content: string;
}

const TranscriptProjectPage: React.FC<PropsIF> = ({ update }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [deleteAudio, setDeleteAudio] = useState(false);
    const [transcriptionData, setTranscriptionData] = useState<TranscriptItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [zipBlob, setZipBlob] = useState<Blob | null>(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const { updateTranscript, currentData, gettranscriptData, transcriptData } = useTranscriptStore();

    useEffect(() => {
        if (id) {
            gettranscriptData(id);
        }
    }, [id]);

    useEffect(() => {
        if (transcriptData && transcriptData?.transcriptions?.length > 0) {
            setTranscriptionData(transcriptData?.transcriptions || []);
        }
    }, [transcriptData]);

    const tabs = useMemo(
        () => [
            { id: 'transcript', title: 'Transcription' },
            { id: 'summary', title: 'Summary' },
            { id: 'cpt', title: 'CPT' }
        ],
        []
    );

    const clearData = () => {
        setTranscriptionData([]);
        setDeleteAudio(true);
    };

    const handleExport = () => {
        if (!zipBlob) return;

        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${getCurrentDateTime()}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleSubmit = async () => {
        if (currentData?._id) {
            const payload = {
                name: currentData?.name,
                transcriptions: transcriptionData
            };
            const res = await updateTranscript(payload, currentData._id);
            if (res) navigate('/transcript/list');
        }
    };

    const titleName = 'Audio';

    return (
        <PageContainer className="gap-4 p-2 md:p-6">
            <PageNameComponent
                name={id ? 'Update CPT Code' : 'Create CPT Code'}
                showBackButton={true}
                customGoBackFunction={() => navigate('/transcript/list')}
            >
                <Button startIcon={<Upload size={16} className="text-gray-500" />} outlined onClick={handleExport}>
                    Export
                </Button>
            </PageNameComponent>
            <div className="hidden md:block overflow-auto flex-col h-full  border-t">
                <ResizableContainer
                    left={
                        <AudioRecorder
                            titleName={titleName}
                            setIsProcessing={setIsProcessing}
                            setZipBlob={setZipBlob}
                            setTranscriptionData={setTranscriptionData}
                            setError={setError}
                            deleteAudioTrack={deleteAudio}
                        />
                    }
                    right={
                        <ResponseViewer
                            isProcessing={isProcessing}
                            transcriptionData={transcriptionData}
                            tabs={tabs}
                            titleName={titleName}
                            error={error}
                            clearData={clearData}
                            onSubmit={handleSubmit}
                        />
                    }
                    initialLeftWidthPercent={60}
                    minLeftWidthPercent={30}
                    maxLeftWidthPercent={70}
                />
            </div>
            <div className="block md:hidden overflow-auto  flex-col h-full">
                <AudioRecorder
                    titleName={titleName}
                    setIsProcessing={setIsProcessing}
                    setTranscriptionData={setTranscriptionData}
                    setError={setError}
                    deleteAudioTrack={deleteAudio}
                />
            </div>
        </PageContainer>
    );
};

export default TranscriptProjectPage;
