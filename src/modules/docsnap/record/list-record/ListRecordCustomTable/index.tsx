import { useNavigate } from 'react-router-dom';
import { TableBody } from './TableBody';
import { TableHeader } from './TableHeader';
import { useEffect } from 'react';
import { useDocsnapStore } from '../../../../../zustand-store/DocsnapStore';
import { useListRecordApi } from '../hooks/useListRecordApi';

interface ListRecordCustomTableIF {
    test?: string;
}

const columns = [
    { label: 'Name', key: 'name' },
    { label: 'Extracted By', key: 'extractedBy' },
    { label: 'Status', key: 'status' },
    { label: 'Date', key: 'date' },
    { label: 'Actions', key: 'actions' }
];

export const ListRecordCustomTable: React.FC<ListRecordCustomTableIF> = () => {
    const { refreshRecord } = useDocsnapStore();
    const { getRecordsApi } = useListRecordApi();

    const navigate = useNavigate();

    useEffect(() => {
        getRecordsApi();
    }, [refreshRecord]);
    return (
        <div className={`bg-background dark:bg-background-dark flex min-w-[770px] flex-1 flex-col `}>
            {/* <TableToolbar /> */}
            <div className="h-full overflow-y-auto rounded-lg border">
                <table className="min-w-full table-fixed">
                    <TableHeader columns={columns} />
                    <TableBody columns={columns} />
                </table>
            </div>
            {/* <TableFooter /> */}
        </div>
    );
};
