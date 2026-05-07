import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useToastStore } from '../../../../../../components/toast/ToastStore';
import { config } from '../../../../../../config/default';
import { formatDateForMaraekat } from './utils/getMaraekatPayload';
import { Order } from '../types';

export interface SubmitReceiptToMaraekatProps {
    order: Order;
    extractedData: any;
    onOrderUpdate?: (updatedOrder: any) => void;
}

export const useRecPaySubmit = ({ order, extractedData, onOrderUpdate }: SubmitReceiptToMaraekatProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToastStore();

    const handleSubmit = async (orderOverride?: Order): Promise<boolean> => {
        setIsSubmitting(true);
        const effectiveOrder = orderOverride || order;
        try {
            const eonBookingNumber = effectiveOrder?.maraekatDetails?.eonBookingNumber;
            const bookingNo = effectiveOrder?.maraekatDetails?.bookingNumber;
            const orderType: string = effectiveOrder?.orderDetails?.orderType;

            if (!eonBookingNumber || !bookingNo) {
                toast.error('Booking Number or EON Booking Number is missing');
                setIsSubmitting(false);
                return false;
            }

            const receipts = extractedData?.receipts || [];

            const loginRes = await fetch(`${config.workflowService}/api/orient/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!loginRes.ok) {
                toast.error(`Login failed: ${loginRes.status}`);
                setIsSubmitting(false);
                return false;
            }

            const loginData = await loginRes.json();
            const authToken = loginData?.Result;

            if (!authToken) {
                toast.error('No auth token received from login');
                setIsSubmitting(false);
                return false;
            }

            if (receipts.length === 0) {
                toast.error('No receipts found to submit');
                setIsSubmitting(false);
                return false;
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
                    const categorisedAccountNumbers = {
                        AHMD: {
                            '914020023991846': 'AXIS846',
                            '00000035782412743': 'SBI743'
                        },

                        AMTR: {
                            '916020014634868': 'AXIS868'
                        },

                        BANH: {
                            '919020074095783': 'AXIS5783',
                            '12262090000050': 'HDFC'
                        },

                        BANW: {
                            '923020070570106': 'AXIS70106'
                        },

                        BELG: {
                            '914020012417461': 'AXIS',
                            '02532090000040': 'HDFC0040'
                        },

                        CALCT: {
                            '914020013039000': 'AXIS'
                        },

                        CHAD: {
                            '200999478501': 'INDUSJNR'
                        },

                        CHN: {
                            '914020006153764': 'AXIS',
                            '002281400006919': 'YESBNK06919'
                        },

                        COARP: {
                            '200999478532': 'INDUSCOARP'
                        },

                        COMB: {
                            '919020084679889': 'AXIS889'
                        },

                        COMGR: {
                            '913020024767106': 'AXISEXPO',
                            '15122090000014': 'HDFC0014',
                            '002281400006929': 'YESBNK06929'
                        },

                        DLHI: {
                            '914020021605910': 'AXISDLHI',
                            '50200011742914': 'HDFC2914'
                        },

                        GURG: {
                            '200999478518': 'INDUS8518',
                            '002281400006949': 'YESBNK06949'
                        },

                        HYD: {
                            '916020029890684': 'AXI684',
                            '16272560000035': 'HDFC0035'
                        },

                        JLDR: {
                            '916020014438806': 'AXIS806',
                            '2999002100042248': 'PNB2248',
                            '04751100000976': 'PSIB976',
                            '00000065255370455': 'SBP455',
                            '002281400006939': 'YESBNK06939'
                        },

                        KOL: {
                            '913020049024154': 'AXIS',
                            '50200009566772': 'HDFC6772'
                        },

                        KOLM: {
                            '911020022168048': 'AXIS'
                        },

                        KTM: {
                            '913020055629086': 'AXIS'
                        },

                        MNGLR: {
                            '914020023991888': 'AXIS888'
                        },

                        MUMD: {
                            '015020110000301': 'BOI301',
                            '50200119383552': 'HDFC83552'
                        },

                        MUMV: {
                            '913020038917603': 'AXIS',
                            '03582090000031': 'HDFC0031',
                            '002281400006886': 'YESBNK06886'
                        },

                        PUNE: {
                            '917020063654511': 'AXI511'
                        },

                        SURAT: {
                            '01880200001335': 'BOB1335',
                            '200999478525': 'INDUS8525'
                        },

                        THRI: {
                            '914020012500615': 'AXISTHRI',
                            '06702090000016': 'HDFC0016'
                        },

                        TVM: {
                            '914020011087568': 'AXISBANKTVM'
                        },

                        VADO: {
                            '917020042844012': 'AXIS4012'
                        },

                        HOT: {
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
                            '002281400006896': 'YESFINTIBA'
                        }
                    };

                    const bankAccounts = categorisedAccountNumbers[sessionStorage.getItem('branch_code') as keyof typeof categorisedAccountNumbers];

                    // const bankAccounts = {
                    //     '081010200019813': 'AXIS9813',
                    //     '009010200015039': 'AXISBLRMGROAD',
                    //     '914020014608384': 'COMMAXIS',
                    //     '918020069425192': 'ONLINEAXIS192',
                    //     '920020053547564': 'AXISEEFC564',
                    //     '510101005983524': 'CORPBANK3524',
                    //     '11530200023482': 'FEDERAL482',
                    //     '01332320001240': 'HDFC1240',
                    //     '041505000723': 'ICICI',
                    //     '116205000517': 'ICICIKOCHI',
                    //     '10020841026': 'IDFC1026',
                    //     '200000979511': 'INDUSIND',
                    //     '204011032315': 'INGVY',
                    //     '4762000100174701': 'KAR701',
                    //     '20062019000134': 'SBM0134',
                    //     '67341643312': 'SBT',
                    //     '0087073000001784': 'SIB784',
                    //     '019784000000068': 'YESB',
                    //     '002281400006909': 'YESBNK06909',
                    //     '002281400006896': 'YESFINTIBA',
                    //     '914020023991846': 'AXIS846',
                    //     '00000035782412743': 'SBI743',
                    //     '916020014634868': 'AXIS868',
                    //     '919020074095783': 'AXIS5783',
                    //     '12262090000050': 'HDFC',
                    //     '923020070570106': 'AXIS70106',
                    //     '914020012417461': 'AXIS',
                    //     '02532090000040': 'HDFC0040',
                    //     '914020013039000': 'AXIS',
                    //     '200999478501': 'INDUSJNR',
                    //     '914020006153764': 'AXIS',
                    //     '002281400006919': 'YESBNK06919',
                    //     '200999478532': 'INDUSCOARP',
                    //     '919020084679889': 'AXIS889',
                    //     '913020024767106': 'AXISEXPO',
                    //     '15122090000014': 'HDFC0014',
                    //     '002281400006929': 'YESBNK06929',
                    //     '914020021605910': 'AXISDLHI',
                    //     '50200011742914': 'HDFC2914',
                    //     '200999478518': 'INDUS8518',
                    //     '002281400006949': 'YESBNK06949',
                    //     '916020029890684': 'AXI684',
                    //     '16272560000035': 'HDFC0035',
                    //     '916020014438806': 'AXIS806',
                    //     '2999002100042248': 'PNB2248',
                    //     '04751100000976': 'PSIB976',
                    //     '00000065255370455': 'SBP455',
                    //     '002281400006939': 'YESBNK06939',
                    //     '913020049024154': 'AXIS',
                    //     '50200009566772': 'HDFC6772',
                    //     '911020022168048': 'AXIS',
                    //     '913020055629086': 'AXIS',
                    //     '914020023991888': 'AXIS888',
                    //     '015020110000301': 'BOI301',
                    //     '50200119383552': 'HDFC83552',
                    //     '913020038917603': 'AXIS',
                    //     '03582090000031': 'HDFC0031',
                    //     '002281400006886': 'YESBNK06886',
                    //     '917020063654511': 'AXI511',
                    //     '01880200001335': 'BOB1335',
                    //     '200999478525': 'INDUS8525',
                    //     '914020012500615': 'AXISTHRI',
                    //     '06702090000016': 'HDFC0016',
                    //     '914020011087568': 'AXISBANKTVM',
                    //     '917020042844012': 'AXIS4012'
                    // };

                    console.log('receipt.account_number', `${receipt.account_number}`);
                    console.log('bankAccounts[receipt.account_number as keyof typeof bankAccounts]', bankAccounts[`${receipt.account_number?.value}` as keyof typeof bankAccounts]);

                    if (effectiveOrder.orderDetails.branchAccountNumber) {
                    }
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

                // Push Receipt
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
                try {
                    const updatePayload = {
                        maraekatDetails: {
                            ...effectiveOrder.maraekatDetails,
                            receiptPayStatus: 'submitted'
                        }
                    };
                    const res = await fetch(`${config.workflowService}/api/orders/${effectiveOrder.orderDetails.orderNumber}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatePayload)
                    });
                    if (res.ok && onOrderUpdate) {
                        onOrderUpdate({
                            ...effectiveOrder,
                            maraekatDetails: {
                                ...effectiveOrder.maraekatDetails,
                                recPaySubmitted: true
                            }
                        });
                    }
                } catch (err) {
                    console.error('Failed to update order with receipt pay status:', err);
                }
                return true;
            } else if (hasError) {
                toast.error(`Failed to submit all receipts. ${successCount}/${receipts.length} successful.`);
                return false;
            }
            return false;
        } catch (error: any) {
            console.error('Submit Receipt to Maraekat error:', error);
            toast.error(error.message || 'An unexpected error occurred during submission');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAlreadySubmitted = order?.maraekatDetails?.recPaySubmitted;

    return { isSubmitting, handleSubmit, isAlreadySubmitted };
};

const SubmitReceiptToMaraekat: React.FC<SubmitReceiptToMaraekatProps> = ({ order, extractedData, onOrderUpdate }) => {
    const { isSubmitting, handleSubmit, isAlreadySubmitted } = useRecPaySubmit({ order, extractedData, onOrderUpdate });

    return (
        <button
            onClick={isAlreadySubmitted ? undefined : () => handleSubmit(undefined)}
            disabled={isSubmitting || isAlreadySubmitted}
            className={`flex items-center justify-center gap-2 rounded-md border border-gray-400 bg-white px-3 py-1 text-base font-light text-gray-500 transition-all duration-200 ease-in-out hover:border-blue-500 hover:bg-blue-400 hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${isAlreadySubmitted ? 'opacity-10 cursor-not-allowed ' : ''}`}
        >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isAlreadySubmitted ? 'Rec Pay Submitted' : 'Submit Rec Pay'}
        </button>
    );
};

export default SubmitReceiptToMaraekat;
