import React from 'react';
import { Clock, User, Mail, Phone, Hash, Building2, Edit, Trash2 } from 'lucide-react';
import { Order } from './types';
import { GBtn } from './OrderCardPrimitives';
import { convertToIst } from '../../../../../global-utils/convert-date-format';

// ── Info chip helper ──────────────────────────────────────────

interface InfoChip {
    icon: React.ReactNode | null;
    val: React.ReactNode;
    hide?: boolean;
}

const LabelValue: React.FC<{ label: string; value: React.ReactNode; bold?: boolean }> = ({ label, value, bold }) => (
    <>
        <span className="text-gray-400 font-medium mr-[3px]">{label}:</span>{' '}
        <span className={`text-gray-600 ${bold ? 'font-extrabold' : 'font-bold'}`}>{value}</span>
    </>
);

function buildInfoChips(order: Order): InfoChip[] {
    const od = order.orderDetails;
    const ud = order.userDetails;

    const chips: InfoChip[] = [
        { icon: <User size={12} className="text-gray-400" />, val: ud.name },
        { icon: <Mail size={12} className="text-gray-400" />, val: ud.email },
        { icon: <Phone size={12} className="text-gray-400" />, val: ud.phone },
    ];

    if (ud.panNumber) {
        chips.push({ icon: <Hash size={12} className="text-gray-400" />, val: `PAN: ${ud.panNumber}` });
    }

    chips.push({ icon: <Building2 size={12} className="text-gray-400" />, val: od.branch });
    chips.push({ icon: null, val: <LabelValue label="Branch ID" value={od.branchId} /> });
    chips.push({ icon: null, val: <LabelValue label="Actual" value={`₹${od.actualAmount.toLocaleString()}`} />, hide: !od.actualAmount });
    chips.push({ icon: null, val: <LabelValue label="Total" value={`₹${od.totalAmount.toLocaleString()}`} bold />, hide: !od.totalAmount });

    if (od.paymentType) chips.push({ icon: null, val: <LabelValue label="Payment" value={od.paymentType} /> });
    if (od.deliveryMode) chips.push({ icon: null, val: <LabelValue label="Delivery" value={od.deliveryMode} /> });
    if (od.deliveryCharge !== undefined) chips.push({ icon: null, val: <LabelValue label="Delivery Charge" value={`₹${od.deliveryCharge}`} /> });
    if (od.handlingCharges !== undefined) chips.push({ icon: null, val: <LabelValue label="Handling" value={`₹${od.handlingCharges}`} /> });
    if (od.purpose) chips.push({ icon: null, val: <LabelValue label="Purpose" value={od.purpose} /> });
    if (od.documentUploadTime) {
        chips.push({ icon: <Clock size={12} className="text-gray-400" />, val: <LabelValue label="Uploaded" value={od.documentUploadTime} /> });
    }

    return chips;
}

// ── Status label ──────────────────────────────────────────────

function getStatusLabel(status: string): string {
    if (status === 'extracted') return 'Review Pending';
    if (status === 'pending') return 'Extraction Pending';
    return status;
}

// ── Header Props ──────────────────────────────────────────────

interface OrderCardHeaderProps {
    order: Order;
    status: { text: string; bg: string; border: string; dot: string };
    docCounts: { online: number; email: number; manual: number; total: number };
    showOnline: boolean;
    onEdit?: (order: Order) => void;
    onDelete?: () => void;
}

// ── Component ─────────────────────────────────────────────────

const OrderCardHeader: React.FC<OrderCardHeaderProps> = ({ order, status, docCounts, showOnline, onEdit, onDelete }) => {
    const od = order.orderDetails;
    const chips = buildInfoChips(order);

    return (
        <div className="flex items-start justify-between gap-4 px-[22px] pt-[18px] pb-4 border-b border-gray-100">
            <div>
                {/* Title row */}
                <div className="flex items-center gap-2 flex-wrap mb-[6px]">
                    <span className="text-[22px] font-extrabold text-gray-900 tracking-tight">{od.orderNumber}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-extrabold ${status.text} ${status.bg} border ${status.border} px-2 py-[3px] rounded-full`}>
                        <span className={`w-[5px] h-[5px] rounded-full ${status.dot} inline-block`} />
                        {getStatusLabel(od.orderStatus)}
                    </span>
                    <span className="text-xs font-extrabold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-[3px] rounded-full">{od.orderType.toUpperCase()}</span>
                    <span className="text-xs font-extrabold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-[3px] rounded-full">
                        {(Array.isArray(od.productType) ? od.productType.join(', ') : String(od.productType || '')).toUpperCase()}
                    </span>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-1 text-[13px] text-gray-400 mb-[10px]">
                    <Clock size={13} className="text-gray-400" />
                    {order.createdAt ? convertToIst(order.createdAt) : 'N/A'}
                    <span className="mx-1.5">•</span>
                    <Building2 size={13} className="text-gray-400" />
                    {od.location || od.branch}
                    <span className="mx-1.5">•</span>
                    <span className="text-gray-500 font-semibold">{od.documentSubmitStatus} Submission</span>
                </div>

                {/* Info chips */}
                <div className="flex gap-2 flex-wrap">
                    {chips.map(({ icon, val, hide }, idx) => {
                        if (hide) return null;
                        return (
                            <div key={idx} className="inline-flex items-center gap-[5px] bg-gray-50 border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] font-semibold text-gray-600">
                                {icon}
                                {val}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right side: actions + doc counts */}
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                    {onEdit && od.orderStatus !== 'submitted' && (
                        <GBtn colorClass="text-blue-600" borderClass="border-blue-200" hoverClass="hover:bg-blue-50" icon={<Edit size={11} />} label="Edit" onClick={() => onEdit(order)} />
                    )}
                    {onDelete && (
                        <GBtn colorClass="text-red-600" borderClass="border-red-200" hoverClass="hover:bg-red-50" icon={<Trash2 size={11} />} label="Delete" onClick={onDelete} />
                    )}
                </div>
                <div className="flex gap-[7px]">
                    {[
                        { n: docCounts.online, l: 'ONLINE', dark: false, show: showOnline },
                        { n: docCounts.email, l: 'EMAIL', dark: false, show: true },
                        { n: docCounts.manual, l: 'MANUAL', dark: false, show: true },
                        { n: docCounts.total, l: 'TOTAL', dark: true, show: true }
                    ].map(({ n, l, dark, show }) => {
                        if (!show) return null;
                        return (
                            <div key={l} className={`rounded-[10px] py-[9px] px-[13px] text-center min-w-[58px] border ${dark ? 'bg-[#012D56] border-gray-900' : 'bg-gray-50 border-gray-200'}`}>
                                <div className={`text-2xl font-extrabold leading-none ${dark ? 'text-white' : 'text-gray-900'}`}>{n}</div>
                                <div className={`text-[11px] font-bold tracking-[0.07em] mt-0.5 ${dark ? 'text-white/45' : 'text-gray-400'}`}>{l}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OrderCardHeader;
