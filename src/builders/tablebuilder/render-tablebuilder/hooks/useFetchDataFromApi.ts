import { useCallback } from 'react';
import { useTablebuilderState } from './useTablebuilderStateContext';
import { getFiltersObject } from '../utils/getFiltersObject';
import { QueryParams } from '../interface';
import httpRequest from '../../../../global-utils/httpRequest';

export const useFetchDataFromApi = () => {
  const { state, setState, settings, injectedData } = useTablebuilderState();
  const { page, pageRows, startDate, endDate, searchValue, sorts, activeFilters } = state;

  const getDataFromApi = useCallback(
    async (customQuery?: Partial<QueryParams>, clearFilterRequest?: boolean): Promise<boolean> => {
      setState(prev => ({ ...prev, loading: true }));

      try {
        // Build the base query from state
        const query: any = {
          page: customQuery?.page ?? page,
          pageSize: customQuery?.pageSize ?? pageRows,
          startDate: customQuery?.startDate ?? startDate,
          endDate: customQuery?.endDate ?? endDate,
          search: customQuery?.search ?? searchValue,
          sortBy: (customQuery?.sorts ?? sorts).map(sort => `${sort.column}:${sort.direction}`).join(','),
          searchFields: customQuery?.searchableColumns ?? [],
          dateFieldKey: settings.dateRange.dateFieldKey || 'updatedAt',
        };

        // Handle filters properly - use activeFilters only if not explicitly skipped
        if ((activeFilters.length > 0 && !customQuery?.skipActiveFilters) || customQuery?.filters) {
          // Start with active filters if not skipping
          const baseFilters = customQuery?.skipActiveFilters ? {} : getFiltersObject(activeFilters);

          // Merge with custom filters if provided
          query.filters = {
            ...baseFilters,
            ...customQuery?.filters,
            ...injectedData.externalFilters,
          };
        } else {
          query.filters = {
            ...injectedData.externalFilters,
          };
        }
        const api = settings.api;
        // const url = 'http://192.168.1.36:4600';
        const url = api.getUrlFromEnv ? import.meta.env[api.envVariable] : api.url;

        const updatedQuery = injectedData.updatedQuery ? injectedData.updatedQuery(query) : query;

        const res = await httpRequest('POST', `${url}${api.endPoint}`, clearFilterRequest ? { filters: injectedData.externalFilters } : updatedQuery);

        if (!res || !res.data) {
          throw new Error('Invalid API response format');
        }
        setState(prev => ({ ...prev, total: res.total, data: res.data }));

        return true;
      } catch (error) {
        console.error('Failed to fetch data:', error);
        return false;
      } finally {
        setTimeout(() => {
          setState(prev => ({ ...prev, loading: false }));
        }, 200);
      }
    },
    [page, pageRows, startDate, endDate, searchValue, sorts, activeFilters, setState, settings, injectedData]
  );
  return { getDataFromApi };
};
