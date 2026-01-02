import { Search, Plus, CircleX } from 'lucide-react';
import { useTemplateState } from '../hooks/templateContext';
import { Button } from '../../../../../components/Button';
import { useListTemplatePageApi } from '../hooks/useTemplateApi';
import { useEffect } from 'react';

const PageActionsComponent: React.FC = () => {
    const { state, setState } = useTemplateState();
    const { getPredefinedTemplatesApi, getTemplatesApi } = useListTemplatePageApi();

    useEffect(() => {
        if (!state.searchText) return;
        // getTemplatesApi();
    }, [state.searchText]);

    const handleCreateTemplate = () => {
        setState({ ...state, showCreateTemplateDialog: true });
        getPredefinedTemplatesApi();
    };

    const importTemplate = () => {
        setState({ ...state, showImportTemplateDialog: true });
    };

    return (
        <div className="flex w-full justify-end gap-4">
            <Button outlined onClick={importTemplate}>
                Import Template
            </Button>
            <div className=" h-10 w-full max-w-100 flex-1 items-center rounded-md border px-3  hidden md:flex">
                <Search className="text-gray-500" size={20} />
                <input
                    value={state.searchText}
                    onChange={e => setState({ ...state, searchText: e.target.value })}
                    className="w-full flex-1 px-4 text-sm outline-none"
                    placeholder="Search"
                />
                {state.searchText && <CircleX className="cursor-pointer text-gray-400" size={18} onClick={() => setState({ ...state, searchText: '' })} />}
            </div>
            <Button permission="create:template" onClick={handleCreateTemplate} startIcon={<Plus size={18} />}>
                Create Template
            </Button>
        </div>
    );
};

export default PageActionsComponent;
