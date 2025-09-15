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
import { Button } from '../../components/Button';
import DragAndDropFileInput from '../../components/DragAndDropFileInput';

interface AudioRecorderProps {
    setIsProcessing?: (val: boolean) => void;
    setTranscriptionData?: (data: any) => void;
    setZipBlob?: (blob: Blob | null) => void;
    titleName: string;
    setError?: (val: string | null) => void;
    deleteAudioTrack?: boolean;
}

type SourceType = 'text' | 'audio' | 'file';

const AudioRecorder = ({ setIsProcessing, setTranscriptionData, setZipBlob, titleName, setError, deleteAudioTrack }: AudioRecorderProps) => {
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
    const { uploadAudio, uploadText } = useTranscriptGroupStore();
    const { createTranscript, updateTranscript, currentData } = useTranscriptStore();
    const { id } = useParams();
    // const { showAlert, closeAlert } = useAlertStore();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [sourceType, setSourceType] = useState<SourceType>('text');
    const [textInput, setTextInput] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (deleteAudioTrack) deleteAudio();
    }, [deleteAudioTrack]);

    useEffect(() => {
        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        };
    }, []);

    const handleUploadText = async () => {
        if (!textInput.trim()) {
            setError?.('Please type something to upload.');
            return;
        }
        setIsProcessing?.(true);

        try {
            // 1️⃣ Create a .txt file from textInput
            const blob = new Blob([textInput], { type: 'text/plain' });
            const textFile = new File([blob], `typed-${Date.now()}.txt`, {
                type: 'text/plain'
            });

            // 2️⃣ Prepare FormData for API
            const fd = new FormData();
            fd.append('file', textFile);

            // 3️⃣ Call your existing API
            const response: any = await uploadText(fd); // <-- same function you use for audio

            if (response) {
                // If your API returns a zip like with audio
                const transcriptions = await processZipResponse(response);
                setTranscriptionData?.(transcriptions);

                const zipBlob = new Blob([response], { type: 'application/zip' });
                setZipBlob?.(zipBlob);
            }
        } catch (err) {
            console.error(err);
            setError?.('Failed to process text.');
            setTranscriptionData?.([]);
        } finally {
            setIsProcessing?.(false);
        }
    };

    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const selected = e.target.files?.[0];
    //     if (selected) {
    //         setFile(selected);
    //     }
    // };

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
    const handleFileChange = (files: FileList) => {
        console.log('File type---->', files?.[0]);

        // setAudioBlob(null);
        // setError?.(null);
        // audioChunksRef.current = [];
        // if (file) {
        //     if (!file.type.startsWith('audio/')) {
        //         setError?.('Please select an audio file.');
        //         return;
        //     }
        //     setFileUpload(true);
        //     setAudioBlob(file);
        // }
    };

    const uploadFileToS3 = async (file: File) => {
        try {
            return await httpUploadRequest(`${import.meta.env.VITE_NODE_URL}/idp/document/upload`, file);
        } catch (err) {
            console.log('Error:', err);
        }
    };

    const handleUpload = async () => {
        console.log('Audio blob---->', audioBlob);

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
                setZipBlob?.(blob);
                // const file = new File([blob], `${getCurrentDateTime()}.zip`, { type: 'application/zip' });
                const audioFile = new File([audioBlob], `audio-${getCurrentDateTime()}.m4a`, { type: 'audio/m4a' });
                const result = await uploadFileToS3(audioFile);
                const payload = { transcriptedFile: result?.data?.fileName, transcriptions };
                if (currentData?._id) updateTranscript(payload, currentData._id);
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
        <div className="h-full bg-green-400">
            <div className="flex gap-4 bg-yellow-300 p-6">
                <label className="flex items-center gap-2">
                    <input type="radio" value="text" checked={sourceType === 'text'} onChange={() => setSourceType('text')} />
                    Text
                </label>
                <label className="flex items-center gap-2">
                    <input type="radio" value="audio" checked={sourceType === 'audio'} onChange={() => setSourceType('audio')} />
                    Audio Record
                </label>
                <label className="flex items-center gap-2">
                    <input type="radio" value="file" checked={sourceType === 'file'} onChange={() => setSourceType('file')} />
                    File Upload
                </label>
            </div>
            <div className="flex flex-col justify-center h-full">
                {/* Conditional Input UI */}
                {sourceType === 'text' && (
                    <div className="flex flex-col gap-4">
                        <textarea
                            className="w-full h-32 border rounded-md p-2"
                            placeholder="Type your text here..."
                            value={textInput}
                            onChange={e => setTextInput(e.target.value)}
                        />
                        <Button onClick={handleUploadText} className="bg-blue-600 text-white">
                            Send Text
                        </Button>
                    </div>
                )}

                {sourceType === 'audio' && (
                    <div className="flex flex-col items-center justify-center flex-grow gap-4">
                        <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                            <AudioWaveform isRecording={isRecording && !isPaused} />
                        </div>
                        <div className="text-xl font-mono text-gray-700">{formatTime(recordingTime)}</div>

                        {/*  Buttons */}
                        <div className="flex justify-center gap-4 flex-wrap">
                            {!isRecording ? (
                                <>
                                    <Button
                                        onClick={startRecording}
                                        disabled={isRecordingStop}
                                        className="flex items-center text-nowrap gap-2 px-6 py-3 text-white bg-gray-700 rounded-full hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        <Mic className="w-5 h-5" /> Start Recording
                                    </Button>

                                    <Button
                                        onClick={uploadAudioFile}
                                        disabled={isUploading}
                                        className="flex text-nowrap items-center gap-2 px-6 py-3 text-white bg-gray-700 rounded-full hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        <FileUp className="w-5 h-5" /> Choose File
                                    </Button>
                                    <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={togglePause}
                                        className="flex items-center gap-2 px-6 py-3 text-white bg-gray-700 rounded-full hover:bg-gray-800"
                                    >
                                        {isPaused ? (
                                            <>
                                                <Play className="w-5 h-5" /> Resume
                                            </>
                                        ) : (
                                            <>
                                                <Pause className="w-5 h-5" /> Pause
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={stopRecording}
                                        className="flex text-nowrap items-center gap-2 px-6 py-3 text-white bg-red-600 rounded-full hover:bg-red-700"
                                    >
                                        <Square className="w-5 h-5" /> Stop Recording
                                    </Button>
                                </>
                            )}

                            {/* Upload  Button */}
                            <Button
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
                            </Button>
                        </div>
                    </div>
                )}

                {sourceType === 'file' && (
                    <div className="flex flex-col gap-4 justify-center overflow-y-auto bg-red-200">
                        {/* <input type="file" accept="audio/*" onChange={handleFileChange} />
                        {file && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm">{file.name}</span>
                                <Trash2 className="w-4 h-4 text-red-600 cursor-pointer" onClick={() => setFile(null)} />
                            </div>
                        )}
                        <Button onClick={handleUpload} className="bg-blue-600 text-white">
                            <Upload className="w-5 h-5" /> Upload File
                        </Button> */}
                        <DragAndDropFileInput onFileDrop={handleFileChange} />
                    </div>
                    // <div className="h-full bg-red-200"></div>
                )}

                {/* Preview */}
                {audioBlob && !isRecording && !isUploading && !exit && (
                    <div className="flex flex-col overflow-auto justify-center h-full">
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioRecorder;
