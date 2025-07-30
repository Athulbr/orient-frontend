import { useNavigate, useParams } from 'react-router-dom';
import { StatusCustomUI } from '../../../builders/tablebuilder/render-tablebuilder/components/CustomUI';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { useDocumentState } from './hooks/documentContext';
import { useDocumentsApi } from './hooks/useDocumentApi';

export const ListDocumentComponent: React.FC = () => {
  const { id } = useParams();
  const { setState } = useDocumentState();
  const { getDocumentByIdApi, deleteDocumentApi } = useDocumentsApi();
  const actionButtons = [
    {
      label: 'Create Document',
      action: () => {
        setState(prev => ({ ...prev, showCreatePage: true }));
      },
    },
  ];
  const customFunctions = {
    editClickHandler: (row: any) => {
      setState(prev => ({ ...prev, showCreatePage: true, id: row._id }));
      getDocumentByIdApi(row._id);
    },
    deleteClickHandler: (row: any) => {
      deleteDocumentApi(row._id);
    },
  };
  const customUI = {
    status: StatusCustomUI,
  };
  if (!id) return <div className=""></div>;
  return (
    <UseTablebuilder
      name="List Document Table"
      fluidHeight
      externalFilters={{ projectId: id }}
      customFunctions={customFunctions}
      customUI={customUI}
      actionButtons={actionButtons}
      deletePermission="delete:document"
      updatePermission="update:document"
    />
  );
};
