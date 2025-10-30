export type TablePersistenceOptions = {
    storageKey?: string;
    version?: string | number;
};

export default function useTablepersistance() {
    const setPageQueryParam = (pageNumber: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', pageNumber.toString());
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    };

    const getPageFromQuery = (): number => {
        const params = new URLSearchParams(window.location.search);
        return Number(params.get('page')) || 1;
    };

    const setPageSizeParam = (pageSize: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('pageSize', pageSize);
        params.set('page', '1');
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    };

    const getPageSizeFromQuery = (): number | null => {
        const params = new URLSearchParams(window.location.search);
        return params.get('pageSize') ? Number(params.get('pageSize')) : null;
    };

    const setDateRangeParam = (newStartDate: Date | null, newEndDate: Date | null) => {
        const params = new URLSearchParams(window.location.search);
        params.set('startDate', newStartDate ? newStartDate.toISOString() : '');
        params.set('endDate', newEndDate ? newEndDate.toISOString() : '');
        params.set('page', '1');
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    };

    const getDateRangeFromQuery = (): { startDate: Date | null; endDate: Date | null } => {
        const params = new URLSearchParams(window.location.search);
        const s = params.get('startDate');
        const e = params.get('endDate');
        return {
            startDate: s ? new Date(s) : null,
            endDate: e ? new Date(e) : null
        };
    };

    const setSearchParam = (newSearchValue: string) => {
        const params = new URLSearchParams(window.location.search);
        if (newSearchValue) {
            params.set('search', newSearchValue);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    };

    const getSearchFromQuery = (): string => {
        const params = new URLSearchParams(window.location.search);
        return params.get('search') || '';
    };

    const clearFiltersParams = () => {
        const params = new URLSearchParams(window.location.search);
        params.delete('filters');
        params.delete('search');
        params.delete('startDate');
        params.delete('endDate');
        params.set('page', '1');
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    };

    const setFiltersParam = (filtersObject: Record<string, any>) => {
        const params = new URLSearchParams(window.location.search);
        params.set('filters', JSON.stringify(filtersObject));
        params.set('page', '1');
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    };

    const getFiltersFromQuery = (): Record<string, any> | null => {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get('filters');
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (err) {
            // preserve original behavior: warn and return null
            console.warn('Invalid filters query param, ignoring', err);
            return null;
        }
    };

    return {
        setPageQueryParam,
        getPageFromQuery,
        setPageSizeParam,
        getPageSizeFromQuery,
        setDateRangeParam,
        getDateRangeFromQuery,
        setSearchParam,
        getSearchFromQuery,
        clearFiltersParams,
        setFiltersParam,
        getFiltersFromQuery
    };
}
