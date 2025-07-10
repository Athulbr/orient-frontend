import { useEffect } from 'react';
import { useTemplateState } from './hooks/templateContext';
import { useListTemplatePageApi } from './hooks/useTemplateApi';
import { MoreVertical, Edit, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../components/Button';
import { Dropdown } from '../../../../components/Dropdown';
import { useToastStore } from '../../../../components/toast/ToastStore';
import httpRequest from '../../../../global-utils/httpRequest';
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
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {Array.from({ length: 10 }).map((_, idx) => (
          <TemplateCardComponent key={idx} isLoading />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
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
