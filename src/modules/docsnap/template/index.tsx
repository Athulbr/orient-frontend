import { useState } from 'react';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { TemplateStateProvider } from './hooks/templateContext';
import ListTemplateComponent from './ListTemplateComponent';
import PageActionsComponent from './components/PageActionsComponent';
import { CreateTemplateComponent } from './components/CreateTemplateComponent';

export interface TemplateStateIF {
  id: string;
  templates: any[];
  loadingTemplates: boolean;
  showCreateTemplateDialog: boolean;
}
const initialState = {
  id: '',
  templates: [],
  loadingTemplates: false,
  showCreateTemplateDialog: false,
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
    </TemplateStateProvider>
  );
};

export default ListTemplatePage;
