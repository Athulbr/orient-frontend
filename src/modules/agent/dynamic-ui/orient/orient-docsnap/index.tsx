import React, { useState, useCallback } from 'react';
import OrderCard from './OrderCard';
import { Order, Email } from './types';
import { sampleOrders, sampleEmails, availableEmails as availableEmailsData, templateRequirements } from './data';
import { DialogComponent } from '../../../../../components/DialogComponent';
import { Button } from '../../../../../components/Button';
import CreateOrderDialog from './CreateOrderDialog';

interface OrientDocsnapUserInterfaceIF {
    test?: string;
}

const OrientDocsnapUserInterface: React.FC<OrientDocsnapUserInterfaceIF> = () => {
    const [orders, setOrders] = useState<Order[]>(sampleOrders);
    const [emails] = useState<Email[]>([...sampleEmails, ...availableEmailsData]);
    const [uploadedFilesMap, setUploadedFilesMap] = useState<Record<number, File[]>>({});
    const [proceedingOrderId, setProceedingOrderId] = useState<number | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    // console.log('orders:===========', orders);

    const handleDeleteOrder = useCallback((orderId: number) => {
        setOrders(prev => prev.filter(o => o.order_details.order_id !== orderId));
    }, []);

    const getLinkedEmails = useCallback(
        (order: Order): Email[] => {
            if (!order.linkedEmailIds || order.linkedEmailIds.length === 0) return [];
            return emails.filter(e => order.linkedEmailIds!.includes(e.id));
        },
        [emails]
    );

    const getAvailableEmails = useCallback((): Email[] => {
        const linkedIds = new Set(orders.flatMap(o => o.linkedEmailIds || []));
        return emails.filter(e => !linkedIds.has(e.id) && !e.orderId);
    }, [orders, emails]);

    const handleLinkEmail = useCallback((orderId: number, emailId: string) => {
        setOrders(prev => prev.map(o => (o.order_details.order_id === orderId ? { ...o, linkedEmailIds: [...(o.linkedEmailIds || []), emailId] } : o)));
    }, []);

    const handleUnlinkEmail = useCallback((orderId: number, emailId: string) => {
        setOrders(prev => prev.map(o => (o.order_details.order_id === orderId ? { ...o, linkedEmailIds: (o.linkedEmailIds || []).filter(id => id !== emailId) } : o)));
    }, []);

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
            formData.append('templateId', '68a8b19919dd45d21642d18d'); // PO_Private
            // formData.append('templateId', '69a1109890de8c4def6793e9'); // Orient_v1

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
                const address = '54.243.28.4';
                // const address = 'localhost';
                const response = await fetch(`http://${address}:6007/api/webhooks/trigger/orient-v1`, {
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
                const streamUrl = `http://${address}:6007/api/executions/${executionId}/status-stream?apiKey=secret1`;
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
                                        setOrders(prev =>
                                            prev.map(o =>
                                                o.order_details.order_id === orderId ? { ...o, extractionDetails: { extractedData: finalData.extractedData, recordId: finalData.recordId } } : o
                                            )
                                        );
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

    const currentAvailableEmails = getAvailableEmails();

    return (
        <div className="min-h-full w-full bg-gray-50">
            <div className="px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orient Exchange Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">Review documents from all sources and proceed with extraction.</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>Create Order</Button>
            </div>

            <div className="px-6 py-6 flex flex-col gap-5">
                {orders.map(order => (
                    <OrderCard
                        key={order.order_details.order_id}
                        order={order}
                        linkedEmails={getLinkedEmails(order)}
                        uploadedFiles={uploadedFilesMap[order.order_details.order_id] || []}
                        availableEmails={currentAvailableEmails}
                        templateRequirements={templateRequirements}
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
                        onCreate={newOrder => {
                            setOrders([newOrder, ...orders]);
                            setShowCreateDialog(false);
                        }}
                        onUpdate={updatedOrder => {
                            setOrders(orders.map(o => (o.order_details.order_id === updatedOrder.order_details.order_id ? updatedOrder : o)));
                            setEditingOrder(null);
                        }}
                    />
                )}
            </DialogComponent>
        </div>
    );
};

export default OrientDocsnapUserInterface;
