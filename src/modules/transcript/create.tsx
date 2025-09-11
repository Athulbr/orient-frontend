import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AudioRecorder from './audioRecorder';
import ResponseViewer from './responseViewer/index';
import useTranscriptGroupStore from '../../zustand-store/transcriptGroupStore';
import useTranscriptStore from '../../zustand-store/transcriptStore';
import PageContainer from '../../components/PageContainer';
import PageNameComponent from '../../components/PageName';

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

    const titleName = 'Audio';

    return (
        <PageContainer className="gap-4 p-6">
            <PageNameComponent name="Create CPT Code" showBackButton={true} />
            <div className="h-[87vh] flex flex-col bg-gray-50 overflow-hidden">
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 grid grid-cols-[1.3fr_1fr] relative overflow-hidden min-h-[87vh]">
                        <div className="flex flex-col border-r border-gray-200 relative overflow-hidden">
                            <AudioRecorder
                                titleName={titleName}
                                setIsProcessing={setIsProcessing}
                                setTranscriptionData={setTranscriptionData}
                                setError={setError}
                                deleteAudioTrack={deleteAudio}
                            />
                        </div>
                        <div className="relative overflow-hidden min-h-[50vh] max-h-[87vh] xs:hidden">
                            <ResponseViewer
                                isProcessing={isProcessing}
                                transcriptionData={transcriptionData}
                                tabs={tabs}
                                titleName={titleName}
                                error={error}
                                clearData={clearData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default TranscriptProjectPage;
