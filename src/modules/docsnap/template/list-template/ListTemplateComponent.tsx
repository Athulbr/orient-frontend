import { useEffect } from 'react';
import { useTemplateState } from './hooks/templateContext';
import { useListTemplatePageApi } from './hooks/useTemplateApi';
import { TemplateCardComponent } from './components/TemplateCard';

const ListTemplateComponent: React.FC = () => {
    const { state, setState } = useTemplateState();
    const { getTemplatesApi, getTemplateApi } = useListTemplatePageApi();

    useEffect(() => {
        getTemplatesApi();
    }, [state.searchText]);

    useEffect(() => {
        if (state.refresh === 1) return;
        getTemplatesApi();
    }, [state.refresh]);

    const onClickUploadButton = (template: any) => {
        const recentlyUsedTemplates = JSON.parse(localStorage.getItem('recentlyUsedTemplates') || '[]');
        const filteredTemplates = recentlyUsedTemplates.filter((item: any) => item !== template._id);
        const finalTemplates = [template._id, ...filteredTemplates];
        localStorage.setItem('recentlyUsedTemplates', JSON.stringify(finalTemplates));
        setState({ ...state, showUploadDocumentDialog: true, selectedTemplate: template, refresh: state.refresh + 1 });
    };

    const exportTemplate = async (id: string) => {
        const template = await getTemplateApi(id);
        const data = {
            name: template.name,
            fields: template.fields,
            settings: template.settings,
            templateType: template.templateType,
            s3FileName: template.s3FileName,
            description: template.description,
            active: true
        };
        console.log(data);
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    };

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
            {state.templates.map((template: any, idx: number) => (
                <TemplateCardComponent
                    onClickUpload={() => onClickUploadButton(template)}
                    key={idx}
                    template={template}
                    refreshPage={() => setState({ ...state, refresh: state.refresh + 1 })}
                    exportTemplate={exportTemplate}
                />
            ))}
        </div>
    );
};

export default ListTemplateComponent;
