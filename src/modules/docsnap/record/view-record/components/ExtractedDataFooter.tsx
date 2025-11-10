import { Button } from '../../../../../components/Button';
import { useNavigate } from 'react-router-dom';
import { useViewRecordApi } from '../hooks/useViewRecordApi';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { RefreshCw, SkipForward } from 'lucide-react';
import Tooltip from '../../../../../components/Tooltip';
import { convertJSON } from '../../list-record/utils/convertJSON';
import httpRequest from '../../../../../global-utils/httpRequest';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import { config } from '../../../../../config/default';
interface ExtractedDataFooterIF {
    test?: string;
}

const ExtractedDataFooter: React.FC<ExtractedDataFooterIF> = () => {
    const navigate = useNavigate();
    const toast = useToastStore();
    const { state, setState } = useViewRecordState();
    const { updateRecordApiById, updateExtractedData, getRecordApiById, submitRecordApi } = useViewRecordApi();
    const handleSubmit = async () => {
        await submitRecordApi();
    };

    const handleReExtract = async () => {
        setState(prev => ({ ...prev, reExtracting: true }));
        const convertedJson = convertJSON(state.record?.fields || []);

        setState(prev => ({ ...prev, hoveredFieldId: null, hoveredOnArrayField: false, wire: null, bbox: null, pageNumber: 1 }));

        const token = window?.sessionStorage?.getItem('accessToken') || '';
        const formData = new FormData();
        formData.append('s3_file_name', state.record?.pdfFileName);
        formData.append('template_id', state.record?.templateId?._id);
        formData.append('record_id', state.record?._id);
        const apiEndPoint = `${config.extractionServicePython}/api/v5/document/analyze_document`;

        const response = await fetch(apiEndPoint, {
            method: 'POST',
            headers: { authorization: `Bearer ${JSON.parse(token)}` },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('data:===========', data);

        const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
        const streamResponse = await fetch(`${config.extractionServicePython}${data.stream_url}?token=Bearer ${JSON.parse(accessToken)}`, {
            method: 'GET',
            headers: { authorization: `Bearer ${JSON.parse(accessToken)}` }
        });

        if (!streamResponse.ok) {
            throw new Error(`Stream HTTP error! status: ${streamResponse.status}`);
        }

        if (!streamResponse.body) {
            throw new Error('ReadableStream not supported');
        }

        const reader = streamResponse.body.getReader();

        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;
                    if (!line.startsWith('data: ')) continue;

                    try {
                        // Handle SSE format: "data: {json}" or just "{json}"
                        let jsonString = line;
                        if (line.startsWith('data: ')) {
                            jsonString = line.substring(6); // Remove "data: " prefix
                        }

                        if (!jsonString.trim()) continue;

                        const parsed = JSON.parse(jsonString);

                        // Get fresh state

                        // Handle different status types
                        switch (parsed.status) {
                            case 'completed':
                                await updateExtractedData(parsed?.result?.extracted_data || {});
                                setState(prev => ({ ...prev, reExtracting: false }));
                                await getRecordApiById(state.record?._id);
                                break;

                            case 'failed':
                                setState(prev => ({ ...prev, reExtracting: false }));
                                toast.error('Extraction failed');
                                break;
                            case 'error':
                                setState(prev => ({ ...prev, reExtracting: false }));
                                toast.error('Extraction failed');
                                break;

                            default:
                                if (parsed.status) {
                                }
                                break;
                        }
                    } catch (parseError) {
                        console.warn('Failed to parse SSE message:', parseError, 'Line:', line);
                        continue;
                    }
                }
            }
        } catch (streamError) {
            console.error('Stream processing error:', streamError);
        }

        // eventSource.addEventListener('task_update', async (event: any) => {
        //     const data = JSON.parse(event.data);
        //     if (data.current_step === 'Completed') {
        //         eventSource.close();
        //         await updateExtractedData(data?.result?.extracted_data || {});
        //         setState(prev => ({ ...prev, reExtracting: false }));
        //         await getRecordApiById(state.record?._id);
        //     }
        // });
    };

    const skipToNextDocumentHandler = () => {
        const recordIdList = window?.sessionStorage?.getItem('recordIdList') as string;
        const recordIdListArray = JSON.parse(recordIdList);
        const index = recordIdListArray.indexOf(state.record?._id);
        if (index === -1) return;
        setState(prev => ({ ...prev, hoveredFieldId: null, hoveredOnArrayField: false, wire: null, bbox: null, pageNumber: 1 }));
        navigate(`/docsnap/record/view/${recordIdListArray[index + 1]}`);
    };

    if (state.selectedTableName) return null;

    const reExtracting = state.reExtracting;

    return (
        <div className="flex items-center justify-end gap-2 border-t p-2">
            <Tooltip text="Skip to Next Document">
                <Button disabled={reExtracting} small outlined onClick={skipToNextDocumentHandler}>
                    <SkipForward size={18} className="text-gray-500" />
                </Button>
            </Tooltip>
            {state.templateSettings?.reExtraction && (
                <Tooltip text="Re Extract">
                    <Button disabled={reExtracting} onClick={handleReExtract} small outlined>
                        <RefreshCw size={18} className={`text-gray-500 ${reExtracting ? 'animate-spin' : ''}`} />
                    </Button>
                </Tooltip>
            )}
            <Button disabled={reExtracting} onClick={() => navigate('/docsnap/record/list')} outlined small>
                Cancel
            </Button>
            <Tooltip text="Save Updated Data">
                <Button disabled={reExtracting} onClick={() => updateRecordApiById()} outlined small>
                    Save
                </Button>
            </Tooltip>
            <Button disabled={reExtracting} onClick={handleSubmit} outlined small>
                Submit
            </Button>
        </div>
    );
};

export default ExtractedDataFooter;
