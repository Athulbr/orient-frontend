import { useNavigate, useSearchParams } from 'react-router-dom';
import { UseTablebuilder } from '../../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { RecordStatusCustomUI } from './components/RecordStatusCustomUI';
import { useListRecordPageState } from './hooks/listRecordPageContext';
import { useListRecordApi } from './hooks/useListRecordApi';
import { useDocsnapStore } from '../../../../zustand-store/DocsnapStore';
import { useEffect } from 'react';
import DealerListComponent from './components/DealerSelectionComponent';

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

    const { refreshRecord, extractionQueue } = useDocsnapStore();

    useEffect(() => {
        if (refreshRecord === 100) return;
        setState(prev => ({ ...prev, refresh: refreshRecord }));
    }, [refreshRecord]);

    const customFunctions = {
        rowClickHandler: (row: any, data: any) => {
            navigate(`/docsnap/record/view/${row._id}`);
            window?.sessionStorage?.setItem('recordIdList', JSON.stringify(data.map((item: any) => item._id)));
        },
        deleteClickHandler: (row: any) => {
            deleteRecordApi(row._id);
        }
    };

    const customUI = {
        recordStatus: RecordStatusCustomUI,
        poLink: Polink
    };

    const rehabMartTenant = `${import.meta.env.VITE_NODE_URL}`.includes('rehabmart');

    const actionButtons = rehabMartTenant
        ? []
        : [
              {
                  label: 'Export Record',
                  action: () => {
                      setState(prev => ({ ...prev, dealerSelectionDialog: true }));
                  }
              }
          ];
    const updatedQuery = (query: any) => {
        setState(prev => ({ ...prev, query }));
        return query;
    };

    const downloadXlsxFile = async (payload: any) => {
        const accessToken = window?.sessionStorage?.getItem('accessToken') as string;

        let exportURL = '';
        // Update this condition based on your tenant settings
        const user = JSON.parse(window?.sessionStorage?.getItem('user') as string);
        exportURL = `${import.meta.env.VITE_NODE_URL}/idp/history/export/new`;

        const response = await fetch(exportURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${accessToken ? JSON.parse(accessToken) : ''}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `table-export-${new Date().getTime()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const onSubmit = (dealers: any) => {
        const query = state.query;
        const payload = {
            startDate: query.startDate,
            endDate: query.endDate,
            format: 'xlsx',
            dealers
        };
        downloadXlsxFile(payload);
    };

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
            />
            <DealerListComponent
                onSubmit={onSubmit}
                isOpen={state.dealerSelectionDialog}
                closeDialog={() => setState(prev => ({ ...prev, dealerSelectionDialog: false }))}
            />
        </>
    );
};
