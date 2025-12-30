import { TableBody } from './TableBody';
import { TableHeader } from './TableHeader';
import { useEffect, useState } from 'react';
import { useDocsnapStore } from '../../../../../zustand-store/DocsnapStore';
import TableFooter from './TableFooter';
import TableToolbar from './TableToolbar';
import { useListRecordCustomTableApi } from './hooks/useListRecordCustomTableApi';
import { ListRecordCustomTableStateProvider, useListRecordCustomTableState } from './hooks/listRecordCustomTableStateContext';
import { cn } from '../../../../../global-utils/twMerge';

interface ListRecordCustomTableIF {
    test?: string;
}
const columns = [
    { label: 'Name' },
    { label: 'Document Number' },
    { label: 'Status' },
    { label: 'Extracted By' },
    { label: 'Processed Date' },
    { label: 'Actions' }
];
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
}

const initialState = {
    records: [],
    loadingRecords: false,
    pageSize: 10,
    page: 1,
    totalRecords: 0,
    selectedStatuses: [],
    selectedTemplates: [],
    selectedValidator: '',
    searchText: ''
};

export const ListRecordCustomTable: React.FC<ListRecordCustomTableIF> = () => {
    const [state, setState] = useState<ListRecordCustomTableStateIF>(initialState);

    return (
        <ListRecordCustomTableStateProvider value={{ state, setState }}>
            <div className={`bg-background dark:bg-background-dark flex min-w-[770px] flex-1 flex-col overflow-y-auto`}>
                <TableToolbar />
                <div className="h-full overflow-y-auto rounded-lg border">
                    <TableLineLoader />
                    <table className="min-w-full table-fixed">
                        <TableHeader columns={columns} />
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
