import { Button } from '../../../../../components/Button';
import { useNavigate } from 'react-router-dom';
import { useViewRecordApi } from '../hooks/useViewRecordApi';
import { useViewRecordState } from '../hooks/viewRecordContext';
interface ExtractedDataFooterIF {
  test?: string;
}

const ExtractedDataFooter: React.FC<ExtractedDataFooterIF> = () => {
  const navigate = useNavigate();
  const { updateRecordApiById } = useViewRecordApi();
  const handleSubmit = () => {
    console.log('Submit clicked');
  };

  return (
    <div className="flex items-center justify-end gap-2 border-t bg-white p-2">
      <Button onClick={() => navigate(-1)} outlined small>
        Cancel
      </Button>
      <Button onClick={() => updateRecordApiById} outlined small>
        Confirm
      </Button>
      <Button onClick={handleSubmit} outlined small>
        Submit
      </Button>
    </div>
  );
};

export default ExtractedDataFooter;
