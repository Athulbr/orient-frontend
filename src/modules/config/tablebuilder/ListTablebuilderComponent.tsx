import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { useTablebuilderState } from './hooks/tablebuilderContext';

interface ListTablebuilderComponentIF {
  test?: string;
}

const ListTablebuilderComponent: React.FC<ListTablebuilderComponentIF> = () => {
  const { state, setState } = useTablebuilderState();
  const actionButtons = [
    {
      label: 'Create Tablebuilder',
      action: () => {
        setState(prev => ({ ...prev, id: '', createDialog: true }));
      },
    },
  ];
  const customFunctions = {
    editClickHandler: (row: Record<string, string>) => {
      setState(prev => ({ ...prev, id: row._id, createDialog: true }));
    },
    deleteClickHandler: (row: Record<string, string>) => {
      console.log('row:===========', row);
    },
  };
  return <UseTablebuilder name="list tablebuilder" fluidHeight actionButtons={actionButtons} customFunctions={customFunctions} />;
};

export default ListTablebuilderComponent;
