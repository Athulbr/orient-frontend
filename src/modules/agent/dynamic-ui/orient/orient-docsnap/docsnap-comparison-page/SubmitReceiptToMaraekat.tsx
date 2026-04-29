import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useToastStore } from '../../../../../../components/toast/ToastStore';
import { config } from '../../../../../../config/default';
import { format } from 'date-fns';
import { formatDateForMaraekat } from './utils/getMaraekatPayload';

interface SubmitReceiptToMaraekatProps {
    order: any;
    extractedData: any;
}

const SubmitReceiptToMaraekat: React.FC<SubmitReceiptToMaraekatProps> = ({ order, extractedData }) => {
    // const sampleReceipts = [
    //     {
    //         amount: {
    //             value: '37,401.00',
    //             page: 10,
    //             wordIndexes: [2070],
    //             bbox: {
    //                 x_min: 0.3746438746,
    //                 y_min: 0.262,
    //                 x_max: 0.5163817664,
    //                 y_max: 0.278
    //             },
    //             confidence: 0.9733
    //         },
    //         cheque_date: {
    //             value: '06-Jan-2026',
    //             page: 10,
    //             wordIndexes: [2057, 2058, 2059],
    //             bbox: {
    //                 x_min: 0.1801994302,
    //                 y_min: 0.184,
    //                 x_max: 0.2884615385,
    //                 y_max: 0.194
    //             },
    //             confidence: 0.9746333333333334
    //         },
    //         receipt_type: {
    //             value: 'UPI collect',
    //             page: 10,
    //             wordIndexes: [2067, 2068],
    //             bbox: {
    //                 x_min: 0.1232193732,
    //                 y_min: 0.2625,
    //                 x_max: 0.245014245,
    //                 y_max: 0.2745
    //             },
    //             confidence: 0.9270499999999999
    //         },
    //         cheque_number: {
    //             value: '511',
    //             page: 10,
    //             wordIndexes: []
    //         },
    //         account_number: {
    //             value: '',
    //             page: 10,
    //             wordIndexes: []
    //         },
    //         bank_name: {
    //             value: 'HDFC Bank',
    //             page: 10,
    //             wordIndexes: [2094, 2095],
    //             bbox: {
    //                 x_min: 0.2336182336,
    //                 y_min: 0.7735,
    //                 x_max: 0.2834757835,
    //                 y_max: 0.7785
    //             },
    //             confidence: 0.70965
    //         }
    //     }
    // ];
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToastStore();

    // console.log('order', order);
    // console.log('extractedData', extractedData);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const eonBookingNumber = order?.maraekatDetails?.eonBookingNumber;
            const bookingNo = order?.maraekatDetails?.bookingNumber;
            const orderType = order?.orderDetails?.orderType;

            if (!eonBookingNumber || !bookingNo) {
                toast.error('Booking Number or EON Booking Number is missing');
                setIsSubmitting(false);
                return;
            }

            const receipts = extractedData?.receipts || [];
            // const receipts = sampleReceipts;

            // // Step 1: Login to get auth token
            const loginRes = await fetch(`${config.workflowService}/api/orient/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!loginRes.ok) {
                toast.error(`Login failed: ${loginRes.status}`);
                setIsSubmitting(false);
                return;
            }

            const loginData = await loginRes.json();
            const authToken = loginData?.Result;

            if (!authToken) {
                toast.error('No auth token received from login');
                setIsSubmitting(false);
                return;
            }

            // Helper to format date
            // const formatForMaraekat = (dateStr: string) => {
            //     if (!dateStr) return '';
            //     const parseDate = new Date(dateStr);
            //     if (!isNaN(parseDate.getTime())) {
            //         return format(parseDate, 'dd-MMM-yyyy').toUpperCase();
            //     }
            //     return dateStr.toUpperCase();
            // };

            if (receipts.length === 0) {
                toast.error('No receipts found to submit');
                setIsSubmitting(false);
                return;
            }

            let hasError = false;
            let successCount = 0;

            for (const receipt of receipts) {
                const getCashBank = (): string => {
                    const receiptType = receipt.receipt_type?.value?.trim().toUpperCase() ?? '';
                    const bankName = receipt.bank_name?.value?.trim().toUpperCase() ?? '';
                    console.log('receiptType', receiptType);
                    console.log('bankName', bankName);

                    // If receipt type is CHEQ, return empty string
                    if (receiptType.includes('CHEQ')) return '';

                    // If receipt type is UPI or SCAN, return QRHDFC or QRYESBANK based on bank name
                    if (receiptType.includes('UPI') || receiptType.includes('SCAN')) {
                        if (bankName.includes('HDFC')) {
                            return 'QRHDFC';
                        }
                        return 'QRYESBANK';
                    }

                    // If receipt type is NEFT, return NEFT
                    if (receiptType.includes('BANK')) return '';

                    return '';
                };
                const payload = {
                    BRANCHCODE: window.sessionStorage.getItem('branch_code') || '',
                    BOOKINGTYPE: orderType === 'sell' ? 'SALE' : orderType === 'buy' ? 'PURCHASE' : orderType?.toUpperCase() || '',
                    BOOKINGNO: String(bookingNo).toUpperCase(),
                    EONBOOKINGNO: String(eonBookingNumber).toUpperCase(),
                    CASHBANK: getCashBank().toUpperCase(),
                    CHQNO: String(receipt.cheque_number?.value || '').toUpperCase(),
                    CHQDT: formatDateForMaraekat(String(receipt.cheque_date?.value || '')).date,
                    DRAWNON: 'AAA',
                    BANKBRANCH: 'BBB',
                    AMOUNT: String(receipt.amount?.value || '').replace(/[^\d.]/g, '')
                };

                // Step 2: Push Receipt
                const response = await fetch(`${config.workflowService}/api/orient/receipt-submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    toast.error(`Receipt Submission API failed: ${response.status}`);
                    hasError = true;
                    continue;
                }

                const responseData = await response.json();
                console.log('Receipt Submit Response:', responseData);

                const resultItem = responseData?.Result?.[0];

                if (resultItem?.APISTATUS === 'FAILED') {
                    toast.error(`Submission failed: ${resultItem.ERRORDESC || 'Unknown error'}`);
                    hasError = true;
                } else {
                    successCount++;
                }
            }

            if (!hasError && successCount > 0) {
                toast.success(`Successfully submitted ${successCount} receipt(s) to Maraekat!`);
            } else if (hasError) {
                toast.error(`Failed to submit all receipts. ${successCount}/${receipts.length} successful.`);
            }
        } catch (error: any) {
            console.error('Submit Receipt to Maraekat error:', error);
            toast.error(error.message || 'An unexpected error occurred during submission');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-md border border-gray-400 bg-white px-3 py-1 text-base font-light text-gray-500 transition-all duration-200 ease-in-out hover:border-blue-500 hover:bg-blue-400 hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Rec Pay
        </button>
    );
};

export default SubmitReceiptToMaraekat;
