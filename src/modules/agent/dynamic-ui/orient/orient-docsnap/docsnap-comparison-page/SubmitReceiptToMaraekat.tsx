import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useToastStore } from '../../../../../../components/toast/ToastStore';
import { config } from '../../../../../../config/default';
import { format } from 'date-fns';

interface SubmitReceiptToMaraekatProps {
    order: any;
    extractedData: any;
}

const SubmitReceiptToMaraekat: React.FC<SubmitReceiptToMaraekatProps> = ({ order, extractedData }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToastStore();

    console.log('order', order);
    console.log('extractedData', extractedData);

    const handleSubmit = async () => {
        const sampleReceipts = [
            {
                bank_name: {
                    value: 'okicici',
                    page: 10,
                    wordIndexes: [2069],
                    bbox: {
                        x_min: 0.2279202279,
                        y_min: 0.3475,
                        x_max: 0.2927350427,
                        y_max: 0.3605
                    },
                    confidence: 0.9863
                },
                amount: {
                    value: '37,401.00',
                    page: 10,
                    wordIndexes: [2064],
                    bbox: {
                        x_min: 0.3739316239,
                        y_min: 0.2615,
                        x_max: 0.5163817664,
                        y_max: 0.2775
                    },
                    confidence: 0.9737
                },
                cheque_date: {
                    value: '06/01/2026',
                    page: 10,
                    wordIndexes: [2050, 2051, 2053],
                    bbox: {
                        x_min: 0.1809116809,
                        y_min: 0.1845,
                        x_max: 0.287037037,
                        y_max: 0.1945
                    },
                    confidence: 0.9843666666666667
                },
                drawn_on: {
                    value: '',
                    page: 10,
                    wordIndexes: []
                },
                check_number: {
                    value: '',
                    page: 10,
                    wordIndexes: []
                },
                bank_branch: {
                    value: '',
                    page: 10,
                    wordIndexes: []
                }
            }
        ];
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
            const formatForMaraekat = (dateStr: string) => {
                if (!dateStr) return '';
                const parseDate = new Date(dateStr);
                if (!isNaN(parseDate.getTime())) {
                    return format(parseDate, 'dd-MMM-yyyy').toUpperCase();
                }
                return dateStr.toUpperCase();
            };

            if (receipts.length === 0) {
                toast.error('No receipts found to submit');
                setIsSubmitting(false);
                return;
            }

            let hasError = false;
            let successCount = 0;

            for (const receipt of receipts) {
                const payload = {
                    BRANCHCODE: 'BANH',
                    BOOKINGTYPE: orderType === 'sell' ? 'SALE' : orderType === 'buy' ? 'PURCHASE' : orderType?.toUpperCase() || '',
                    BOOKINGNO: String(bookingNo).toUpperCase(),
                    EONBOOKINGNO: String(eonBookingNumber).toUpperCase(),
                    CASHBANK: String(receipt.mode_of_transaction?.value || 'CASH').toUpperCase(),
                    CHQNO: String(receipt.cheque_number?.value || receipt.check_number?.value || '99').toUpperCase(),
                    CHQDT: formatForMaraekat(String(receipt.cheque_date?.value || '')),
                    DRAWNON: String(receipt.drawn_on?.value || receipt.bank_name?.value || '').toUpperCase(),
                    BANKBRANCH: String(receipt.branch?.value || receipt.bank_branch?.value || '').toUpperCase(),
                    AMOUNT: String(receipt.amount?.value || '').replace(/[^\d.]/g, '')
                };

                // Step 2: Push Receipt
                const response = await fetch(`${config.workflowService}/api/orient/receipt-submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                        // Authorization: `Bearer ${authToken}`
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
            } else if (successCount > 0) {
                toast.success(`Partially submitted: ${successCount} receipt(s) successful, some failed.`);
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
            Rec Pay Submit
        </button>
    );
};

export default SubmitReceiptToMaraekat;
