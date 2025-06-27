import { useState } from 'react';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { TemplateStateProvider } from './hooks/templateContext';
import { TemplateCardComponent } from '../dashboard';

export interface TemplateStateIF {
  showCreateDialog: boolean;
  loading: boolean;
  id: string;
  refresh: number;
  template: any | null;
  loadingTemplate: boolean;
}
const initialState = {
  showCreateDialog: false,
  loading: false,
  id: '',
  refresh: 1,
  template: null,
  loadingTemplate: false,
};

const ListTemplatePage: React.FC = () => {
  const [state, setState] = useState<TemplateStateIF>(initialState);

  return (
    <TemplateStateProvider value={{ state, setState }}>
      <PageContainer className="gap-4 p-6">
        <PageNameComponent name="List of Templates" showBackButton>
          <Breadcrumbs page="listTemplate" className="pl-14" />
        </PageNameComponent>
        <div className="flex w-full flex-wrap gap-4">
          <TemplateCardComponent name="Driving Licence" />
          <TemplateCardComponent name="Invoice" />
          <TemplateCardComponent name="Purchase Order" />
          <TemplateCardComponent name="Insurance" />
          <TemplateCardComponent name="Receipt" />
          <TemplateCardComponent name="ID Card" />
        </div>
      </PageContainer>
    </TemplateStateProvider>
  );
};

export default ListTemplatePage;
