import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AudioRecorder from './audioRecorder';
import ResponseViewer from './responseViewer/index';
import useTranscriptGroupStore from '../../zustand-store/transcriptGroupStore';
import useTranscriptStore from '../../zustand-store/transcriptStore';

interface PropsIF {
    update?: boolean;
}

interface TabIF {
    id?: string;
    title?: string;
}

const TranscriptProjectPage: React.FC<PropsIF> = ({ update }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { gettranscript, transcript } = useTranscriptGroupStore();
    const { gettranscriptData, transcriptData } = useTranscriptStore();

    const [isProcessing, setIsProcessing] = useState(false);
    const [deleteAudio, setDeleteAudio] = useState(false);
    const [transcriptionData, setTranscriptionData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (update && id) {
            gettranscriptData(id);
        } else if (id) {
            gettranscript(id);
        }
    }, [id, update]);

    useEffect(() => {
        if (update && transcriptData) {
            setTranscriptionData(transcriptData?.transcriptions);
        }
    }, [transcriptData]);

    const tabs: TabIF[] = [
        { id: 'transcript', title: 'Transcription' },
        { id: 'summary', title: 'Summary' }
    ];

    const transcriptName = transcript?.name?.toLowerCase() || transcriptData?.transcriptGroupId?.name?.toLowerCase();
    if (!update && (transcriptName === 'medical' || transcriptName === 'healthcare')) {
        tabs.push({ id: 'cpt', title: 'CPT Code' });
    }
    if (update && (transcriptName === 'medical' || transcriptName === 'healthcare')) {
        tabs.push({ id: 'cpt', title: 'CPT Code' });
    }

    const clearData = () => {
        setTranscriptionData([]);
        setDeleteAudio(true);
    };

    return (
        <div className="h-[87vh] flex flex-col bg-gray-50 overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 grid grid-cols-[1.3fr_1fr] relative overflow-hidden min-h-[91vh]">
                    {/* Upload Section */}
                    <div className="flex flex-col border-r border-gray-200 relative overflow-hidden">
                        <AudioRecorder
                            setIsProcessing={setIsProcessing}
                            titleName={transcript?.name ? transcript?.name : ''}
                            setTranscriptionData={setTranscriptionData}
                            setError={setError}
                            deleteAudioTrack={deleteAudio}
                        />
                    </div>

                    {/* Data Section */}
                    <div className="relative overflow-hidden min-h-[50vh] max-h-[87vh]">
                        <ResponseViewer
                            isProcessing={isProcessing}
                            transcriptionData={transcriptionData}
                            tabs={tabs}
                            titleName={transcript?.name || transcriptData?.transcriptGroupId?.name}
                            error={error}
                            clearData={clearData}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TranscriptProjectPage;
