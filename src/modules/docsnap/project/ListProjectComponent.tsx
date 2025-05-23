import { useNavigate } from 'react-router-dom';
import { StatusCustomUI } from '../../../builders/tablebuilder/render-tablebuilder/components/CustomUI';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { useProjectState } from './hooks/projectContext';

export const ListProjectComponent: React.FC = () => {
  const { setState } = useProjectState();
  const navigate = useNavigate();
  const actionButtons = [
    {
      label: 'Create Project',
      action: () => {
        setState(prev => ({ ...prev, showCreateDialog: true }));
      },
    },
  ];
  const customFunctions = {
    rowClickHandler: (row: any) => {
      navigate(`/docsnap/document/list/${row._id}`);
    },
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
  return <UseTablebuilder name="List Project Table" fluidHeight customFunctions={customFunctions} customUI={customUI} actionButtons={actionButtons} />;
};
