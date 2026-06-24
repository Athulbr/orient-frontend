import { useState, useCallback, useEffect } from 'react';
import { config } from '../../../../../../config/default';
import { DEFAULT_PAGE_SIZE } from './constants';
import type { ScannedDocument, StatusFilter, DateRange } from './types';

interface UseScannedDocumentsReturn {
    documents: ScannedDocument[];
    isLoading: boolean;
    error: string | null;
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
    statusFilter: StatusFilter;
    branchFilter: string;
    dateRange: DateRange;
    setCurrentPage: (page: number) => void;
    setStatusFilter: (status: StatusFilter) => void;
    setBranchFilter: (branch: string) => void;
    setDateRange: (range: DateRange) => void;
    fetchDocuments: (silent?: boolean) => void;
    handleReset: () => void;
}

/**
 * Manages all data fetching, pagination and filter state for the
 * ScannedDocuments page.  Components only need to read from and call
 * the values this hook returns.
 */
export const useScannedDocuments = (): UseScannedDocumentsReturn => {
    const [documents, setDocuments] = useState<ScannedDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [branchFilter, setBranchFilter] = useState(() => sessionStorage.getItem('branch_code') || 'all');
    const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = DEFAULT_PAGE_SIZE;
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Reset to page 1 whenever any filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, branchFilter, dateRange]);

    const fetchDocuments = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: perPage.toString()
            });

            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (branchFilter !== 'all') params.append('branchCode', branchFilter);
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const token = localStorage.getItem('token');
            const response = await fetch(`${config.workflowService}/api/scanned-documents?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });

            const result = await response.json();
            if (result.success) {
                setDocuments(result.data);
                setTotal(result.total);
                setTotalPages(result.totalPages);
            } else {
                throw new Error(result.error || 'Failed to fetch');
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to load scanned documents.');
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [currentPage, perPage, statusFilter, branchFilter, dateRange]);

    // Refetch whenever dependencies change
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleReset = () => {
        setStatusFilter('all');
        setBranchFilter(sessionStorage.getItem('branch_code') || 'all');
        setDateRange({ startDate: '', endDate: '' });
        setCurrentPage(1);
    };

    return {
        documents,
        isLoading,
        error,
        total,
        totalPages,
        currentPage,
        perPage,
        statusFilter,
        branchFilter,
        dateRange,
        setCurrentPage,
        setStatusFilter,
        setBranchFilter,
        setDateRange,
        fetchDocuments,
        handleReset
    };
};
