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
        <PageContainer className="gap-4 p-2 md:p-6">
            <PageNameComponent name="Create CPT Code" showBackButton={true} >
                <Button startIcon={<Upload size={16} className='text-gray-500' />} outlined>Export</Button>
            </PageNameComponent>
            <div className="hidden md:block overflow-auto flex-col h-full  border-t">
                <ResizableContainer
                    left={
                        <AudioRecorder
                            titleName={titleName}
                            setIsProcessing={setIsProcessing}
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
