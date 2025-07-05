import { Search, Plus } from 'lucide-react';
import { useTemplateState } from '../hooks/templateContext';
import { Button } from '../../../../../components/Button';

const PageActionsComponent: React.FC = () => {
  const { state, setState } = useTemplateState();

  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-full flex-1 items-center rounded-md border pl-3">
        <Search className="text-gray-500" size={20} />
        <input className="flex-1 px-4 text-sm outline-none" placeholder="Search" />
      </div>
      <Button onClick={() => setState({ ...state, showCreateTemplateDialog: true })} startIcon={<Plus size={18} />}>
        Create Template
      </Button>
    </div>
  );
};

export default PageActionsComponent;
