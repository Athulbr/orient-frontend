import React, { useState, useCallback } from 'react';
import OrderCard from './OrderCard';
import { Order, Email } from './types';
import { sampleOrders, sampleEmails, availableEmails as availableEmailsData, templateRequirements } from './data';

interface OrientDocsnapUserInterfaceIF {
    test?: string;
}

const OrientDocsnapUserInterface: React.FC<OrientDocsnapUserInterfaceIF> = () => {
    const [orders, setOrders] = useState<Order[]>(sampleOrders);
    const [emails] = useState<Email[]>([...sampleEmails, ...availableEmailsData]);
    const [uploadedFilesMap, setUploadedFilesMap] = useState<Record<string, File[]>>({});
    const [proceedingOrderId, setProceedingOrderId] = useState<string | null>(null);

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

    const handleLinkEmail = useCallback((orderId: string, emailId: string) => {
        setOrders(prev => prev.map(o => (o.order_id === orderId ? { ...o, linkedEmailIds: [...(o.linkedEmailIds || []), emailId] } : o)));
    }, []);

    const handleUnlinkEmail = useCallback((orderId: string, emailId: string) => {
        setOrders(prev => prev.map(o => (o.order_id === orderId ? { ...o, linkedEmailIds: (o.linkedEmailIds || []).filter(id => id !== emailId) } : o)));
    }, []);

    const handleUploadFiles = useCallback((orderId: string, files: File[]) => {
        setUploadedFilesMap(prev => ({
            ...prev,
            [orderId]: [...(prev[orderId] || []), ...files]
        }));
    }, []);

    const handleRemoveUploadedFile = useCallback((orderId: string, fileIndex: number) => {
        setUploadedFilesMap(prev => ({
            ...prev,
            [orderId]: (prev[orderId] || []).filter((_, i) => i !== fileIndex)
        }));
    }, []);

    const handleProceed = useCallback(
        async (orderId: string) => {
            const order = orders.find(o => o.order_id === orderId);
            if (!order) return;

            setProceedingOrderId(orderId);

            const formData = new FormData();
            formData.append('orderId', orderId);

            // Add order document URLs
            order.documents.forEach((url, i) => {
                formData.append(`orderDocuments[${i}]`, url);
            });

            // Add email attachment URLs
            const linkedEmails = getLinkedEmails(order);
            let attachmentIndex = 0;
            linkedEmails.forEach(email => {
                email.attachments.forEach(att => {
                    formData.append(`emailAttachments[${attachmentIndex}]`, att.url);
                    attachmentIndex++;
                });
            });

            // Add uploaded files
            const uploaded = uploadedFilesMap[orderId] || [];
            uploaded.forEach(file => {
                formData.append('uploadedFiles', file);
            });

            try {
                const response = await fetch('/api/extract', {
                    method: 'POST',
                    body: formData
                });
                console.log('Extraction API response:', response.status);
            } catch (err) {
                console.error('Extraction API error:', err);
            } finally {
                setProceedingOrderId(null);
            }
        },
        [orders, getLinkedEmails, uploadedFilesMap]
    );

    const currentAvailableEmails = getAvailableEmails();

    return (
        <div className="min-h-full w-full bg-gray-50">
            <div className="px-6 py-5 bg-white border-b border-gray-200 sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900">Orient Exchange Orders</h1>
                <p className="text-sm text-gray-500 mt-1">Review documents from all sources and proceed with extraction.</p>
            </div>

            <div className="px-6 py-6 flex flex-col gap-5">
                {orders.map(order => (
                    <OrderCard
                        key={order.order_id}
                        order={order}
                        linkedEmails={getLinkedEmails(order)}
                        uploadedFiles={uploadedFilesMap[order.order_id] || []}
                        availableEmails={currentAvailableEmails}
                        templateRequirements={templateRequirements}
                        onLinkEmail={handleLinkEmail}
                        onUnlinkEmail={handleUnlinkEmail}
                        onUploadFiles={handleUploadFiles}
                        onRemoveUploadedFile={handleRemoveUploadedFile}
                        onProceed={handleProceed}
                        isProceeding={proceedingOrderId === order.order_id}
                    />
                ))}
            </div>
        </div>
    );
};

export default OrientDocsnapUserInterface;
