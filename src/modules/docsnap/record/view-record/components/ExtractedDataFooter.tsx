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
    const { updateRecordApiById, updateExtractedData, getRecordApiById, submitRecordApi, reExtractDocument } = useViewRecordApi();

    // Validate that all required object sub-fields have a value before save/submit
    const validateRequiredFields = (): boolean => {
        const templateFields = state.record?.templateId?.fields || [];

        for (const field of templateFields) {
            // Only object-type fields (rendered in RenderObjectFields) have subFields here
            if (!field?.subFields?.length) continue;

            const objectFieldValues = state.objectFields?.[field.jsonKey];
            if (!objectFieldValues) continue;

            for (const subField of field.subFields) {
                if (!subField?.required) continue;

                const currentValue = objectFieldValues?.[subField.jsonKey]?.value;
                if (currentValue === undefined || currentValue === null || `${currentValue}`.trim() === '') {
                    toast.error(`${subField.name || subField.jsonKey} is required and cannot be empty`);
                    return false;
                }
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateRequiredFields()) return;
        await submitRecordApi();
    };

    const handleNodeReExtraction = async () => {
        const formData = new FormData();
        formData.append('templateId', state.record?.templateId?._id);
        formData.append('recordId', state.record?._id);
        if (state.record?.imageFileNames) {
            console.log('state.record?.imageFileNames:===========', state.record?.imageFileNames);
            formData.append('imageFileNames', JSON.stringify(state.record?.imageFileNames));
        }
        await reExtractDocument(formData);
    };

    const handlePythonReExtraction = async () => {
        try {
            const token = window?.sessionStorage?.getItem('accessToken') || '';
            const selectedTenant = window?.sessionStorage?.getItem('selectedTenant');
            const formData = new FormData();
            formData.append('template_id', state.record?.templateId?._id);
            formData.append('s3_file_name', state.record?.pdfFileName);
            const apiEndPoint = `${config.extractionServicePython}/api/v5/document/analyze_document`;

            const headers: Record<string, string> = { authorization: `Bearer ${JSON.parse(token)}` };
            if (selectedTenant) {
                headers.tenantId = selectedTenant;
            }

            const response = await fetch(apiEndPoint, {
                method: 'POST',
                headers,
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Fetch the stream URL
            const streamHeaders: Record<string, string> = { authorization: `Bearer ${JSON.parse(token)}` };
            if (selectedTenant) {
                streamHeaders.tenantId = selectedTenant;
            }
            
            const streamResponse = await fetch(`${config.extractionServicePython}${data.stream_url}?token=Bearer ${JSON.parse(token)}`, {
                method: 'GET',
                headers: streamHeaders
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
                        let jsonString = line.substring(6); // Remove "data: " prefix
                        if (!jsonString.trim()) continue;

                        const parsedData = JSON.parse(jsonString);
                        if (parsedData.current_step === 'Completed') {
                            await updateExtractedData(parsedData?.result?.extracted_data || {});
                            setState(prev => ({ ...prev, reExtracting: false }));
                            await getRecordApiById(state.record?._id);
                            return; // End parsing here
                        }
                    } catch (e) {
                        console.error('Failed to parse SSE message:', e, 'Line:', line);
                        continue;
                    }
                }
            }
        } catch (error) {
            console.error('API request error:', error);
            setState(prev => ({ ...prev, reExtracting: false }));
        }
    };

    const handleReExtract = async () => {
        setState(prev => ({ ...prev, hoveredFieldId: null, hoveredOnArrayField: false, wire: null, bbox: null, pageNumber: 1, reExtracting: true }));
        
        if (state.record?.templateId?.settings?.extractionEngine !== 'python') {
            await handleNodeReExtraction();
        } else {
            await handlePythonReExtraction();
        }
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
                <Button data-tour-id="skip-next-document-button" disabled={reExtracting} small outlined onClick={skipToNextDocumentHandler}>
                    <SkipForward size={18} className="text-gray-500" />
                </Button>
            </Tooltip>
            {state.templateSettings?.reExtraction && (
                <Tooltip text="Re Extract">
                    <Button data-tour-id="re-extract-button" disabled={reExtracting} onClick={handleReExtract} small outlined>
                        <RefreshCw size={18} className={`text-gray-500 ${reExtracting ? 'animate-spin' : ''}`} />
                    </Button>
                </Tooltip>
            )}
            <Button disabled={reExtracting} onClick={() => navigate('/docsnap/record/list')} outlined small>
                Cancel
            </Button>
            <Tooltip text="Save Updated Data">
                <Button
                    data-tour-id="save-updated-data-button"
                    disabled={reExtracting}
                    onClick={async () => {
                        if (!validateRequiredFields()) return;
                        await updateRecordApiById();
                    }}
                    outlined
                    small
                >
                    Save
                </Button>
            </Tooltip>
            <Button data-tour-id="submit-button" disabled={reExtracting} onClick={handleSubmit} outlined small>
                Submit
            </Button>
        </div>
    );
};

export default ExtractedDataFooter;
