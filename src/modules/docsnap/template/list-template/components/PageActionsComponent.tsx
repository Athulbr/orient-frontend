import { Search, Plus, CircleX } from 'lucide-react';
import { useTemplateState } from '../hooks/templateContext';
import { Button } from '../../../../../components/Button';

const PageActionsComponent: React.FC = () => {
  const { state, setState } = useTemplateState();

  return (
    <div className="flex w-full justify-end gap-4">
      <div className="flex h-10 w-full max-w-100 flex-1 items-center rounded-md border px-3">
        <Search className="text-gray-500" size={20} />
        <input
          value={state.searchText}
          onChange={e => setState({ ...state, searchText: e.target.value })}
          className="w-full flex-1 px-4 text-sm outline-none"
          placeholder="Search"
        />
        {state.searchText && <CircleX className="cursor-pointer text-gray-400" size={18} onClick={() => setState({ ...state, searchText: '' })} />}
      </div>
      <Button onClick={() => setState({ ...state, showCreateTemplateDialog: true })} startIcon={<Plus size={18} />}>
        Create Template
      </Button>
    </div>
  );
};

export default PageActionsComponent;
