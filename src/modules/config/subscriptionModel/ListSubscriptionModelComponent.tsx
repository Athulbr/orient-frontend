import { StatusCustomUI } from '../../../builders/tablebuilder/render-tablebuilder/components/CustomUI';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { useSubscriptionModelState } from './hooks/subscriptionModelContext';
import { useSubscriptionModelsApi } from './hooks/useSubscriptionModelApi';

export const ListSubscriptionModelComponent: React.FC = () => {
  const { setState, state } = useSubscriptionModelState();
  const { getSubscriptionModelByIdApi, deleteSubscriptionModelApi } = useSubscriptionModelsApi();

  const actionButtons = [
    {
      label: 'Create Subscription Model',
      action: () => {
        setState(prev => ({ ...prev, showCreateDialog: true }));
      },
    },
  ];

  const customFunctions = {
    rowClickHandler: (row: any) => {
      setState(prev => ({ ...prev, showViewDialog: true, id: row._id }));
      getSubscriptionModelByIdApi(row._id);
    },
    editClickHandler: (row: any) => {
      setState(prev => ({ ...prev, showCreateDialog: true, subscriptionModel: row, id: row._id }));
    },
    deleteClickHandler: (row: any) => {
      deleteSubscriptionModelApi(row._id);
    },
  };

  const customUI = {
    status: StatusCustomUI,
  };

  return (
    <UseTablebuilder
      name="List Subscription Model Table"
      fluidHeight
      refresh={state.refresh}
      customFunctions={customFunctions}
      customUI={customUI}
      actionButtons={actionButtons}
    />
  );
};
