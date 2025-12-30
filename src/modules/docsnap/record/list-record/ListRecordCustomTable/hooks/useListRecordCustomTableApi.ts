import { useToastStore } from '../../../../../../components/toast/ToastStore';
import httpRequest from '../../../../../../global-utils/httpRequest';
import { useListRecordCustomTableState } from './listRecordCustomTableStateContext';
import { config } from '../../../../../../config/default';

export const useListRecordCustomTableApi = () => {
    const toast = useToastStore();
    const { state, setState } = useListRecordCustomTableState();

    // ============================= CREATE ==================================
    const getRecordsApi = async (filters: any) => {
        try {
            const payload = {
                search: filters.searchText ?? state.searchText,
                pageSize: filters.pageSize ?? state.pageSize,
                page: filters.page ?? state.page,
                searchFields: ['status'],
                filters: { deleted: false }
            };

            // if (typeof filters.searchText === 'string') {
            //     // @ts-ignore
            //     payload.filters.search = filters.searchText;
            // } else {
            //     // @ts-ignore
            //     payload.filters.search = state.searchText;
            // }

            if (Array.isArray(filters.selectedStatuses)) {
                if (filters.selectedStatuses.length > 0) {
                    // @ts-ignore
                    payload.filters.status = { $in: filters.selectedStatuses };
                }
            } else if (state.selectedStatuses.length > 0) {
                // @ts-ignore
                payload.filters.status = { $in: state.selectedStatuses };
            }

            setState(prev => ({ ...prev, loadingRecords: true }));
            const res: any = await httpRequest('POST', `${config.nodeApiUrl}/idp/history`, payload);
            setState(prev => ({ ...prev, loadingRecords: false, records: res.data }));
            window?.sessionStorage?.setItem('recordIdList', JSON.stringify(res.data.map((item: any) => item._id)));
            return true;
        } catch (error) {
            toast.error('Failed to fetch record');
        }
    };
    const createRecordApi = async (requestBody: any) => {
        try {
            const res = await httpRequest('POST', `${config.nodeApiUrl}/idp/history/create`, requestBody);
            toast.success('Record created successfully');
            return res;
        } catch (error) {
            toast.error('Failed to Create record');
        }
    };
    const updateRecordApi = async (requestBody: any, id: string) => {
        try {
            const res = await httpRequest('PATCH', `${config.nodeApiUrl}/idp/history/save/extraction/${id}`, requestBody);
            toast.success('Record updated successfully');
        } catch (error) {
            toast.error('Failed to update record');
        }
    };
    const deleteRecordApi = async (id: string) => {
        try {
            const res = await httpRequest('DELETE', `${config.nodeApiUrl}/idp/history/delete/${id}`);
            setState(prev => ({ ...prev }));
            toast.success('Record deleted successfully');
        } catch (error) {
            toast.error('Failed to delete record');
        }
    };

    return { getRecordsApi, createRecordApi, updateRecordApi, deleteRecordApi };
};
