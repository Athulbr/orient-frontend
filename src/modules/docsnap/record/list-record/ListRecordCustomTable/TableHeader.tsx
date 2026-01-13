import { FC } from 'react';
import { useListRecordCustomTableApi } from './hooks/useListRecordCustomTableApi';
import { useEffect } from 'react';
import { useListRecordCustomTableState } from './hooks/listRecordCustomTableStateContext';
import { useExtractionStore } from '../../../../../zustand-store/extractionStore';
import { usePermissionStore } from '../../../../../zustand-store/PermissionStore';

interface TableHeaderIF {}

export const TableHeader: FC<TableHeaderIF> = () => {
    const { refreshRecord } = useExtractionStore();
    const { state, setState } = useListRecordCustomTableState();
    const { getRecordsApi } = useListRecordCustomTableApi();
    const { user, checkPermission } = usePermissionStore();

    const columns = [
        { label: 'Name', visible: true },
        { label: 'Document Number', visible: true },
        { label: 'Status', visible: true },
        {
            label: 'Polink',
            visible: String(user?.tenant?.name).toLowerCase() == 'rehabmart' || sessionStorage.getItem('selectedTenantName')?.toLowerCase() == 'rehabmart'
        },
        { label: 'Extracted By', visible: true },
        { label: 'Processed Date', visible: true },
        { label: 'Actions', visible: checkPermission('delete:record') || checkPermission('update:record') }
    ];

    const { selectedStatuses, selectedTemplates, selectedValidator, searchText, startDate, endDate, pageSize, page } = state;

    useEffect(() => {
        getRecordsApi();
    }, [refreshRecord, selectedStatuses.length, selectedTemplates.length, selectedValidator, searchText, startDate, endDate, pageSize, page]);

    const onSelectAllRows = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ ...prev, selectedRows: e.target.checked ? state.records.map((item: any) => item._id) : [] }));
    };
    return (
        <thead>
            <tr>
                <th scope="col" className="sticky top-0 w-12 bg-gray-50 px-5 py-3">
                    <input
                        type="checkbox"
                        className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={Boolean(state.selectedRows.length && state.selectedRows.length === state.records.length)}
                        onChange={onSelectAllRows}
                    />
                </th>
                {columns.map((column: any, index: number) => {
                    if (!column.visible) return null;
                    return (
                        <th
                            key={index}
                            scope="col"
                            className={`sticky top-0 z-1 h-14 bg-gray-50 px-2 py-3 text-left text-xs font-medium tracking-wider text-nowrap text-gray-500 uppercase xl:px-5`}
                        >
                            <div className="flex items-center gap-2 md:text-xs lg:text-sm">{column.label}</div>
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
};
