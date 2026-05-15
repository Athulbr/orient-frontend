import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Order } from '../types';
import { useKycSubmit, DraggableResultCard } from './SubmitToMaraekat';
import { useRecPaySubmit } from './SubmitReceiptToMaraekat';

interface CombinedSubmitProps {
    order: Order;
    extractedData: any;
    onOrderUpdate?: (updatedOrder: Order) => void;
    onBeforeSubmit?: () => Promise<void>;
    isKycSubmitted?: boolean;
    isRecPaySubmitted?: boolean;
    isCurrencySubmitted?: boolean;
    onAfterRecPay?: () => Promise<void>;
}

/**
 * CombinedSubmitToMaraekat
 *
 * A single "Submit" button that:
 *  1. Calls the KYC API (SubmitToMaraekat logic) first.
 *  2. On KYC success, automatically calls the Rec Pay API (SubmitReceiptToMaraekat logic).
 *
 * The underlying logic for each step lives in its own file:
 *   - KYC logic    → SubmitToMaraekat.tsx     (useKycSubmit hook)
 *   - Rec Pay logic → SubmitReceiptToMaraekat.tsx (useRecPaySubmit hook)
 */
const CombinedSubmitToMaraekat: React.FC<CombinedSubmitProps> = ({
    order,
    extractedData,
    onOrderUpdate,
    onBeforeSubmit,
    isKycSubmitted,
    isRecPaySubmitted,
    isCurrencySubmitted,
    onAfterRecPay
}) => {
    // latestOrderRef always holds the most-recently-updated order.
    // When KYC succeeds it calls onOrderUpdate with the order enriched with
    // eonBookingNumber/bookingNumber. We capture that here so we can hand it
    // directly to the rec-pay step — avoiding a stale-closure bug where rec pay
    // would read the original order (which has no eonBookingNumber yet).
    const latestOrderRef = useRef<Order>(order);

    const wrappedOnOrderUpdate = (updatedOrder: Order) => {
        latestOrderRef.current = updatedOrder;
        onOrderUpdate?.(updatedOrder);
    };

    const kycHook = useKycSubmit({
        order,
        extractedData,
        onOrderUpdate: wrappedOnOrderUpdate,
        onBeforeSubmit,
        isSubmitted: isKycSubmitted
    });

    const recPayHook = useRecPaySubmit({
        order,
        extractedData,
        onOrderUpdate: wrappedOnOrderUpdate
    });

    const [phase, setPhase] = useState<'idle' | 'kyc' | 'recpay' | 'exchange'>('idle');

    const isSubmitting = phase !== 'idle';
    const allDone = isKycSubmitted && isRecPaySubmitted && isCurrencySubmitted;

    const handleCombinedSubmit = async () => {
        if (isSubmitting || allDone) return;

        // ── Step 1: KYC ──────────────────────────────────────────────────
        if (!isKycSubmitted) {
            setPhase('kyc');
            const kycSuccess = await kycHook.handleSubmit();
            if (!kycSuccess) {
                setPhase('idle');
                return; // Stop — do not proceed to rec pay if KYC failed
            }
        }

        // ── Step 2: Rec Pay (runs only after KYC success) ─────────────────
        // Pass latestOrderRef.current so rec pay has the eonBookingNumber that
        // KYC just wrote to the DB and returned via onOrderUpdate.
        if (!isRecPaySubmitted) {
            setPhase('recpay');
            const recPaySuccess = await recPayHook.handleSubmit(latestOrderRef.current);
            if (!recPaySuccess) {
                setPhase('idle');
                return; // Stop — do not proceed to exchange if rec pay failed
            }
        }

        // ── Step 3: Exchange (runs only after Rec Pay success) ────────────
        if (!isCurrencySubmitted && onAfterRecPay) {
            setPhase('exchange');
            await onAfterRecPay();
        }

        setPhase('idle');
    };

    const getLabel = () => {
        if (allDone) return 'Submitted';
        if (phase === 'kyc') return 'Submitting KYC...';
        if (phase === 'recpay') return 'Submitting Rec Pay...';
        if (phase === 'exchange') return 'Adding Exchange...';
        return 'Submit';
    };

    return (
        <div className="relative">
            {/* KYC result card (validation errors / success from KYC step) */}
            {kycHook.resultMessage && (
                <DraggableResultCard
                    result={kycHook.resultMessage}
                    onClose={() => kycHook.setResultMessage(null)}
                />
            )}

            <button
                id="combined-submit-btn"
                onClick={handleCombinedSubmit}
                disabled={isSubmitting || allDone}
                className={`flex items-center justify-center gap-2 rounded-md border border-gray-400 bg-white px-3 py-1 text-base font-light text-gray-500 transition-all duration-200 ease-in-out hover:border-blue-500 hover:bg-blue-400 hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${allDone ? 'opacity-10 cursor-not-allowed' : ''}`}
            >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {getLabel()}
            </button>
        </div>
    );
};

export default CombinedSubmitToMaraekat;
