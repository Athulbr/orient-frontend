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

        const requestBody: Record<string, any> = {
            // document_type: state.record?.docType || 'other',
            // entity_schema: convertedJson,
            // include_confidence: true,
            // include_bbox: true,
            // confidence_threshold: 0.2,
            s3_file_name: state.record?.pdfFileName,
            template_id: state.record?.templateId?._id
            // provider_id: 'azure',
            // model_id: 'gpt-4o',
            // use_latest: false
        };
        // requestBody.ocr_engine = 'google_vision'; // 'doctr';
        const res = await httpRequest('POST', `${config.extractionServicePython}/api/v5/document/analyze_document_v5`, requestBody);
        const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
        const eventSource = new EventSource(`${config.extractionServicePython}${res.stream_url}?token=Bearer ${JSON.parse(accessToken)}`);

        eventSource.addEventListener('task_update', async (event: any) => {
            const data = JSON.parse(event.data);
            if (data.current_step === 'Completed') {
                eventSource.close();
                await updateExtractedData(data?.result?.extracted_data || {});
                setState(prev => ({ ...prev, reExtracting: false }));
                await getRecordApiById(state.record?._id);
            }
        });
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
            <Tooltip text="Re Extract">
                <Button disabled={reExtracting} onClick={handleReExtract} small outlined>
                    <RefreshCw size={18} className={`text-gray-500 ${reExtracting ? 'animate-spin' : ''}`} />
                </Button>
            </Tooltip>
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
