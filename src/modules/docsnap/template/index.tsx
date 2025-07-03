import { useState } from 'react';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { TemplateStateProvider } from './hooks/templateContext';
import ListTemplateComponent from './ListTemplateComponent';
import PageActionsComponent from './components/PageActionsComponent';
import { CreateTemplateComponent } from './CreateTemplateComponent';
import { UploadDocumentComponent } from '../upload-document';
import { useDocsnapStore } from '../../../zustand-store/DocsnapStore';

export interface TemplateStateIF {
  id: string;
  templates: any[];
  loadingTemplates: boolean;
  showCreateTemplateDialog: boolean;
  showUploadDocumentDialog: boolean;
  selectedTemplate: any;
  refresh: number;
}
const initialState = {
  id: '',
  templates: [],
  loadingTemplates: false,
  showCreateTemplateDialog: false,
  showUploadDocumentDialog: false,
  selectedTemplate: null,
  refresh: 1,
};

const ListTemplatePage: React.FC = () => {
  const [state, setState] = useState<TemplateStateIF>(initialState);

  return (
    <TemplateStateProvider value={{ state, setState }}>
      <PageContainer className="gap-4 p-6">
        <PageNameComponent name="List of Templates" showBackButton>
          <Breadcrumbs page="listTemplate" className="pl-14" />

          <PageActionsComponent />
        </PageNameComponent>
        <ListTemplateComponent />
      </PageContainer>
      <CreateTemplateComponent state={state} setState={setState} />
      {state.showUploadDocumentDialog && (
        <UploadDocumentComponent template={state.selectedTemplate} closeDialog={() => setState({ ...state, showUploadDocumentDialog: false })} />
      )}
    </TemplateStateProvider>
  );
};

export default ListTemplatePage;
