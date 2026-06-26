import React from 'react';
import { RotateCw, X, ScanLine, Search } from 'lucide-react';
import DateTimePicker from '../../../../../../components/DateTimePicker';
import { STATIC_BRANCHES } from './constants';
import type { StatusFilter, DateRange } from './types';

interface ScannedDocumentsHeaderProps {
    documentCount: number;
    isLoading: boolean;
    statusFilter: StatusFilter;
    branchFilter: string;
    dateRange: DateRange;
    searchQuery: string;
    onStatusChange: (status: StatusFilter) => void;
    onBranchChange: (branch: string) => void;
    onDateRangeChange: (range: DateRange) => void;
    onSearchChange: (query: string) => void;
    onRefresh: () => void;
    onReset: () => void;
}

/**
 * Sticky top bar containing:
 * - Page title + document count
 * - Date range picker
 * - Status and branch filter dropdowns
 * - Refresh and reset-filters buttons
 */
const ScannedDocumentsHeader: React.FC<ScannedDocumentsHeaderProps> = ({
    documentCount,
    isLoading,
    statusFilter,
    branchFilter,
    dateRange,
    searchQuery,
    onStatusChange,
    onBranchChange,
    onDateRangeChange,
    onSearchChange,
    onRefresh,
    onReset
}) => (
    <div className="px-5 py-3 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
            {/* Title */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                    <ScanLine size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="text-[17px] font-bold text-gray-900 leading-tight">Scanned Documents</h1>
                    <p className="text-[11px] text-gray-400">{documentCount} total documents</p>
                </div>
            </div>

            {/* Controls — pushed to the right */}
            <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
                {/* Search field */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-9 pl-8 pr-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-700 w-48"
                    />
                </div>

                {/* Date range picker */}
                <div className="flex items-center justify-end" style={{ width: 170 }}>
                    <DateTimePicker onChange={onDateRangeChange} initialStartDate={dateRange.startDate} initialEndDate={dateRange.endDate} />
                </div>

                {/* Status filter */}
                <select
                    id="scanned-docs-status-filter"
                    value={statusFilter}
                    onChange={e => onStatusChange(e.target.value as StatusFilter)}
                    className="h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-700 cursor-pointer"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="extracted">Extracted</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                </select>

                {/* Branch filter */}
                <select
                    id="scanned-docs-branch-filter"
                    value={branchFilter}
                    onChange={e => onBranchChange(e.target.value)}
                    className="h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-700 cursor-pointer"
                >
                    <option value="all">All Branches</option>
                    {STATIC_BRANCHES.map(b => (
                        <option key={b} value={b}>
                            {b}
                        </option>
                    ))}
                </select>

                {/* Refresh */}
                <button
                    id="scanned-docs-refresh"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="h-9 px-3 flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer bg-white"
                >
                    <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>

                {/* Reset filters */}
                <button
                    id="scanned-docs-reset"
                    onClick={onReset}
                    title="Reset filters"
                    className="h-9 w-9 flex items-center justify-center text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer bg-white"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    </div>
);

export default ScannedDocumentsHeader;
