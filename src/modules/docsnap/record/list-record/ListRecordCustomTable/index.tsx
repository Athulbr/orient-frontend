import { TableBody } from './TableBody';
import { TableHeader } from './TableHeader';
import { useState, useEffect } from 'react';
import useTablepersistance from '../../../../../hooks/useTablepersistance';
import TableFooter from './TableFooter';
import TableToolbar from './TableToolbar';
import { ListRecordCustomTableStateProvider, useListRecordCustomTableState } from './hooks/listRecordCustomTableStateContext';
import { usePermissionStore } from '../../../../../zustand-store/PermissionStore';

interface ListRecordCustomTableIF {
    test?: string;
}

export interface ListRecordCustomTableStateIF {
    records: Record<string, any>[];
    loadingRecords: boolean;
    pageSize: number;
    page: number;
    totalRecords: number;
    selectedStatuses: string[];
    selectedTemplates: string[];
    selectedValidator: string;
    searchText: string;
    startDate: string;
    endDate: string;
    selectedRows: string[];
}

const getInitialState = (
    getPageFromQuery: () => number,
    getPageSizeFromQuery: () => number | null,
    getSearchFromQuery: () => string,
    getDateRangeFromQuery: () => { startDate: Date | null; endDate: Date | null },
    getFiltersFromQuery: () => Record<string, any> | null
) => {
    const page = getPageFromQuery();
    const pageSize = getPageSizeFromQuery() || 10;
    const searchText = getSearchFromQuery() || '';
    const { startDate, endDate } = getDateRangeFromQuery();
    const filters = getFiltersFromQuery() || {};
    return {
        records: [],
        loadingRecords: false,
        pageSize,
        page,
        totalRecords: 0,
        selectedStatuses: Array.isArray(filters.selectedStatuses) ? filters.selectedStatuses : [],
        selectedTemplates: Array.isArray(filters.selectedTemplates) ? filters.selectedTemplates : [],
        selectedValidator: typeof filters.selectedValidator === 'string' ? filters.selectedValidator : '',
        searchText,
        startDate: startDate ? startDate.toISOString() : '',
        endDate: endDate ? endDate.toISOString() : '',
        selectedRows: []
    };
};

export const ListRecordCustomTable: React.FC<ListRecordCustomTableIF> = () => {
    const { getPageFromQuery, getPageSizeFromQuery, getSearchFromQuery, getDateRangeFromQuery, getFiltersFromQuery } = useTablepersistance();
    const [state, setState] = useState<ListRecordCustomTableStateIF>(() => getInitialState(
        getPageFromQuery,
        getPageSizeFromQuery,
        getSearchFromQuery,
        getDateRangeFromQuery,
        getFiltersFromQuery
    ));

    return (
        <ListRecordCustomTableStateProvider value={{ state, setState }}>
            <div className={`bg-background dark:bg-background-dark flex min-w-[770px] flex-1 flex-col overflow-y-auto`}>
                <TableToolbar />
                <div className="h-full overflow-y-auto rounded-lg border">
                    <TableLineLoader />
                    <table className="min-w-full table-fixed">
                        <TableHeader />
                        <TableBody />
                    </table>
                </div>
                <TableFooter />
            </div>
        </ListRecordCustomTableStateProvider>
    );
};

interface TableLineLoaderIF {
    test?: string;
}

const TableLineLoader: React.FC<TableLineLoaderIF> = () => {
    const { state } = useListRecordCustomTableState();

    if (!state.loadingRecords) return null;

    return (
        <div className="w-full overflow-hidden">
            <div className="relative h-[1.5px] bg-gray-200">
                <div className="absolute left-0 top-0 h-full w-1/2 bg-green-500 animate-table-line-loader" />
            </div>
        </div>
    );
};
