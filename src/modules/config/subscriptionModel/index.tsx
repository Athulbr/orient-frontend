import { useState } from 'react';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import { SubscriptionModelStateProvider } from './hooks/subscriptionModelContext';
import { ListSubscriptionModelComponent } from './ListSubscriptionModelComponent';
import { DialogComponent } from '../../../components/DialogComponent';
import CreateSubscriptionModelComponent from './CreateSubscriptionModelComponent';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { ViewSubscriptionModelComponent } from './ViewSubscriptionModelComponent';

export interface SubscriptionModelStateIF {
  showViewDialog: boolean;
  showCreateDialog: boolean;
  loading: boolean;
  id: string;
  subscriptionModel: any | null;
  refresh: number;
}

const initialState: SubscriptionModelStateIF = {
  showViewDialog: false,
  showCreateDialog: false,
  loading: false,
  id: '',
  subscriptionModel: null,
  refresh: 1,
};

const ListSubscriptionModelPage: React.FC = () => {
  const [state, setState] = useState<SubscriptionModelStateIF>(initialState);

  return (
    <SubscriptionModelStateProvider value={{ state, setState }}>
      {state.showViewDialog ? (
        <DialogComponent closeDialog={() => setState(prev => ({ ...prev, showViewDialog: false }))} name="View Subscription Model" isOpen className="w-[90vw]">
          <ViewSubscriptionModelComponent />
        </DialogComponent>
      ) : (
        <PageContainer className="gap-2">
          <PageNameComponent name="List of Subscription Models">
            <Breadcrumbs page="listSubscriptionModel" />
          </PageNameComponent>
          <ListSubscriptionModelComponent />
        </PageContainer>
      )}
      <CreateSubscriptionModelComponent />
    </SubscriptionModelStateProvider>
  );
};

export default ListSubscriptionModelPage;
