import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useToastStore } from '../../../../../../components/toast/ToastStore';
import { config } from '../../../../../../config/default';
import { format } from 'date-fns';
import { formatDateForMaraekat } from './utils/getMaraekatPayload';

interface SubmitReceiptToMaraekatProps {
    order: any;
    extractedData: any;
    onOrderUpdate?: (updatedOrder: any) => void;
}

const SubmitReceiptToMaraekat: React.FC<SubmitReceiptToMaraekatProps> = ({ order, extractedData, onOrderUpdate }) => {
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
                    // return 'SBI743';
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
                    const bankAccounts = {
                        '081010200019813': 'AXIS9813',
                        '009010200015039': 'AXISBLRMGROAD',
                        '914020014608384': 'COMMAXIS',
                        '918020069425192': 'ONLINEAXIS192',
                        '920020053547564': 'AXISEEFC564',
                        '510101005983524': 'CORPBANK3524',
                        '11530200023482': 'FEDERAL482',
                        '01332320001240': 'HDFC1240',
                        '041505000723': 'ICICI',
                        '116205000517': 'ICICIKOCHI',
                        '10020841026': 'IDFC1026',
                        '200000979511': 'INDUSIND',
                        '204011032315': 'INGVY',
                        '4762000100174701': 'KAR701',
                        '20062019000134': 'SBM0134',
                        '67341643312': 'SBT',
                        '0087073000001784': 'SIB784',
                        '019784000000068': 'YESB',
                        '002281400006909': 'YESBNK06909',
                        '002281400006896': 'YESFINTIBA',
                        '914020023991846': 'AXIS846',
                        '00000035782412743': 'SBI743',
                        '916020014634868': 'AXIS868',
                        '919020074095783': 'AXIS5783',
                        '12262090000050': 'HDFC',
                        '923020070570106': 'AXIS70106',
                        '914020012417461': 'AXIS',
                        '02532090000040': 'HDFC0040',
                        '914020013039000': 'AXIS',
                        '200999478501': 'INDUSJNR',
                        '914020006153764': 'AXIS',
                        '002281400006919': 'YESBNK06919',
                        '200999478532': 'INDUSCOARP',
                        '919020084679889': 'AXIS889',
                        '913020024767106': 'AXISEXPO',
                        '15122090000014': 'HDFC0014',
                        '002281400006929': 'YESBNK06929',
                        '914020021605910': 'AXISDLHI',
                        '50200011742914': 'HDFC2914',
                        '200999478518': 'INDUS8518',
                        '002281400006949': 'YESBNK06949',
                        '916020029890684': 'AXI684',
                        '16272560000035': 'HDFC0035',
                        '916020014438806': 'AXIS806',
                        '2999002100042248': 'PNB2248',
                        '04751100000976': 'PSIB976',
                        '00000065255370455': 'SBP455',
                        '002281400006939': 'YESBNK06939',
                        '913020049024154': 'AXIS',
                        '50200009566772': 'HDFC6772',
                        '911020022168048': 'AXIS',
                        '913020055629086': 'AXIS',
                        '914020023991888': 'AXIS888',
                        '015020110000301': 'BOI301',
                        '50200119383552': 'HDFC83552',
                        '913020038917603': 'AXIS',
                        '03582090000031': 'HDFC0031',
                        '002281400006886': 'YESBNK06886',
                        '917020063654511': 'AXI511',
                        '01880200001335': 'BOB1335',
                        '200999478525': 'INDUS8525',
                        '914020012500615': 'AXISTHRI',
                        '06702090000016': 'HDFC0016',
                        '914020011087568': 'AXISBANKTVM',
                        '917020042844012': 'AXIS4012'
                    };
                    console.log('receipt.account_number', `${receipt.account_number}`);
                    console.log('bankAccounts[receipt.account_number as keyof typeof bankAccounts]', bankAccounts[`${receipt.account_number?.value}` as keyof typeof bankAccounts]);

                    if (bankAccounts[`${receipt.account_number?.value}` as keyof typeof bankAccounts]) {
                        return bankAccounts[`${receipt.account_number?.value}` as keyof typeof bankAccounts];
                    }

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
                // disable button after success
                toast.success(`Successfully submitted ${successCount} receipt(s) to Maraekat!`);
                try {
                    const updatePayload = {
                        maraekatDetails: {
                            ...order.maraekatDetails,
                            receiptPayStatus: 'submitted'
                        }
                    };
                    const res = await fetch(`${config.workflowService}/api/orders/${order.orderDetails.orderNumber}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatePayload)
                    });
                    if (res.ok && onOrderUpdate) {
                        onOrderUpdate({
                            ...order,
                            maraekatDetails: {
                                ...order.maraekatDetails,
                                receiptPayStatus: 'submitted'
                            }
                        });
                    }
                } catch (err) {
                    console.error('Failed to update order with receipt pay status:', err);
                }
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

    const isAlreadySubmitted = order?.maraekatDetails?.receiptPayStatus === 'submitted';

    return (
        <button
            onClick={isAlreadySubmitted ? undefined : handleSubmit}
            disabled={isSubmitting || isAlreadySubmitted}
            className={`flex items-center justify-center gap-2 rounded-md border border-gray-400 bg-white px-3 py-1 text-base font-light text-gray-500 transition-all duration-200 ease-in-out hover:border-blue-500 hover:bg-blue-400 hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${isAlreadySubmitted ? 'opacity-10 cursor-not-allowed ' : ''}`}
        >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isAlreadySubmitted ? 'Rec Pay Submitted' : 'Submit Rec Pay'}
        </button>
    );
};

export default SubmitReceiptToMaraekat;
