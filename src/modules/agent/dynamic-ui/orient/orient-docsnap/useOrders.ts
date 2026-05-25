import { useState, useCallback, useRef, useEffect } from 'react';
import { Order, Email, DocumentDetail } from './types';
import { config } from '../../../../../config/default';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import { rearrangeDocuments } from './upload-receipt/functions';

// ─── Types ────────────────────────────────────────────────────

export interface AgentSettings {
    webhookUrl?: string;
    defaultTemplateId?: string;
    templates?: { name: string; description: string }[];
    [key: string]: unknown;
}

export interface OrderFilters {
    searchQuery: string;
    debouncedSearchQuery: string;
    statusFilter: string;
    branchFilter: string;
    orderTypeFilter: string;
    dateRange: { startDate: string; endDate: string };
    perPage: string;
    currentPage: number;
}

export interface UseOrdersReturn {
    // Data
    orders: Order[];
    emails: Email[];
    totalPages: number;
    totalCount: number;

    // Loading states
    isLoadingOrders: boolean;
    ordersError: string | null;
    uploadingOrders: Record<number, boolean>;
    proceedingOrders: Record<number, boolean>;
    linkingEmails: Record<string, boolean>;

    // Actions
    fetchData: () => Promise<void>;
    handleDeleteOrder: (orderNumber: number) => Promise<void>;
    handleLinkEmail: (orderNumber: number, emailId: string) => Promise<void>;
    handleUnlinkEmail: (orderNumber: number, emailId: string) => Promise<void>;
    handleUploadFiles: (orderNumber: number, files: File[]) => Promise<void>;
    handleRemoveUploadedFile: (orderNumber: number, fileIndex: number) => Promise<void>;
    handleRemoveWebDocument: (orderNumber: number, fileIndex: number) => Promise<void>;
    handleRemoveEmailDocument: (orderNumber: number, fileIndex: number) => Promise<void>;
    handleProceed: (orderNumber: number) => Promise<void>;
    handleCreateOrder: (newOrder: Partial<Order>) => Promise<void>;
    handleUpdateOrder: (updatedOrder: Order) => Promise<void>;
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    setTotalPages: React.Dispatch<React.SetStateAction<number>>;
    setTotalCount: React.Dispatch<React.SetStateAction<number>>;
}

// Hardcoded API key is moved to a single constant so it's easy to
// replace with an env variable / config value later. (#8)
const API_KEY = import.meta.env.VITE_WORKFLOW_API_KEY || 'secret1';

// ─── Hook ─────────────────────────────────────────────────────

export function useOrders(filters: OrderFilters, agentSettings: AgentSettings | undefined): UseOrdersReturn {
    const [orders, setOrders] = useState<Order[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [uploadingOrders, setUploadingOrders] = useState<Record<number, boolean>>({});
    const [proceedingOrders, setProceedingOrders] = useState<Record<number, boolean>>({});
    const [linkingEmails, setLinkingEmails] = useState<Record<string, boolean>>({});
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [ordersError, setOrdersError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const toast = useToastStore();

    // ── Refs for SSE callbacks (avoid stale closures — #1, #16) ──
    const ordersRef = useRef(orders);
    useEffect(() => {
        ordersRef.current = orders;
    }, [orders]);

    const emailsRef = useRef(emails);
    useEffect(() => {
        emailsRef.current = emails;
    }, [emails]);

    // ── Fetch emails once ──
    useEffect(() => {
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

    // ── Fetch orders (paginated + filtered) ──
    const fetchData = useCallback(async () => {
        setIsLoadingOrders(true);
        setOrdersError(null);
        try {
            const params = new URLSearchParams();
            if (filters.debouncedSearchQuery) params.append('search', filters.debouncedSearchQuery);
            if (filters.statusFilter !== 'all') params.append('status', filters.statusFilter);
            if (filters.branchFilter !== 'all') params.append('branch', filters.branchFilter);
            if (filters.orderTypeFilter && filters.orderTypeFilter !== 'all') params.append('orderType', filters.orderTypeFilter);
            if (filters.dateRange.startDate && filters.dateRange.endDate) {
                params.append('startDate', filters.dateRange.startDate);
                params.append('endDate', filters.dateRange.endDate);
            }
            params.append('page', filters.currentPage.toString());
            params.append('limit', filters.perPage);

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
            } else {
                setOrdersError(`Failed to fetch orders. Status: ${res.status}`);
            }
        } catch (err: any) {
            console.error('Failed to fetch orders', err);
            setOrdersError(err.message || 'Failed to fetch orders');
        } finally {
            setIsLoadingOrders(false);
        }
    }, [filters.debouncedSearchQuery, filters.statusFilter, filters.branchFilter, filters.orderTypeFilter, filters.dateRange, filters.currentPage, filters.perPage]);

    // ── Link email — copy attachments into emailDocuments, set linked:true ──
    const handleLinkEmail = useCallback(
        async (orderNumber: number, emailId: string) => {
            const linkKey = `${orderNumber}-${emailId}`;
            setLinkingEmails(prev => ({ ...prev, [linkKey]: true }));

            try {
                // Fetch email details to get attachments
                let email = emailsRef.current.find(e => e.emailId === emailId);
                if (!email) {
                    const emailDetailRes = await fetch(`${config.workflowService}/api/emails/${emailId}`);
                    if (!emailDetailRes.ok) throw new Error('Failed to fetch email');
                    email = await emailDetailRes.json();
                    setEmails(prev => [...prev, email!]);
                }

                // Convert email attachments to DocumentDetail format
                const newDocs: DocumentDetail[] = (email!.attachments || [])
                    .map((att: any) => ({
                        documentName: att.documentName || att.name || '',
                        documentPages: att.documentPages || att.pages || (att.url ? [att.url] : [])
                    }))
                    .filter((d: DocumentDetail) => d.documentPages.length > 0);

                const order = ordersRef.current.find(o => o.orderDetails.orderNumber === orderNumber);
                const updatedEmailDocuments = [...(order?.emailDocuments || []), ...newDocs];

                // Optimistic update
                setOrders(prev => prev.map(o => (o.orderDetails.orderNumber === orderNumber ? { ...o, emailDocuments: updatedEmailDocuments } : o)));

                // Persist: update order emailDocuments + email linked flag
                const [orderRes, emailRes] = await Promise.all([
                    fetch(`${config.workflowService}/api/orders/${orderNumber}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ emailDocuments: updatedEmailDocuments })
                    }),
                    fetch(`${config.workflowService}/api/emails/${emailId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ linked: true })
                    })
                ]);

                if (!orderRes.ok || !emailRes.ok) throw new Error('API returned non-OK status');

                // Update local email cache
                setEmails(prev => prev.map(e => (e.emailId === emailId ? { ...e, linked: true } : e)));

                toast.success('Email linked successfully');
            } catch (err) {
                console.error('Failed to link email', err);
                toast.error('Failed to link email');
                // Rollback
                const order = ordersRef.current.find(o => o.orderDetails.orderNumber === orderNumber);
                setOrders(prev => prev.map(o => (o.orderDetails.orderNumber === orderNumber ? { ...o, emailDocuments: order?.emailDocuments || [] } : o)));
            } finally {
                setLinkingEmails(prev => {
                    const next = { ...prev };
                    delete next[linkKey];
                    return next;
                });
            }
        },
        [toast]
    );

    // ── Delete order (#7 — now checks response) (#17 — toast on error) ──
    const handleDeleteOrder = useCallback(
        async (orderNumber: number) => {
            try {
                const res = await fetch(`${config.workflowService}/api/orders/${orderNumber}`, { method: 'DELETE' });
                if (!res.ok) {
                    toast.error(`Failed to delete order. Status: ${res.status}`);
                    return;
                }
                setOrders(prev => prev.filter(o => o.orderDetails.orderNumber !== orderNumber));
                toast.success('Order deleted successfully');
            } catch (err) {
                console.error('Failed to delete order', err);
                toast.error('Failed to delete order');
            }
        },
        [toast]
    );

    // ── Unlink email — remove email docs from emailDocuments, set linked:false ──
    const handleUnlinkEmail = useCallback(
        async (orderNumber: number, emailId: string) => {
            const linkKey = `${orderNumber}-${emailId}`;
            setLinkingEmails(prev => ({ ...prev, [linkKey]: true }));

            const order = ordersRef.current.find(o => o.orderDetails.orderNumber === orderNumber);
            const prevEmailDocs = order?.emailDocuments || [];

            // Get the email to know which docs to remove
            const email = emailsRef.current.find(e => e.emailId === emailId);
            const emailDocNames = new Set((email?.attachments || []).map((att: any) => att.documentName || att.name || ''));

            const updatedEmailDocuments = prevEmailDocs.filter(d => !emailDocNames.has(d.documentName));

            // Optimistic update
            setOrders(prev => prev.map(o => (o.orderDetails.orderNumber === orderNumber ? { ...o, emailDocuments: updatedEmailDocuments } : o)));

            try {
                const [orderRes, emailRes] = await Promise.all([
                    fetch(`${config.workflowService}/api/orders/${orderNumber}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ emailDocuments: updatedEmailDocuments })
                    }),
                    fetch(`${config.workflowService}/api/emails/${emailId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ linked: false })
                    })
                ]);

                if (!orderRes.ok || !emailRes.ok) throw new Error('API returned non-OK status');

                // Update local email cache
                setEmails(prev => prev.map(e => (e.emailId === emailId ? { ...e, linked: false } : e)));

                toast.success('Email unlinked');
            } catch (err) {
                console.error('Failed to unlink email', err);
                toast.error('Failed to unlink email');
                // Rollback
                setOrders(prev => prev.map(o => (o.orderDetails.orderNumber === orderNumber ? { ...o, emailDocuments: prevEmailDocs } : o)));
            } finally {
                setLinkingEmails(prev => {
                    const next = { ...prev };
                    delete next[linkKey];
                    return next;
                });
            }
        },
        [toast]
    );

    // ── Upload files (#1 — uses ref, #5 — logs errors, #17 — toasts) ──
    const handleUploadFiles = useCallback(
        async (orderNumber: number, files: File[]) => {
            if (files.length === 0) return;

            setUploadingOrders(prev => ({ ...prev, [orderNumber]: true }));

            const formData = new FormData();
            formData.append('orderNumber', orderNumber.toString());
            files.forEach(file => formData.append('file', file));

            try {
                const response = await fetch(`${config.workflowService}/api/webhooks/trigger/orient-file-upload`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    console.error('Upload API response error:', response.status);
                    toast.error(`Upload failed. Status: ${response.status}`);
                    setUploadingOrders(prev => ({ ...prev, [orderNumber]: false }));
                    return;
                }

                const responseData = await response.json();
                const executionId = responseData?.data?.executionId;

                if (!executionId) {
                    console.error('No executionId found in response');
                    toast.error('Upload failed — no execution ID returned');
                    setUploadingOrders(prev => ({ ...prev, [orderNumber]: false }));
                    return;
                }

                const streamUrl = `${config.workflowService}/api/executions/${executionId}/status-stream?apiKey=${API_KEY}`;
                const eventSource = new EventSource(streamUrl);

                eventSource.onmessage = async event => {
                    try {
                        const jsonString = event.data;
                        if (!jsonString || jsonString.trim() === '' || jsonString === '{}') return;

                        const parsed = JSON.parse(jsonString);
                        if (parsed.status) {
                            if (['completed', 'failed', 'error', 'cancelled', 'timeout'].includes(parsed.status)) {
                                eventSource.close();
                                setUploadingOrders(prev => ({ ...prev, [orderNumber]: false }));

                                if (parsed.status === 'completed') {
                                    const finalData = parsed.finalData[0] || {};
                                    console.log('parsed', parsed);
                                    const newDocs: DocumentDetail[] = [];

                                    finalData.manualDocuments.forEach((doc: string[]) => {
                                        if (doc && doc.length > 0) {
                                            newDocs.push({
                                                documentName: doc[0].split('/').pop() || new Date().toISOString(),
                                                documentPages: doc
                                            });
                                        }
                                    });

                                    if (newDocs.length > 0) {
                                        // Use ref to get the freshest order state (#1, #16)
                                        const currentOrder = ordersRef.current.find(o => o.orderDetails.orderNumber === orderNumber);
                                        const updatedManualDocuments = [...(currentOrder?.manualDocuments || []), ...newDocs];

                                        setOrders(prev => prev.map(o => (o.orderDetails.orderNumber === orderNumber ? { ...o, manualDocuments: updatedManualDocuments } : o)));

                                        await fetch(`${config.workflowService}/api/orders/${orderNumber}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ manualDocuments: updatedManualDocuments })
                                        });

                                        toast.success(`${newDocs.length} document(s) uploaded`);
                                    }
                                } else {
                                    toast.error(`Upload ${parsed.status}`);
                                }
                            }
                        }
                    } catch (e) {
                        // #5 — log SSE parse errors instead of silently swallowing
                        console.error('Error processing upload SSE message:', e);
                    }
                };

                eventSource.onerror = err => {
                    console.error('SSE EventSource error:', err);
                    eventSource.close();
                    setUploadingOrders(prev => ({ ...prev, [orderNumber]: false }));
                    toast.error('Upload stream disconnected');
                };
            } catch (err) {
                console.error('Upload API error:', err);
                setUploadingOrders(prev => ({ ...prev, [orderNumber]: false }));
                toast.error('Upload failed');
            }
        },
        [toast]
    );

    // ── Remove manual document (#1 — uses ref, #17, #23) ──
    const handleRemoveUploadedFile = useCallback(
        async (orderNumber: number, fileIndex: number) => {
            const order = ordersRef.current.find(o => o.orderDetails.orderNumber === orderNumber);
            if (!order || !order.manualDocuments) return;

            const prevDocs = order.manualDocuments;
            const updatedManualDocuments = order.manualDocuments.filter((_, i) => i !== fileIndex);

            setOrders(prev => prev.map(o => (o.orderDetails.orderNumber === orderNumber ? { ...o, manualDocuments: updatedManualDocuments } : o)));

            try {
                const res = await fetch(`${config.workflowService}/api/orders/${orderNumber}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ manualDocuments: updatedManualDocuments })
                });
                if (!res.ok) throw new Error(`Status ${res.status}`);
            } catch (err) {
                console.error('Failed to remove manual document', err);
                toast.error('Failed to remove document');
                // Rollback
                setOrders(prev => prev.map(o => (o.orderDetails.orderNumber === orderNumber ? { ...o, manualDocuments: prevDocs } : o)));
            }
        },
        [toast]
    );

    // ── Remove web document (#1, #17, #23) ──
    const handleRemoveWebDocument = useCallback(
        async (orderNumber: number, fileIndex: number) => {
            const order = ordersRef.current.find(o => o.orderDetails.orderNumber === orderNumber);
            if (!order || !order.webDocuments) return;

            const prevDocs = order.webDocuments;
            const updatedWebDocuments = order.webDocuments.filter((_, i) => i !== fileIndex);

            setOrders(prev => prev.map(o => (o.orderDetails.orderNumber === orderNumber ? { ...o, webDocuments: updatedWebDocuments } : o)));

            try {
                const res = await fetch(`${config.workflowService}/api/orders/${orderNumber}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ webDocuments: updatedWebDocuments })
                });
                if (!res.ok) throw new Error(`Status ${res.status}`);
            } catch (err) {
                console.error('Failed to remove web document', err);
                toast.error('Failed to remove document');
                // Rollback
                setOrders(prev => prev.map(o => (o.orderDetails.orderNumber === orderNumber ? { ...o, webDocuments: prevDocs } : o)));
            }
        },
        [toast]
    );

    // ── Remove email document from order.emailDocuments ──
    const handleRemoveEmailDocument = useCallback(
        async (orderNumber: number, fileIndex: number) => {
            const order = ordersRef.current.find(o => o.orderDetails.orderNumber === orderNumber);
            if (!order || !order.emailDocuments) return;

            const prevDocs = order.emailDocuments;
            const updatedEmailDocuments = order.emailDocuments.filter((_, i) => i !== fileIndex);

            setOrders(prev => prev.map(o => (o.orderDetails.orderNumber === orderNumber ? { ...o, emailDocuments: updatedEmailDocuments } : o)));

            try {
                const res = await fetch(`${config.workflowService}/api/orders/${orderNumber}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ emailDocuments: updatedEmailDocuments })
                });
                if (!res.ok) throw new Error(`Status ${res.status}`);
            } catch (err) {
                console.error('Failed to remove email document', err);
                toast.error('Failed to remove email document');
                // Rollback
                setOrders(prev => prev.map(o => (o.orderDetails.orderNumber === orderNumber ? { ...o, emailDocuments: prevDocs } : o)));
            }
        },
        [toast]
    );

    // ── Proceed / Extract (#1 — ref, #2 — dynamic webhook, #6 — log errors, #22 — toast not alert) ──
    const handleProceed = useCallback(
        async (orderNumber: number) => {
            const order = ordersRef.current.find(o => o.orderDetails.orderNumber === orderNumber);
            if (!order) return;

            setProceedingOrders(prev => ({ ...prev, [orderNumber]: true }));

            const emailDocuments = order.emailDocuments || [];

            const hasDocuments = (order.manualDocuments?.length || 0) + (order.webDocuments?.length || 0) + emailDocuments.length > 0;
            if (!hasDocuments) {
                // #22 — use toast instead of alert()
                toast.error('Please upload files before extracting');
                setProceedingOrders(prev => ({ ...prev, [orderNumber]: false }));
                return;
            }

            const allDocDetails = [...emailDocuments, ...(order.webDocuments || []), ...(order.manualDocuments || [])];

            const arrangedDocuments = rearrangeDocuments(allDocDetails);

            console.log('allDocDetails', arrangedDocuments);

            const payloadDocuments = arrangedDocuments.flatMap(doc => {
                const pages = doc.documentPages || [];
                if (pages.length === 0) return [];

                const baseName = doc.documentName ? doc.documentName.replace(/\.[^/.]+$/, '') : 'document';

                if (pages.length === 1) {
                    return [{ documentName: baseName, documentUrl: pages[0] }];
                } else {
                    return pages.map((pageUrl: string, index: number) => ({
                        documentName: `${baseName}_page_${index + 1}`,
                        documentUrl: pageUrl
                    }));
                }
            });

            // #2 — use agentSettings?.webhookUrl instead of hardcoding
            const webhookSlug = agentSettings?.webhookEndpoint || 'orient-document-extractor';

            try {
                const response = await fetch(`${config.workflowService}/api/webhooks/trigger/${webhookSlug}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderNumber: orderNumber,
                        order: order,
                        templateId: agentSettings?.defaultTemplateId || '',
                        templateName: agentSettings?.templates?.[0]?.name || 'Orient Document Extractor V1',
                        documents: payloadDocuments
                    })
                });

                if (!response.ok) {
                    console.error('Extraction API response error:', response.status);
                    toast.error(`Extraction failed. Status: ${response.status}`);
                    setProceedingOrders(prev => ({ ...prev, [orderNumber]: false }));
                    return;
                }

                const responseData = await response.json();
                const executionId = responseData?.data?.executionId;

                if (!executionId) {
                    console.error('No executionId found in response');
                    toast.error('Extraction failed — no execution ID returned');
                    setProceedingOrders(prev => ({ ...prev, [orderNumber]: false }));
                    return;
                }

                // #8 — apiKey from constant
                const streamUrl = `${config.workflowService}/api/executions/${executionId}/status-stream?apiKey=${API_KEY}`;
                const eventSource = new EventSource(streamUrl);

                eventSource.onmessage = event => {
                    try {
                        const jsonString = event.data;
                        if (!jsonString || jsonString.trim() === '' || jsonString === '{}') return;

                        const parsed = JSON.parse(jsonString);
                        if (parsed.status) {
                            if (['completed', 'failed', 'error', 'cancelled', 'timeout'].includes(parsed.status)) {
                                eventSource.close();
                                setProceedingOrders(prev => ({ ...prev, [orderNumber]: false }));
                                if (parsed.status === 'completed') {
                                    const finalData = parsed.finalData[0];
                                    if (finalData.extractedData) {
                                        // Use ref (#1, #16)
                                        const currentOrder = ordersRef.current.find(o => o.orderDetails.orderNumber === orderNumber);
                                        const updateDetails = {
                                            orderDetails: { ...(currentOrder?.orderDetails || {}), orderStatus: 'extracted' },
                                            extractionDetails: {
                                                extractedData: finalData.extractedData,
                                                recordId: finalData.recordId,
                                                templateId: agentSettings?.defaultTemplateId || '',
                                                templateName: agentSettings?.templates?.[0]?.name
                                            }
                                        };

                                        fetch(`${config.workflowService}/api/orders/${orderNumber}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(updateDetails)
                                        }).catch(err => console.error('Failed to save extraction details', err));

                                        setOrders(prev =>
                                            prev.map(o =>
                                                o.orderDetails.orderNumber === orderNumber
                                                    ? { ...o, orderDetails: { ...o.orderDetails, orderStatus: 'extracted' as const }, extractionDetails: updateDetails.extractionDetails }
                                                    : o
                                            )
                                        );

                                        toast.success('Extraction completed');
                                    }
                                } else {
                                    toast.error(`Extraction ${parsed.status}`);
                                }
                            }
                        }
                    } catch (e) {
                        // #6 — log instead of silently swallowing
                        console.error('Error processing extraction SSE message:', e);
                    }
                };

                eventSource.onerror = err => {
                    console.error('SSE EventSource error:', err);
                    eventSource.close();
                    setProceedingOrders(prev => ({ ...prev, [orderNumber]: false }));
                    toast.error('Extraction stream disconnected');
                };
            } catch (err) {
                console.error('Extraction API error:', err);
                setProceedingOrders(prev => ({ ...prev, [orderNumber]: false }));
                toast.error('Extraction failed');
            }
        },
        [agentSettings, toast]
    );

    // ── Create order (#3 — functional updater) ──
    const handleCreateOrder = useCallback(
        async (newOrder: Partial<Order>) => {
            try {
                const response = await fetch(`${config.workflowService}/api/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newOrder)
                });
                if (response.ok) {
                    const createdOrder = await response.json();
                    // #3 — use functional updater to avoid stale closure
                    setOrders(prev => [createdOrder, ...prev]);
                    toast.success('Order created successfully');
                } else {
                    toast.error(`Failed to create order. Status: ${response.status}`);
                }
            } catch (err) {
                toast.error('Failed to create order');
                console.error('Failed to create order', err);
            }
        },
        [toast]
    );

    // ── Update order (#4 — functional updater) ──
    const handleUpdateOrder = useCallback(
        async (updatedOrder: Order) => {
            try {
                const response = await fetch(`${config.workflowService}/api/orders/${updatedOrder.orderDetails.orderNumber}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedOrder)
                });
                if (response.ok) {
                    // #4 — functional updater
                    setOrders(prev => prev.map(o => (o.orderDetails.orderNumber === updatedOrder.orderDetails.orderNumber ? updatedOrder : o)));
                    toast.success('Order updated successfully');
                } else {
                    toast.error(`Failed to update order. Status: ${response.status}`);
                }
            } catch (err) {
                console.error('Failed to update order', err);
                toast.error('Failed to update order');
            }
        },
        [toast]
    );

    return {
        orders,
        emails,
        totalPages,
        totalCount,
        isLoadingOrders,
        ordersError,
        uploadingOrders,
        proceedingOrders,
        linkingEmails,
        fetchData,
        handleDeleteOrder,
        handleLinkEmail,
        handleUnlinkEmail,
        handleUploadFiles,
        handleRemoveUploadedFile,
        handleRemoveWebDocument,
        handleRemoveEmailDocument,
        handleProceed,
        handleCreateOrder,
        handleUpdateOrder,
        setOrders,
        setTotalPages,
        setTotalCount
    };
}
