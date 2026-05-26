import React, { useState } from 'react';
import { FileText, Mail, UploadCloud, Link2, ArrowRight, Plus, Zap, Eye, RefreshCw, ArrowLeftRight, Trash2 } from 'lucide-react';
import GenericFileInput from '../../../../../components/DragAndDropFileInput';
import { DialogComponent } from '../../../../../components/DialogComponent';
import { Button } from '../../../../../components/Button';
import EmailLinkDialog from './EmailLinkDialog';
import { Order, FileItem } from './types';
import { config } from '../../../../../config/default';
import Spinner from '../../../../../components/Spinner';
import { DocsnapComparisonUI } from './docsnap-comparison-page';

// Extracted sub-components
import DocTile, { getFileType } from './DocTile';
import { STATUS_CONFIG, GBtn, ColIcon, ColCount, CurrencyMiniCard } from './OrderCardPrimitives';
import OrderCardHeader from './OrderCardHeader';

// ── Props ─────────────────────────────────────────────────────

interface OrderCardProps {
    order: Order;
    onLinkEmail: (orderNumber: number, emailId: string) => void;
    onUploadFiles: (orderNumber: number, files: File[]) => void;
    onRemoveUploadedFile: (orderNumber: number, fileIndex: number) => void;
    onRemoveWebDocument?: (orderNumber: number, fileIndex: number) => void;
    onRemoveEmailDocument?: (orderNumber: number, fileIndex: number) => void;
    onProceed: (orderNumber: number) => void;
    onEdit?: (order: Order) => void;
    onDelete?: (orderNumber: number) => void;
    isProceeding: boolean;
    isUploading?: boolean;
    onDocsnapOpen?: () => void;
    onDocsnapClose?: () => void;
    onOrderUpdate?: (updatedOrder: Order) => void;
}

// ── Component ─────────────────────────────────────────────────

const OrderCard: React.FC<OrderCardProps> = ({
    order,
    onLinkEmail,
    onUploadFiles,
    onRemoveUploadedFile,
    onRemoveWebDocument,
    onRemoveEmailDocument,
    onProceed,
    onEdit,
    onDelete,
    isProceeding,
    isUploading,
    onDocsnapOpen,
    onDocsnapClose,
    onOrderUpdate
}) => {
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [showUploader, setShowUploader] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showRecordDialog, setShowRecordDialog] = useState(false);

    const openRecordDialog = () => {
        setShowRecordDialog(true);
        onDocsnapOpen?.();
    };
    const closeRecordDialog = () => {
        setShowRecordDialog(false);
        onDocsnapClose?.();
    };

    // ── Derive file lists ─────────────────────────────────────
    const orderFiles: (FileItem & { index: number })[] = (order.webDocuments || []).map((doc, i) => {
        const url = doc.documentPages?.[0] || '';
        return { name: doc.documentName, url, type: getFileType(url), source: 'order' as const, pages: doc.documentPages || [], index: i };
    });

    const emailFiles: (FileItem & { index: number })[] = (order.emailDocuments || []).map((doc, i) => {
        const url = doc.documentPages?.[0] || '';
        return {
            name: doc.documentName,
            url,
            type: getFileType(url),
            source: 'email' as const,
            pages: doc.documentPages || [],
            index: i
        };
    });

    const uploadedFileItems: (FileItem & { index: number })[] = (order.manualDocuments || []).map((f, i) => {
        const url = f.documentPages?.[0] || '';
        return { name: f.documentName, url, type: getFileType(url), source: 'upload' as const, pages: f.documentPages || [], index: i };
    });

    const totalDocs = orderFiles.length + emailFiles.length + uploadedFileItems.length;
    const hasDocuments = totalDocs > 0;
    const status = STATUS_CONFIG[order.orderDetails.orderStatus.toUpperCase()] ?? STATUS_CONFIG.DEFAULT;
    const isOnline = (order.orderDetails?.documentSubmitStatus || '').toLowerCase() === 'online';

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="font-[DM_Sans,Segoe_UI,sans-serif] bg-white border border-gray-200 rounded-2xl overflow-hidden w-full shadow-lg shadow-gray-200/80">
            <div className={`h-[3px] bg-gradient-to-r ${status.stripe} to-transparent`} />

            {/* Header */}
            <OrderCardHeader
                order={order}
                status={status}
                docCounts={{ online: orderFiles.length, email: emailFiles.length, manual: uploadedFileItems.length, total: totalDocs }}
                showOnline={isOnline}
                onEdit={onEdit}
                onDelete={onDelete ? () => setShowDeleteConfirm(true) : undefined}
                onUploadComplete={newDocs => {
                    if (newDocs.length > 0) {
                        const updatedReceipts = [...(order.receipts || []), ...newDocs];
                        const updatedOrder = { ...order, receipts: updatedReceipts };
                        onOrderUpdate?.(updatedOrder);
                        // Persist to backend
                        fetch(`${config.workflowService}/api/orders/${order.orderDetails.orderNumber}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ receipts: updatedReceipts })
                        }).catch(err => console.error('Failed to persist receipt upload', err));
                    }
                }}
                onRemoveReceipt={idx => {
                    const updatedReceipts = [...(order.receipts || [])];
                    updatedReceipts.splice(idx, 1);
                    const updatedOrder = { ...order, receipts: updatedReceipts };
                    onOrderUpdate?.(updatedOrder);
                    // Persist to backend
                    fetch(`${config.workflowService}/api/orders/${order.orderDetails.orderNumber}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ receipts: updatedReceipts })
                    }).catch(err => console.error('Failed to persist receipt removal', err));
                }}
                onOrderUpdate={onOrderUpdate}
            />

            {/* Document columns */}
            <div className={`grid ${isOnline ? 'grid-cols-3' : 'grid-cols-2'} border-b border-gray-100 min-h-[200px]`}>
                {/* Online Documents */}
                {isOnline && (
                    <DocumentColumn
                        title="Online Documents"
                        icon={<FileText size={15} className="text-blue-500" />}
                        iconBg="bg-blue-50"
                        iconBorder="border-blue-200"
                        countColor={{ text: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' }}
                        count={orderFiles.length}
                        emptyText="No documents attached"
                        hasBorderRight
                    >
                        <div className="flex flex-wrap gap-[7px] p-2">
                            {orderFiles.map((f, i) => (
                                <DocTile
                                    key={i}
                                    file={f}
                                    onRemove={onRemoveWebDocument ? () => onRemoveWebDocument(order.orderDetails.orderNumber, f.index) : undefined}
                                    orderStatus={order.orderDetails.orderStatus}
                                />
                            ))}
                        </div>
                    </DocumentColumn>
                )}

                {/* Email Documents */}
                <div className="p-2 border-r border-gray-100 min-w-0">
                    <div className="flex items-center justify-between mb-[11px] bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center gap-[8px]">
                            <ColIcon bg="bg-violet-50" border="border-violet-200">
                                <Mail size={15} className="text-violet-500" />
                            </ColIcon>
                            <span className="text-[15px] font-bold text-gray-700">Email Documents</span>
                            {/* <ColCount colorClass="text-violet-700" bgClass="bg-violet-100" borderClass="border-violet-200" n={emailFiles.length} /> */}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* {emailFiles.length > 0 && (
                                <GBtn
                                    colorClass="text-red-600"
                                    borderClass="border-red-200"
                                    hoverClass="hover:bg-red-50"
                                    icon={<Trash2 size={11} />}
                                    label="Remove All"
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to remove all email documents?')) {
                                            const updatedOrder = { ...order, emailDocuments: [] };
                                            onOrderUpdate?.(updatedOrder);
                                            fetch(`${config.workflowService}/api/orders/${order.orderDetails.orderNumber}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ emailDocuments: [] })
                                            }).catch(err => console.error('Failed to remove all email documents', err));
                                        }
                                    }}
                                />
                            )} */}
                            <GBtn
                                colorClass="text-violet-700"
                                borderClass="border-violet-300/50"
                                hoverClass="hover:bg-violet-50"
                                icon={<Plus size={11} />}
                                label="Add Files"
                                onClick={() => setShowLinkDialog(true)}
                            />
                        </div>
                    </div>

                    {emailFiles.length > 0 ? (
                        <div className="flex flex-wrap gap-[7px] p-2">
                            {emailFiles.map((f, i) => (
                                <DocTile
                                    key={i}
                                    file={f}
                                    onRemove={onRemoveEmailDocument ? () => onRemoveEmailDocument(order.orderDetails.orderNumber, f.index) : undefined}
                                    orderStatus={order.orderDetails.orderStatus}
                                />
                            ))}
                        </div>
                    ) : (
                        <span className="text-[13px] text-gray-300 italic">No email linked yet</span>
                    )}

                    <DialogComponent isOpen={showLinkDialog} closeDialog={() => setShowLinkDialog(false)} name="Select an Email to Link" className="w-[80vw] h-[90vh]">
                        <EmailLinkDialog
                            onLink={id => {
                                onLinkEmail(order.orderDetails.orderNumber, id);
                                setShowLinkDialog(false);
                            }}
                        />
                    </DialogComponent>
                </div>

                {/* Manual Documents */}
                <div className="p-2 min-w-0">
                    <div className="flex items-center justify-between mb-[11px] bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center gap-[8px]">
                            <ColIcon bg="bg-emerald-50" border="border-emerald-200">
                                {isUploading ? <Spinner size={15} /> : <UploadCloud size={15} className="text-emerald-500" />}
                            </ColIcon>
                            <span className="text-[15px] font-bold text-gray-700">{isUploading ? 'Uploading...' : 'Manual Documents'}</span>
                            {/* <ColCount colorClass="text-emerald-800" bgClass="bg-emerald-100" borderClass="border-emerald-300" n={uploadedFileItems.length} /> */}
                        </div>
                        <div className="flex items-center gap-2">
                            {uploadedFileItems.length > 0 && order.orderDetails.orderStatus !== 'submitted' && (
                                <GBtn
                                    colorClass="text-red-600"
                                    borderClass="border-red-200"
                                    hoverClass="hover:bg-red-50"
                                    icon={<Trash2 size={11} />}
                                    label="Remove All"
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to remove all manual documents?')) {
                                            const updatedOrder = { ...order, manualDocuments: [] };
                                            onOrderUpdate?.(updatedOrder);
                                            fetch(`${config.workflowService}/api/orders/${order.orderDetails.orderNumber}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ manualDocuments: [] })
                                            }).catch(err => console.error('Failed to remove all manual documents', err));
                                        }
                                    }}
                                />
                            )}
                            <GBtn
                                colorClass="text-emerald-700"
                                borderClass="border-emerald-300/50"
                                hoverClass="hover:bg-emerald-50"
                                icon={isUploading ? <Spinner size={11} /> : <Plus size={11} />}
                                label={isUploading ? 'Uploading' : 'Add Files'}
                                onClick={() => !isUploading && setShowUploader(true)}
                            />
                        </div>
                    </div>

                    {uploadedFileItems.length > 0 ? (
                        <div className="flex flex-wrap gap-[7px] p-2">
                            {uploadedFileItems.map((f, i) => (
                                <DocTile key={i} file={f} onRemove={() => onRemoveUploadedFile(order.orderDetails.orderNumber, f.index)} orderStatus={order.orderDetails.orderStatus} />
                            ))}
                        </div>
                    ) : (
                        <span className="text-[13px] text-gray-300 italic">No files uploaded yet</span>
                    )}

                    <DialogComponent isOpen={showUploader} closeDialog={() => setShowUploader(false)} name="Upload Files" className="w-[90vw]">
                        <div className="p-6">
                            <GenericFileInput
                                onFilesChange={files => {
                                    onUploadFiles(order.orderDetails.orderNumber, files);
                                    setShowUploader(false);
                                }}
                                multiple
                                dropText="Drag & drop files here"
                                browseText="browse"
                                className="h-[80vh] bg-white border-2 border-dashed border-emerald-300"
                                accept=".png,.jpeg,.jpg,.pdf,.webp"
                            />
                        </div>
                    </DialogComponent>
                </div>
            </div>

            {/* Footer: currency cards + extract button */}
            <div className="px-[22px] py-[13px] flex items-center justify-between bg-slate-50/30 border-t border-gray-50">
                <div className="flex flex-wrap items-center gap-2.5">
                    {order.currencyDetails?.map((item, idx) => (
                        <CurrencyMiniCard key={idx} item={item} />
                    ))}
                    {order.maraekatDetails?.eonBookingNumber && (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5">
                            <ArrowLeftRight size={13} className="text-green-500" />
                            <span className="text-[11px] font-bold tracking-wide text-green-400 uppercase">EON</span>
                            <span className="text-[13px] font-extrabold text-green-700">{order.maraekatDetails.eonBookingNumber}</span>
                        </div>
                    )}
                </div>
                {!order.extractionDetails?.recordId ? (
                    <Button
                        startIcon={isProceeding ? <Spinner size={16} /> : <Zap size={15} />}
                        outlined
                        onClick={() => onProceed(order.orderDetails?.orderNumber)}
                        disabled={!hasDocuments || isProceeding}
                        endIcon={!isProceeding && <ArrowRight size={15} />}
                    >
                        {isProceeding ? 'Processing…' : 'Extract Documents'}
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button
                            hidden={order.orderDetails.orderStatus === 'submitted'}
                            startIcon={isProceeding ? <Spinner size={12} /> : <RefreshCw size={12} />}
                            outlined
                            onClick={() => onProceed(order.orderDetails?.orderNumber)}
                            disabled={!hasDocuments || isProceeding}
                        >
                            {isProceeding ? 'Processing…' : 'Re-Extract'}
                        </Button>
                        <Button startIcon={<Eye size={15} />} outlined onClick={openRecordDialog}>
                            View Extracted Data
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete confirmation dialog */}
            {onDelete && (
                <DialogComponent isOpen={showDeleteConfirm} closeDialog={() => setShowDeleteConfirm(false)} name="Delete Order?" className="max-w-[600px]">
                    <div className="p-6">
                        <div className="text-gray-600 mb-6">
                            <div className="text-sm">
                                Order<strong className=" text-sm"> {order.orderDetails.orderNumber}</strong> will be permanently deleted. This action cannot be undone
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button outlined onClick={() => setShowDeleteConfirm(false)}>
                                Keep Order
                            </Button>
                            <Button
                                onClick={() => {
                                    onDelete(order.orderDetails.orderNumber);
                                    setShowDeleteConfirm(false);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogComponent>
            )}

            {/* Fullscreen docsnap comparison dialog */}
            <DialogComponent disableBlurCloseDialog isOpen={showRecordDialog} closeDialog={closeRecordDialog} fullScreen>
                <DocsnapComparisonUI order={order} recordId={`${order.extractionDetails?.recordId}`} onClose={closeRecordDialog} onOrderUpdate={onOrderUpdate} />
            </DialogComponent>
        </div>
    );
};

// ── Reusable document column wrapper ──────────────────────────

const DocumentColumn: React.FC<{
    title: string;
    icon: React.ReactNode;
    iconBg: string;
    iconBorder: string;
    countColor: { text: string; bg: string; border: string };
    count: number;
    emptyText: string;
    hasBorderRight?: boolean;
    action?: React.ReactNode;
    children: React.ReactNode;
}> = ({ title, icon, iconBg, iconBorder, countColor, count, emptyText, hasBorderRight, action, children }) => (
    <div className={`p-2 min-w-0 ${hasBorderRight ? 'border-r border-gray-100' : ''}`}>
        <div className="flex items-center justify-between mb-[11px] bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center gap-[8px]">
                <ColIcon bg={iconBg} border={iconBorder}>
                    {icon}
                </ColIcon>
                <span className="text-[15px] font-bold text-gray-700">{title}</span>
                {/* <ColCount colorClass={countColor.text} bgClass={countColor.bg} borderClass={countColor.border} n={count} /> */}
            </div>
            {action}
        </div>
        {count > 0 ? children : <span className="text-[13px] text-gray-300 italic">{emptyText}</span>}
    </div>
);

export default OrderCard;
