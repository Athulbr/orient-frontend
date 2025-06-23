import { useNavigate, useParams } from 'react-router-dom';
import { StatusCustomUI } from '../../../builders/tablebuilder/render-tablebuilder/components/CustomUI';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { useRoleState } from './hooks/roleContext';
import { useRolesApi } from './hooks/useRoleApi';

export const ListRoleComponent: React.FC = () => {
  const { id } = useParams();
  const { setState } = useRoleState();
  const { getRoleByIdApi, deleteRoleApi } = useRolesApi();
  const actionButtons = [
    {
      label: 'Create Role',
      action: () => {
        setState(prev => ({ ...prev, showCreateDialog: true }));
      },
    },
  ];
  const customFunctions = {
    rowClickHandler: (row: any) => {
      setState(prev => ({ ...prev, showViewDialog: true, id: row._id }));
      getRoleByIdApi(row._id);
    },
    deleteClickHandler: (row: any) => {
      deleteRoleApi(row._id);
    },
  };
  const customUI = {
    status: StatusCustomUI,
  };
  return (
    <UseTablebuilder
      name="List Project Table"
      fluidHeight
      externalFilters={{ projectId: id }}
      customFunctions={customFunctions}
      customUI={customUI}
      actionButtons={actionButtons}
    />
  );
};
