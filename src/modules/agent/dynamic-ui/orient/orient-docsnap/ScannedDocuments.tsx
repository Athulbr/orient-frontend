import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText,
    RotateCw,
    X,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Hash,
    HardDrive,
    Calendar,
    Building2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    Filter,
    ScanLine,
} from 'lucide-react';
import { config } from '../../../../../config/default';
import DateTimePicker from '../../../../../components/DateTimePicker';

// ── Types ──────────────────────────────────────────────────────

interface ScannedDocument {
    _id?: string;
    folderName?: string;
    name: string;
    path: string;
    size: number;
    fileAddedAt: string;
    fileModifiedAt?: string;
    branchCode: string;
    invoiceNumber: string;
    status: 'pending' | 'success' | 'failed';
    errorMessage: string | null;
    createdAt?: string;
    updatedAt?: string;
}

// ── Status config ──────────────────────────────────────────────

const STATUS_CONFIG: Record<
    string,
    {
        label: string;
        icon: React.ReactNode;
        text: string;
        bg: string;
        border: string;
        dot: string;
        stripe: string;
        badgeBg: string;
    }
> = {
    pending: {
        label: 'Pending',
        icon: <Clock size={12} />,
        text: 'text-amber-800',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        dot: 'bg-amber-400',
        stripe: 'from-amber-400',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    success: {
        label: 'Success',
        icon: <CheckCircle2 size={12} />,
        text: 'text-emerald-800',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        stripe: 'from-emerald-400',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    failed: {
        label: 'Failed',
        icon: <XCircle size={12} />,
        text: 'text-red-800',
        bg: 'bg-red-50',
        border: 'border-red-300',
        dot: 'bg-red-500',
        stripe: 'from-red-400',
        badgeBg: 'bg-red-100 text-red-800 border-red-200',
    },
};

// ── Utility helpers ────────────────────────────────────────────

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (iso: string): string => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const getFileName = (path: string): string => path.split('/').pop() || path;

// ── Sample data (replace with API call) ───────────────────────

// Removed SAMPLE_DATA as it's no longer used

// ── Sub-component: ScannedDocumentCard ────────────────────────

const ScannedDocumentCard: React.FC<{ doc: ScannedDocument }> = ({ doc }) => {
    const statusCfg = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG['pending'];

    return (
        <div className="font-[DM_Sans,Segoe_UI,sans-serif] bg-white border border-gray-200 rounded-xl overflow-hidden w-full shadow-sm shadow-gray-100 transition-all duration-150 hover:shadow-md hover:border-gray-300">
            {/* Left color accent bar */}
            <div className="flex items-stretch">
                <div className={`w-[3px] flex-shrink-0 bg-gradient-to-b ${statusCfg.stripe} to-transparent rounded-l-xl`} />

                <div className="flex-1 flex items-center gap-4 px-5 py-4 min-w-0">
                    {/* PDF icon */}
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                        <FileText size={18} className="text-red-500" />
                    </div>

                    {/* File name + path */}
                    <div className="min-w-0 flex-shrink" style={{ width: '24%' }}>
                        <p className="text-[14px] font-bold text-gray-800 truncate leading-tight" title={doc.name}>
                            {getFileName(doc.name)}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate font-mono mt-0.5" title={doc.path}>
                            {doc.path}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="h-9 w-px bg-gray-100 flex-shrink-0" />

                    {/* Metadata pills row */}
                    <div className="flex items-center gap-2 flex-1 flex-wrap min-w-0">
                        <MetaPill icon={<Building2 size={12} className="text-blue-500" />} colorClass="bg-blue-50 text-blue-700 border-blue-100">
                            {doc.branchCode}
                        </MetaPill>
                        <MetaPill icon={<Hash size={12} className="text-violet-500" />} colorClass="bg-violet-50 text-violet-700 border-violet-100">
                            {doc.invoiceNumber}
                        </MetaPill>
                        <MetaPill icon={<HardDrive size={12} className="text-slate-400" />} colorClass="bg-slate-50 text-slate-600 border-slate-100">
                            {formatBytes(doc.size)}
                        </MetaPill>
                        <MetaPill icon={<Calendar size={12} className="text-emerald-500" />} colorClass="bg-emerald-50 text-emerald-700 border-emerald-100">
                            {formatDate(doc.fileAddedAt)}
                        </MetaPill>
                        {doc.errorMessage && (
                            <MetaPill icon={<AlertCircle size={12} className="text-red-500" />} colorClass="bg-red-50 text-red-700 border-red-100">
                                {doc.errorMessage}
                            </MetaPill>
                        )}
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 flex-shrink-0 px-3 py-1 rounded-full text-[12px] font-bold border ${statusCfg.badgeBg}`}>
                        {statusCfg.icon}
                        {statusCfg.label}
                    </span>
                </div>
            </div>
        </div>
    );
};

// ── Sub-component: MetaPill ───────────────────────────────────

const MetaPill: React.FC<{
    icon: React.ReactNode;
    colorClass: string;
    children: React.ReactNode;
}> = ({ icon, colorClass, children }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-semibold border truncate max-w-[280px] ${colorClass}`}>
        {icon}
        <span className="truncate">{children}</span>
    </span>
);

// ── Main Component ────────────────────────────────────────────

const ScannedDocuments: React.FC = () => {
    const [documents, setDocuments] = useState<ScannedDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');
    const [branchFilter, setBranchFilter] = useState('all');
    const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    
    // Derived backend options
    const [uniqueBranches, setUniqueBranches] = useState<string[]>([]);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, branchFilter, dateRange]);

    // Fetch data
    const fetchDocuments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: perPage.toString(),
            });

            if (statusFilter !== 'all') queryParams.append('status', statusFilter);
            if (branchFilter !== 'all') queryParams.append('branchCode', branchFilter);
            if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
            if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);

            const token = localStorage.getItem('token');
            const response = await fetch(`${config.workflowService}/api/scanned-documents?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            if (result.success) {
                setDocuments(result.data);
                setTotal(result.total);
                setTotalPages(result.totalPages);
                setUniqueBranches(result.uniqueBranches || []);
            } else {
                throw new Error(result.error || 'Failed to fetch');
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to load scanned documents.');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, perPage, statusFilter, branchFilter, dateRange]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleReset = () => {
        setStatusFilter('all');
        setBranchFilter('all');
        setDateRange({ startDate: '', endDate: '' });
        setCurrentPage(1);
    };

    return (
        <div className="font-[DM_Sans,Segoe_UI,sans-serif] min-h-full w-full bg-gray-50 flex flex-col">
            {/* ── Header / Filter Bar ────────────────────────────────── */}
            <div className="px-5 py-3 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                {/* Single-row header: title left, all controls right */}
                <div className="flex items-center gap-4">
                    {/* Title */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                            <ScanLine size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-[17px] font-bold text-gray-900 leading-tight">
                                Scanned Documents
                            </h1>
                            <p className="text-[11px] text-gray-400">
                                {documents.length} total documents
                            </p>
                        </div>
                    </div>

                    {/* Controls — pushed to right */}
                    <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
                        <div className="flex items-center justify-end w-auto" style={{ width: 170 }}>
                            <DateTimePicker 
                                onChange={setDateRange} 
                                initialStartDate={dateRange.startDate} 
                                initialEndDate={dateRange.endDate} 
                            />
                        </div>

                        {/* Status filter */}
                        <select
                            id="scanned-docs-status-filter"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                            className="h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-700 cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                        </select>

                        {/* Branch filter */}
                        <select
                            id="scanned-docs-branch-filter"
                            value={branchFilter}
                            onChange={e => setBranchFilter(e.target.value)}
                            className="h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-700 cursor-pointer"
                        >
                            <option value="all">All Branches</option>
                            {uniqueBranches.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>

                        {/* Refresh */}
                        <button
                            id="scanned-docs-refresh"
                            onClick={() => fetchDocuments()}
                            disabled={isLoading}
                            className="h-9 px-3 flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer bg-white"
                        >
                            <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
                            Refresh
                        </button>

                        {/* Reset filters */}
                        <button
                            id="scanned-docs-reset"
                            onClick={handleReset}
                            className="h-9 w-9 flex items-center justify-center text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer bg-white"
                            title="Reset filters"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Content ────────────────────────────────────────────── */}
            <div className="flex-1 p-5">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={32} className="animate-spin text-blue-500" />
                        <p className="text-sm font-medium">Loading scanned documents…</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
                        <AlertCircle size={28} />
                        <p className="font-semibold">Failed to load documents</p>
                        <p className="text-sm text-red-500">{error}</p>
                        <button
                            onClick={() => fetchDocuments()}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-gray-200 rounded-xl text-gray-400">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <Filter size={24} className="text-gray-300" />
                        </div>
                        <p className="font-semibold text-gray-500">No documents found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria.</p>
                        <button
                            onClick={handleReset}
                            className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {documents.map((doc, idx) => (
                            <ScannedDocumentCard key={doc._id || idx} doc={doc} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Pagination ──────────────────────────────────────────── */}
            {!isLoading && !error && documents.length > 0 && (
                <div className="px-5 py-3 flex items-center justify-between border-t border-gray-200 bg-white sticky bottom-0 z-10">
                    <p className="text-xs text-gray-500">
                        Showing{' '}
                        <span className="font-bold text-gray-700">
                            {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, total)}
                        </span>{' '}
                        of <span className="font-bold text-gray-700">{total}</span> documents
                    </p>

                    <div className="flex items-center gap-1.5">
                        <PagBtn
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            icon={<ChevronsLeft size={15} />}
                            title="First page"
                        />
                        <PagBtn
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            icon={<ChevronLeft size={15} />}
                            title="Previous page"
                        />
                        <span className="px-3 py-1 text-xs font-semibold text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <PagBtn
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            icon={<ChevronRight size={15} />}
                            title="Next page"
                        />
                        <PagBtn
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            icon={<ChevronsRight size={15} />}
                            title="Last page"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};



// ── Helper: Pagination button ─────────────────────────────────

const PagBtn: React.FC<{
    onClick: () => void;
    disabled: boolean;
    icon: React.ReactNode;
    title: string;
}> = ({ onClick, disabled, icon, title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
    >
        {icon}
    </button>
);

export default ScannedDocuments;
