import { useNavigate, useSearchParams } from 'react-router-dom';
// import { RecordStatusCustomUI } from './components/RecordStatusCustomUI';
import { useListRecordPageState } from './hooks/listRecordPageContext';
import { useListRecordApi } from './hooks/useListRecordApi';
import { useEffect } from 'react';
import DealerListComponent from './components/DealerSelectionComponent';
import { usePermissionStore } from '../../../zustand-store/PermissionStore';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';

// export const Polink = (row: any) => {
//     const rmLink = row?.data?.rmResponse?.data?.url ? row?.data?.rmResponse?.data?.url : row?.data?.rmResponse?.url;
//     const poId = row?.data?.rmResponse?.data?.id ? row?.data?.rmResponse?.data?.id : row?.data?.rmResponse?.id;

//     const onClickPOLink = (e: any, row: any) => {
//         e.stopPropagation();
//         window.open(`${rmLink}`, '_blank');
//     };

//     if (!rmLink) {
//         return <div className="text-blue-400  pl-6">-</div>;
//     }

//     return (
//         <div onClick={e => onClickPOLink(e, row)} className="text-blue-400 text-sm hover:underline cursor-pointer hover:text-blue-700">
//             {poId}
//         </div>
//     );
// };

export const ListRecordComponent: React.FC = () => {
    const { state, setState } = useListRecordPageState();
    const navigate = useNavigate();
    const { deleteRecordApi } = useListRecordApi();
    const [params] = useSearchParams();
    const { checkPermission, user } = usePermissionStore();

    // const { refreshRecord, extractionQueue } = useDocsnapStore();

    // useEffect(() => {
    //     if (refreshRecord === 100) return;
    //     setState(prev => ({ ...prev, refresh: refreshRecord }));
    // }, [refreshRecord]);

    const customFunctions = {
        rowClickHandler: (row: any, data: any) => {
            console.log('row:--------->', row);
            console.log('data:--------->', data);
            navigate(`/transcript/view/${row._id}`);
        },
        deleteClickHandler: (row: any) => {
            deleteRecordApi(row._id);
        }
    };

    // const customUI = {
    //     recordStatus: RecordStatusCustomUI,
    //     poLink: Polink
    // };

    const actionButtons = checkPermission('export:record:ardex')
        ? [
              {
                  label: 'Export Record',
                  action: () => {
                      setState(prev => ({ ...prev, dealerSelectionDialog: true }));
                  }
              }
          ]
        : [];
    const updatedQuery = (query: any) => {
        setState(prev => ({ ...prev, query }));
        return query;
    };

    const selectedFilter = params.get('status') || '' ? { status: params.get('status') || '' } : {};
    return (
        <>
            <UseTablebuilder
                // disableLoader={extractionQueue.length > 0}
                // customUI={customUI}
                externalFilters={{ deleted: false, ...selectedFilter }}
                refresh={state.refresh}
                name="Medical Code List"
                fluidHeight
                customFunctions={customFunctions}
                deletePermission="delete:medicalCode"
                updatePermission="update:medicalCode"
                actionButtons={actionButtons}
                updatedQuery={updatedQuery}
                // hiddenColumns={hiddenColumns}
            />
        </>
    );
};
