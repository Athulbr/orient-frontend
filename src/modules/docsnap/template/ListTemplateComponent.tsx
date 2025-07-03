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
    if (state.refresh === 1) return;
    getTemplatesApi();
  }, [state.refresh]);
  if (state.loadingTemplates) {
    return (
      <div className="flex w-full flex-wrap gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <TemplateCardComponent key={idx} isLoading />
        ))}
      </div>
    );
  }
  return (
    <div className="flex w-full flex-wrap gap-4">
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
