import { StatusCustomUI } from '../../../builders/tablebuilder/render-tablebuilder/components/CustomUI';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { useUserState } from './hooks/userContext';

export const ListUserComponent: React.FC = () => {
  const { setState } = useUserState();
  const actionButtons = [
    {
      label: 'Create User',
      action: () => {
        setState(prev => ({ ...prev, showCreateDialog: true }));
      },
    },
  ];
  const customFunctions = {
    editClickHandler: (row: any) => {
      setState(prev => ({ ...prev, showCreateDialog: true, id: row._id }));
    },
    deleteClickHandler: (row: any) => {
      alert(`${row.name} Deleted`);
    },
  };
  const customUI = {
    status: StatusCustomUI,
  };
  return <UseTablebuilder name="list user" fluidHeight customFunctions={customFunctions} customUI={customUI} actionButtons={actionButtons} />;
};
