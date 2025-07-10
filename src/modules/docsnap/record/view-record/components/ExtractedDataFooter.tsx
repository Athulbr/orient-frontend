import { Button } from '../../../../../components/Button';
import { useNavigate } from 'react-router-dom';
import { useViewRecordApi } from '../hooks/useViewRecordApi';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { Forward, RefreshCcw, SkipForward } from 'lucide-react';
import Tooltip from '../../../../../components/Tooltip';
import { convertJSON } from '../../list-record/utils/convertJSON';
import httpRequest from '../../../../../global-utils/httpRequest';
import { useState } from 'react';
interface ExtractedDataFooterIF {
  test?: string;
}

const ExtractedDataFooter: React.FC<ExtractedDataFooterIF> = () => {
  const navigate = useNavigate();
  const { setState } = useViewRecordState();
  const { updateRecordApiById, updateExtractedData, getRecordApiById } = useViewRecordApi();
  const handleSubmit = () => {};

  const handleReExtract = async () => {
    setState(prev => ({ ...prev, reExtracting: true }));
    const convertedJson = convertJSON(state.record?.fields || []);

    setState(prev => ({ ...prev, hoveredFieldId: null, hoveredOnArrayField: false, wire: null, bbox: null, pageNumber: 1 }));

    const requestBody: Record<string, any> = {
      document_type: state.record?.docType || 'other',
      entity_schema: convertedJson,
      include_confidence: true,
      include_bbox: true,
      confidence_threshold: 0.8,
      s3_file_name: state.record?.pdfFileName,
      provider_id: 'azure',
      model_id: 'gpt-4o',
      use_latest: false,
    };
    requestBody.ocr_engine = 'doctr';
    const res = await httpRequest('POST', import.meta.env.VITE_PYTHON_API_ANALYZE_DOCUMENT_URL, requestBody);
    const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
    const eventSource = new EventSource(`${import.meta.env.VITE_PYTHON_URL}/ai/${res.stream_url}?token=Bearer ${JSON.parse(accessToken)}`);

    eventSource.addEventListener('task_update', async (event: any) => {
      const data = JSON.parse(event.data);
      if (data.current_step === 'Complete') {
        eventSource.close();
        await updateExtractedData(data?.result?.extracted_data || {});
        setState(prev => ({ ...prev, reExtracting: false }));
        await getRecordApiById(state.record?._id);
      }
    });
  };

  const { state } = useViewRecordState();

  const skipToNextDocumentHandler = () => {
    const recordIdList = window?.sessionStorage?.getItem('recordIdList') as string;
    const recordIdListArray = JSON.parse(recordIdList);
    const index = recordIdListArray.indexOf(state.record?._id);
    if (index === -1) return;
    setState(prev => ({ ...prev, hoveredFieldId: null, hoveredOnArrayField: false, wire: null, bbox: null, pageNumber: 1 }));
    navigate(`/docsnap/record/view/${recordIdListArray[index + 1]}`);
  };

  if (state.selectedTableName) return null;

  return (
    <div className="flex items-center justify-end gap-2 border-t p-2">
      <Tooltip text="Skip to Next Document">
        <Button small outlined onClick={skipToNextDocumentHandler}>
          <SkipForward size={18} className="text-gray-500" />
        </Button>
      </Tooltip>
      <Tooltip text="Re Extract">
        <Button onClick={handleReExtract} small outlined>
          <RefreshCcw size={18} className={`text-gray-500 ${state.reExtracting ? 'animate-spin' : ''}`} />
        </Button>
      </Tooltip>
      <Button onClick={() => navigate(-1)} outlined small>
        Cancel
      </Button>
      <Tooltip text="Save Updated Data">
        <Button onClick={() => updateRecordApiById()} outlined small>
          Save
        </Button>
      </Tooltip>
      <Button onClick={handleSubmit} outlined small>
        Submit
      </Button>
    </div>
  );
};

export default ExtractedDataFooter;
