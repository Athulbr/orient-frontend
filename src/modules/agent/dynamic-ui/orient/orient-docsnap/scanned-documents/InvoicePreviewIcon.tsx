import React, { useState, useEffect, useRef } from 'react';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { config } from '../../../../../../config/default';
import { API_KEY } from './constants';

interface InvoicePreviewIconProps {
    invoicePagePath?: string;
}

/**
 * Displays a document icon.
 * On hover, fetches and shows a thumbnail popup of the invoice page image.
 * The image is fetched lazily on first hover and the object URL is revoked on unmount.
 */
const InvoicePreviewIcon: React.FC<InvoicePreviewIconProps> = ({ invoicePagePath }) => {
    const [hover, setHover] = useState(false);
    const [hasHovered, setHasHovered] = useState(false);
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const iconRef = useRef<HTMLDivElement>(null);
    const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

    // Fetch preview image on first hover
    useEffect(() => {
        if (!invoicePagePath || !hasHovered) return;

        let objectUrl: string;

        const fetchImage = async () => {
            setLoading(true);
            try {
                const url = `${config.workflowService}/api/executions/files?path=${encodeURIComponent(invoicePagePath)}`;
                const token = localStorage.getItem('token');
                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'x-api-key': API_KEY
                    }
                });
                if (!res.ok) throw new Error('Failed to fetch image');
                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                setThumbUrl(objectUrl);
            } catch (err) {
                console.error('Error fetching preview:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [invoicePagePath, hasHovered]);

    const handleMouseEnter = () => {
        setHover(true);
        setHasHovered(true);

        if (iconRef.current) {
            const cardEl = iconRef.current.closest('.scanned-document-card');
            const rect = cardEl ? cardEl.getBoundingClientRect() : iconRef.current.getBoundingClientRect();
            const isLowerHalf = rect.top > window.innerHeight / 2;

            setPopupStyle({
                position: 'fixed',
                left: rect.left + rect.width / 2,
                transform: 'translateX(-50%)',
                ...(isLowerHalf ? { bottom: window.innerHeight - rect.top + 10 } : { top: rect.bottom + 10 }),
                zIndex: 999
            });
        }
    };

    return (
        <div
            ref={iconRef}
            className="relative flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setHover(false)}
        >
            <FileText size={18} className="text-blue-500" />

            {hover && invoicePagePath && (
                <div style={popupStyle} className="pointer-events-none p-2 bg-white rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.15)] border border-gray-200">
                    {loading && !thumbUrl ? (
                        <div className="flex flex-col gap-3 items-center justify-center bg-gray-50 rounded-xl" style={{ width: '40vw', height: '35vh' }}>
                            <Loader2 size={36} className="animate-spin text-blue-500" />
                            <span className="text-sm text-gray-500 font-medium">Loading preview...</span>
                        </div>
                    ) : thumbUrl ? (
                        <div className="w-[40vw] h-[35vh] rounded-xl overflow-hidden shadow-sm bg-gray-50 relative">
                            <img src={thumbUrl} alt="Invoice Preview" className="absolute top-0 left-0 w-[80vw] max-w-none h-auto object-left-top -translate-y-[10%]" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-red-400 bg-red-50 p-10 rounded-xl" style={{ width: '40vw', height: '35vh' }}>
                            <AlertCircle size={36} className="mb-3" />
                            <span className="text-sm font-medium">Preview failed</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InvoicePreviewIcon;
