import { useEffect } from 'react';
import { useTemplateState } from './hooks/templateContext';
import { useListTemplatePageApi } from './hooks/useTemplateApi';
import { TemplateCardComponent } from './components/TemplateCard';

const ListTemplateComponent: React.FC = () => {
    const { state, setState } = useTemplateState();
    const { getTemplatesApi } = useListTemplatePageApi();

    useEffect(() => {
        getTemplatesApi();
    }, []);

    useEffect(() => {
        getTemplatesApi();
    }, [state.searchText]);

    useEffect(() => {
        if (state.refresh === 1) return;
        getTemplatesApi();
    }, [state.refresh]);

    // Get selected tenant id from localStorage
    const selectedTenantId = localStorage.getItem('selectedTenant');

    // Filter templates by tenant id if present
    let filteredTemplates =
        !selectedTenantId || selectedTenantId === 'all' ? state.templates : state.templates.filter((template: any) => template.tenantId === selectedTenantId);

    // Reorder templates: recently clicked first
    const recentTemplateIds = (() => {
        try {
            const arr = localStorage.getItem('recentTemplate');
            return arr ? JSON.parse(arr) : [];
        } catch {
            return [];
        }
    })();

    if (Array.isArray(recentTemplateIds) && recentTemplateIds.length > 0) {
        const recentTemplates: any[] = [];
        const otherTemplates: any[] = [];
        filteredTemplates.forEach((template: any) => {
            if (recentTemplateIds.includes(template._id)) {
                recentTemplates.push(template);
            } else {
                otherTemplates.push(template);
            }
        });
        // Sort recentTemplates by order in recentTemplateIds
        recentTemplates.sort((a: any, b: any) => recentTemplateIds.indexOf(a._id) - recentTemplateIds.indexOf(b._id));
        filteredTemplates = [...recentTemplates, ...otherTemplates];
    }

    if (state.loadingTemplates) {
        return (
            <div className="flex flex-wrap gap-4">
                {Array.from({ length: 10 }).map((_, idx) => (
                    <TemplateCardComponent key={idx} isLoading />
                ))}
            </div>
        );
    }
    if (!state.loadingTemplates && state.templates.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <p className="text-gray-500">🤗 &nbsp;No templates found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
            {filteredTemplates.map((template: any, idx: number) => (
                <TemplateCardComponent
                    onClickUpload={() => {
                        setState({ ...state, showUploadDocumentDialog: true, selectedTemplate: template });
                        // Update recentTemplate array in localStorage
                        try {
                            const arr = localStorage.getItem('recentTemplate');
                            let recent = arr ? JSON.parse(arr) : [];
                            // Remove if already present
                            recent = recent.filter((id: string) => id !== template._id);
                            // Add to front
                            recent.unshift(template._id);
                            // Limit to 10 recent templates
                            if (recent.length > 10) recent = recent.slice(0, 10);
                            localStorage.setItem('recentTemplate', JSON.stringify(recent));
                        } catch (e) {
                            // Ignore localStorage errors
                        }
                    }}
                    key={idx}
                    template={template}
                    refreshPage={() => setState({ ...state, refresh: state.refresh + 1 })}
                />
            ))}
        </div>
    );
};

export default ListTemplateComponent;
