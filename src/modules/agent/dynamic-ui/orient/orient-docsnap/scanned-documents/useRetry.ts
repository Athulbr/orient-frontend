import React, { useState } from 'react';
import { config } from '../../../../../../config/default';
import { useToastStore } from '../../../../../../components/toast/ToastStore';
import { STATIC_BRANCHES, API_KEY } from './constants';
import type { ScannedDocument } from './types';

const TERMINAL_STATUSES = ['completed', 'failed', 'error', 'cancelled', 'timeout'];

/**
 * Provides a `handleRetry` function that:
 * 1. Validates branch, orderType and invoiceNumber.
 * 2. POSTs to the retry webhook.
 * 3. Opens an SSE status-stream and shows a toast on completion/failure.
 *
 * Returns `isRetrying` so the UI can show a loading state.
 */
export const useRetry = (doc: ScannedDocument) => {
    const [isRetrying, setIsRetrying] = useState(false);
    const toast = useToastStore();

    const handleRetry = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        // ── Validation ─────────────────────────────────────────
        if (!doc.branchCode || !STATIC_BRANCHES.includes(doc.branchCode)) {
            toast.error('Invalid branch. Please select a valid branch.');
            return;
        }

        if (!doc.orderType || !['SALE', 'PURCHASE'].includes(doc.orderType.toUpperCase())) {
            toast.error('Order type must be SALE or PURCHASE.');
            return;
        }

        const invoiceCleaned = doc.invoiceNumber?.trim() || '';
        if (!/^\d{6,8}$/.test(invoiceCleaned)) {
            toast.error('Invoice number must have 6-8 digits.');
            return;
        }

        // ── Trigger webhook ────────────────────────────────────
        setIsRetrying(true);
        try {
            const response = await fetch(`${config.workflowService}/api/webhooks/trigger/webhook-upload-scanned-documents-to-maraekat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...doc, recordId: doc._id })
            });

            if (!response.ok) {
                toast.error(`Retry failed. Status: ${response.status}`);
                setIsRetrying(false);
                return;
            }

            const responseData = await response.json();
            const executionId = responseData?.data?.executionId;

            if (!executionId) {
                toast.error('Retry failed — no execution ID returned');
                setIsRetrying(false);
                return;
            }

            // ── Listen on SSE status stream ────────────────────
            const streamUrl = `${config.workflowService}/api/executions/${executionId}/status-stream?apiKey=${API_KEY}`;
            const eventSource = new EventSource(streamUrl);

            eventSource.onmessage = event => {
                try {
                    const raw = event.data;
                    if (!raw || raw.trim() === '' || raw === '{}') return;

                    const parsed = JSON.parse(raw);
                    if (!parsed.status) return;

                    if (TERMINAL_STATUSES.includes(parsed.status)) {
                        eventSource.close();
                        setIsRetrying(false);

                        if (parsed.status === 'completed') {
                            const finalData = parsed.finalData?.[0];
                            if (finalData?.success === true) {
                                toast.success('Retry completed successfully');
                            } else {
                                toast.error(finalData?.errorMessage || 'Retry failed');
                            }
                        } else {
                            toast.error(`Retry ${parsed.status}`);
                        }
                    }
                } catch (err) {
                    console.error('Error processing retry SSE message:', err);
                }
            };

            eventSource.onerror = err => {
                console.error('SSE EventSource error:', err);
                eventSource.close();
                setIsRetrying(false);
                toast.error('Retry stream disconnected');
            };
        } catch (err) {
            console.error('Retry API error:', err);
            setIsRetrying(false);
            toast.error('Retry failed');
        }
    };

    return { isRetrying, handleRetry };
};
