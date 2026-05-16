import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Order } from '../../types';
import { DraggableResultCard } from './DraggableResultCard';
import { useSubmitKyc } from './useSubmitKyc';
import { useSubmitReceipts } from './useSubmitReceipts';
import { useSubmitCurrency } from './useSubmitCurrency';

interface SubmitOrderProps {
    order: Order;
    extractedData: any;
    onOrderUpdate?: (updatedOrder: Order) => void;
    onBeforeSubmit?: () => Promise<void>;
    isKycSubmitted?: boolean;
    isRecPaySubmitted?: boolean;
    isCurrencySubmitted?: boolean;
}

type SubmitPhase = 'idle' | 'kyc' | 'receipts' | 'currency';

/**
 * SubmitOrder — Single submit button that orchestrates the entire submission flow:
 *
 *  Step 1: Submit KYC → get eonBookingNumber
 *  Step 2: Submit Receipts (skipped if receipts array is empty)
 *  Step 3: Submit Currency Exchange
 *
 * Each step has specific error handling and the flow stops on first failure.
 */
const SubmitOrder: React.FC<SubmitOrderProps> = ({
    order,
    extractedData,
    onOrderUpdate,
    onBeforeSubmit,
    isKycSubmitted,
    isRecPaySubmitted,
    isCurrencySubmitted
}) => {
    const [phase, setPhase] = useState<SubmitPhase>('idle');

    // Track the latest order so subsequent steps use the enriched order
    // (with eonBookingNumber) that KYC returns via onOrderUpdate.
    const latestOrderRef = useRef<Order>(order);

    const wrappedOnOrderUpdate = (updatedOrder: Order) => {
        latestOrderRef.current = updatedOrder;
        onOrderUpdate?.(updatedOrder);
    };

    const { resultMessage, setResultMessage, submitKyc } = useSubmitKyc({
        order,
        extractedData,
        onOrderUpdate: wrappedOnOrderUpdate,
        onBeforeSubmit
    });

    const { submitReceipts } = useSubmitReceipts({
        extractedData,
        onOrderUpdate: wrappedOnOrderUpdate
    });

    const { submitCurrency } = useSubmitCurrency({
        extractedData,
        onOrderUpdate: wrappedOnOrderUpdate
    });

    const isSubmitting = phase !== 'idle';
    const allDone = isKycSubmitted && isRecPaySubmitted && isCurrencySubmitted;

    const handleSubmit = async () => {
        if (isSubmitting || allDone) return;

        // ── Step 1: Submit KYC ─────────────────────────────────────────
        if (!isKycSubmitted) {
            setPhase('kyc');
            const kycResult = await submitKyc();
            if (!kycResult.success) {
                setPhase('idle');
                return;
            }
        }

        // ── Step 2: Submit Receipts (skipped if empty) ─────────────────
        if (!isRecPaySubmitted) {
            setPhase('receipts');
            const receiptsSuccess = await submitReceipts(latestOrderRef.current);
            if (!receiptsSuccess) {
                setPhase('idle');
                return;
            }
        }

        // ── Step 3: Submit Currency Exchange ───────────────────────────
        if (!isCurrencySubmitted) {
            setPhase('currency');
            await submitCurrency(latestOrderRef.current);
        }

        setPhase('idle');
    };

    const getLabel = () => {
        if (allDone) return 'Submitted';
        if (phase === 'kyc') return 'Submitting KYC...';
        if (phase === 'receipts') return 'Submitting Receipts...';
        if (phase === 'currency') return 'Adding Currency...';
        return 'Submit';
    };

    return (
        <div className="relative">
            {/* KYC result card (validation errors / success) */}
            {resultMessage && (
                <DraggableResultCard
                    result={resultMessage}
                    onClose={() => setResultMessage(null)}
                />
            )}

            <button
                id="submit-order-btn"
                onClick={handleSubmit}
                disabled={isSubmitting || allDone}
                className={`flex items-center justify-center gap-2 rounded-md border border-gray-400 bg-white px-3 py-1 text-base font-light text-gray-500 transition-all duration-200 ease-in-out hover:border-blue-500 hover:bg-blue-400 hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${allDone ? 'opacity-10 cursor-not-allowed' : ''}`}
            >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {getLabel()}
            </button>
        </div>
    );
};

export default SubmitOrder;
