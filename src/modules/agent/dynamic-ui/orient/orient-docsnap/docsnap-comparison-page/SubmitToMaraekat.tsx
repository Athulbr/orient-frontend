import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, GripHorizontal, Loader2 } from 'lucide-react';
import { config } from '../../../../../../config/default';
import { Order } from '../types';
import { getMaraekatPayload } from './utils/getMaraekatPayload';
import { validateMaraekatPayload } from './utils/validateMaraekatPayload';
import { manipulateMaraekatPayload } from './utils/manipulateMaraekatPayload';

export type ResultMessage = {
    type: 'success' | 'error';
    messages: string[];
};


interface DraggableResultCardProps {
    result: ResultMessage;
    onClose: () => void;
}

export const DraggableResultCard: React.FC<DraggableResultCardProps> = ({ result, onClose }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - dragStartPos.current.x,
                y: e.clientY - dragStartPos.current.y
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const isSuccess = result.type === 'success';

    return (
        <div
            className={`absolute bottom-[calc(100%+1rem)] right-0 z-50 flex w-120 flex-col overflow-hidden rounded-xl border bg-white shadow-2xl transition-shadow ${
                isSuccess ? 'border-green-200' : 'border-red-200'
            } ${isDragging ? 'cursor-grabbing shadow-[0_20px_50px_rgba(0,0,0,0.2)]' : 'shadow-lg'}`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`
            }}
        >
            {/* Header (Draggable handle) */}
            <div
                className={`flex cursor-grab items-center justify-between px-4 py-3 active:cursor-grabbing ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 font-semibold">
                    <GripHorizontal size={18} className={isSuccess ? 'text-green-500/50' : 'text-red-500/50'} />
                    {isSuccess ? <CheckCircle size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-red-600" />}
                    <span>{isSuccess ? 'Success' : 'Submission Failed'}</span>
                </div>
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className={`rounded-md p-1 transition-colors ${isSuccess ? 'hover:bg-green-200/50' : 'hover:bg-red-200/50'}`}
                >
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="max-h-100 overflow-y-auto bg-white p-4 text-sm text-gray-700">
                <ul className="flex flex-col gap-3">
                    {result.messages.map((msg, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                            <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="leading-snug">{msg}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export interface SubmitToMaraekatIF {
    order: Order;
    extractedData: any;
    onOrderUpdate?: (updatedOrder: Order) => void;
    onBeforeSubmit?: () => Promise<void>;
    isSubmitted?: boolean;
}

export const useKycSubmit = ({ order, extractedData, onOrderUpdate, onBeforeSubmit, isSubmitted }: SubmitToMaraekatIF) => {
    const [resultMessage, setResultMessage] = useState<ResultMessage | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setResultMessage(null);

        // Silently save the latest extracted data to the DB before submitting
        if (onBeforeSubmit) {
            try {
                await onBeforeSubmit();
            } catch (err) {
                console.error('Silent save before submit failed:', err);
                // Do not block submission on save failure
            }
        }
        if (!(extractedData?.travel_itinerary?.passenger_name?.value || '').toUpperCase().includes(extractedData?.passport?.first_name?.value.toUpperCase())) {
            const accepted = confirm(
                `Passenger name does not match passport name.\nPassport name: ${extractedData?.passport?.first_name?.value} ${extractedData?.passport?.last_name?.value}\nTicket name: ${extractedData?.travel_itinerary?.passenger_name?.value}\n\nProceed anyway?`
            );
            if (!accepted) {
                setIsSubmitting(false);
                return false;
            }
        }

        const { payload, dateErrors } = getMaraekatPayload(order, extractedData);
        const manipulatedJson = manipulateMaraekatPayload(payload, order);
        const validationResult = validateMaraekatPayload(manipulatedJson);

        const allErrors = [...dateErrors, ...validationResult.errors];
        if (allErrors.length > 0) {
            setResultMessage({ type: 'error', messages: allErrors });
            setIsSubmitting(false);
            return false;
        }

        try {
            const response = await fetch(`${config.workflowService}/api/webhooks/trigger/submit-order-3`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ payload: manipulatedJson })
            });

            if (!response.ok) {
                console.error('Submission API response error:', response.status);
                setIsSubmitting(false);
                setResultMessage({ type: 'error', messages: ['Failed to submit to Maraekat: ' + response.status] });
                return false;
            }

            const responseData = await response.json();
            const executionId = responseData?.data?.executionId;

            if (!executionId) {
                console.error('No executionId found in response');
                setIsSubmitting(false);
                setResultMessage({ type: 'error', messages: ['No executionId found in response'] });
                return false;
            }

            // Listen to SSE Stream for Completion
            return await new Promise<boolean>(resolve => {
                const streamUrl = `${config.workflowService}/api/executions/${executionId}/status-stream?apiKey=secret1`;
                const eventSource = new EventSource(streamUrl);

                eventSource.onmessage = event => {
                    try {
                        const jsonString = event.data;
                        if (!jsonString || jsonString.trim() === '' || jsonString === '{}') return;

                        const parsed = JSON.parse(jsonString);
                        if (parsed.status && ['completed', 'failed', 'error', 'cancelled', 'timeout'].includes(parsed.status)) {
                            eventSource.close();
                            setIsSubmitting(false);

                            if (parsed.status === 'completed') {
                                const result = parsed.finalData?.[0] || {};
                                if (result && result.success === false) {
                                    const errorMessages = Array.isArray(result.messages)
                                        ? result.messages.map((m: any) => (typeof m === 'string' ? m : m.message || JSON.stringify(m)))
                                        : ['Validation failed'];
                                    setResultMessage({ type: 'error', messages: errorMessages });
                                    resolve(false);
                                } else {
                                    const eonBookingNo = result.EONBOOKINGNO;
                                    const bookingNo = result.BOOKINGNO;
                                    console.log('EONBOOKINGNO: ', eonBookingNo);
                                    console.log('BOOKINGNO: ', bookingNo);

                                    // Update local state IMMEDIATELY so the combined
                                    // submit can hand the enriched order to rec pay
                                    // before the DB persist completes.
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
                                                bookingNumber: bookingNo
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
                                                bookingNumber: bookingNo
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
                                        : ['Successfully submitted to Maraekat'];
                                    setResultMessage({ type: 'success', messages: successMessages });
                                    resolve(true);
                                }
                            } else {
                                const errorMsg = parsed.error || `Submission ended with status: ${parsed.status}`;
                                setResultMessage({ type: 'error', messages: [errorMsg] });
                                resolve(false);
                            }
                        }
                    } catch (e) {
                        // Ignore parse errors for partial streams
                    }
                };

                eventSource.onerror = err => {
                    console.error('SSE EventSource error:', err);
                    eventSource.close();
                    setIsSubmitting(false);
                    setResultMessage({ type: 'error', messages: ['Stream connection error'] });
                    resolve(false);
                };
            });
        } catch (error) {
            console.error('Submit to Maraekat error:', error);
            setIsSubmitting(false);
            setResultMessage({ type: 'error', messages: ['An unexpected error occurred'] });
            return false;
        }
    };

    return { resultMessage, setResultMessage, isSubmitting, handleSubmit };
};

const SubmitToMaraekat: React.FC<SubmitToMaraekatIF> = ({ order, extractedData, onOrderUpdate, onBeforeSubmit, isSubmitted }) => {
    const { resultMessage, setResultMessage, isSubmitting, handleSubmit } = useKycSubmit({
        order,
        extractedData,
        onOrderUpdate,
        onBeforeSubmit,
        isSubmitted
    });

    return (
        <div className="relative">
            {resultMessage && <DraggableResultCard result={resultMessage} onClose={() => setResultMessage(null)} />}
            <button
                onClick={isSubmitted ? () => {} : () => handleSubmit()}
                disabled={isSubmitting || isSubmitted}
                className={`flex items-center justify-center gap-2 rounded-md border border-gray-400 bg-white px-3 py-1 text-base font-light text-gray-500 transition-all duration-200 ease-in-out hover:border-blue-500 hover:bg-blue-400 hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${isSubmitted ? 'opacity-10 cursor-not-allowed ' : ''}`}
            >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitted ? 'KYC Submitted' : 'Submit KYC'}
            </button>
        </div>
    );
};

export default SubmitToMaraekat;
