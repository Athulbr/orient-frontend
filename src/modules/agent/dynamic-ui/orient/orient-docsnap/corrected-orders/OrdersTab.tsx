import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, FileText, Calendar, Hash } from 'lucide-react';
import { fetchCorrectedOrders } from './api';
import { Button } from '../../../../../../components/Button';

interface Order {
    _id: string;
    orderNumber: number;
    orderType: string;
    eonNumber: string;
    submittedAt: string;
    correctedFields: Array<{
        path: string;
        value: string;
        initialValue: string;
    }>;
}

const formatLabel = (path: string) => {
    return path
        .split('.')
        .map(part => {
            const spaced = part.replace(/_/g, ' ');
            return spaced.charAt(0).toUpperCase() + spaced.slice(1);
        })
        .join(' > ');
};

const OrdersTab: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const loadOrders = async (p: number) => {
        try {
            setLoading(true);
            const res = await fetchCorrectedOrders(p, 20);
            if (res.success) {
                setOrders(res.data);
                setTotalPages(res.pagination.totalPages);
                setTotalCount(res.pagination.total || 0);
                setPage(res.pagination.page);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders(1);
    }, []);

    const toggleOrder = (orderId: string) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (loading && orders.length === 0) {
        return <div className="p-8 text-center text-gray-500">Loading orders...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-semibold">Order Number</th>
                            <th className="p-4 font-semibold">Order Type</th>
                            <th className="p-4 font-semibold">EON Number</th>
                            <th className="p-4 font-semibold">Submitted At</th>
                            <th className="p-4 font-semibold">Corrections</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map(order => (
                            <React.Fragment key={order._id}>
                                <tr className={`hover:bg-blue-50 cursor-pointer transition-colors ${expandedOrder === order._id ? 'bg-blue-50' : ''}`} onClick={() => toggleOrder(order._id)}>
                                    <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                                        {expandedOrder === order._id ? <ChevronDown size={16} className="text-blue-500" /> : <ChevronRight size={16} className="text-gray-400" />}
                                        <Hash size={14} className="text-gray-400" />
                                        {order.orderNumber}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium uppercase tracking-wider">{order.orderType}</span>
                                    </td>
                                    <td className="p-4 text-gray-600">{order.eonNumber || 'N/A'}</td>
                                    <td className="p-4 text-gray-600 flex items-center gap-1">
                                        <Calendar size={14} className="text-gray-400" />
                                        {new Date(order.submittedAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">{order.correctedFields?.length || 0} fields</span>
                                    </td>
                                </tr>

                                {/* Expanded Row */}
                                {expandedOrder === order._id && (
                                    <tr className="bg-slate-50/50 border-t border-blue-100 shadow-inner">
                                        <td colSpan={5} className="p-4">
                                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                                                    <FileText size={16} className="text-gray-500" />
                                                    <h3 className="font-semibold text-gray-700 text-sm">Corrected Fields Details</h3>
                                                </div>
                                                <div className="p-4">
                                                    {order.correctedFields && order.correctedFields.length > 0 ? (
                                                        <div className="flex flex-wrap gap-4">
                                                            {order.correctedFields.map((field, idx) => (
                                                                <div key={idx} className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                                                    <div className="text-xs gap-4 font-bold text-gray-600 mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
                                                                        <span className="break-all">{formatLabel(field.path)}</span>
                                                                        <button
                                                                            className="text-[10px] bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-blue-600 px-2 py-1 rounded shadow-sm transition-colors whitespace-nowrap cursor-pointer"
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                sessionStorage.setItem('order_no', order.orderNumber.toString());
                                                                                navigate('/agent/run/Document%20Extractor');
                                                                            }}
                                                                        >
                                                                            Visit Order
                                                                        </button>
                                                                    </div>
                                                                    <div className="flex flex-col gap-2 mt-2">
                                                                        <div className="bg-red-50 p-2 rounded border border-red-100">
                                                                            <span className="text-[10px] text-red-400 uppercase font-bold block mb-1">Extracted Value</span>
                                                                            <span className="text-base text-red-700 font-medium">{field.initialValue || 'empty'}</span>
                                                                        </div>
                                                                        <div className="bg-green-50 p-2 rounded border border-green-100">
                                                                            <span className="text-[10px] text-green-500 uppercase font-bold block mb-1">Corrected Value</span>
                                                                            <span className="text-base text-green-700 font-semibold">{field.value || 'empty'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500 italic">No fields were corrected in this order.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 mt-auto">
                <span className="text-sm text-gray-600 flex items-center gap-4">
                    <span>Total Orders: <b className="text-gray-900">{totalCount}</b></span>
                    <span>Page <b>{page}</b> of <b>{totalPages}</b></span>
                </span>
                <div className="flex gap-2">
                    <Button disabled={page === 1} onClick={() => loadOrders(page - 1)} outlined>
                        Previous
                    </Button>
                    <Button disabled={page === totalPages} onClick={() => loadOrders(page + 1)} outlined>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrdersTab;
