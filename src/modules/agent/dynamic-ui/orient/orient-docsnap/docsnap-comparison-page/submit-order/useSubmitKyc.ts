import { useState } from 'react';
import { config } from '../../../../../../../config/default';
import { Order } from '../../types';
import { getMaraekatPayload } from './getMaraekatPayload';
import { ResultMessage } from './DraggableResultCard';
import clientLoggerNew from '../../../../../../../global-utils/clientLoggerNew';
import { useToastStore } from '../../../../../../../components/toast/ToastStore';

export interface UseSubmitKycOptions {
    order: Order;
    extractedData: any;
    onOrderUpdate?: (updatedOrder: Order) => void;
    onBeforeSubmit?: () => Promise<void>;
}

export interface KycSubmitResult {
    success: boolean;
    eonBookingNumber?: string;
    bookingNumber?: string;
}

const checkIsExtractedDataUpdated = (extractedData: any): boolean => {
    try {
        const isFieldObject = (obj: any): boolean => {
            try {
                return obj !== null && typeof obj === 'object' && !Array.isArray(obj) && 'value' in obj && 'initialValue' in obj;
            } catch {
                return false;
            }
        };

        const isFieldUpdated = (fieldValue: any): boolean => {
            try {
                const initial = fieldValue?.initialValue;
                const current = fieldValue?.value;

                if (!initial || typeof initial !== 'string') return false;

                return (
                    String(current ?? '')
                        .trim()
                        .toUpperCase() !== initial.trim().toUpperCase()
                );
            } catch {
                return false;
            }
        };

        const traverse = (node: any): boolean => {
            try {
                if (node === null || node === undefined || typeof node !== 'object') return false;
                if (Array.isArray(node)) return node.some(item => traverse(item));
                if (isFieldObject(node)) return isFieldUpdated(node);
                return Object.values(node).some(val => traverse(val));
            } catch {
                return false;
            }
        };

        return traverse(extractedData);
    } catch {
        return false;
    }
};

export const useSubmitKyc = ({ order, extractedData, onOrderUpdate, onBeforeSubmit }: UseSubmitKycOptions) => {
    const [resultMessage, setResultMessage] = useState<ResultMessage | null>(null);
    const [isInitiatingKyc, setIsInitiatingKyc] = useState(false);

    const submitKyc = async (): Promise<KycSubmitResult> => {
        setResultMessage(null);
        setIsInitiatingKyc(true);

        // Step 1: Silently save the latest extracted data before submitting
        if (onBeforeSubmit) {
            try {
                await Promise.race([onBeforeSubmit(), new Promise<void>(resolve => setTimeout(resolve, 3000))]);
            } catch (err) {
                console.error('Silent save before submit failed:', err);
                // Do not block submission on save failure
            }
        }

        // Step 2: Validate passenger name against passport
        if (
            order.orderDetails?.orderType === 'sell' &&
            !(extractedData?.travel_itinerary?.passenger_name?.value || '').toUpperCase().includes(extractedData?.passport?.first_name?.value.toUpperCase())
        ) {
            const accepted = confirm(
                `Passenger name does not match passport name.\nPassport name: ${extractedData?.passport?.first_name?.value} ${extractedData?.passport?.last_name?.value}\nTicket name: ${extractedData?.travel_itinerary?.passenger_name?.value}\n\nProceed anyway?`
            );
            if (!accepted) {
                setIsInitiatingKyc(false);
                return { success: false };
            }
        }

        // Step 3: Build and validate payload
        const { payload, dateErrors } = getMaraekatPayload(order, extractedData);

        if (dateErrors.length > 0) {
            setIsInitiatingKyc(false);
            setResultMessage({ type: 'error', messages: dateErrors });
            return { success: false };
        }
        const isExtractedDataUpdated = checkIsExtractedDataUpdated(extractedData);

        // Step 4: Call submit API
        let isKycApiCompleted = false;
        const kycController = new AbortController();

        const kycTimeoutId = setTimeout(async () => {
            if (!isKycApiCompleted) {
                let healthResponseData = null;
                try {
                    const healthRes = await Promise.race([
                        fetch(`${config.workflowService}/api/health`),
                        new Promise<Response>(resolve => setTimeout(() => resolve(new Response(JSON.stringify({ error: 'timeout' }))), 1000))
                    ]);
                    healthResponseData = await healthRes.json();
                } catch (err) {
                    healthResponseData = { error: 'Failed to fetch health API' };
                }

                try {
                    clientLoggerNew({
                        message: `KYC submit request API is taking more than 10 seconds (still pending)`,
                        orderNumber: order.orderDetails?.orderNumber,
                        healthResponse: healthResponseData
                    });
                } catch (error) {}

                // Fire toast and result directly from the timeout — don't rely on catch chain
                useToastStore.getState().error('Check that your VPN is connected and your internet is working, then try again. If the problem continues, contact your IT team', {
                    duration: 1200000,
                    title: 'Connection Error'
                });
                setResultMessage({
                    type: 'error',
                    messages: ['Connection Error']
                });
                setIsInitiatingKyc(false);

                kycController.abort();
            }
        }, 10000);

        setIsInitiatingKyc(true);
        let response;
        try {
            response = await fetch(`${config.workflowService}/api/webhooks/trigger/maraekat-submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload: payload, order, isExtractedDataUpdated }),
                signal: kycController.signal
            });
        } catch (error: any) {
            isKycApiCompleted = true;
            clearTimeout(kycTimeoutId);
            setIsInitiatingKyc(false);
            if (error.name === 'AbortError') {
                // Toast already fired from the timeout callback
                return { success: false };
            }
            console.error('Submit KYC error:', error);
            setResultMessage({ type: 'error', messages: ['Failed to submit KYC details: An unexpected error occurred'] });
            return { success: false };
        }

        isKycApiCompleted = true;
        clearTimeout(kycTimeoutId);
        setIsInitiatingKyc(false);

        if (!response.ok) {
            console.error('Submission API response error:', response.status);
            setResultMessage({ type: 'error', messages: ['Failed to submit KYC details: ' + response.status] });
            return { success: false };
        }

        const responseData = await response.json();
        const executionId = responseData?.data?.executionId;

        if (!executionId) {
            console.error('No executionId found in response');
            setResultMessage({ type: 'error', messages: ['Failed to submit KYC details: No executionId in response'] });
            return { success: false };
        }

        // Step 5: Listen to SSE Stream for completion
        try {
            return await new Promise<KycSubmitResult>(resolve => {
                const streamUrl = `${config.workflowService}/api/executions/${executionId}/status-stream?apiKey=secret1`;
                const eventSource = new EventSource(streamUrl);

                eventSource.onmessage = event => {
                    try {
                        const jsonString = event.data;
                        if (!jsonString || jsonString.trim() === '' || jsonString === '{}') return;

                        const parsed = JSON.parse(jsonString);
                        if (parsed.status && ['completed', 'failed', 'error', 'cancelled', 'timeout'].includes(parsed.status)) {
                            eventSource.close();

                            if (parsed.status === 'completed') {
                                const result = parsed.finalData?.[0] || {};
                                if (result && result.success === false) {
                                    const errorMessages = Array.isArray(result.messages)
                                        ? result.messages.map((m: any) => (typeof m === 'string' ? m : m.message || JSON.stringify(m)))
                                        : ['Failed to submit KYC details'];
                                    setResultMessage({ type: 'error', messages: errorMessages });
                                    resolve({ success: false });
                                } else {
                                    const eonBookingNo = result.EONBOOKINGNO;
                                    const bookingNo = result.BOOKINGNO;
                                    console.log('EONBOOKINGNO: ', eonBookingNo);

                                    const isExtractedDataUpdated = checkIsExtractedDataUpdated(extractedData);
                                    // Update local state with enriched order
                                    if (eonBookingNo && onOrderUpdate) {
                                        const updatedOrder: Order = {
                                            ...order,
                                            orderDetails: {
                                                ...order.orderDetails,
                                                orderStatus: 'submitted'
                                            },
                                            maraekatDetails: {
                                                ...order.maraekatDetails,
                                                eonBookingNumber: eonBookingNo,
                                                bookingNumber: bookingNo,
                                                isExtractedDataUpdated: isExtractedDataUpdated
                                            }
                                        };
                                        onOrderUpdate(updatedOrder);
                                    }

                                    // Persist to DB (fire-and-forget)
                                    if (eonBookingNo) {
                                        const updatePayload = {
                                            'orderDetails.orderStatus': 'submitted',
                                            maraekatDetails: {
                                                eonBookingNumber: eonBookingNo,
                                                bookingNumber: bookingNo,
                                                isExtractedDataUpdated: isExtractedDataUpdated
                                            }
                                        };
                                        fetch(`${config.workflowService}/api/orders/${order.orderDetails.orderNumber}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(updatePayload)
                                        }).catch(err => console.error('Failed to update order with EONBOOKINGNO:', err));
                                    }

                                    const successMessages = Array.isArray(result?.messages)
                                        ? result.messages.map((m: any) => (typeof m === 'string' ? m : m.message || 'Validated Successfully'))
                                        : ['Successfully submitted KYC to Maraekat'];
                                    setResultMessage({ type: 'success', messages: successMessages });
                                    resolve({ success: true, eonBookingNumber: eonBookingNo, bookingNumber: bookingNo });
                                }
                            } else {
                                const errorMsg = parsed.error || `Failed to submit KYC details: ${parsed.status}`;
                                setResultMessage({ type: 'error', messages: [errorMsg] });
                                resolve({ success: false });
                            }
                        }
                    } catch (e) {
                        // Ignore parse errors for partial streams
                    }
                };

                eventSource.onerror = err => {
                    console.error('SSE EventSource error:', err);
                    eventSource.close();
                    setResultMessage({ type: 'error', messages: ['Failed to submit KYC details: Stream connection error'] });
                    resolve({ success: false });
                };
            });
        } catch (error) {
            console.error('SSE stream error:', error);
            setResultMessage({ type: 'error', messages: ['Failed to submit KYC details: An unexpected error occurred'] });
            return { success: false };
        }
    };

    return { resultMessage, setResultMessage, submitKyc, isInitiatingKyc };
};
