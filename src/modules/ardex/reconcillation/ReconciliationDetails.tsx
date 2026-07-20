import React from 'react';
import { Building2, Receipt, Wallet, AlertCircle, CheckCircle2, Clock, CreditCard, Percent, Landmark, FileText, ArrowRightLeft, Check, X, Eye, AlertTriangle, TriangleAlert } from 'lucide-react';
import { htmlData } from './data/html';
interface ReconciliationDetailsProps {
    data: any;
    isLoading: boolean;
    selectedInvoiceId?: string | null;
}

export const ReconciliationDetails: React.FC<ReconciliationDetailsProps> = ({ data, isLoading, selectedInvoiceId }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Loading reconciliation details...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mb-4 text-gray-300" />
                <p className="font-medium">No reconciliation data available</p>
                <p className="text-sm mt-1 text-gray-400">Select an invoice to view its reconciliation details.</p>
            </div>
        );
    }

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '₹0';
        return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const { vendor, proposalTable = [], aiVerificationTable = [] } = data;

    const selectedProposal = proposalTable?.find((item: any) => item.proposalLineId === selectedInvoiceId) || proposalTable?.[0];
    const selectedAiVerification = aiVerificationTable?.find((item: any) => item.proposalLineId === selectedInvoiceId || item.recordId === selectedInvoiceId) || aiVerificationTable?.[0];

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] overflow-y-auto w-full">
            <div className="p-3  mx-auto w-full space-y-3">
                {/* Header & Vendor Details */}
                <div className="bg-white rounded-xl border border-gray-200 transition-shadow p-4">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                                <Building2 size={20} />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-lg font-semibold text-gray-900 truncate">{vendor?.vendorName || 'Unknown Vendor'}</h2>

                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                                    <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-600">
                                        <span className="font-medium">Code:</span> {vendor?.vendorCode}
                                    </span>

                                    <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-600">
                                        <span className="font-medium">GSTIN:</span> {vendor?.gstin || 'N/A'}
                                    </span>

                                    {vendor?.msmeVendor && <span className="rounded-md bg-emerald-100 px-2 py-1 text-emerald-700 font-medium">MSME</span>}
                                </div>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="rounded-xl bg-blue-50 border border-blue-100 px-5 py-3 text-right shrink-0">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Total Payable</p>

                            <p className="text-2xl font-bold text-blue-700">{formatCurrency(vendor?.vendorPayableAmount)}</p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                            <Landmark size={18} className="text-indigo-500" />
                            <div>
                                <p className="text-[11px] text-gray-500">Bank Key</p>
                                <p className="text-sm font-semibold text-gray-900">{vendor?.bankKey || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                            <CreditCard size={18} className="text-indigo-500" />
                            <div>
                                <p className="text-[11px] text-gray-500">Account</p>
                                <p className="text-sm font-semibold text-gray-900">{vendor?.accountNumber || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                            <Percent size={18} className="text-orange-500" />
                            <div>
                                <p className="text-[11px] text-gray-500">TDS</p>
                                <p className="text-sm font-semibold text-gray-900">{vendor?.tdsRate ? `${(vendor.tdsRate * 100).toFixed(4)}%` : '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                            <Percent size={18} className="text-rose-500" />
                            <div>
                                <p className="text-[11px] text-gray-500">CD</p>
                                <p className="text-sm font-semibold text-gray-900">{vendor?.cdRate ? `${(vendor.cdRate * 100).toFixed(2)}%` : '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Proposal Details Section */}
                {selectedProposal && (
                    <div className="bg-white rounded-2xl shadow-sm  relative z-20">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                    <FileText size={18} />
                                </div>
                                <h3 className="text-md font-bold text-gray-900">Proposal Details</h3>
                            </div>
                            <div className="group relative">
                                <button className="p-1.5 rounded-md text-sm text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-2">
                                    View <Eye size={20} />
                                </button>
                                <div className="absolute right-0 bottom-full mb-2 w-[740px] max-h-[400px] overflow-auto bg-white rounded-xl shadow-2xl border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-bottom-right">
                                    <div className="p-4" dangerouslySetInnerHTML={{ __html: htmlData }} />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-gray-50/30">
                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    MSME <span className="text-[10px] text-gray-400 ml-1">MASTER</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">{vendor?.msme ? 'Yes' : 'No'}</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    SAP Document No <span className="text-[10px] text-blue-500 ml-1">PROPOSAL</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">{selectedProposal.sapDocumentNo || '-'}</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Invoice No <span className="text-[10px] text-blue-500 ml-1">PROPOSAL</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">{selectedProposal.invoiceNo || '-'}</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Invoice Date <span className="text-[10px] text-blue-500 ml-1">PROPOSAL</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedProposal.invoiceDate ? new Date(selectedProposal.invoiceDate).toLocaleDateString('en-GB').replace(/\//g, '.') : '-'}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Invoice Gross Value <span className="text-[10px] text-blue-500 ml-1">PROPOSAL</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedProposal.invoiceValue !== undefined ? formatCurrency(selectedProposal.invoiceValue).replace('₹', '').trim() : '-'}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Agreed Days <span className="text-[10px] text-blue-500 ml-1">PROPOSAL</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">{selectedProposal.agreedDays || '-'}</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Payment Due Date <span className="text-[10px] text-blue-500 ml-1">PROPOSAL</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900 flex items-center gap-1.5">
                                    {selectedProposal.paymentDueDate ? new Date(selectedProposal.paymentDueDate).toLocaleDateString('en-GB').replace(/\//g, '.') : '-'}
                                    <AlertTriangle size={16} className="text-rose-500" />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    CD % <span className="text-[10px] text-blue-500 ml-1">PROPOSAL</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">{selectedProposal.cdPercentage !== undefined ? `${selectedProposal.cdPercentage}%` : '0%'}</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    CD Deducted <span className="text-[10px] text-blue-500 ml-1">PROPOSAL</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedProposal.cdDeducted !== undefined ? formatCurrency(selectedProposal.cdDeducted).replace('₹', '').trim() : '0.00'}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Net Value <span className="text-[10px] text-blue-500 ml-1">PROPOSAL</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900 flex items-center gap-1.5">
                                    {selectedProposal.netValue !== undefined ? formatCurrency(selectedProposal.netValue).replace('₹', '').trim() : '-'}
                                    {selectedProposal.hasMismatch && <span className="text-amber-600 font-black">- *</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Verification Section */}
                {selectedAiVerification && (
                    <div className="bg-white rounded-2xl shadow-sm  overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <CheckCircle2 size={18} />
                                </div>
                                <h3 className="text-md font-bold text-gray-900">AI Verification Details</h3>
                            </div>
                        </div>

                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-gray-50/30">
                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    SAP Document No <span className="text-[10px] text-blue-500 ml-1">PROPOSAL</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">{selectedAiVerification.sapDocumentNo || '-'}</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Invoice No <span className="text-[10px] text-emerald-500 ml-1">MATCHED</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">{selectedAiVerification.invoiceNo || '-'}</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Invoice Date <span className="text-[10px] text-emerald-500 ml-1">MATCHED</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedAiVerification.invoiceDate ? new Date(selectedAiVerification.invoiceDate).toLocaleDateString('en-GB').replace(/\//g, '.') : '-'}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Basic Invoice Value (a) <span className="text-[10px] text-gray-400 ml-1">INVOICE (+)</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedAiVerification.basicInvoiceValue !== undefined ? formatCurrency(selectedAiVerification.basicInvoiceValue).replace('₹', '').trim() : '-'}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Freight Inward (b) <span className="text-[10px] text-gray-400 ml-1">INVOICE (+)</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedAiVerification.freightInwardValue !== undefined ? formatCurrency(selectedAiVerification.freightInwardValue).replace('₹', '').trim() : '0.00'}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    CD Deducted <span className="text-[10px] text-gray-400 ml-1">INVOICE (-)</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedAiVerification.invoiceCdDeducted !== undefined ? formatCurrency(selectedAiVerification.invoiceCdDeducted).replace('₹', '').trim() : '0.00'}
                                    <span className="text-[11px] text-gray-400 ml-1.5 font-normal">({selectedAiVerification.invoiceCdPercentage || 2}%)</span>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Others <span className="text-[10px] text-gray-400 ml-1">INVOICE (+)</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedAiVerification.others !== undefined ? formatCurrency(selectedAiVerification.others).replace('₹', '').trim() : '0.00'}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl  shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    GST (c) <span className="text-[10px] text-gray-400 ml-1">INVOICE (+)</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedAiVerification.gst !== undefined ? formatCurrency(selectedAiVerification.gst).replace('₹', '').trim() : '0.00'}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Gross Value <span className="text-[10px] text-gray-400 ml-1">INVOICE</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedAiVerification.grossValueOfInvoice !== undefined ? formatCurrency(selectedAiVerification.grossValueOfInvoice).replace('₹', '').trim() : '-'}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Invoice Value <span className="text-[10px] text-purple-500 ml-1">COMPUTED (a+b+c-CD=d)</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedAiVerification.computedInvoiceValue !== undefined
                                        ? formatCurrency(selectedAiVerification.computedInvoiceValue).replace('₹', '').trim()
                                        : selectedAiVerification.grossValueOfInvoice !== undefined
                                          ? formatCurrency(selectedAiVerification.grossValueOfInvoice).replace('₹', '').trim()
                                          : '-'}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Extracted TDS <span className="text-[10px] text-gray-400 ml-1">INVOICE</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedAiVerification.extractedTds !== undefined ? formatCurrency(selectedAiVerification.extractedTds).replace('₹', '').trim() : '0.00'}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Calculated TDS (e) <span className="text-[10px] text-purple-500 ml-1">COMPUTED (-)</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedAiVerification.calculatedTds !== undefined ? formatCurrency(selectedAiVerification.calculatedTds).replace('₹', '').trim() : '0.00'}
                                    <span className="text-[11px] font-medium text-gray-400 ml-1.5">
                                        ({selectedAiVerification.calculatedTdsPercentage !== undefined ? selectedAiVerification.calculatedTdsPercentage : 0.1}%)
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    CD Deducted (f) <span className="text-[10px] text-blue-500 ml-1">PROPOSAL (-)</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                    {selectedAiVerification.cdDeducted !== undefined ? formatCurrency(selectedAiVerification.cdDeducted).replace('₹', '').trim() : '0.00'}
                                    <span className="text-[11px] text-gray-400 ml-1.5 font-normal">({selectedAiVerification.cdPercentage || 0}%)</span>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Adjustments <span className="text-[10px] text-gray-400 ml-1">INPUT (+/-)</span>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        className="w-24 h-8 px-2 text-base font-semibold text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm"
                                        defaultValue={selectedAiVerification.adjustments || 0}
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Net Value (d-e-f) <span className="text-[10px] text-emerald-500 ml-1">MATCHED</span>
                                </div>
                                <div className="text-base font-semibold text-gray-900 flex items-center gap-1.5">
                                    {selectedAiVerification.netValueToBePaid !== undefined ? formatCurrency(selectedAiVerification.netValueToBePaid).replace('₹', '').trim() : '-'}
                                    {selectedAiVerification.hasMismatch !== false && <span className="text-amber-600 font-black">- *</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
