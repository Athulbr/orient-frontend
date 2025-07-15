import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { useTablebuilderState } from './hooks/tablebuilderContext';
import { useTablebuilderApi } from './hooks/useTablebuilderApi';
interface ListTablebuilderComponentIF {
  test?: string;
}

const ListTablebuilderComponent: React.FC<ListTablebuilderComponentIF> = () => {
  const { state, setState } = useTablebuilderState();
  const { refreshCache, deleteTablebuilderApi } = useTablebuilderApi();
  const actionButtons = [
    {
      label: 'Create Tablebuilder',
      action: () => {
        setState(prev => ({ ...prev, id: '', createDialog: true }));
      },
    },
    {
      label: 'Refresh Cache',
      action: refreshCache,
    },
  ];
  const customFunctions = {
    editClickHandler: (row: Record<string, string>) => {
      setState(prev => ({ ...prev, id: row._id, createDialog: true }));
    },
    deleteClickHandler: (row: Record<string, string>) => {
      deleteTablebuilderApi(row._id);
    },
  };
  return <UseTablebuilder name="list tablebuilder" fluidHeight actionButtons={actionButtons} customFunctions={customFunctions} />;
};

export default ListTablebuilderComponent;
