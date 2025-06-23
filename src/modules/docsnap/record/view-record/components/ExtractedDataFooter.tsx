import { Button } from '../../../../../components/Button';
import { useNavigate } from 'react-router-dom';
import { useViewRecordApi } from '../hooks/useViewRecordApi';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { Forward, RefreshCcw, SkipForward } from 'lucide-react';
import Tooltip from '../../../../../components/Tooltip';
interface ExtractedDataFooterIF {
  test?: string;
}

const ExtractedDataFooter: React.FC<ExtractedDataFooterIF> = () => {
  const navigate = useNavigate();
  const { updateRecordApiById } = useViewRecordApi();
  const handleSubmit = () => {
    console.log('Submit clicked');
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
        <Button small outlined>
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
