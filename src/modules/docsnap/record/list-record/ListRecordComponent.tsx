import { useNavigate } from 'react-router-dom';
import { UseTablebuilder } from '../../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { RecordStatusCustomUI } from './components/RecordStatusCustomUI';
import { useListRecordPageState } from './hooks/listRecordPageContext';
import { useListRecordApi } from './hooks/useListRecordApi';

export const ListRecordComponent: React.FC = () => {
  const { state } = useListRecordPageState();
  const navigate = useNavigate();
  const { deleteRecordApi } = useListRecordApi();

  const customFunctions = {
    rowClickHandler: (row: any, data: any) => {
      navigate(`/docsnap/record/view/${row._id}`);
      window?.sessionStorage?.setItem('recordIdList', JSON.stringify(data.map((item: any) => item._id)));
    },
    deleteClickHandler: (row: any) => {
      deleteRecordApi(row._id);
    },
  };
  const customUI = {
    recordStatus: RecordStatusCustomUI,
  };
  return (
    <UseTablebuilder
      customUI={customUI}
      externalFilters={{ deleted: false }}
      refresh={state.refresh}
      name="List Record Table"
      fluidHeight
      customFunctions={customFunctions}
    />
  );
};
