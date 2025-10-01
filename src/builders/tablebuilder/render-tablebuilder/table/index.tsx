import { useEffect } from 'react';
import { useTablebuilderState } from '../hooks/useTablebuilderStateContext';
import { TableBody } from './TableBody';
import { TableFooter } from './TableFooter';
import { TableHeader } from './TableHeader';
import { TableToolbar } from './TableToolbar';
import { useFetchDataFromApi } from '../hooks/useFetchDataFromApi';
import FullScreenLoader from '../../../../components/FullScreenLoader';

interface TableIF {
    refresh?: number;
}

const Table: React.FC<TableIF> = ({ refresh = 0 }) => {
    const { injectedData, settings, setState, state } = useTablebuilderState();
    const { getDataFromApi } = useFetchDataFromApi();

    useEffect(() => {
        if (settings.api.refresh === 0) return;
        setState(prev => ({
            ...prev,
            activeFilters: [],
            searchValue: '',
            startDate: null,
            endDate: null,
            sorts: [],
            page: 1 // Reset to page 1
        }));
        getDataFromApi({
            page: 1,
            search: '',
            startDate: null,
            endDate: null,
            sorts: [],
            filters: {}, // Force empty filters object
            skipActiveFilters: true // Skip using the active filters
        });
    }, [settings.api.refresh, refresh]);

    return (
        <div className={`bg-background dark:bg-background-dark flex min-w-[770px] flex-1 flex-col ${injectedData.fluidHeight ? 'h-full' : 'h-fit'}`}>
            <TableToolbar />
            <div className="h-full overflow-y-auto rounded-lg border">
                <table className="min-w-full table-fixed">
                    <TableHeader />
                    {state.loading && (state.data.length === 0 || !injectedData.disableLoader) ? null : <TableBody />}
                </table>
                {state.loading && (state.data.length === 0 || !injectedData.disableLoader) ? (
                    <FullScreenLoader />
                ) : !state.loading && state.data.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">🤗 &nbsp;No Data Found</div>
                ) : null}
            </div>
            <TableFooter />
        </div>
    );
};

export default Table;
