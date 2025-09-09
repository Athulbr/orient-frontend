import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, FileUp, Play, Pause, Square, Upload, ArrowLeft, DeleteIcon, Trash2 } from 'lucide-react';
import AudioWaveform from './audioWave';
import { getCurrentDateTime } from '../../global-utils/convert-date-format';
import { processZipResponse } from '../../global-utils/zipHandler';
import useTranscriptStore from '../../zustand-store/transcriptStore';
import useTranscriptGroupStore from '../../zustand-store/transcriptGroupStore';
import httpUploadRequest from '../../global-utils/httpUploadRequest';
import { Dialog } from '../../builders/formbuilder/components/dialog';

interface AudioRecorderProps {
    setIsProcessing?: (val: boolean) => void;
    setTranscriptionData?: (data: any) => void;
    titleName: string;
    setError?: (val: string | null) => void;
    deleteAudioTrack?: boolean;
}

const AudioRecorder = ({ setIsProcessing, setTranscriptionData, titleName, setError, deleteAudioTrack }: AudioRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [voiceRecording, setVoiceRecording] = useState(false);
    const [fileUpload, setFileUpload] = useState(false);
    const [isRecordingStop, setIsRecordingStop] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [exit, setExit] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [transcription, setTranscription] = useState<any[]>([]);
    const [clicked, setClicked] = useState(false);
    const navigate = useNavigate();
    const { uploadAudio } = useTranscriptGroupStore();
    const { createTranscript } = useTranscriptStore();
    const { id } = useParams();
    // const { showAlert, closeAlert } = useAlertStore();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (deleteAudioTrack) deleteAudio();
    }, [deleteAudioTrack]);

    useEffect(() => {
        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        };
    }, []);

    const startRecording = async () => {
        try {
            setAudioBlob(null);
            setError?.(null);
            audioChunksRef.current = [];
            setVoiceRecording(true);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
                stream.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);
            timerRef.current = window.setInterval(() => setRecordingTime(p => p + 1), 1000);
        } catch (err) {
            setError?.('Could not access microphone. Please ensure permissions are granted.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecordingStop(true);
            setIsRecording(false);
            setIsPaused(false);
            setRecordingTime(0);
            if (timerRef.current) window.clearInterval(timerRef.current);
        }
    };

    const togglePause = () => {
        if (mediaRecorderRef.current && isRecording) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                timerRef.current = window.setInterval(() => setRecordingTime(p => p + 1), 1000);
            } else {
                mediaRecorderRef.current.pause();
                if (timerRef.current) window.clearInterval(timerRef.current);
            }
            setIsPaused(!isPaused);
        }
    };

    const uploadAudioFile = () => fileInputRef.current?.click();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAudioBlob(null);
        setError?.(null);
        audioChunksRef.current = [];
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('audio/')) {
                setError?.('Please select an audio file.');
                return;
            }
            setFileUpload(true);
            setAudioBlob(file);
        }
    };

    const uploadFileToS3 = async (file: File) => {
        try {
            return await httpUploadRequest(`${import.meta.env.VITE_NODE_URL}/idp/document/upload`, file);
        } catch (err) {
            console.log('Error:', err);
        }
    };

    const handleUpload = async () => {
        if (!audioBlob) return setError?.('No audio file to upload.');

        try {
            setIsUploading(true);
            setIsProcessing?.(true);
            setError?.(null);

            const fd = new FormData();
            fd.append('file', audioBlob, 'recording.m4a');
            const response: any = await uploadAudio(fd);

            if (response) {
                const transcriptions = await processZipResponse(response);
                setTranscriptionData?.(transcriptions);
                setTranscription(transcriptions);

                const blob = new Blob([response], { type: 'application/zip' });
                const file = new File([blob], `${getCurrentDateTime()}.zip`, { type: 'application/zip' });
                const result = await uploadFileToS3(file);

                const payload = { transcriptGroupId: id || '', transcriptedFile: result?.data?.fileName, transcriptions };
                createTranscript(payload);
            }
        } catch (err) {
            setError?.('Failed to process audio. Try again.');
            setTranscriptionData?.([]);
        } finally {
            setIsUploading(false);
            setIsProcessing?.(false);
        }
    };

    const formatTime = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

    const deleteAudio = () => {
        setRecordingTime(0);
        setAudioBlob(null);
        setClicked(false);
        setVoiceRecording(false);
        setIsRecordingStop(false);
        setFileUpload(false);
    };

    return (
        <div className="flex flex-col flex-grow">
            {/* Header */}
            <div className="flex items-center gap-2 p-3">
                <span className="flex items-center gap-1 text-gray-700 cursor-pointer" onClick={() => setExit(true)}>
                    <ArrowLeft className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-semibold text-gray-800">Record {titleName} Audio</h2>
            </div>

            {/* Recorder Content */}
            <div className="flex flex-col items-center justify-center flex-grow gap-4">
                <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                    <AudioWaveform isRecording={isRecording && !isPaused} />
                </div>
                <div className="text-xl font-mono text-gray-700">{formatTime(recordingTime)}</div>

                {/* Buttons */}
                <div className="flex justify-center gap-4">
                    {!isRecording ? (
                        <>
                            <button
                                onClick={startRecording}
                                disabled={isRecordingStop}
                                className="flex items-center gap-2 px-6 py-3 text-white bg-gray-700 rounded-full hover:bg-gray-800 disabled:opacity-50"
                            >
                                <Mic className="w-5 h-5" /> Start Recording
                            </button>

                            <button
                                onClick={uploadAudioFile}
                                disabled={isUploading}
                                className="flex items-center gap-2 px-6 py-3 text-white bg-gray-700 rounded-full hover:bg-gray-800 disabled:opacity-50"
                            >
                                <FileUp className="w-5 h-5" /> Choose File
                            </button>
                            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                        </>
                    ) : (
                        <>
                            <button onClick={togglePause} className="flex items-center gap-2 px-6 py-3 text-white bg-gray-700 rounded-full hover:bg-gray-800">
                                {isPaused ? (
                                    <>
                                        <Play className="w-5 h-5" /> Resume
                                    </>
                                ) : (
                                    <>
                                        <Pause className="w-5 h-5" /> Pause
                                    </>
                                )}
                            </button>
                            <button onClick={stopRecording} className="flex items-center gap-2 px-6 py-3 text-white bg-red-600 rounded-full hover:bg-red-700">
                                <Square className="w-5 h-5" /> Stop Recording
                            </button>
                        </>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!audioBlob || isUploading || transcription.length > 0}
                        className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isUploading ? (
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Processing...
                            </div>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" /> Upload
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Preview */}
            {audioBlob && !isRecording && !isUploading && !exit && (
                <div className="p-4 mb-10 bg-blue-50 rounded-md">
                    <p className="mb-2 text-sm text-blue-600">Audio Ready For Upload!</p>
                    <div className="flex items-center gap-4">
                        <audio controls className="w-4/5">
                            <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                            Your browser does not support the audio element.
                        </audio>
                        {transcription.length === 0 && (
                            <span
                                onClick={() => {
                                    console.log('clicked delete');
                                    deleteAudio();
                                    // setClicked(true);
                                }}
                                className="text-red-600 cursor-pointer"
                            >
                                <Trash2 />
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;
