import { useNavigate } from 'react-router-dom';
import { UseTablebuilder } from '../../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { RecordStatusCustomUI } from './components/RecordStatusCustomUI';
import { useListRecordPageState } from './hooks/listRecordPageContext';
import PageNameComponent from '../../../../components/PageName';

export const ListRecordComponent: React.FC = () => {
  const { state } = useListRecordPageState();
  const navigate = useNavigate();

  const customFunctions = {
    rowClickHandler: (row: any) => {
      navigate(`/docsnap/record/view/${row._id}`);
    },
    deleteClickHandler: (row: any) => {
      alert(`${row.name} Deleted`);
    },
  };
  const customUI = {
    recordStatus: RecordStatusCustomUI,
  };
  return <UseTablebuilder customUI={customUI} refresh={state.refresh} name="List Record Table" fluidHeight customFunctions={customFunctions} />;
};
