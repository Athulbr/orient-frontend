import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import httpRequest from '../../../../../../global-utils/httpRequest';
import * as XLSX from 'xlsx';
import DateTimePicker from '../../../../../../components/DateTimePicker';
import {
    ArrowLeft,
    RefreshCw,
    Search,
    FileText,
    Layers,
    AlertCircle,
    Download,
    Filter,
    Calendar,
    Smartphone,
    Store,
    BarChart3,
    Table,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Wifi,
    PieChart,
    FileSpreadsheet
} from 'lucide-react';
import { Button } from '../../../../../../components/Button';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface OrderDetailChild {
    ordermode: string;
    docCount: number;
}

export interface OrderDetailItem {
    branchCode: string;
    docCount: number;
    children?: OrderDetailChild[];
}

export interface OrderDetailResponse {
    indexName: string;
    groupByFields: string[];
    data: OrderDetailItem[];
}

export interface ScannedDocItem {
    'branch.keyword': string;
    docCount: number;
}

export interface ScannedDocResponse {
    indexName: string;
    groupByFields: string[];
    data: ScannedDocItem[];
}

export interface MergedBranchData {
    branchCode: string;
    branchName: string;
    scannedDocs: number;
    submittedOrders: number;
    extractedOrders: number;
    offlineOrders: number;
    onlineOrders: number;
}

type ViewTab = 'dashboard' | 'table';
type SortField = 'branchCode' | 'scannedDocs' | 'submittedOrders' | 'extractedOrders' | 'offlineOrders' | 'onlineOrders';
type SortOrder = 'asc' | 'desc';

// ── City Map for Branch Codes ──────────────────────────────────────────────────

const BRANCH_NAME_MAP: Record<string, string> = {
    BANH: 'Bangalore - Basavangudi',
    AHMD: 'Ahmedabad - C.G.ROAD',
    BANW: 'Bangalore - Whitefield',
    PUNE: 'Pune - Dhole Patil Road',
    DLHI: 'Delhi - Barakhamba Road',
    COMGR: 'Coimbatore - R. S Puram',
    MUMV: 'Mumbai - Vile Parle',
    MNGLR: 'Mangalore - Bunts Hostel Circle',
    HYD: 'Hyderabad - Hyderguda',
    MUMD: 'Mumbai - Mahim( West), Near Dadar',
    VADO: 'Vadodara - Gotri Main Road',
    SURAT: 'Surat - Parle Point Circle',
    COMB: 'Kochi - M G Road',
    CHN: 'Chennai - Nungambakkam',
    GURG: 'Gurugram - Metropolis Mall',
    THRI: 'Thrissur - M. G Road',
    CHAD: 'Chandigarh - Sector 8(C)',
    KOL: 'Kolkata - Little Russel Street',
    BELG: 'Belgaum - Civil Hospital Road',
    AMTR: 'Amritsar - Liberty Market',
    TVM: 'Trivandrum - Pattor Junction',
    JLDR: 'Jalandhar - Garha Road',
    KTM: 'Kottayam - Baker Junction',
    COARP: 'Kochi - Near Airport',
    CALCT: 'Calicut - Kurisupalli',
    KOLM: 'Kollam - Sankar Junction',
    KOCH: 'Kochi - M G Road'
};

// ── Main Daily Report Component ────────────────────────────────────────────────

const DailyReportPage: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
        startDate: '2026-08-08T00:00:00+05:30',
        endDate: '2026-08-09T23:59:59+05:30'
    });

    // Comparison State
    const [isCompareActive, setIsCompareActive] = useState<boolean>(false);
    const [compareDateRange, setCompareDateRange] = useState<{ startDate: string; endDate: string }>({
        startDate: '2026-08-08T00:00:00+05:30',
        endDate: '2026-08-09T23:59:59+05:30'
    });

    const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
    const [loading, setLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
    const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

    // Primary API Data
    const [orderDetailData, setOrderDetailData] = useState<OrderDetailResponse | null>(null);
    const [extractedDetailData, setExtractedDetailData] = useState<OrderDetailResponse | null>(null);
    const [scannedDocData, setScannedDocData] = useState<ScannedDocResponse | null>(null);

    // Comparison API Data
    const [compareOrderDetailData, setCompareOrderDetailData] = useState<OrderDetailResponse | null>(null);
    const [compareExtractedDetailData, setCompareExtractedDetailData] = useState<OrderDetailResponse | null>(null);
    const [compareScannedDocData, setCompareScannedDocData] = useState<ScannedDocResponse | null>(null);

    // Table state
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortField, setSortField] = useState<SortField>('submittedOrders');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

    const API_ENDPOINT = 'http://172.16.0.240:6011/search/query/aggregate';

    const handleCompareToggle = (checked: boolean) => {
        setIsCompareActive(checked);
        if (checked) {
            setCompareDateRange({
                startDate: dateRange.startDate || '2026-08-08T00:00:00+05:30',
                endDate: dateRange.endDate || '2026-08-09T23:59:59+05:30'
            });
        }
    };

    // Fetch API Data for Primary and optional Comparison
    const fetchReportData = useCallback(async () => {
        setLoading(true);
        setIsRefreshing(true);
        setApiErrorMessage(null);

        const dateStart = dateRange.startDate || '2026-08-08T00:00:00+05:30';
        const dateEnd = dateRange.endDate || '2026-08-09T23:59:59+05:30';

        const orderDetailBodyOfSubmitted = {
            indexName: 'orderdetail',
            groupByFields: ['branchCode', 'ordermode'],
            filters: [
                { field: 'orderStatus', operator: 'equals', value: 'submitted' },
                { field: 'createdAt', operator: 'between', value: [dateStart, dateEnd] }
            ]
        };
        const orderDetailBodyOfExtracted = {
            indexName: 'orderdetail',
            groupByFields: ['branchCode'],
            filters: [
                { field: 'orderStatus', operator: 'equals', value: 'extracted' },
                { field: 'createdAt', operator: 'between', value: [dateStart, dateEnd] }
            ]
        };

        const scannedDocsBody = {
            indexName: 'scanneddocuments',
            groupByFields: ['branch.keyword'],
            filters: [
                { field: 'status', operator: 'equals', value: 'success' },
                { field: 'createdAt', operator: 'between', value: [dateStart, dateEnd] }
            ]
        };

        const promises: Promise<any>[] = [
            httpRequest<OrderDetailResponse>('POST', API_ENDPOINT, orderDetailBodyOfSubmitted),
            httpRequest<OrderDetailResponse>('POST', API_ENDPOINT, orderDetailBodyOfExtracted),
            httpRequest<ScannedDocResponse>('POST', API_ENDPOINT, scannedDocsBody)
        ];

        if (isCompareActive) {
            const compareStart = compareDateRange.startDate || dateStart;
            const compareEnd = compareDateRange.endDate || dateEnd;

            const compareOrderBody = {
                indexName: 'orderdetail',
                groupByFields: ['branchCode', 'ordermode'],
                filters: [
                    { field: 'orderStatus', operator: 'equals', value: 'submitted' },
                    { field: 'createdAt', operator: 'between', value: [compareStart, compareEnd] }
                ]
            };

            const compareExtractedBody = {
                indexName: 'orderdetail',
                groupByFields: ['branchCode'],
                filters: [
                    { field: 'orderStatus', operator: 'equals', value: 'extracted' },
                    { field: 'createdAt', operator: 'between', value: [compareStart, compareEnd] }
                ]
            };

            const compareScannedBody = {
                indexName: 'scanneddocuments',
                groupByFields: ['branch.keyword'],
                filters: [
                    { field: 'status', operator: 'equals', value: 'success' },
                    { field: 'createdAt', operator: 'between', value: [compareStart, compareEnd] }
                ]
            };

            promises.push(
                httpRequest<OrderDetailResponse>('POST', API_ENDPOINT, compareOrderBody),
                httpRequest<OrderDetailResponse>('POST', API_ENDPOINT, compareExtractedBody),
                httpRequest<ScannedDocResponse>('POST', API_ENDPOINT, compareScannedBody)
            );
        }

        try {
            const results = await Promise.all(promises);
            if (results[0] && results[1] && results[2]) {
                setOrderDetailData(results[0]);
                setExtractedDetailData(results[1]);
                setScannedDocData(results[2]);
            } else {
                throw new Error('Invalid or empty response payload from backend');
            }

            if (isCompareActive && results[3] && results[4] && results[5]) {
                setCompareOrderDetailData(results[3]);
                setCompareExtractedDetailData(results[4]);
                setCompareScannedDocData(results[5]);
            }
        } catch (err: any) {
            console.error('[DailyReport] API call failed:', err?.message || err);
            setOrderDetailData(null);
            setExtractedDetailData(null);
            setScannedDocData(null);
            setCompareOrderDetailData(null);
            setCompareExtractedDetailData(null);
            setCompareScannedDocData(null);
            setApiErrorMessage(
                err?.code === 'ECONNABORTED'
                    ? 'Connection timed out while reaching http://172.16.0.240:6011. Please verify network access.'
                    : `Unable to fetch data from ${API_ENDPOINT}. Error: ${err?.message || 'Network unreachable'}`
            );
        } finally {
            setLastFetchedAt(new Date());
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [dateRange, compareDateRange, isCompareActive]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    // Merged Data Processing Helper
    const processMergedBranches = useCallback((orderData: OrderDetailResponse | null, extractedData: OrderDetailResponse | null, scannedData: ScannedDocResponse | null): MergedBranchData[] => {
        if (!orderData && !extractedData && !scannedData) return [];

        const branchMap = new Map<string, MergedBranchData>();

        // Process Scanned Docs
        if (scannedData?.data && Array.isArray(scannedData.data)) {
            scannedData.data.forEach(item => {
                const bCode = item['branch.keyword'];
                if (!bCode) return;
                branchMap.set(bCode, {
                    branchCode: bCode,
                    branchName: BRANCH_NAME_MAP[bCode] || bCode,
                    scannedDocs: item.docCount || 0,
                    submittedOrders: 0,
                    extractedOrders: 0,
                    offlineOrders: 0,
                    onlineOrders: 0
                });
            });
        }

        // Process Extracted Orders
        if (extractedData?.data && Array.isArray(extractedData.data)) {
            extractedData.data.forEach(item => {
                const bCode = item.branchCode;
                if (!bCode) return;

                const existing = branchMap.get(bCode);
                const count = item.docCount || 0;

                if (existing) {
                    existing.extractedOrders = count;
                } else {
                    branchMap.set(bCode, {
                        branchCode: bCode,
                        branchName: BRANCH_NAME_MAP[bCode] || bCode,
                        scannedDocs: 0,
                        submittedOrders: 0,
                        extractedOrders: count,
                        offlineOrders: 0,
                        onlineOrders: 0
                    });
                }
            });
        }

        // Process Submitted Orders
        if (orderData?.data && Array.isArray(orderData.data)) {
            orderData.data.forEach(item => {
                const bCode = item.branchCode;
                if (!bCode) return;

                let offline = 0;
                let online = 0;
                if (item.children && Array.isArray(item.children)) {
                    item.children.forEach(child => {
                        if (child.ordermode === 'offline') offline += child.docCount || 0;
                        if (child.ordermode === 'online') online += child.docCount || 0;
                    });
                }

                const existing = branchMap.get(bCode);
                const scanned = existing ? existing.scannedDocs : 0;
                const extracted = existing ? existing.extractedOrders : 0;
                const submitted = item.docCount || 0;

                branchMap.set(bCode, {
                    branchCode: bCode,
                    branchName: BRANCH_NAME_MAP[bCode] || bCode,
                    scannedDocs: scanned,
                    submittedOrders: submitted,
                    extractedOrders: extracted,
                    offlineOrders: offline,
                    onlineOrders: online
                });
            });
        }

        return Array.from(branchMap.values());
    }, []);

    // Primary Merged Branches
    const mergedBranches = useMemo(() => processMergedBranches(orderDetailData, extractedDetailData, scannedDocData), [orderDetailData, extractedDetailData, scannedDocData, processMergedBranches]);

    // Comparison Merged Branches
    const compareMergedBranches = useMemo(
        () => processMergedBranches(compareOrderDetailData, compareExtractedDetailData, compareScannedDocData),
        [compareOrderDetailData, compareExtractedDetailData, compareScannedDocData, processMergedBranches]
    );

    // Aggregate KPI Totals
    const kpiTotals = useMemo(() => {
        let totalScans = 0;
        let totalOrders = 0;
        let totalOffline = 0;
        let totalOnline = 0;

        mergedBranches.forEach(b => {
            totalScans += b.scannedDocs;
            totalOrders += b.submittedOrders;
            totalOffline += b.offlineOrders;
            totalOnline += b.onlineOrders;
        });

        const offlinePct = totalOrders > 0 ? (totalOffline / totalOrders) * 100 : 0;
        const onlinePct = totalOrders > 0 ? (totalOnline / totalOrders) * 100 : 0;

        return {
            totalScans,
            totalOrders,
            totalOffline,
            totalOnline,
            offlinePct,
            onlinePct,
            branchCount: mergedBranches.length
        };
    }, [mergedBranches]);

    // Filtering & Sorting Helper
    const filterAndSortBranches = useCallback(
        (branches: MergedBranchData[]) => {
            return branches
                .filter(b => {
                    const matchesSearch = b.branchCode.toLowerCase().includes(searchQuery.toLowerCase()) || b.branchName.toLowerCase().includes(searchQuery.toLowerCase());
                    if (!matchesSearch) return false;
                    return true;
                })
                .sort((a, b) => {
                    let valA = a[sortField];
                    let valB = b[sortField];

                    if (typeof valA === 'string') {
                        return sortOrder === 'asc' ? (valA as string).localeCompare(valB as string) : (valB as string).localeCompare(valA as string);
                    }

                    return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
                });
        },
        [searchQuery, sortField, sortOrder]
    );

    // Filtered & Sorted Branch Data
    const filteredBranches = useMemo(() => filterAndSortBranches(mergedBranches), [mergedBranches, filterAndSortBranches]);
    const compareFilteredBranches = useMemo(() => filterAndSortBranches(compareMergedBranches), [compareMergedBranches, filterAndSortBranches]);

    // All Branches for Chart
    const chartBranches = useMemo(() => {
        return [...mergedBranches].sort((a, b) => b.submittedOrders - a.submittedOrders);
    }, [mergedBranches]);

    // Max Bar Value for scaling charts
    const maxBarValue = useMemo(() => {
        let max = 1;
        mergedBranches.forEach(b => {
            if (b.scannedDocs > max) max = b.scannedDocs;
            if (b.submittedOrders > max) max = b.submittedOrders;
        });
        return max;
    }, [mergedBranches]);

    const handleSortToggle = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    // Export in Excel (.xlsx) using SheetJS (XLSX)
    const handleExportExcel = () => {
        if (filteredBranches.length === 0) return;

        const excelRows = filteredBranches.map(b => ({
            'Branch Code': b.branchCode,
            'Branch Name': b.branchName,
            'Scanned Documents': b.scannedDocs,
            'Submitted Orders': b.submittedOrders,
            'Extracted Orders': b.extractedOrders,
            'Offline Orders': b.offlineOrders,
            'Online Orders': b.onlineOrders
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Branch Performance');

        // Column width formatting
        worksheet['!cols'] = [
            { wch: 14 }, // Branch Code
            { wch: 24 }, // Branch Name
            { wch: 20 }, // Scanned Documents
            { wch: 18 }, // Submitted Orders
            { wch: 18 }, // Extracted Orders
            { wch: 16 }, // Offline Orders
            { wch: 16 } // Online Orders
        ];

        const displayDate = dateRange.startDate ? dateRange.startDate.split('T')[0] : 'export';
        XLSX.writeFile(workbook, `Daily_Branch_Report_${displayDate}.xlsx`);
    };

    const renderBranchTable = (branchesData: MergedBranchData[], title?: string, badgeColor?: string, rangeText?: string) => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full flex-1">
            {title && (
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${badgeColor || 'bg-indigo-600'}`}></span>
                        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
                    </div>
                    {rangeText && <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-xs">{rangeText}</span>}
                </div>
            )}
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-xs">
                        <tr>
                            <th className="py-3 px-5 cursor-pointer hover:text-indigo-600" onClick={() => handleSortToggle('branchCode')}>
                                <div className="flex items-center gap-1.5">
                                    Branch Location
                                    {sortField === 'branchCode' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                </div>
                            </th>

                            <th className="py-3 px-5 text-right cursor-pointer hover:text-amber-600" onClick={() => handleSortToggle('extractedOrders')}>
                                <div className="flex items-center justify-end gap-1.5">
                                    Extracted Orders
                                    {sortField === 'extractedOrders' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                </div>
                            </th>
                            <th className="py-3 px-5 text-right cursor-pointer hover:text-indigo-600" onClick={() => handleSortToggle('submittedOrders')}>
                                <div className="flex items-center justify-end gap-1.5">
                                    Submitted Orders
                                    {sortField === 'submittedOrders' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                </div>
                            </th>
                            <th className="py-3 px-5 text-right cursor-pointer hover:text-indigo-600" onClick={() => handleSortToggle('offlineOrders')}>
                                <div className="flex items-center justify-end gap-1.5">
                                    Offline Orders
                                    {sortField === 'offlineOrders' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                </div>
                            </th>
                            <th className="py-3 px-5 text-right cursor-pointer hover:text-indigo-600" onClick={() => handleSortToggle('onlineOrders')}>
                                <div className="flex items-center justify-end gap-1.5">
                                    Online Orders
                                    {sortField === 'onlineOrders' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                </div>
                            </th>
                            <th className="py-3 px-5 text-center">Channel Split</th>
                            <th className="py-3 px-5 text-right cursor-pointer hover:text-indigo-600" onClick={() => handleSortToggle('scannedDocs')}>
                                <div className="flex items-center justify-end gap-1.5">
                                    Scanned Invoices
                                    {sortField === 'scannedDocs' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {branchesData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-slate-400 text-sm font-medium">
                                    No branch record matching the search/filter criteria.
                                </td>
                            </tr>
                        ) : (
                            branchesData.map(b => {
                                const isExpanded = expandedBranch === b.branchCode;
                                const totalOrd = b.submittedOrders || 1;
                                const offlinePct = Math.round((b.offlineOrders / totalOrd) * 100);
                                const onlinePct = 100 - offlinePct;

                                return (
                                    <React.Fragment key={b.branchCode}>
                                        <tr onClick={() => setExpandedBranch(isExpanded ? null : b.branchCode)} className="hover:bg-slate-50 cursor-pointer transition-colors text-xs">
                                            {/* Branch Code */}
                                            <td className="py-3 px-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono font-bold text-sm rounded border border-slate-200">{b.branchCode}</span>
                                                    <span className="text-slate-900 font-medium text-sm">{b.branchName}</span>
                                                </div>
                                            </td>
                                            {/* Extracted Orders */}
                                            <td className="py-3 px-5 text-right font-bold text-amber-600 text-sm">{Number(b.extractedOrders || 0) + Number(b.submittedOrders || 0)}</td>

                                            {/* Submitted Orders */}
                                            <td className="py-3 px-5 text-right font-bold text-slate-900 text-sm">{Number(b.submittedOrders || 0)}</td>

                                            {/* Offline */}
                                            <td className="py-3 px-5 text-right text-emerald-600 font-semibold">{b.offlineOrders}</td>

                                            {/* Online */}
                                            <td className="py-3 px-5 text-right text-purple-600 font-semibold">
                                                {b.onlineOrders > 0 ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Smartphone size={12} /> {b.onlineOrders}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300">0</span>
                                                )}
                                            </td>

                                            {/* Visual Mode Split Bar */}
                                            <td className="py-3 px-5">
                                                <div className="w-24 mx-auto bg-slate-100 rounded-full h-2 overflow-hidden flex border border-slate-200">
                                                    <div className="bg-emerald-500 h-full" style={{ width: `${offlinePct}%` }} title={`Offline: ${offlinePct}%`}></div>
                                                    <div className="bg-purple-500 h-full" style={{ width: `${onlinePct}%` }} title={`Online: ${onlinePct}%`}></div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 text-right font-bold text-blue-600 text-sm">{b.scannedDocs}</td>
                                        </tr>

                                        {/* Expanded Branch Breakdown Detail */}
                                        {isExpanded && (
                                            <tr className="bg-slate-50/80">
                                                <td colSpan={7} className="p-4 border-l-4 border-indigo-500">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                                                            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Branch Info</span>
                                                            <div className="font-bold text-slate-900 text-sm mt-1">
                                                                {b.branchCode} - {b.branchName}
                                                            </div>
                                                        </div>

                                                        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                                                            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Channel Distribution</span>
                                                            <div className="flex items-center gap-3 mt-1.5 font-medium">
                                                                <div className="text-emerald-700">
                                                                    <strong>{b.offlineOrders}</strong> Offline ({offlinePct}%)
                                                                </div>
                                                                <div className="text-purple-700">
                                                                    <strong>{b.onlineOrders}</strong> Online ({onlinePct}%)
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col w-full">
            {/* Header - Full Width */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40 shadow-xs w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                    {/* Title & Navigation */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200" title="Go Back">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daily Branch Performance & Analytics Report</h1>
                            </div>
                        </div>
                    </div>

                    {/* Actions & Controls */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Date range picker */}
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                            <DateTimePicker onChange={setDateRange} initialStartDate={dateRange.startDate} initialEndDate={dateRange.endDate} />
                        </div>

                        {/* Excel Export Button */}
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-colors"
                            title="Export reporting data to Microsoft Excel (.xlsx)"
                        >
                            <FileSpreadsheet size={16} />
                            Export Excel
                        </button>
                    </div>
                </div>

                {/* API Status Notice if error */}
                {apiErrorMessage && (
                    <div className="mt-4 w-full bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-sm text-rose-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <AlertCircle size={18} className="shrink-0 text-rose-600" />
                            <span>
                                <strong>API Communication Warning:</strong> {apiErrorMessage} Target Endpoint:{' '}
                                <code className="font-mono bg-rose-100 px-1.5 py-0.5 rounded text-xs font-semibold text-rose-800">{API_ENDPOINT}</code>
                            </span>
                        </div>
                        <button onClick={() => setApiErrorMessage(null)} className="text-rose-600 hover:text-rose-900 font-bold text-lg px-2">
                            ×
                        </button>
                    </div>
                )}
            </header>

            {/* View Navigation Tabs - Full Width */}
            <div className="bg-white border-b border-slate-200 px-6 py-2.5 w-full">
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <BarChart3 size={16} /> Visual Dashboard
                        </button>

                        <button
                            onClick={() => setActiveTab('table')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                activeTab === 'table' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <Table size={16} /> Branch Data Matrix ({filteredBranches.length})
                        </button>
                    </div>

                    <div className="text-xs font-medium text-slate-500 hidden sm:block">{lastFetchedAt && <span>Last Sync: {lastFetchedAt.toLocaleTimeString()}</span>}</div>
                </div>
            </div>

            {/* Main Content Area - 100% Full Width */}
            <main className="flex-1 w-full p-6 space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-slate-600">Fetching live API responses from backend...</p>
                    </div>
                ) : !orderDetailData && !scannedDocData ? (
                    /* Error state when backend endpoint cannot be reached */
                    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white rounded-xl border border-slate-200 text-center space-y-4 shadow-xs">
                        <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                            <AlertCircle size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Unable to Load Live Report Data</h3>
                        <p className="text-sm text-slate-500 max-w-lg">
                            The system attempted to call <code className="font-mono text-indigo-600 font-medium">{API_ENDPOINT}</code> but could not retrieve data.
                        </p>
                        <button onClick={fetchReportData} className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2 shadow-xs">
                            <RefreshCw size={15} /> Retry Connection
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Summary KPI Cards - Full Width Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Card 1: Total Scanned Documents */}
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scanned Invoices</span>
                                    <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                                        <FileText size={18} />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl font-bold text-slate-900 tracking-tight">{kpiTotals.totalScans.toLocaleString()}</div>
                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                                        <span>
                                            Status: <strong className="text-emerald-600">Success</strong>
                                        </span>
                                        <span>•</span>
                                        <span>{kpiTotals.branchCount} branches</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Total Submitted Orders */}
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted Orders</span>
                                    <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                                        <Layers size={18} />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl font-bold text-slate-900 tracking-tight">{kpiTotals.totalOrders.toLocaleString()}</div>
                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                                        <span>
                                            Status: <strong className="text-emerald-600">Submitted</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Offline Orders Breakdown */}
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offline Orders</span>
                                    <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                                        <Store size={18} />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl font-bold text-slate-900 tracking-tight">{kpiTotals.totalOffline.toLocaleString()}</div>
                                    <div className="text-xs text-slate-500 mt-1 font-medium">
                                        <span className="font-semibold text-emerald-600">{kpiTotals.offlinePct.toFixed(1)}%</span> of total
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: Online Orders Breakdown */}
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Online Orders</span>
                                    <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
                                        <Smartphone size={18} />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl font-bold text-slate-900 tracking-tight">{kpiTotals.totalOnline.toLocaleString()}</div>
                                    <div className="text-xs text-slate-500 mt-1 font-medium">
                                        <span className="font-semibold text-purple-600">{kpiTotals.onlinePct.toFixed(1)}%</span> of total
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* VIEW TAB 1: VISUAL DASHBOARD */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6 w-full">
                                <div className=" w-full">
                                    {/* Main Comparison Chart: All Branch Details */}
                                    <div className=" bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                    <BarChart3 className="text-indigo-600" size={18} />
                                                    All Branch Details: Scans vs Submitted Orders
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-1">Side-by-side metric comparison by branch location</p>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-semibold">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                                                    <span className="text-slate-600">Scanned Invoices</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-3 h-3 rounded bg-indigo-600 inline-block"></span>
                                                    <span className="text-slate-600">Submitted Orders</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Custom Responsive SVG / HTML Bar Chart */}
                                        <div className="space-y-3.5">
                                            {chartBranches.length === 0 ? (
                                                <div className="py-12 text-center text-slate-400 font-medium text-sm">No branch data available to graph.</div>
                                            ) : (
                                                chartBranches.map(branch => {
                                                    const scanPct = Math.round((branch.scannedDocs / maxBarValue) * 100);
                                                    const orderPct = Math.round((branch.submittedOrders / maxBarValue) * 100);

                                                    return (
                                                        <div key={branch.branchCode} className="space-y-1">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <div className="font-semibold text-slate-800 flex items-center gap-2">
                                                                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-700 font-bold border border-slate-200">
                                                                        {branch.branchCode}
                                                                    </span>
                                                                    <span>{branch.branchName}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                                                                    <span className="text-blue-600 font-semibold">{branch.scannedDocs} scans</span>
                                                                    <span>•</span>
                                                                    <span className="text-indigo-600 font-semibold">{branch.submittedOrders} orders</span>
                                                                </div>
                                                            </div>

                                                            {/* Bars */}
                                                            <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                                <div className="h-3.5 bg-slate-200/70 rounded-full overflow-hidden flex items-center">
                                                                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.max(scanPct, 4)}%` }}></div>
                                                                </div>
                                                                <div className="h-3.5 bg-slate-200/70 rounded-full overflow-hidden flex items-center">
                                                                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${Math.max(orderPct, 4)}%` }}></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW TAB 2: DETAILED MATRIX TABLE */}
                        {activeTab === 'table' && (
                            <div className="space-y-4 w-full">
                                {/* Table Controls Bar */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="compare"
                                                checked={isCompareActive}
                                                onChange={e => handleCompareToggle(e.target.checked)}
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                                            />
                                            <label className="text-sm font-semibold text-slate-700 cursor-pointer" htmlFor="compare">
                                                Compare
                                            </label>
                                        </div>

                                        {/* Date range filter for comparison shown after checkbox when active */}
                                        {isCompareActive && (
                                            <div className="flex items-center gap-2 bg-indigo-50/70 border border-indigo-200 px-3 py-1 rounded-lg">
                                                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Compare Period:</span>
                                                <DateTimePicker onChange={setCompareDateRange} initialStartDate={compareDateRange.startDate} initialEndDate={compareDateRange.endDate} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Search Input */}
                                    <div className="relative flex-1 max-w-xs">
                                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by Branch Code or City..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Table Content: Single or Two-Column Side-by-Side Comparison */}
                                {!isCompareActive ? (
                                    renderBranchTable(filteredBranches)
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                                        {renderBranchTable(
                                            compareFilteredBranches,
                                            'Comparison Date Range Table',
                                            'bg-purple-600',
                                            `${compareDateRange.startDate ? compareDateRange.startDate.split('T')[0] : ''} to ${compareDateRange.endDate ? compareDateRange.endDate.split('T')[0] : ''}`
                                        )}
                                        {renderBranchTable(
                                            filteredBranches,
                                            'Primary Date Range Table',
                                            'bg-indigo-600',
                                            `${dateRange.startDate ? dateRange.startDate.split('T')[0] : ''} to ${dateRange.endDate ? dateRange.endDate.split('T')[0] : ''}`
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default DailyReportPage;
