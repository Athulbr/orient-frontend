import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck2, Database, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import OrdersTab from './OrdersTab';
import FieldsTab from './FieldsTab';
import { fetchExportData } from './api';
import { Button } from '../../../../../../components/Button';
import DateTimePicker from '../../../../../../components/DateTimePicker';

const toLocalISOStringWithOffset = (date: Date): string => {
    const pad = (num: number): string => String(num).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    const tzOffset = -date.getTimezoneOffset();
    const sign = tzOffset >= 0 ? '+' : '-';
    const tzHours = pad(Math.floor(Math.abs(tzOffset) / 60));
    const tzMinutes = pad(Math.abs(tzOffset) % 60);
    const offsetString = `${sign}${tzHours}:${tzMinutes}`;

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetString}`;
};

const formatLabel = (path: string) => {
    return path
        .split('.')
        .map(part => {
            const spaced = part.replace(/_/g, ' ');
            return spaced.charAt(0).toUpperCase() + spaced.slice(1);
        })
        .join(' > ');
};

const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return {
        startDate: toLocalISOStringWithOffset(start),
        endDate: toLocalISOStringWithOffset(end)
    };
};

const CorrectedOrdersPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'orders' | 'fields'>('orders');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [exporting, setExporting] = useState(false);
    const navigate = useNavigate();

    const handleExport = async () => {
        try {
            setExporting(true);
            const res = await fetchExportData(activeTab, dateRange.startDate, dateRange.endDate);
            if (res.success) {
                const wb = XLSX.utils.book_new();
                if (activeTab === 'orders') {
                    const orders = res.data;
                    const rows: any[] = [];
                    let currentRow = 1; // 1 because json_to_sheet adds header at row 0
                    const merges: any[] = [];

                    orders.forEach((order: any) => {
                        const baseOrder = {
                            'Order Number': `${order.orderNumber}`,
                            'Order Type': order.orderType,
                            'EON Number': order.eonNumber || 'N/A',
                            'Submitted At': order.submittedAt ? new Date(order.submittedAt).toLocaleString() : ''
                        };
                        const numCorrections = order.correctedFields?.length || 1;
                        const startRow = currentRow;

                        if (order.correctedFields && order.correctedFields.length > 0) {
                            order.correctedFields.forEach((field: any) => {
                                rows.push({
                                    ...baseOrder,
                                    'Corrected Field Path': formatLabel(field.path),
                                    'Initial Value': field.initialValue || '',
                                    'Corrected Value': field.value || ''
                                });
                            });
                        } else {
                            rows.push({
                                ...baseOrder,
                                'Corrected Field Path': '',
                                'Initial Value': '',
                                'Corrected Value': ''
                            });
                        }

                        if (numCorrections > 1) {
                            const endRow = startRow + numCorrections - 1;
                            merges.push({ s: { r: startRow, c: 0 }, e: { r: endRow, c: 0 } });
                            merges.push({ s: { r: startRow, c: 1 }, e: { r: endRow, c: 1 } });
                            merges.push({ s: { r: startRow, c: 2 }, e: { r: endRow, c: 2 } });
                            merges.push({ s: { r: startRow, c: 3 }, e: { r: endRow, c: 3 } });
                        }
                        currentRow += numCorrections;
                    });
                    const ws = XLSX.utils.json_to_sheet(rows);
                    if (merges.length > 0) {
                        if (!ws['!merges']) ws['!merges'] = [];
                        ws['!merges'].push(...merges);
                    }
                    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
                } else {
                    const fields = res.data;
                    const rows: any[] = [];
                    fields.forEach((field: any) => {
                        rows.push({ A: 'Field Path:', B: formatLabel(field.path) });
                        rows.push({
                            A: 'Order Number',
                            B: 'Order Type',
                            C: 'EON Number',
                            D: 'Initial Value',
                            E: 'Corrected Value',
                            F: 'Submitted At'
                        });
                        if (field.corrections && field.corrections.length > 0) {
                            field.corrections.forEach((c: any) => {
                                rows.push({
                                    A: `${c.correctedOrderId?.orderNumber}` || 'N/A',
                                    B: c.correctedOrderId?.orderType || 'N/A',
                                    C: c.correctedOrderId?.eonNumber || 'N/A',
                                    D: c.initialValue || '',
                                    E: c.value || '',
                                    F: c.submittedAt ? new Date(c.submittedAt).toLocaleString() : ''
                                });
                            });
                        }
                        rows.push({}); // Empty row to separate
                    });
                    const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: true });
                    // Merging cells for Field Path header to look better
                    if (!ws['!merges']) ws['!merges'] = [];
                    let r = 0;
                    fields.forEach((field: any) => {
                        ws['!merges']?.push({ s: { r: r, c: 1 }, e: { r: r, c: 5 } });
                        r += (field.corrections?.length || 0) + 3; // +3 for field path row, header row, and empty row
                    });
                    XLSX.utils.book_append_sheet(wb, ws, 'Fields');
                }
                XLSX.writeFile(wb, `Corrected_${activeTab === 'orders' ? 'Orders' : 'Fields'}_${new Date().getTime()}.xlsx`);
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        } finally {
            setExporting(false);
        }
    };

    const setQuickDate = (period: 'today' | 'yesterday' | 'thisMonth' | 'lastMonth') => {
        const start = new Date();
        const end = new Date();

        switch (period) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'yesterday':
                start.setDate(start.getDate() - 1);
                start.setHours(0, 0, 0, 0);
                end.setDate(end.getDate() - 1);
                end.setHours(23, 59, 59, 999);
                break;
            case 'thisMonth':
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'lastMonth':
                start.setMonth(start.getMonth() - 1);
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                end.setDate(0);
                end.setHours(23, 59, 59, 999);
                break;
        }

        setDateRange({
            startDate: toLocalISOStringWithOffset(start),
            endDate: toLocalISOStringWithOffset(end)
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-50 overflow-hidden">
            {/* Header Section */}
            <div className="px-6 py-2 bg-white border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/agent/scanned-documents')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FileCheck2 className="text-blue-600" />
                            Corrected Orders
                        </h1>
                    </div>
                </div>
                <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg self-start">
                    {/* date-time range filter */}
                    <div className="flex items-center justify-end gap-2 pr-4 border-r border-gray-300 mr-2">
                        <div className="flex items-center gap-0.5 py-1.5 bg-gray-100 p-1 rounded-md border border-gray-200">
                            {/* <button
                                onClick={() => setQuickDate('today')}
                                className="px-2 py-1 text-[12px] font-medium text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm rounded transition-all"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setQuickDate('yesterday')}
                                className="px-2 py-1 text-[12px] font-medium text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm rounded transition-all"
                            >
                                Yesterday
                            </button> */}
                            <button
                                onClick={() => setQuickDate('thisMonth')}
                                className="px-2 py-1 text-[12px] font-medium text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm rounded transition-all"
                            >
                                This Month
                            </button>
                            <button
                                onClick={() => setQuickDate('lastMonth')}
                                className="px-2 py-1 text-[12px] font-medium text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm rounded transition-all"
                            >
                                Last Month
                            </button>
                            <button
                                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                                className="px-2 py-1 text-[12px] font-medium text-red-500 hover:text-red-700 hover:bg-white hover:shadow-sm rounded transition-all"
                            >
                                Clear
                            </button>
                        </div>
                        <DateTimePicker onChange={setDateRange} initialStartDate={dateRange.startDate} initialEndDate={dateRange.endDate} />
                    </div>

                    {/* tab switcher */}
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-all ${
                            activeTab === 'orders' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'
                        }`}
                    >
                        <FileCheck2 size={16} />
                        Corrected Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('fields')}
                        className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-all ${
                            activeTab === 'fields' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'
                        }`}
                    >
                        <Database size={16} />
                        Corrected Fields
                    </button>
                    {/* Export data */}
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md transition-all ml-4 disabled:opacity-50 shadow-sm"
                    >
                        <Download size={16} />
                        {exporting ? 'Exporting...' : 'Export'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                {/* Tab Switcher */}

                {/* Tab Content */}
                <div className="flex-1 bg-white rounded-sm border border-gray-200 flex flex-col overflow-hidden">
                    {activeTab === 'orders' ? <OrdersTab dateRange={dateRange} /> : <FieldsTab dateRange={dateRange} />}
                </div>
            </div>
        </div>
    );
};

export default CorrectedOrdersPage;
