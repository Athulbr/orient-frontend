import React, { useState } from 'react';
import { FileText, Mail, UploadCloud, ExternalLink, Link2, Unlink, ArrowRight, Plus, X, Zap, Clock, User, Building2, Hash, Eye } from 'lucide-react';
import GenericFileInput from '../../../../../components/DragAndDropFileInput';
import { DialogComponent } from '../../../../../components/DialogComponent';
import { Button } from '../../../../../components/Button';
import EmailLinkDialog from './EmailLinkDialog';
import { Order, Email, FileItem, TemplateRequirement } from './types';
import { getFileNameFromUrl, getFileType } from './data';

interface OrderCardProps {
    order: Order;
    linkedEmails: Email[];
    uploadedFiles: File[];
    availableEmails: Email[];
    templateRequirements: TemplateRequirement[];
    onLinkEmail: (orderId: string, emailId: string) => void;
    onUnlinkEmail: (orderId: string, emailId: string) => void;
    onUploadFiles: (orderId: string, files: File[]) => void;
    onRemoveUploadedFile: (orderId: string, fileIndex: number) => void;
    onProceed: (orderId: string) => void;
    isProceeding: boolean;
}

const FILE_COLORS = {
    pdf: { label: 'PDF', text: 'text-blue-700', bg: 'bg-blue-100' },
    image: { label: 'IMG', text: 'text-emerald-800', bg: 'bg-emerald-100' },
    doc: { label: 'DOC', text: 'text-blue-700', bg: 'bg-blue-100' },
    other: { label: 'FILE', text: 'text-gray-500', bg: 'bg-gray-100' }
} as const;

const SOURCE_STRIP_CLASS: Record<string, string> = {
    order: 'bg-blue-500',
    email: 'bg-violet-500',
    upload: 'bg-emerald-500'
};

const STATUS_CONFIG: Record<string, { text: string; bg: string; border: string; dot: string; stripe: string }> = {
    PENDING: { text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400', stripe: 'from-amber-400' },
    COMPLETED: { text: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', stripe: 'from-emerald-400' },
    REJECTED: { text: 'text-red-800', bg: 'bg-red-50', border: 'border-red-300', dot: 'bg-red-500', stripe: 'from-red-400' },
    DEFAULT: { text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200', dot: 'bg-gray-400', stripe: 'from-gray-400' }
};

const DocTile: React.FC<{ file: FileItem & { index?: number }; onRemove?: () => void }> = ({ file, onRemove }) => {
    const [hover, setHover] = useState(false);
    const [preview, setPreview] = useState(false);
    const cfg = FILE_COLORS[file.type as keyof typeof FILE_COLORS] ?? FILE_COLORS.other;
    const shortName = file.name.replace(/\.[^.]+$/, '');

    const handleClick = () => {
        if (file.type === 'image') {
            setPreview(true);
        } else {
            window.open(file.url, '_blank');
        }
    };

    return (
        <>
            <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={handleClick}
                title={file.name}
                className={`relative w-[96px] h-[112px] rounded-2xl flex flex-col items-center justify-center gap-2 px-2 pb-2 pt-3 cursor-pointer overflow-hidden flex-shrink-0 transition-all duration-200 shadow-sm
                    ${hover ? 'bg-white shadow-md scale-[1.03] border border-gray-200' : 'bg-gray-50 border border-gray-150 scale-100'}`}
                style={{ boxShadow: hover ? '0 4px 18px 0 rgba(0,0,0,0.10)' : '0 1px 4px 0 rgba(0,0,0,0.06)' }}
            >
                {/* Remove button */}
                {onRemove && hover && (
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white border border-red-200 shadow-sm cursor-pointer flex items-center justify-center z-10 transition-colors hover:bg-red-50"
                    >
                        <X size={10} className="text-red-500" />
                    </button>
                )}

                {file.type === 'image' ? (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        <div
                            className={`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity duration-150 ${hover ? 'opacity-100' : 'opacity-0'}`}
                            style={{ background: 'rgba(0,0,0,0.38)' }}
                        >
                            <Eye size={18} className="text-white drop-shadow" />
                            <span className="text-white text-[10px] font-semibold tracking-wide">Preview</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* File type badge */}
                        <span className={`text-[10px] font-extrabold tracking-widest font-mono ${cfg.text} ${cfg.bg} px-[6px] py-[3px] rounded-md`}>{cfg.label}</span>

                        {/* File name */}
                        <span className="text-[11px] text-gray-500 font-medium text-center leading-[1.3] break-all line-clamp-3 w-full px-0.5">{shortName}</span>

                        {/* Hover open hint */}
                        <div
                            className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-1 transition-opacity duration-150 ${hover ? 'opacity-100' : 'opacity-0'}`}
                            style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(2px)' }}
                        >
                            <ExternalLink size={17} className="text-gray-500" />
                            <span className="text-gray-500 text-[10px] font-semibold tracking-wide">Open</span>
                        </div>
                    </>
                )}
            </div>

            {/* Lightbox preview for images */}
            {preview && file.type === 'image' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }} onClick={() => setPreview(false)}>
                    <div className="relative max-w-[90vw] max-h-[88vh] rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <img src={file.url} alt={file.name} className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl" />
                        <button
                            onClick={() => setPreview(false)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                        >
                            <X size={15} className="text-white" />
                        </button>
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                            <button
                                onClick={() => window.open(file.url, '_blank')}
                                className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow transition-colors"
                            >
                                <ExternalLink size={12} /> Open original
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const GBtn: React.FC<{
    colorClass: string;
    borderClass: string;
    hoverClass: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}> = ({ colorClass, borderClass, hoverClass, icon, label, onClick }) => (
    <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 px-[10px] py-[5px] rounded-md cursor-pointer text-xs font-bold border bg-transparent font-[inherit] transition-colors duration-150 ${colorClass} ${borderClass} ${hoverClass}`}
    >
        {icon}
        {label}
    </button>
);

const ColIcon: React.FC<{ bg: string; border: string; children: React.ReactNode }> = ({ bg, border, children }) => (
    <div className={`w-7 h-7 rounded-[7px] ${bg} ${border} border flex items-center justify-center flex-shrink-0`}>{children}</div>
);

const ColCount: React.FC<{ colorClass: string; bgClass: string; borderClass: string; n: number }> = ({ colorClass, bgClass, borderClass, n }) => (
    <span className={`text-xs font-extrabold ${colorClass} ${bgClass} border ${borderClass} px-[7px] py-[1px] rounded-full leading-[1.8]`}>{n}</span>
);

const OrderCard: React.FC<OrderCardProps> = ({
    order,
    linkedEmails,
    uploadedFiles,
    availableEmails,
    templateRequirements,
    onLinkEmail,
    onUnlinkEmail,
    onUploadFiles,
    onRemoveUploadedFile,
    onProceed,
    isProceeding
}) => {
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [showUploader, setShowUploader] = useState(false);

    const orderFiles: FileItem[] = order.documents.map(url => ({ name: getFileNameFromUrl(url), url, type: getFileType(url), source: 'order' as const }));
    const emailFiles: FileItem[] = linkedEmails.flatMap(email => email.attachments) || [];
    const uploadedFileItems: (FileItem & { index: number })[] = uploadedFiles.map((f, i) => ({
        name: f.name,
        url: URL.createObjectURL(f),
        type: getFileType(f.name),
        source: 'upload' as const,
        index: i
    }));

    const totalDocs = orderFiles.length + emailFiles.length + uploadedFiles.length;
    const hasDocuments = totalDocs > 0;
    const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.DEFAULT;

    return (
        <div className="font-[DM_Sans,Segoe_UI,sans-serif] bg-white border border-gray-200 rounded-2xl overflow-hidden w-full shadow-lg shadow-gray-200/80">
            <div className={`h-[3px] bg-gradient-to-r ${status.stripe} to-transparent`} />

            <div className="flex items-start justify-between gap-4 px-[22px] pt-[18px] pb-4 border-b border-gray-100">
                <div>
                    <div className="flex items-center gap-2 flex-wrap mb-[6px]">
                        <span className="text-[22px] font-extrabold text-gray-900 tracking-tight">{order.order_id}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-extrabold ${status.text} ${status.bg} border ${status.border} px-2 py-[3px] rounded-full`}>
                            <span className={`w-[5px] h-[5px] rounded-full ${status.dot} inline-block`} />
                            {order.status}
                        </span>
                        <span className="text-xs font-extrabold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-[3px] rounded-full">{order.order_type}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[13px] text-gray-400 mb-[10px]">
                        <Clock size={13} className="text-gray-300" />
                        {new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <div className="flex gap-[6px] flex-wrap">
                        {[
                            { icon: <User size={12} className="text-gray-400" />, val: order.customer_name },
                            { icon: <Building2 size={12} className="text-gray-400" />, val: order.branch_name },
                            { icon: <Hash size={12} className="text-gray-400" />, val: order.branch_id }
                        ].map(({ icon, val }) => (
                            <div key={val} className="inline-flex items-center gap-[5px] bg-gray-50 border border-gray-200 rounded-[7px] px-[9px] py-1 text-[13px] font-semibold text-gray-600">
                                {icon}
                                {val}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-[7px] flex-shrink-0">
                    {[
                        { n: orderFiles.length, l: 'ORDER', dark: false },
                        { n: emailFiles.length, l: 'EMAIL', dark: false },
                        { n: uploadedFiles.length, l: 'UPLOAD', dark: false },
                        { n: totalDocs, l: 'TOTAL', dark: true }
                    ].map(({ n, l, dark }) => (
                        <div key={l} className={`rounded-[10px] py-[9px] px-[13px] text-center min-w-[58px] border ${dark ? 'bg-[#012D56] border-gray-900' : 'bg-gray-50 border-gray-200'}`}>
                            <div className={`text-2xl font-extrabold leading-none ${dark ? 'text-white' : 'text-gray-900'}`}>{n}</div>
                            <div className={`text-[11px] font-bold tracking-[0.07em] mt-0.5 ${dark ? 'text-white/45' : 'text-gray-400'}`}>{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 border-b border-gray-100">
                <div className="p-[15px_18px] border-r border-gray-100 min-w-0">
                    <div className="flex items-center justify-between mb-[11px]">
                        <div className="flex items-center gap-[6px]">
                            <ColIcon bg="bg-blue-50" border="border-blue-200">
                                <FileText size={15} className="text-blue-500" />
                            </ColIcon>
                            <span className="text-[13px] font-bold text-gray-700">Order Documents</span>
                            <ColCount colorClass="text-blue-700" bgClass="bg-blue-100" borderClass="border-blue-200" n={orderFiles.length} />
                        </div>
                    </div>
                    {orderFiles.length > 0 ? (
                        <div className="flex flex-wrap gap-[7px]">
                            {orderFiles.map((f, i) => (
                                <DocTile key={i} file={f} />
                            ))}
                        </div>
                    ) : (
                        <span className="text-[13px] text-gray-300 italic">No documents attached</span>
                    )}
                </div>

                <div className="p-[15px_18px] border-r border-gray-100 min-w-0">
                    <div className="flex items-center justify-between mb-[11px]">
                        <div className="flex items-center gap-[6px]">
                            <ColIcon bg="bg-violet-50" border="border-violet-200">
                                <Mail size={15} className="text-violet-500" />
                            </ColIcon>
                            <span className="text-[13px] font-bold text-gray-700">Email Attachments</span>
                            <ColCount colorClass="text-violet-700" bgClass="bg-violet-100" borderClass="border-violet-200" n={emailFiles.length} />
                        </div>
                        <GBtn
                            colorClass="text-violet-700"
                            borderClass="border-violet-300/50"
                            hoverClass="hover:bg-violet-50"
                            icon={<Link2 size={11} />}
                            label="Link Email"
                            onClick={() => setShowLinkDialog(true)}
                        />
                    </div>

                    {linkedEmails.length > 0 &&
                        linkedEmails.map(email => (
                            <div key={email.id} className="flex items-center gap-2 px-[10px] py-2 rounded-lg bg-violet-50 border border-violet-200 mb-[10px]">
                                <div className="w-7 h-7 rounded-[7px] bg-violet-100 flex items-center justify-center flex-shrink-0">
                                    <Mail size={14} className="text-violet-700" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[13px] font-bold text-gray-700 truncate">{email.subject}</div>
                                    <div className="text-xs text-gray-400 mt-[1px]">{email.from}</div>
                                </div>
                                <GBtn
                                    colorClass="text-red-600"
                                    borderClass="border-red-300/50"
                                    hoverClass="hover:bg-red-50"
                                    icon={<Unlink size={11} />}
                                    label="Unlink"
                                    onClick={() => onUnlinkEmail(order.order_id, email.id)}
                                />
                            </div>
                        ))}

                    {emailFiles.length > 0 ? (
                        <div className="flex flex-wrap gap-[7px]">
                            {emailFiles.map((f, i) => (
                                <DocTile key={i} file={f} />
                            ))}
                        </div>
                    ) : (
                        <span className="text-[13px] text-gray-300 italic">{linkedEmails.length > 0 ? 'No attachments in linked emails' : 'No email linked yet'}</span>
                    )}

                    <DialogComponent isOpen={showLinkDialog} closeDialog={() => setShowLinkDialog(false)} name="Select an Email to Link" className="w-[80vw] h-[90vh]">
                        <EmailLinkDialog
                            availableEmails={availableEmails}
                            onLink={id => {
                                onLinkEmail(order.order_id, id);
                                setShowLinkDialog(false);
                            }}
                        />
                    </DialogComponent>
                </div>

                <div className="p-[15px_18px] min-w-0">
                    <div className="flex items-center justify-between mb-[11px]">
                        <div className="flex items-center gap-[6px]">
                            <ColIcon bg="bg-emerald-50" border="border-emerald-200">
                                <UploadCloud size={15} className="text-emerald-500" />
                            </ColIcon>
                            <span className="text-[13px] font-bold text-gray-700">Uploaded Files</span>
                            <ColCount colorClass="text-emerald-800" bgClass="bg-emerald-100" borderClass="border-emerald-300" n={uploadedFiles.length} />
                        </div>
                        <GBtn
                            colorClass="text-emerald-700"
                            borderClass="border-emerald-300/50"
                            hoverClass="hover:bg-emerald-50"
                            icon={<Plus size={11} />}
                            label="Add Files"
                            onClick={() => setShowUploader(true)}
                        />
                    </div>

                    {uploadedFileItems.length > 0 ? (
                        <div className="flex flex-wrap gap-[7px]">
                            {uploadedFileItems.map((f, i) => (
                                <DocTile key={i} file={f} onRemove={() => onRemoveUploadedFile(order.order_id, f.index)} />
                            ))}
                        </div>
                    ) : (
                        <span className="text-[13px] text-gray-300 italic">No files uploaded yet</span>
                    )}

                    <DialogComponent isOpen={showUploader} closeDialog={() => setShowUploader(false)} name="Upload Files" className="w-[90vw]">
                        <div className="p-6">
                            <GenericFileInput
                                onFilesChange={files => {
                                    onUploadFiles(order.order_id, files);
                                    setShowUploader(false);
                                }}
                                multiple
                                dropText="Drag & drop files here"
                                browseText="browse"
                                className="h-[80vh] bg-white border-2 border-dashed border-emerald-300"
                            />
                        </div>
                    </DialogComponent>
                </div>
            </div>

            <div className="px-[22px] py-[13px] flex items-center justify-between">
                <span className="text-sm text-gray-400 font-medium">
                    {totalDocs} document{totalDocs !== 1 ? 's' : ''} ready for extraction
                </span>
                <Button outlined onClick={() => onProceed(order.order_id)} disabled={!hasDocuments || isProceeding}>
                    {isProceeding ? (
                        <>
                            <div className="w-[14px] h-[14px] rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Processing…
                        </>
                    ) : (
                        <>
                            <Zap size={15} />
                            Proceed to Extract
                            <ArrowRight size={15} />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default OrderCard;
