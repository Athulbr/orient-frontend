import { useEffect } from 'react';
import { TemplateCardComponent } from '../../dashboard/components/TemplateCards';
import { useTemplateState } from './hooks/templateContext';
import { useListTemplatePageApi } from './hooks/useTemplateApi';

const ListTemplateComponent: React.FC = () => {
  const { state } = useTemplateState();
  const { getTemplatesApi } = useListTemplatePageApi();

  useEffect(() => {
    getTemplatesApi();
  }, []);
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
        <TemplateCardComponent key={idx} name={template.name} />
      ))}
    </div>
  );
};

export default ListTemplateComponent;
