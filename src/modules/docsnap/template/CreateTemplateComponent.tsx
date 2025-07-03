import { Search, CircleChevronRight } from 'lucide-react';
import { DialogComponent } from '../../../components/DialogComponent';
import { useState } from 'react';
import { useListTemplatePageApi } from './hooks/useTemplateApi';
import httpRequest from '../../../utils/httpRequest';

export const CreateTemplateComponent = ({ state, setState }: any) => {
  const [selectedTemplateName, setSelectedTemplateName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const template = state.templates.find((template: any) => template.name === selectedTemplateName);
    if (template) {
      setError('Template name already exists');
    } else {
      const template = state.templates.find((template: any) => template.name === selectedTemplateName);
      if (template) {
        setError('Template name already exists');
        return;
      }
      const requestBody = {
        name: selectedTemplateName,
        templateId: selectedTemplate._id,
      };
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/template/create`, requestBody);
      setState({ ...state, showCreateTemplateDialog: false });
    }
  };

  const onChangeTemplateName = (e: any) => {
    const template = state.templates.find((template: any) => template.name === selectedTemplateName);
    if (template) {
      setError('Template name already exists');
    } else {
      setError('');
    }
    setSelectedTemplateName(e.target.value);
  };

  if (!state.showCreateTemplateDialog) return null;
  return (
    <DialogComponent
      className="w-[800px]"
      name="Create Template"
      isOpen={state.showCreateTemplateDialog}
      closeDialog={() => {
        setState({ ...state, showCreateTemplateDialog: false });
        setError('');
        setSelectedTemplateName('');
      }}
      primaryButtonText="Create Template"
      onPrimaryAction={handleSubmit}
    >
      <div className="h-full p-6">
        <div className="flex h-full flex-col gap-8">
          <div className="flex w-full items-center rounded-md border pl-3">
            <Search className="text-gray-500" size={20} />
            <input
              className="h-10 flex-1 px-4 text-sm outline-none"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex h-full w-full flex-wrap gap-4">
            {state.templates
              .filter((template: any) => template.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((template: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedTemplateName(template.name);
                    setSelectedTemplate(template);
                  }}
                  className={`flex h-14 w-60 cursor-pointer items-center justify-between rounded-lg border p-3 text-sm ${selectedTemplateName === template.name ? 'border border-sky-500 bg-sky-50' : 'bg-white'}`}
                >
                  {template.name}
                  <CircleChevronRight size={14} className="text-gray-500" />
                </div>
              ))}
            <div
              onClick={() => {
                setSelectedTemplateName('Custom');
              }}
              className={`flex h-14 w-60 cursor-pointer items-center justify-between rounded-lg border p-3 text-sm ${selectedTemplateName === 'Custom' ? 'border border-sky-500 bg-sky-50' : 'bg-white'}`}
            >
              Custom <CircleChevronRight size={14} className="text-gray-500" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="pl-1 text-sm font-light text-gray-600" htmlFor="templateName">
              Template Name
            </label>
            <input
              name="templateName"
              className={`min-h-10 flex-1 rounded-md border px-4 text-sm outline-none ${error ? 'border-red-500' : ''}`}
              value={selectedTemplateName}
              onChange={onChangeTemplateName}
            />
            {error && <p className="pl-1 text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </DialogComponent>
  );
};
