import { useNavigate, useSearchParams } from 'react-router-dom';
import { UseTablebuilder } from '../../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { RecordStatusCustomUI } from './components/RecordStatusCustomUI';
import { useListRecordPageState } from './hooks/listRecordPageContext';
import { useListRecordApi } from './hooks/useListRecordApi';
import { useEffect } from 'react';
import DealerListComponent from './components/DealerSelectionComponent';
import { usePermissionStore } from '../../../../zustand-store/PermissionStore';
import { OnlyDateCustomUI } from './components/OnlyDateCustomUI';
import { useExtractionStore } from '../../../../zustand-store/extractionStore';
import { downloadXlsxFile } from './utils/downloadXlsxFile';
const selectedTenant = window?.sessionStorage?.getItem('selectedTenant') || '';

export const Polink = (row: any) => {
    const rmLink = row?.data?.rmResponse?.data?.url ? row?.data?.rmResponse?.data?.url : row?.data?.rmResponse?.url;
    const poId = row?.data?.rmResponse?.data?.id ? row?.data?.rmResponse?.data?.id : row?.data?.rmResponse?.id;

    const onClickPOLink = (e: any, row: any) => {
        e.stopPropagation();
        window.open(`${rmLink}`, '_blank');
    };

    if (!rmLink) {
        return <div className="text-blue-400  pl-6">-</div>;
    }

    return (
        <div onClick={e => onClickPOLink(e, row)} className="text-blue-400 text-sm hover:underline cursor-pointer hover:text-blue-700">
            {poId}
        </div>
    );
};

export const ListRecordComponent: React.FC = () => {
    const { state, setState } = useListRecordPageState();
    const navigate = useNavigate();
    const { deleteRecordApi } = useListRecordApi();
    const [params] = useSearchParams();
    const { checkPermission, user } = usePermissionStore();
    const tenantId = user?.tenant?._id || selectedTenant;

    const { refreshRecord, extractionQueue } = useExtractionStore();

    useEffect(() => {
        if (refreshRecord === 100) return;
        setState(prev => ({ ...prev, refresh: refreshRecord }));
    }, [refreshRecord]);

    const customFunctions = {
        rowClickHandler: (row: any, data: any) => {
            const url = window.location.href;
            navigate(`/docsnap/record/view/${row._id}`, { state: { from: url } });
            window?.sessionStorage?.setItem('recordIdList', JSON.stringify(data.map((item: any) => item._id)));
        },
        deleteClickHandler: (row: any) => {
            deleteRecordApi(row._id);
        }
    };

    const customUI = {
        recordStatus: RecordStatusCustomUI,
        poLink: Polink,
        documentDate: OnlyDateCustomUI
    };

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

    const onSubmit = (dealers: any, startDate: null | Date, endDate: null | Date) => {
        let formattedStart: string | null = null;
        let formattedEnd: string | null = null;

        if (startDate) {
            const s = new Date(startDate);
            s.setHours(0, 0, 0, 0); // start of day
            formattedStart = s.toISOString(); // still UTC, but exact 00:00 local
        }

        if (endDate) {
            const e = new Date(endDate);
            e.setHours(23, 59, 59, 999); // end of day
            formattedEnd = e.toISOString();
        }
        const payload = {
            startDate: formattedStart,
            endDate: formattedEnd,
            format: 'xlsx',
            dealers
        };

        downloadXlsxFile(payload, selectedTenant);
    };

    const hiddenColumns = String(user?.tenant?.name).toLowerCase() === 'rehabmart' ? [] : ['poLink'];

    const selectedFilter = params.get('status') || '' ? { status: params.get('status') || '' } : {};
    return (
        <>
            <UseTablebuilder
                disableLoader={extractionQueue.length > 0}
                customUI={customUI}
                externalFilters={{ deleted: false, ...selectedFilter }}
                refresh={state.refresh}
                name="List Record Table"
                fluidHeight
                customFunctions={customFunctions}
                deletePermission="delete:record"
                updatePermission="update:record"
                actionButtons={actionButtons}
                updatedQuery={updatedQuery}
                hiddenColumns={hiddenColumns}
            />
            {state.dealerSelectionDialog && (
                <DealerListComponent
                    onSubmit={onSubmit}
                    isOpen={state.dealerSelectionDialog}
                    closeDialog={() => setState(prev => ({ ...prev, dealerSelectionDialog: false }))}
                />
            )}
        </>
    );
};
