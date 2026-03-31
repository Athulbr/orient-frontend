import React, { useState, useCallback } from 'react';
import OrderCard from './OrderCard';
import { Order, Email } from './types';
import { DialogComponent } from '../../../../../components/DialogComponent';
import { Button } from '../../../../../components/Button';
import CreateOrderDialog from './CreateOrderDialog';
import { config } from '../../../../../config/default';
import { SingleSelect } from '../../../../../components/SingleSelect';
import DateTimePicker from '../../../../../components/DateTimePicker';
import { Search, X } from 'lucide-react';

interface OrientDocsnapUserInterfaceIF {
    test?: string;
}

const OrientDocsnapUserInterface: React.FC<OrientDocsnapUserInterfaceIF> = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [uploadedFilesMap, setUploadedFilesMap] = useState<Record<number, File[]>>({});
    const [proceedingOrderId, setProceedingOrderId] = useState<number | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    // Filter and Pagination States
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [branchFilter, setBranchFilter] = useState('5');
    const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });
    const [perPage, setPerPage] = useState('10');
    const [currentPage, setCurrentPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    React.useEffect(() => {
        const fetchEmails = async () => {
            try {
                const res = await fetch(`${config.workflowService}/api/emails`);
                if (res.ok) {
                    const data = await res.json();
                    setEmails(Array.isArray(data) ? data : (data.data ?? []));
                }
            } catch (err) {
                console.error('Failed to fetch emails', err);
            }
        };
        fetchEmails();
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (branchFilter !== 'all') params.append('branch', branchFilter);
            if (dateRange.startDate && dateRange.endDate) {
                params.append('startDate', dateRange.startDate);
                params.append('endDate', dateRange.endDate);
            }
            params.append('page', currentPage.toString());
            params.append('limit', perPage);

            const res = await fetch(`${config.workflowService}/api/orders?${params.toString()}`);
            if (res.ok) {
                const responseData = await res.json();
                if (Array.isArray(responseData)) {
                    setOrders(responseData);
                } else if (responseData.data) {
                    setOrders(responseData.data);
                    setTotalPages(responseData.pagination.totalPages);
                    setTotalCount(responseData.pagination.totalCount);
                }
            }
        } catch (err) {
            console.error('Failed to fetch orders', err);
        }
    }, [debouncedSearchQuery, statusFilter, branchFilter, dateRange, currentPage, perPage]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteOrder = useCallback(async (orderId: number) => {
        try {
            await fetch(`${config.workflowService}/api/orders/${orderId}`, { method: 'DELETE' });
            setOrders(prev => prev.filter(o => o.order_details.order_id !== orderId));
        } catch (err) {
            console.error('Failed to delete order', err);
        }
    }, []);

    const getLinkedEmails = useCallback(
        (order: Order): Email[] => {
            if (!order.linkedEmailIds || order.linkedEmailIds.length === 0) return [];
            return emails.filter(e => order.linkedEmailIds!.includes(e.emailId));
        },
        [emails]
    );

    const handleResetFilters = useCallback(() => {
        setSearchQuery('');
        setDebouncedSearchQuery('');
        setStatusFilter('all');
        setBranchFilter('5');
        setDateRange({ startDate: '', endDate: '' });
        setPerPage('10');
        setCurrentPage(1);
    }, []);

    const handleLinkEmail = useCallback(
        async (orderId: number, emailId: string) => {
            setOrders(prev => prev.map(o => (o.order_details.order_id === orderId ? { ...o, linkedEmailIds: [...(o.linkedEmailIds || []), emailId] } : o)));

            try {
                const order = orders.find(o => o.order_details.order_id === orderId);
                if (order) {
                    const linkedEmailIds = [...(order.linkedEmailIds || []), emailId];
                    await fetch(`${config.workflowService}/api/orders/${orderId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ linkedEmailIds })
                    });

                    await fetch(`${config.workflowService}/api/emails/${emailId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: String(orderId) })
                    });
                }
            } catch (err) {
                console.error('Failed to link email', err);
            }
        },
        [orders]
    );

    const handleUnlinkEmail = useCallback(
        async (orderId: number, emailId: string) => {
            setOrders(prev => prev.map(o => (o.order_details.order_id === orderId ? { ...o, linkedEmailIds: (o.linkedEmailIds || []).filter(id => id !== emailId) } : o)));

            try {
                const order = orders.find(o => o.order_details.order_id === orderId);
                if (order) {
                    const linkedEmailIds = (order.linkedEmailIds || []).filter(id => id !== emailId);
                    await fetch(`${config.workflowService}/api/orders/${orderId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ linkedEmailIds })
                    });

                    await fetch(`${config.workflowService}/api/emails/${emailId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: '' })
                    });
                }
            } catch (err) {
                console.error('Failed to unlink email', err);
            }
        },
        [orders]
    );

    const handleUploadFiles = useCallback((orderId: number, files: File[]) => {
        setUploadedFilesMap(prev => ({
            ...prev,
            [orderId]: [...(prev[orderId] || []), ...files]
        }));
    }, []);

    const handleRemoveUploadedFile = useCallback((orderId: number, fileIndex: number) => {
        setUploadedFilesMap(prev => ({
            ...prev,
            [orderId]: (prev[orderId] || []).filter((_, i) => i !== fileIndex)
        }));
    }, []);

    const handleProceed = useCallback(
        async (orderId: number) => {
            const order = orders.find(o => o.order_details.order_id === orderId);
            if (!order) return;

            setProceedingOrderId(orderId);

            const formData = new FormData();
            formData.append('orderId', orderId.toString());
            // formData.append('templateId', '68a8b19919dd45d21642d18d'); // PO_Private
            formData.append('templateId', '69ca3b19a8a70950eaccf141'); // Orient_v1

            // Add uploaded files
            const uploaded = uploadedFilesMap[orderId] || [];
            if (uploaded.length === 0) {
                alert('Please upload files');
                setProceedingOrderId(null);

                return;
            }
            uploaded.forEach(file => {
                formData.append('file', file);
            });

            try {
                const response = await fetch(`${config.workflowService}/api/webhooks/trigger/orient-v1`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    console.error('Extraction API response error:', response.status);
                    setProceedingOrderId(null);
                    return;
                }

                const responseData = await response.json();
                const executionId = responseData?.data?.executionId;

                if (!executionId) {
                    console.error('No executionId found in response');
                    setProceedingOrderId(null);
                    return;
                }

                // Listen to SSE Stream for Completion
                const streamUrl = `${config.workflowService}/api/executions/${executionId}/status-stream?apiKey=secret1`;
                const eventSource = new EventSource(streamUrl);

                eventSource.onmessage = event => {
                    try {
                        const jsonString = event.data;
                        if (!jsonString || jsonString.trim() === '' || jsonString === '{}') return;

                        const parsed = JSON.parse(jsonString);
                        if (parsed.status) {
                            if (['completed', 'failed', 'error', 'cancelled', 'timeout'].includes(parsed.status)) {
                                eventSource.close();
                                setProceedingOrderId(null);
                                if (parsed.status === 'completed') {
                                    const finalData = parsed.finalData[0];
                                    if (finalData.extractedData) {
                                        const currentOrder = orders.find(o => o.order_details.order_id === orderId);
                                        const updateDetails = { order_details: { ...(currentOrder?.order_details || {}), order_status: 'extracted' }, extractionDetails: { extractedData: finalData.extractedData, recordId: finalData.recordId } };

                                        fetch(`${config.workflowService}/api/orders/${orderId}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(updateDetails)
                                        }).catch(err => console.error('Failed to save extraction details', err));

                                        setOrders(prev => prev.map(o => (o.order_details.order_id === orderId ? { ...o, order_details: { ...o.order_details, order_status: 'extracted' }, extractionDetails: updateDetails.extractionDetails } : o)));
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        // Ignore invalid JSON or unexpected formatting
                    }
                };

                eventSource.onerror = err => {
                    console.error('SSE EventSource error:', err);
                    eventSource.close();
                    setProceedingOrderId(null);
                };
            } catch (err) {
                console.error('Extraction API error:', err);
                setProceedingOrderId(null);
            }
        },
        [orders, getLinkedEmails, uploadedFilesMap]
    );

    return (
        <div className="min-h-full w-full bg-gray-50 flex flex-col">
            <div className="px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Orient Exchange Orders</h1>
                        <p className="text-xs text-gray-500 mt-1">Review documents from all sources and proceed with extraction.</p>
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                        <div className="relative w-64">
                            <input
                                type="text"
                                className="w-full h-10 pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-0.5 focus:ring-blue-400 focus:border-blue-400"
                                placeholder="Name, Email, or Order ID"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        </div>
                        <SingleSelect
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                            options={[
                                { label: 'All Status', value: 'all' },
                                { label: 'Pending', value: 'pending' },
                                { label: 'Extracted', value: 'extracted' },
                                { label: 'Marekat Submitted', value: 'submitted' },
                                { label: 'Extraction Failed', value: 'failed' }
                            ]}
                        />
                        <div className="flex flex-col gap-1">
                            <DateTimePicker onChange={setDateRange} initialStartDate={dateRange.startDate} initialEndDate={dateRange.endDate} />
                        </div>
                        <SingleSelect
                            value={perPage}
                            onValueChange={setPerPage}
                            options={[
                                { label: '10', value: '10' },
                                { label: '20', value: '20' },
                                { label: '50', value: '50' },
                                { label: '100', value: '100' }
                            ]}
                        />
                        <Button startIcon={<X size={16} />} onClick={handleResetFilters} outlined></Button>
                        <Button onClick={() => setShowCreateDialog(true)}>Create Order</Button>
                    </div>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-5 flex-grow">
                {orders.map(order => (
                    <OrderCard
                        key={order.order_details.order_id}
                        order={order}
                        linkedEmails={getLinkedEmails(order)}
                        uploadedFiles={uploadedFilesMap[order.order_details.order_id] || []}
                        onLinkEmail={handleLinkEmail}
                        onUnlinkEmail={handleUnlinkEmail}
                        onUploadFiles={handleUploadFiles}
                        onRemoveUploadedFile={handleRemoveUploadedFile}
                        onProceed={handleProceed}
                        onEdit={order => setEditingOrder(order)}
                        onDelete={handleDeleteOrder}
                        isProceeding={proceedingOrderId === order.order_details.order_id}
                    />
                ))}
                {orders.length === 0 && (
                    <div className="flex items-center justify-center p-12 text-gray-500 bg-white border border-gray-200 rounded-lg">No orders match the current filter criteria.</div>
                )}
            </div>

            <div className="p-4 flex items-center justify-between border-t border-gray-200 bg-white sticky bottom-0 z-10">
                <span className="text-sm text-gray-500">
                    Showing {totalCount === 0 ? 0 : (currentPage - 1) * Number(perPage) + 1} to {Math.min(currentPage * Number(perPage), totalCount)} of {totalCount} orders
                </span>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button small outlined disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                            Previous
                        </Button>
                        <Button small outlined disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            <DialogComponent
                className="w-[800px]"
                isOpen={showCreateDialog || !!editingOrder}
                closeDialog={() => {
                    setShowCreateDialog(false);
                    setEditingOrder(null);
                }}
                name={editingOrder ? 'Edit Order' : 'Create New Order'}
            >
                {(showCreateDialog || editingOrder) && (
                    <CreateOrderDialog
                        initialOrder={editingOrder || undefined}
                        onClose={() => {
                            setShowCreateDialog(false);
                            setEditingOrder(null);
                        }}
                        onCreate={async newOrder => {
                            try {
                                const response = await fetch(`${config.workflowService}/api/orders`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(newOrder)
                                });
                                if (response.ok) {
                                    const createdOrder = await response.json();
                                    setOrders([createdOrder, ...orders]);
                                    setShowCreateDialog(false);
                                }
                            } catch (err) {
                                console.error('Failed to create order', err);
                            }
                        }}
                        onUpdate={async updatedOrder => {
                            try {
                                const response = await fetch(`${config.workflowService}/api/orders/${updatedOrder.order_details.order_id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(updatedOrder)
                                });
                                if (response.ok) {
                                    setOrders(orders.map(o => (o.order_details.order_id === updatedOrder.order_details.order_id ? updatedOrder : o)));
                                    setEditingOrder(null);
                                }
                            } catch (err) {
                                console.error('Failed to update order', err);
                            }
                        }}
                    />
                )}
            </DialogComponent>
        </div>
    );
};

export default OrientDocsnapUserInterface;
