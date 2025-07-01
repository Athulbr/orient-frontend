import { Button } from '../../../../../components/Button';
import { useNavigate } from 'react-router-dom';
import { useViewRecordApi } from '../hooks/useViewRecordApi';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { Forward, RefreshCcw, SkipForward } from 'lucide-react';
import Tooltip from '../../../../../components/Tooltip';
import { convertJSON } from '../../list-record/utils/convertJSON';
import httpRequest from '../../../../../utils/httpRequest';
interface ExtractedDataFooterIF {
  test?: string;
}

const ExtractedDataFooter: React.FC<ExtractedDataFooterIF> = () => {
  const navigate = useNavigate();
  const { updateRecordApiById } = useViewRecordApi();
  const handleSubmit = () => {};
  const handleReExtract = async () => {
    const convertedJson = convertJSON(state.record?.fields || []);

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
    if (state.record?.enableOcr) requestBody.ocr_engine = 'doctr';
    const res = await httpRequest('POST', import.meta.env.VITE_PYTHON_API_ANALYZE_DOCUMENT_URL, requestBody);
  };

  const { state } = useViewRecordState();

  if (state.selectedTableName) return null;

  return (
    <div className="flex items-center justify-end gap-2 border-t bg-white p-2">
      <Tooltip text="Skip to Next Document">
        <Button small outlined>
          <SkipForward size={18} className="text-gray-500" />
        </Button>
      </Tooltip>
      <Tooltip text="Re Extract">
        <Button onClick={handleReExtract} small outlined>
          <RefreshCcw size={18} className="text-gray-500" />
        </Button>
      </Tooltip>
      <Button onClick={() => navigate(-1)} outlined small>
        Cancel
      </Button>
      <Tooltip text="Save Updated Data">
        <Button onClick={() => updateRecordApiById} outlined small>
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
