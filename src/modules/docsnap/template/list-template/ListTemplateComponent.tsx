import { useEffect } from 'react';
import { useTemplateState } from './hooks/templateContext';
import { useListTemplatePageApi } from './hooks/useTemplateApi';
import { TemplateCardComponent } from './components/TemplateCard';

const ListTemplateComponent: React.FC = () => {
  const { state, setState } = useTemplateState();
  const { getTemplatesApi, getPredefinedTemplatesApi } = useListTemplatePageApi();

  useEffect(() => {
    getTemplatesApi();
    getPredefinedTemplatesApi();
  }, []);

  useEffect(() => {
    getTemplatesApi();
  }, [state.searchText]);

  useEffect(() => {
    if (state.refresh === 1) return;
    getTemplatesApi();
  }, [state.refresh]);

  if (state.loadingTemplates) {
    return (
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 10 }).map((_, idx) => (
          <TemplateCardComponent key={idx} isLoading />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
      {state.templates.map((template: any, idx: number) => (
        <TemplateCardComponent
          onClickUpload={() => setState({ ...state, showUploadDocumentDialog: true, selectedTemplate: template })}
          key={idx}
          template={template}
          refreshPage={() => setState({ ...state, refresh: state.refresh + 1 })}
        />
      ))}
    </div>
  );
};

export default ListTemplateComponent;
