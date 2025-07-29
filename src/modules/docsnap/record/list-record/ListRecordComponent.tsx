import { useNavigate, useSearchParams } from 'react-router-dom';
import { UseTablebuilder } from '../../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { RecordStatusCustomUI } from './components/RecordStatusCustomUI';
import { useListRecordPageState } from './hooks/listRecordPageContext';
import { useListRecordApi } from './hooks/useListRecordApi';
import { useDocsnapStore } from '../../../../zustand-store/DocsnapStore';
import { useEffect } from 'react';

export const ListRecordComponent: React.FC = () => {
  const { state, setState } = useListRecordPageState();
  const navigate = useNavigate();
  const { deleteRecordApi } = useListRecordApi();
  const [params] = useSearchParams();

  const { refreshRecord, extractionQueue } = useDocsnapStore();

  useEffect(() => {
    if (refreshRecord === 10) return;
    setState(prev => ({ ...prev, refresh: refreshRecord }));
  }, [refreshRecord]);

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
  const selectedFilter = params.get('status') || '' ? { status: params.get('status') || '' } : {};
  return (
    <UseTablebuilder
      disableLoader={extractionQueue.length > 0}
      customUI={customUI}
      externalFilters={{ deleted: false, ...selectedFilter }}
      refresh={state.refresh}
      name="List Record Table"
      fluidHeight
      customFunctions={customFunctions}
      deletePermission
    />
  );
};
