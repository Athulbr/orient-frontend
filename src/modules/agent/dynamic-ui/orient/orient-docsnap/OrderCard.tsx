import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    Mail,
    UploadCloud,
    ExternalLink,
    Link2,
    Unlink,
    ArrowRight,
    Plus,
    X,
    Zap,
    Clock,
    User,
    Building2,
    Hash,
    Eye,
    Phone,
    Edit,
    Trash2,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import GenericFileInput from '../../../../../components/DragAndDropFileInput';
import { DialogComponent } from '../../../../../components/DialogComponent';
import { Button } from '../../../../../components/Button';
import EmailLinkDialog from './EmailLinkDialog';
import { Order, Email, FileItem } from './types';
import Spinner from '../../../../../components/Spinner';
import { config } from '../../../../../config/default';
import { DocsnapComparisonUI } from './docsnap-comparison-page';
import { convertToIst } from '../../../../../global-utils/convert-date-format';

interface OrderCardProps {
    order: Order;
    linkedEmails: Email[];
    onLinkEmail: (orderNumber: number, emailId: string) => void;
    onUnlinkEmail: (orderNumber: number, emailId: string) => void;
    onUploadFiles: (orderNumber: number, files: File[]) => void;
    onRemoveUploadedFile: (orderNumber: number, fileIndex: number) => void;
    onProceed: (orderNumber: number) => void;
    onEdit?: (order: Order) => void;
    onDelete?: (orderNumber: number) => void;
    isProceeding: boolean;
    isUploading?: boolean;
    onDocsnapOpen?: () => void;
    onDocsnapClose?: () => void;
}

const FILE_COLORS = {
    pdf: { label: 'PDF', text: 'text-blue-700', bg: 'bg-blue-100' },
    image: { label: 'IMG', text: 'text-emerald-800', bg: 'bg-emerald-100' },
    doc: { label: 'DOC', text: 'text-blue-700', bg: 'bg-blue-100' },
    other: { label: 'FILE', text: 'text-gray-500', bg: 'bg-gray-100' }
} as const;

const STATUS_CONFIG: Record<string, { text: string; bg: string; border: string; dot: string; stripe: string }> = {
    PENDING: { text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400', stripe: 'from-amber-400' },
    EXTRACTED: { text: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400', stripe: 'from-blue-400' },
    COMPLETED: { text: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', stripe: 'from-emerald-400' },
    REJECTED: { text: 'text-red-800', bg: 'bg-red-50', border: 'border-red-300', dot: 'bg-red-500', stripe: 'from-red-400' },
    DEFAULT: { text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200', dot: 'bg-gray-400', stripe: 'from-gray-400' }
};

const getFileType = (url: string = ''): FileItem['type'] => {
    if (!url) return 'other';
    const lower = url.toLowerCase();
    if (lower.endsWith('.pdf')) return 'pdf';
    if (lower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) return 'image';
    if (lower.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/)) return 'doc';
    return 'other';
};

const getPreviewUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }
    let normalizedPath = url.replace(/\\/g, '/');
    // If it's an absolute path, extract the portion after 'temp/' to get the relative path
    const tempIdx = normalizedPath.indexOf('/temp/');
    if (tempIdx !== -1) {
        normalizedPath = normalizedPath.substring(tempIdx + '/temp/'.length);
    }
    // Encode each segment individually to preserve slash structure for the wildcard route
    const encodedPath = normalizedPath
        .split('/')
        .map(seg => encodeURIComponent(seg))
        .join('/');
    return `${config.workflowService}/api/temp-storage/preview/${encodedPath}?apiKey=secret1`;
};

const DocTile: React.FC<{ file: FileItem & { index?: number }; onRemove?: () => void }> = ({ file, onRemove }) => {
    const [hover, setHover] = useState(false);
    const [preview, setPreview] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);
    const [thumbLoading, setThumbLoading] = useState(file.type === 'image');
    const [thumbError, setThumbError] = useState(false);
    const [pageBlobUrls, setPageBlobUrls] = useState<Record<number, string>>({});
    const pageBlobUrlsRef = useRef<Record<number, string>>({});
    const [pageLoading, setPageLoading] = useState(false);

    const cfg = FILE_COLORS[file.type as keyof typeof FILE_COLORS] ?? FILE_COLORS.other;
    const shortName = file.name.replace(/\.[^.]+$/, '');

    const allPages = file.pages && file.pages.length > 0 ? file.pages : file.url ? [file.url] : [];
    const pageApiUrls = allPages.map(getPreviewUrl);
    const totalPages = pageApiUrls.length;

    // Fetch thumbnail blob on mount
    useEffect(() => {
        if (file.type !== 'image' || !pageApiUrls[0]) return;
        let objectUrl: string;

        const fetchThumb = async () => {
            try {
                const res = await fetch(pageApiUrls[0]);
                if (!res.ok) throw new Error('Failed to fetch thumbnail');
                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                setThumbUrl(objectUrl);
            } catch {
                setThumbError(true);
            } finally {
                setThumbLoading(false);
            }
        };
        fetchThumb();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [pageApiUrls[0]]);

    // Fetch a specific page blob for the lightbox
    const fetchPageBlob = async (pageIndex: number) => {
        if (pageBlobUrlsRef.current[pageIndex]) return;
        setPageLoading(true);
        try {
            const res = await fetch(pageApiUrls[pageIndex]);
            if (!res.ok) throw new Error('Failed to fetch page');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            pageBlobUrlsRef.current[pageIndex] = url;
            setPageBlobUrls(prev => ({ ...prev, [pageIndex]: url }));
        } catch (err) {
            console.error('Error fetching page:', err);
        } finally {
            setPageLoading(false);
        }
    };

    // Cleanup all page blob URLs only on unmount
    useEffect(() => {
        return () => {
            Object.values(pageBlobUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    // When lightbox opens or page changes, fetch that page blob
    useEffect(() => {
        if (preview && pageApiUrls[currentPage]) {
            fetchPageBlob(currentPage);
        }
    }, [preview, currentPage]);

    const handleClick = () => {
        if (file.type === 'image') {
            setCurrentPage(0);
            setPreview(true);
        } else {
            const apiUrl = pageApiUrls[0];
            if (apiUrl) {
                fetch(apiUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                        setTimeout(() => URL.revokeObjectURL(url), 60000);
                    })
                    .catch(err => console.error('Preview error:', err));
            }
        }
    };

    const handleOpenOriginal = () => {
        const apiUrl = pageApiUrls[currentPage];
        if (apiUrl) {
            fetch(apiUrl)
                .then(res => res.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    setTimeout(() => URL.revokeObjectURL(url), 60000);
                })
                .catch(err => console.error('Open original error:', err));
        }
    };

    return (
        <>
            <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={handleClick}
                title={file.name}
                className={`relative w-[96px] h-[112px] rounded-2xl flex flex-col items-center justify-center gap-2 px-2 pb-2 pt-3 cursor-pointer overflow-hidden flex-shrink-0 transition-all duration-200 shadow-lg
                    ${hover ? 'bg-white shadow-xl shadow-gray-800 scale-[1.03] border border-gray-300' : 'bg-gray-50 border border-gray-150 scale-100'}`}
                style={{ boxShadow: hover ? '0 4px 18px 0 rgba(0,0,0,0.10)' : '0 1px 4px 0 rgba(0,0,0,0.06)' }}
            >
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

                {totalPages > 1 && <span className="absolute top-1.5 left-1.5 text-[9px] font-extrabold text-white bg-black/50 px-[5px] py-[2px] rounded-md z-10">{totalPages}p</span>}

                {file.type === 'image' ? (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                        {thumbLoading ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Spinner size={16} />
                            </div>
                        ) : thumbError || !thumbUrl ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                                <FileText size={20} className="mb-1 opacity-50" />
                                <span className="text-[9px]">No preview</span>
                            </div>
                        ) : (
                            <img src={thumbUrl} alt={file.name} className="w-full h-full object-cover" />
                        )}
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
                        <span className={`text-[10px] font-extrabold tracking-widest font-mono ${cfg.text} ${cfg.bg} px-[6px] py-[3px] rounded-md`}>{cfg.label}</span>
                        <span className="text-[11px] text-gray-600 font-bold text-center leading-[1.3] break-all line-clamp-3 w-full px-0.5">{shortName}</span>
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

            {/* Lightbox preview — supports multiple pages */}
            {preview && file.type === 'image' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }} onClick={() => setPreview(false)}>
                    <div
                        className="relative max-w-[90vw] max-h-[88vh] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center"
                        style={{ minWidth: 256, minHeight: 256 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {pageLoading && !pageBlobUrls[currentPage] ? (
                            <Spinner size={28} />
                        ) : pageBlobUrls[currentPage] ? (
                            <img src={pageBlobUrls[currentPage]} alt={`${file.name} - page ${currentPage + 1}`} className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                                <FileText size={32} className="mb-2 opacity-50" />
                                <span className="text-sm">Preview unavailable</span>
                            </div>
                        )}

                        <button
                            onClick={() => setPreview(false)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                        >
                            <X size={15} className="text-white" />
                        </button>

                        {totalPages > 1 && (
                            <>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        setCurrentPage(p => Math.max(0, p - 1));
                                    }}
                                    disabled={currentPage === 0}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-30 flex items-center justify-center transition-colors"
                                >
                                    <ChevronLeft size={18} className="text-white" />
                                </button>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        setCurrentPage(p => Math.min(totalPages - 1, p + 1));
                                    }}
                                    disabled={currentPage === totalPages - 1}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-30 flex items-center justify-center transition-colors"
                                >
                                    <ChevronRight size={18} className="text-white" />
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 items-center">
                            {totalPages > 1 && (
                                <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full">
                                    {currentPage + 1} / {totalPages}
                                </span>
                            )}
                            <button
                                onClick={handleOpenOriginal}
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
        className={`inline-flex items-center gap-1 px-[12px] py-[6px] rounded-md cursor-pointer text-xs font-bold border bg-transparent font-[inherit] transition-colors duration-150 ${colorClass} ${borderClass} ${hoverClass}`}
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
    onLinkEmail,
    onUnlinkEmail,
    onUploadFiles,
    onRemoveUploadedFile,
    onProceed,
    onEdit,
    onDelete,
    isProceeding,
    isUploading,
    onDocsnapOpen,
    onDocsnapClose
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

    const orderFiles: FileItem[] = (order.webDocuments || []).map(doc => {
        const url = doc.documentPages?.[0] || '';
        return { name: doc.documentName, url, type: getFileType(url), source: 'order' as const, pages: doc.documentPages || [] };
    });
    const emailFiles: FileItem[] = linkedEmails.flatMap(email =>
        (email.attachments || []).map((att: any) => {
            const url = att.documentPages?.[0] || att.url || '';
            return {
                name: att.documentName || att.name || '',
                url,
                type: getFileType(url),
                source: 'email' as const,
                pages: att.documentPages || att.pages || []
            };
        })
    );
    const uploadedFileItems: (FileItem & { index: number })[] = (order.manualDocuments || []).map((f, i) => {
        const url = f.documentPages?.[0] || '';
        return {
            name: f.documentName,
            url,
            type: getFileType(url),
            source: 'upload' as const,
            pages: f.documentPages || [],
            index: i
        };
    });

    const handleViewExtractedData = () => openRecordDialog();

    const totalDocs = orderFiles.length + emailFiles.length + uploadedFileItems.length;
    const hasDocuments = totalDocs > 0;
    const status = STATUS_CONFIG[order.orderDetails.orderStatus.toUpperCase()] ?? STATUS_CONFIG.DEFAULT;

    return (
        <div className="font-[DM_Sans,Segoe_UI,sans-serif] bg-white border border-gray-200 rounded-2xl overflow-hidden w-full shadow-lg shadow-gray-200/80">
            <div className={`h-[3px] bg-gradient-to-r ${status.stripe} to-transparent`} />

            <div className="flex items-start justify-between gap-4 px-[22px] pt-[18px] pb-4 border-b border-gray-100">
                <div>
                    <div className="flex items-center gap-2 flex-wrap mb-[6px]">
                        <span className="text-[22px] font-extrabold text-gray-900 tracking-tight">{order.orderDetails.orderNumber}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-extrabold ${status.text} ${status.bg} border ${status.border} px-2 py-[3px] rounded-full`}>
                            <span className={`w-[5px] h-[5px] rounded-full ${status.dot} inline-block`} />
                            {order.orderDetails.orderStatus === 'extracted' ? 'Review Pending' : order.orderDetails.orderStatus}
                        </span>
                        <span className="text-xs font-extrabold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-[3px] rounded-full">{order.orderDetails.orderType.toUpperCase()}</span>
                        <span className="text-xs font-extrabold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-[3px] rounded-full">
                            Purpose: {order.orderDetails?.purpose?.toUpperCase()}
                        </span>
                        <span className="text-xs font-extrabold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-[3px] rounded-full">
                            {(Array.isArray(order.orderDetails.productType) ? order.orderDetails.productType.join(', ') : String(order.orderDetails.productType || '')).toUpperCase()}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-[13px] text-gray-400 mb-[10px]">
                        <Clock size={13} className="text-gray-400" />
                        {order.createdAt ? convertToIst(order.createdAt) : 'N/A'}
                        <span className="mx-1.5">•</span>
                        <Building2 size={13} className="text-gray-400" />
                        {order.orderDetails.location || order.orderDetails.branch}
                        <span className="mx-1.5">•</span>
                        <span className="text-gray-500 font-semibold">{order.orderDetails.documentSubmitStatus} Submission</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {[
                            { icon: <User size={12} className="text-gray-400" />, val: `${order.userDetails.name} (#${order.userDetails.userId})` },
                            { icon: <Mail size={12} className="text-gray-400" />, val: order.userDetails.email },
                            { icon: <Phone size={12} className="text-gray-400" />, val: order.userDetails.phone },
                            ...(order.userDetails.panNumber ? [{ icon: <Hash size={12} className="text-gray-400" />, val: `PAN: ${order.userDetails.panNumber}` }] : []),
                            { icon: <Building2 size={12} className="text-gray-400" />, val: order.orderDetails.branch },
                            {
                                icon: null,
                                val: (
                                    <>
                                        <span className="text-gray-400 font-medium mr-[3px]">Branch ID:</span> <span className="text-gray-600 font-bold">{order.orderDetails.branchId}</span>
                                    </>
                                )
                            },
                            {
                                icon: null,
                                val: (
                                    <>
                                        <span className="text-gray-400 font-medium mr-[3px]">Actual:</span>{' '}
                                        <span className="text-gray-600 font-bold">₹{(order.orderDetails.actualAmount || order.orderDetails.totalAmount).toLocaleString()}</span>
                                    </>
                                )
                            },
                            {
                                icon: null,
                                val: (
                                    <>
                                        <span className="text-gray-400 font-medium mr-[3px]">Total:</span>{' '}
                                        <span className="text-gray-600 font-extrabold">₹{order.orderDetails.totalAmount.toLocaleString()}</span>
                                    </>
                                )
                            },
                            ...(order.orderDetails.paymentType
                                ? [
                                      {
                                          icon: null,
                                          val: (
                                              <>
                                                  <span className="text-gray-400 font-medium mr-[3px]">Payment:</span> <span className="text-gray-600 font-bold">{order.orderDetails.paymentType}</span>
                                              </>
                                          )
                                      }
                                  ]
                                : []),
                            ...(order.orderDetails.deliveryMode
                                ? [
                                      {
                                          icon: null,
                                          val: (
                                              <>
                                                  <span className="text-gray-400 font-medium mr-[3px]">Delivery:</span>{' '}
                                                  <span className="text-gray-600 font-bold">{order.orderDetails.deliveryMode}</span>
                                              </>
                                          )
                                      }
                                  ]
                                : []),
                            ...(order.orderDetails.deliveryCharge !== undefined
                                ? [
                                      {
                                          icon: null,
                                          val: (
                                              <>
                                                  <span className="text-gray-400 font-medium mr-[3px]">Delivery Charge:</span>{' '}
                                                  <span className="text-gray-600 font-bold">₹{order.orderDetails.deliveryCharge}</span>
                                              </>
                                          )
                                      }
                                  ]
                                : []),
                            ...(order.orderDetails.handlingCharges !== undefined
                                ? [
                                      {
                                          icon: null,
                                          val: (
                                              <>
                                                  <span className="text-gray-400 font-medium mr-[3px]">Handling:</span>{' '}
                                                  <span className="text-gray-600 font-bold">₹{order.orderDetails.handlingCharges}</span>
                                              </>
                                          )
                                      }
                                  ]
                                : []),
                            ...(order.orderDetails.purpose
                                ? [
                                      {
                                          icon: null,
                                          val: (
                                              <>
                                                  <span className="text-gray-400 font-medium mr-[3px]">Purpose:</span> <span className="text-gray-600 font-bold">{order.orderDetails.purpose}</span>
                                              </>
                                          )
                                      }
                                  ]
                                : []),
                            ...(order.orderDetails.documentUploadTime
                                ? [
                                      {
                                          icon: <Clock size={12} className="text-gray-400" />,
                                          val: (
                                              <>
                                                  <span className="text-gray-400 font-medium mr-[3px]">Uploaded:</span>{' '}
                                                  <span className="text-gray-600 font-bold">{order.orderDetails.documentUploadTime}</span>
                                              </>
                                          )
                                      }
                                  ]
                                : [])
                        ].map(({ icon, val }, idx) => (
                            <div key={idx} className="inline-flex items-center gap-[5px] bg-gray-50 border border-gray-200 rounded-[7px] px-3 py-2 text-[13px] font-semibold text-gray-600">
                                {icon}
                                {val}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        {onEdit && order.orderDetails.orderStatus !== 'submitted' && (
                            <GBtn colorClass="text-blue-600" borderClass="border-blue-200" hoverClass="hover:bg-blue-50" icon={<Edit size={11} />} label="Edit" onClick={() => onEdit(order)} />
                        )}
                        {onDelete && (
                            <GBtn
                                colorClass="text-red-600"
                                borderClass="border-red-200"
                                hoverClass="hover:bg-red-50"
                                icon={<Trash2 size={11} />}
                                label="Delete"
                                onClick={() => setShowDeleteConfirm(true)}
                            />
                        )}
                    </div>
                    <div className="flex gap-[7px]">
                        {[
                            { n: orderFiles.length, l: 'ONLINE', dark: false, show: order.orderDetails.documentSubmitStatus === 'Online' },
                            { n: emailFiles.length, l: 'EMAIL', dark: false, show: true },
                            { n: uploadedFileItems.length, l: 'MANUAL', dark: false, show: true },
                            { n: totalDocs, l: 'TOTAL', dark: true, show: true }
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

            <div className={`grid ${order.orderDetails.documentSubmitStatus === 'Online' ? 'grid-cols-3' : 'grid-cols-2'} border-b border-gray-100 min-h-[200px]`}>
                {order.orderDetails.documentSubmitStatus === 'Online' && (
                    <div className="p-3 border-r border-gray-100 min-w-0">
                        <div className="flex items-center justify-between mb-[11px] bg-gray-100 p-4 rounded-lg">
                            <div className="flex items-center gap-[8px]">
                                <ColIcon bg="bg-blue-50" border="border-blue-200">
                                    <FileText size={15} className="text-blue-500" />
                                </ColIcon>
                                <span className="text-[15px] font-bold text-gray-700">Online Documents</span>
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
                )}

                <div className="p-3 border-r border-gray-100 min-w-0">
                    <div className="flex items-center justify-between mb-[11px]  bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center gap-[8px]">
                            <ColIcon bg="bg-violet-50" border="border-violet-200">
                                <Mail size={15} className="text-violet-500" />
                            </ColIcon>
                            <span className="text-[15px] font-bold text-gray-700">Email Documents</span>
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
                            <div key={email.emailId} className="flex items-center gap-2 px-[10px] py-2 rounded-lg bg-violet-50 border border-violet-200 mb-[10px]">
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
                                    onClick={() => onUnlinkEmail(order.orderDetails.orderNumber, email.emailId)}
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
                            onLink={id => {
                                onLinkEmail(order.orderDetails.orderNumber, id);
                                setShowLinkDialog(false);
                            }}
                        />
                    </DialogComponent>
                </div>

                <div className="p-3 min-w-0">
                    <div className="flex items-center justify-between mb-[11px] bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center gap-[8px]">
                            <ColIcon bg="bg-emerald-50" border="border-emerald-200">
                                {isUploading ? <Spinner size={15} /> : <UploadCloud size={15} className="text-emerald-500" />}
                            </ColIcon>
                            <span className="text-[15px] font-bold text-gray-700">{isUploading ? 'Uploading...' : 'Manual Documents'}</span>
                            <ColCount colorClass="text-emerald-800" bgClass="bg-emerald-100" borderClass="border-emerald-300" n={uploadedFileItems.length} />
                        </div>
                        <GBtn
                            colorClass="text-emerald-700"
                            borderClass="border-emerald-300/50"
                            hoverClass="hover:bg-emerald-50"
                            icon={isUploading ? <Spinner size={11} /> : <Plus size={11} />}
                            label={isUploading ? 'Uploading' : 'Add Files'}
                            onClick={() => !isUploading && setShowUploader(true)}
                        />
                    </div>

                    {uploadedFileItems.length > 0 ? (
                        <div className="flex flex-wrap gap-[7px]">
                            {uploadedFileItems.map((f, i) => (
                                <DocTile key={i} file={f} onRemove={() => onRemoveUploadedFile(order.orderDetails.orderNumber, f.index)} />
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
                            />
                        </div>
                    </DialogComponent>
                </div>
            </div>

            <div className="px-[22px] py-[13px] flex items-center justify-between">
                <span className="text-sm text-gray-400">
                    {totalDocs || 'No'} {totalDocs === 1 ? 'document' : 'documents'} ready for extraction
                </span>
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
                            startIcon={isProceeding ? <Spinner size={12} /> : <RefreshCw size={12} />}
                            outlined
                            onClick={() => onProceed(order.orderDetails?.orderNumber)}
                            disabled={!hasDocuments || isProceeding}
                        >
                            {isProceeding ? 'Processing…' : 'Re-Extract'}
                        </Button>
                        <Button startIcon={<Eye size={15} />} outlined onClick={handleViewExtractedData}>
                            View Extracted Data
                        </Button>
                    </div>
                )}
            </div>

            {onDelete && (
                <DialogComponent isOpen={showDeleteConfirm} closeDialog={() => setShowDeleteConfirm(false)} name="Confirm Delete" className="max-w-[600px]">
                    <div className="p-6">
                        <div className="text-gray-600 mb-6">
                            <strong className="text-gray-900 text-md">Delete Order?</strong>
                            <div className="text-sm pt-2">
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

            <DialogComponent isOpen={showRecordDialog} closeDialog={closeRecordDialog} fullScreen>
                <DocsnapComparisonUI order={order} recordId={`${order.extractionDetails?.recordId}`} onClose={closeRecordDialog} />
            </DialogComponent>
        </div>
    );
};

export default OrderCard;
