import { ChevronRight, MoreVertical, Upload } from 'lucide-react';
import { Button } from '../../../components/Button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardState } from '../hooks/dashboardContext';
import { useDashboardApi } from '../hooks/useDashboardApi';
import { Dropdown } from '../../../components/Dropdown';
import { TemplateCardComponent } from '../../docsnap/template/components/TemplateCard';

interface TemplateCardsComponentIF {
  test?: string;
}

export const TemplateCardsComponent: React.FC<TemplateCardsComponentIF> = () => {
  const { state, setState } = useDashboardState();

  const navigate = useNavigate();
  const { getTemplatesApi } = useDashboardApi();

  useEffect(() => {
    getTemplatesApi();
  }, []);
  return (
    <div className="relative">
      <div
        onClick={() => navigate('/docsnap/template/list')}
        className="absolute top-0 right-0 z-1 flex h-full w-25 cursor-pointer items-center justify-center gap-1 border border-sky-200 bg-white text-sm text-nowrap text-sky-600 hover:bg-gray-100"
      >
        View All
        <ChevronRight size={14} />
      </div>
      {state.loadingTemplates ? (
        <div className="flex min-h-40 gap-6 overflow-x-auto pr-30">
          {Array.from({ length: 5 }).map((_, idx) => (
            <TemplateCardComponent key={idx} isLoading />
          ))}
        </div>
      ) : (
        <div className="flex min-h-40 gap-6 overflow-x-auto pr-30">
          {state.templates.map((template, idx) => (
            <TemplateCardComponent
              key={idx}
              name={template.name}
              onClickUpload={() => setState({ ...state, showUploadDocumentDialog: true, selectedTemplate: template })}
            />
          ))}
        </div>
      )}
    </div>
  );
};
