import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FileText, ExternalLink, X, Eye, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { FileItem } from './types';
import Spinner from '../../../../../components/Spinner';
import { DialogComponent } from '../../../../../components/DialogComponent';
import { Button } from '../../../../../components/Button';
import { config } from '../../../../../config/default';

// ── Constants ─────────────────────────────────────────────────

const API_KEY = import.meta.env.VITE_WORKFLOW_API_KEY || 'secret1';

export const FILE_COLORS = {
    pdf: { label: 'PDF', text: 'text-blue-700', bg: 'bg-blue-100' },
    image: { label: 'IMG', text: 'text-emerald-800', bg: 'bg-emerald-100' },
    doc: { label: 'DOC', text: 'text-blue-700', bg: 'bg-blue-100' },
    other: { label: 'FILE', text: 'text-gray-500', bg: 'bg-gray-100' }
} as const;

// ── Helpers ───────────────────────────────────────────────────

export const getFileType = (url: string = ''): FileItem['type'] => {
    if (!url) return 'other';
    const lower = url.toLowerCase();
    if (lower.endsWith('.pdf')) return 'pdf';
    if (lower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) return 'image';
    if (lower.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/)) return 'doc';
    return 'other';
};

export const getPreviewUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }
    let normalizedPath = url.replace(/\\/g, '/');
    const tempIdx = normalizedPath.indexOf('/temp/');
    if (tempIdx !== -1) {
        normalizedPath = normalizedPath.substring(tempIdx + '/temp/'.length);
    }
    const encodedPath = normalizedPath
        .split('/')
        .map(seg => encodeURIComponent(seg))
        .join('/');
    return `${config.workflowService}/api/temp-storage/preview/${encodedPath}?apiKey=${API_KEY}`;
};

// ── DocTile Component ─────────────────────────────────────────

const DocTile: React.FC<{ file: FileItem & { index?: number }; onRemove?: () => void; onRemovePage?: (pageIndex: number) => void; orderStatus?: string }> = ({ file, onRemove, onRemovePage, orderStatus }) => {
    const [hover, setHover] = useState(false);
    const [preview, setPreview] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);
    const [thumbLoading, setThumbLoading] = useState(file.type === 'image');
    const [thumbError, setThumbError] = useState(false);
    const [pageBlobUrls, setPageBlobUrls] = useState<Record<string, string>>({});
    const pageBlobUrlsRef = useRef<Record<string, string>>({});
    const [pageLoading, setPageLoading] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

    const cfg = FILE_COLORS[file.type as keyof typeof FILE_COLORS] ?? FILE_COLORS.other;
    const shortName = file.name.replace(/\.[^.]+$/, '');

    const allPages = file.pages && file.pages.length > 0 ? file.pages : file.url ? [file.url] : [];
    const pageApiUrls = useMemo(() => allPages.map(getPreviewUrl), [allPages.join('|')]);
    const totalPages = pageApiUrls.length;
    const firstPageUrl = pageApiUrls[0] || '';

    // Fetch thumbnail blob on mount (stable dep: firstPageUrl string)
    useEffect(() => {
        if (file.type !== 'image' || !firstPageUrl) return;
        let objectUrl: string;

        const fetchThumb = async () => {
            try {
                const res = await fetch(firstPageUrl);
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
    }, [firstPageUrl, file.type]);

    // Fetch a specific page blob for the lightbox
    const fetchPageBlob = useCallback(
        async (pageIndex: number) => {
            const url = pageApiUrls[pageIndex];
            if (!url || pageBlobUrlsRef.current[url]) return;
            setPageLoading(true);
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch page');
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);
                pageBlobUrlsRef.current[url] = blobUrl;
                setPageBlobUrls(prev => ({ ...prev, [url]: blobUrl }));
            } catch (err) {
                console.error('Error fetching page:', err);
            } finally {
                setPageLoading(false);
            }
        },
        [pageApiUrls]
    );

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
    }, [preview, currentPage, fetchPageBlob, pageApiUrls]);

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
                className={`relative w-[84px] h-[112px] rounded-2xl flex flex-col items-center justify-center gap-2 px-2 pb-2 pt-3 cursor-pointer overflow-hidden flex-shrink-0 transition-all duration-200 shadow-lg
                    ${hover ? 'bg-white shadow-xl shadow-gray-800 scale-[1.03] border border-gray-300' : 'bg-gray-50 border border-gray-150 scale-100'}`}
                style={{ boxShadow: hover ? '0 4px 18px 0 rgba(0,0,0,0.10)' : '0 1px 4px 0 rgba(0,0,0,0.06)' }}
            >
                {onRemove && hover && orderStatus !== 'submitted' && (
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            setShowRemoveConfirm(true);
                        }}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white border border-red-200 shadow-sm cursor-pointer flex items-center justify-center z-10 transition-colors hover:bg-red-50"
                    >
                        <X size={10} className="text-red-500" />
                    </button>
                )}

                {totalPages > 1 && <span className="absolute top-1.5 left-1.5 text-[8px] font-extrabold text-white bg-black/50 px-[5px] py-[2px] rounded-md z-10">{totalPages} Pages</span>}

                {file.type === 'image' ? (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                        {thumbLoading ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Spinner size={16} />
                            </div>
                        ) : thumbError || !thumbUrl ? (
                            <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl border border-red-300 bg-red-200 text-red-400">
                                <FileText size={20} className="mb-1 opacity-50 text-red-500" />
                                <span className="text-red-500 text-[10px]">Invalid File</span>
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
                        {pageLoading && !pageBlobUrls[pageApiUrls[currentPage]] ? (
                            <Spinner size={28} />
                        ) : pageBlobUrls[pageApiUrls[currentPage]] ? (
                            <img src={pageBlobUrls[pageApiUrls[currentPage]]} alt={`${file.name} - page ${currentPage + 1}`} className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                                <FileText size={32} className="mb-2 opacity-50 text-red-500" />
                                <span className="text-sm text-red-500">Invalid File</span>
                            </div>
                        )}

                        <button
                            onClick={() => setPreview(false)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                        >
                            <X size={15} className="text-white" />
                        </button>

                        {onRemovePage && orderStatus !== 'submitted' && (
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                   
                                        onRemovePage(currentPage);
                                        if (currentPage === totalPages - 1 && currentPage > 0) {
                                            setCurrentPage(currentPage - 1);
                                        }
                                        if (totalPages === 1) {
                                            setPreview(false);
                                        }
                                    
                                }}
                                className="absolute top-14 right-3 w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-600 flex items-center justify-center transition-colors"
                                title="Remove this page"
                            >
                                <Trash2 size={14} className="text-white" />
                            </button>
                        )}

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

            {onRemove && (
                <DialogComponent isOpen={showRemoveConfirm} closeDialog={() => setShowRemoveConfirm(false)} name="Remove Document" className="max-w-[400px]">
                    <div className="p-6">
                        <div className="text-gray-600 mb-6 text-sm">
                            Are you sure you want to remove <strong className="break-all">{file.name}</strong>?
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                outlined
                                onClick={e => {
                                    e.stopPropagation();
                                    setShowRemoveConfirm(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={e => {
                                    e.stopPropagation();
                                    onRemove();
                                    setShowRemoveConfirm(false);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                </DialogComponent>
            )}
        </>
    );
};

export default DocTile;
