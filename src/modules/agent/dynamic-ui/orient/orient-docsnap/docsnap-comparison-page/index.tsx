import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X, GripHorizontal, ArrowLeft } from 'lucide-react';
import { config } from '../../../../../../config/default';

import styles from './scrollbar.module.css';
import { sampleRecord } from './sampleRecord';
import SubmitToMaraekat from './SubmitToMaraekat';
import { Order } from '../types';

const getPreviewUrl = (url: string) => {
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
    return `${config.workflowService}/api/temp-storage/preview/${encodedPath}?apiKey=secret1`;
};

interface BBox {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
}

type FieldValue = {
    value: string | number;
    bbox: BBox | null;
    page: number | null;
    confidence: number | null;
    index: number | null;
    wordIndexes: number[];
};

type FieldGroup = Record<string, FieldValue>;
type ExtractedData = Record<string, FieldGroup | any[]>;

interface DocsnapComparisonUIProps {
    recordId: string;
    onClose?: () => void;
    order: Order;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const DocsnapComparisonUI: React.FC<DocsnapComparisonUIProps> = ({ recordId, onClose, order }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const leftPaneRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [leftWidth, setLeftWidth] = useState(70);
    const [isResizing, setIsResizing] = useState(false);
    const [record, setRecord] = useState<any>({});
    const [extractedData, setExtractedData] = useState<ExtractedData>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const handlePopState = () => {
            if (onClose) onClose();
        };
        window.history.pushState({ modal: 'docsnap' }, '');
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [onClose]);

    const handleClose = () => {
        if (window.history.state?.modal === 'docsnap') {
            window.history.back();
        } else {
            if (onClose) onClose();
        }
    };

    const handleSave = async () => {
        if (!recordId) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${config.workflowService}/api/agent-records/${recordId}?apiKey=secret1`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ finalOutput: extractedData })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setRecord(data.record);
                }
            }
        } catch (error) {
            console.error('Error saving record:', error);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const fetchRecord = async () => {
            try {
                if (!recordId) return;
                const res = await fetch(`${config.workflowService}/api/agent-records/${recordId}?apiKey=secret1`);
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted && data.success && data.record) {
                        setRecord(data.record);
                        setExtractedData(data.record.finalOutput as unknown as ExtractedData);
                        return;
                    }
                }
                throw new Error('Failed to fetch from API');
            } catch (err) {
                console.error('Error fetching record:', err);
                if (isMounted) {
                    // Fallback to sampleRecord for development if database fails
                    setRecord(sampleRecord);
                    setExtractedData(sampleRecord.finalOutput as unknown as ExtractedData);
                }
            }
        };

        fetchRecord();
        return () => {
            isMounted = false;
        };
    }, [recordId]);

    const lineRef = useRef<SVGSVGElement>(null);
    const zoomLabelRef = useRef<HTMLDivElement>(null);
    const activeFieldRef = useRef<string | null>(null);
    const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
    const rightPaneRef = useRef<HTMLDivElement>(null);

    // Draggable edit card state
    const [editCardPos, setEditCardPos] = useState({ x: 0, y: 0 });
    const isEditCardDragging = useRef(false);
    const editCardDragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

    const zoomRef = useRef(0.95);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

    const updateConnectionLine = useCallback(() => {
        if (!lineRef.current || !activeFieldRef.current || !containerRef.current) {
            if (lineRef.current) lineRef.current.style.opacity = '0';
            return;
        }

        const inputId = `input-${activeFieldRef.current}`;
        const bboxId = `bbox-${activeFieldRef.current}`;

        const inputEl = document.getElementById(inputId);
        const bboxEl = document.getElementById(bboxId);

        if (inputEl && bboxEl) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const inputRect = inputEl.getBoundingClientRect();
            const bboxRect = bboxEl.getBoundingClientRect();

            // Start: left edge of the input field
            const startX = inputRect.left - containerRect.left;
            const startY = inputRect.top + inputRect.height / 2 - containerRect.top;
            // End: right edge of the bbox
            const endX = bboxRect.right - containerRect.left;
            const endY = bboxRect.top + bboxRect.height / 2 - containerRect.top;

            // Fixed length of each horizontal arm (start stub & end stub)
            const armLen = 60;

            // Build the straight-cross-straight path: short H arm → diagonal cross → short H arm
            const pathD = `M ${startX} ${startY} H ${startX - armLen} L ${endX + armLen} ${endY} H ${endX}`;

            const svg = lineRef.current;
            const path = svg.querySelector('path') as SVGPathElement | null;
            const dotStart = svg.querySelector('.dot-start') as SVGCircleElement | null;
            const dotEnd = svg.querySelector('.dot-end') as SVGCircleElement | null;

            if (path) path.setAttribute('d', pathD);
            if (dotStart) {
                dotStart.setAttribute('cx', String(startX));
                dotStart.setAttribute('cy', String(startY));
            }
            if (dotEnd) {
                dotEnd.setAttribute('cx', String(endX));
                dotEnd.setAttribute('cy', String(endY));
            }

            svg.style.opacity = '1';

            bboxEl.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
            bboxEl.style.borderColor = 'rgba(59, 130, 246, 1)';
            bboxEl.style.zIndex = '10';
        } else {
            lineRef.current.style.opacity = '0';
        }
    }, []);

    const handleBlur = useCallback(
        (e?: React.FocusEvent) => {
            // Don't deactivate if focus moved to the floating edit card
            if (e?.relatedTarget && (e.relatedTarget as HTMLElement).closest?.('[data-edit-card]')) {
                return;
            }
            if (activeFieldRef.current) {
                const oldBbox = document.getElementById(`bbox-${activeFieldRef.current}`);
                if (oldBbox) {
                    oldBbox.style.backgroundColor = '';
                    oldBbox.style.borderColor = '';
                    oldBbox.style.zIndex = '';
                }
                activeFieldRef.current = null;
                setActiveFieldId(null);
                updateConnectionLine();
            }
        },
        [updateConnectionLine]
    );

    const updateTransform = useCallback(() => {
        if (contentRef.current) {
            contentRef.current.style.transform = `scale(${zoomRef.current})`;
            contentRef.current.style.transformOrigin = zoomRef.current > 1.2 ? 'top left' : 'top center';
            // Switch alignment so left side is accessible when zoomed in
            if (zoomRef.current > 1.2) {
                contentRef.current.classList.remove('items-center');
                contentRef.current.classList.add('items-start');
            } else {
                contentRef.current.classList.remove('items-start');
                contentRef.current.classList.add('items-center');
            }
            if (zoomLabelRef.current) {
                zoomLabelRef.current.innerText = Math.round(zoomRef.current * 100) + '%';
            }
            requestAnimationFrame(updateConnectionLine);
        }
    }, [updateConnectionLine]);

    const apiUrls = useMemo<string[]>(() => {
        return (record?.files?.localImagePaths || []).map((path: string) => getPreviewUrl(path));
    }, [record]);

    const [imageUrls, setImageUrls] = useState<string[]>([]);

    useEffect(() => {
        let isMounted = true;
        if (!apiUrls.length) return;

        const loadBlobs = async () => {
            const urls: string[] = new Array(apiUrls.length).fill('');
            for (let i = 0; i < apiUrls.length; i++) {
                try {
                    const res = await fetch(apiUrls[i]);
                    if (res.ok) {
                        const blob = await res.blob();
                        if (isMounted) {
                            urls[i] = URL.createObjectURL(blob);
                            setImageUrls([...urls]);
                        }
                    }
                } catch (e) {
                    console.error('Error fetching docsnap image:', e);
                }
            }
        };

        loadBlobs();

        return () => {
            isMounted = false;
            setImageUrls(urls => {
                urls.forEach(url => {
                    if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
                });
                return [];
            });
        };
    }, [apiUrls]);

    const scrollToBbox = useCallback((id: string) => {
        const bboxEl = document.getElementById(`bbox-${id}`);
        const container = canvasRef.current;
        if (!bboxEl || !container) return;

        const containerRect = container.getBoundingClientRect();
        const bboxRect = bboxEl.getBoundingClientRect();

        // Calculate how far to scroll to center the bbox
        const scrollAmountY = bboxRect.top + bboxRect.height / 2 - (containerRect.top + containerRect.height / 3);
        const scrollAmountX = bboxRect.left + bboxRect.width / 2 - (containerRect.left + containerRect.width / 2);

        container.scrollTo({
            top: container.scrollTop + scrollAmountY,
            left: container.scrollLeft + scrollAmountX,
            behavior: 'smooth'
        });
    }, []);

    // Scroll right pane to bring input into view
    const scrollToInput = useCallback((id: string) => {
        const inputEl = document.getElementById(`input-${id}`);
        if (inputEl && rightPaneRef.current) {
            const containerRect = rightPaneRef.current.getBoundingClientRect();
            const inputRect = inputEl.getBoundingClientRect();
            const scrollAmountY = inputRect.top + inputRect.height / 2 - (containerRect.top + containerRect.height / 2);

            rightPaneRef.current.scrollTo({
                top: rightPaneRef.current.scrollTop + scrollAmountY,
                behavior: 'smooth'
            });
        }
    }, []);

    const handleFocus = useCallback(
        (id: string) => {
            activeFieldRef.current = id;
            setActiveFieldId(id);
            scrollToBbox(id);
            updateConnectionLine();

            // Keep line connected during smooth scroll
            const start = performance.now();
            const tick = () => {
                updateConnectionLine();
                if (performance.now() - start < 500) {
                    requestAnimationFrame(tick);
                }
            };
            requestAnimationFrame(tick);
        },
        [scrollToBbox, updateConnectionLine]
    );

    // Handle bbox click: activate field, focus input, show connection line
    const handleBboxClick = useCallback(
        (id: string, e: React.MouseEvent) => {
            e.stopPropagation();
            // Focus the corresponding input field
            const inputEl = document.getElementById(`input-${id}`);
            if (inputEl) {
                (inputEl as HTMLInputElement).focus();
            }
            // Scroll right pane to the input
            scrollToInput(id);
        },
        [scrollToInput]
    );

    // Draggable edit card handlers
    const startEditCardDrag = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            isEditCardDragging.current = true;
            editCardDragStart.current = {
                x: e.clientX,
                y: e.clientY,
                posX: editCardPos.x,
                posY: editCardPos.y
            };

            const handleMove = (me: MouseEvent) => {
                if (!isEditCardDragging.current) return;
                const dx = me.clientX - editCardDragStart.current.x;
                const dy = me.clientY - editCardDragStart.current.y;
                setEditCardPos({
                    x: editCardDragStart.current.posX + dx,
                    y: editCardDragStart.current.posY + dy
                });
            };

            const handleUp = () => {
                isEditCardDragging.current = false;
                window.removeEventListener('mousemove', handleMove);
                window.removeEventListener('mouseup', handleUp);
            };

            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
        },
        [editCardPos]
    );

    const closeEditCard = useCallback(() => {
        handleBlur();
        const activeInput = document.getElementById(`input-${activeFieldRef.current}`);
        if (activeInput) (activeInput as HTMLInputElement).blur();
    }, [handleBlur]);

    // Reset edit card position when active field changes
    useEffect(() => {
        setEditCardPos({ x: 0, y: 0 });
    }, [activeFieldId]);

    // Get the field info (groupKey, fieldKey, value) for the active field
    const activeFieldInfo = useMemo(() => {
        if (!activeFieldId) return null;
        const [groupKey, fieldKey] = activeFieldId.split('-');
        const group = extractedData[groupKey];
        if (!group || Array.isArray(group)) return null;
        const field = group[fieldKey];
        if (!field) return null;
        return { groupKey, fieldKey, field };
    }, [activeFieldId, extractedData]);

    const handleZoomIn = () => {
        zoomRef.current = Math.min(zoomRef.current + 0.25, 3);
        updateTransform();
    };
    const handleZoomOut = () => {
        zoomRef.current = Math.max(zoomRef.current - 0.25, 0.25);
        updateTransform();
    };
    const handleResetZoom = () => {
        zoomRef.current = 0.95;
        updateTransform();
        if (canvasRef.current) {
            canvasRef.current.scrollTo({ top: 0, left: 0 });
        }
    };

    const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        isDraggingRef.current = true;
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            scrollLeft: canvasRef.current?.scrollLeft || 0,
            scrollTop: canvasRef.current?.scrollTop || 0
        };
    };

    const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !canvasRef.current) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        canvasRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;
        canvasRef.current.scrollTop = dragStartRef.current.scrollTop - dy;
    };

    const stopDrag = () => {
        isDraggingRef.current = false;
    };

    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);

    const resize = useCallback(
        (mouseMoveEvent: MouseEvent) => {
            if (isResizing && containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const newWidth = ((mouseMoveEvent.clientX - containerRect.left) / containerRect.width) * 100;
                if (newWidth > 10 && newWidth < 90) setLeftWidth(newWidth);
            }
        },
        [isResizing]
    );

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, resize, stopResizing]);

    useEffect(() => {
        updateTransform();
    }, [leftWidth, updateTransform]);

    // Pinch-to-zoom via ctrl/meta + wheel
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY * -0.01;
                zoomRef.current = Math.min(Math.max(zoomRef.current + delta, 0.25), 3);
                updateTransform();
            }
            // Regular scroll is handled natively by overflow-auto
        };

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (canvas) {
                canvas.removeEventListener('wheel', handleWheel);
            }
        };
    }, [updateTransform]);

    // Update connection line on scroll
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handleScroll = () => requestAnimationFrame(updateConnectionLine);
        canvas.addEventListener('scroll', handleScroll);
        return () => canvas.removeEventListener('scroll', handleScroll);
    }, [updateConnectionLine]);

    // Only collect bboxes from non-array groups
    const allBboxes = useMemo(() => {
        const bboxes: { id: string; bbox: Pick<BBox, 'x_min' | 'y_min' | 'x_max' | 'y_max'>; page: number }[] = [];
        Object.entries(extractedData).forEach(([groupKey, groupValue]) => {
            if (Array.isArray(groupValue)) return; // skip arrays
            Object.entries(groupValue).forEach(([fieldKey, fieldValue]: [string, any]) => {
                if (fieldValue?.bbox && fieldValue?.page !== null) {
                    bboxes.push({
                        id: `${groupKey}-${fieldKey}`,
                        bbox: fieldValue.bbox,
                        page: fieldValue.page
                    });
                }
            });
        });
        return bboxes;
    }, [extractedData]);

    return (
        <div ref={containerRef} className="relative flex h-full w-full overflow-hidden bg-white text-zinc-800">
            {/* Left Pane */}
            <div ref={leftPaneRef} className="flex h-full flex-shrink-0 flex-col border-r border-zinc-200 bg-zinc-100" style={{ width: `${leftWidth}%` }}>
                {/* Toolbar */}
                <div className="z-10 flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <button onClick={handleClose} className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900" title="Back">
                            <ArrowLeft size={18} />
                        </button>
                        <span className="max-w-[200px] truncate text-sm font-medium text-zinc-600">Document Viewer</span>
                    </div>
                    <div className="flex items-center space-x-1 rounded-md border border-zinc-200 bg-zinc-100 p-1">
                        <button onClick={handleZoomOut} className="rounded p-1.5 text-zinc-600 transition-all hover:bg-white hover:shadow-sm" title="Zoom Out">
                            <ZoomOut size={16} />
                        </button>
                        <div className="w-16 border-r border-l border-zinc-200 px-2 text-center text-xs font-medium text-zinc-600" ref={zoomLabelRef}>
                            {Math.round(zoomRef.current * 100)}%
                        </div>
                        <button onClick={handleZoomIn} className="rounded p-1.5 text-zinc-600 transition-all hover:bg-white hover:shadow-sm" title="Zoom In">
                            <ZoomIn size={16} />
                        </button>
                        <div className="mx-1 h-4 w-px bg-zinc-300" />
                        <button onClick={handleResetZoom} className="rounded p-1.5 text-zinc-600 transition-all hover:bg-white hover:shadow-sm" title="Reset Zoom">
                            <RotateCcw size={16} />
                        </button>
                    </div>
                    <div className="w-[88px]" />
                </div>

                {/* Canvas Area */}
                <div
                    ref={canvasRef}
                    className="relative flex-1 cursor-grab overflow-auto bg-zinc-200/50 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                    onMouseDown={startDrag}
                    onMouseMove={handleDrag}
                    onMouseUp={stopDrag}
                    onMouseLeave={stopDrag}
                >
                    <div
                        ref={contentRef}
                        className="flex min-h-full flex-col items-center gap-6 pt-6"
                        style={{
                            transform: `scale(${zoomRef.current})`,
                            transformOrigin: 'top center'
                        }}
                    >
                        {imageUrls.map((url, index) => (
                            <div key={index} className="relative w-full bg-white px-8 shadow-lg ring-1 ring-black/5">
                                {url ? <img src={url} alt={`Document Page ${index + 1}`} className="pointer-events-none block w-full object-contain select-none" draggable={false} /> : null}
                                <div className="absolute inset-y-0 right-8 left-8">
                                    {allBboxes
                                        .filter(b => b.page === index + 1)
                                        .map(b => (
                                            <div
                                                key={b.id}
                                                id={`bbox-${b.id}`}
                                                className={`absolute cursor-pointer border transition-colors hover:border-blue-500 hover:bg-blue-400/10 ${
                                                    activeFieldId === b.id ? 'z-10 border-blue-500 bg-blue-500/5' : 'border-yellow-600 bg-yellow-500/8'
                                                }`}
                                                style={{
                                                    left: `${(b.bbox.x_min - 0.004) * 100}%`,
                                                    top: `${(b.bbox.y_min - 0.003) * 100}%`,
                                                    width: `${(b.bbox.x_max - b.bbox.x_min + 0.01) * 100}%`,
                                                    height: `${(b.bbox.y_max - b.bbox.y_min + 0.005) * 100}%`
                                                }}
                                                onClick={e => handleBboxClick(b.id, e)}
                                            >
                                                {/* Draggable edit card for the active bbox */}
                                                {activeFieldId === b.id && activeFieldInfo && (
                                                    <div
                                                        data-edit-card
                                                        className="absolute z-20 min-w-[240px] rounded-lg border border-zinc-300 bg-white p-3 shadow-xl"
                                                        style={{
                                                            top: `calc(100% + 8px + ${editCardPos.y}px)`,
                                                            left: `${-10 + editCardPos.x}px`
                                                        }}
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        {/* Drag handle + label + close */}
                                                        <div className="mb-2 flex items-center justify-between gap-2">
                                                            <div className="flex cursor-grab items-center gap-1.5 active:cursor-grabbing" onMouseDown={startEditCardDrag}>
                                                                <GripHorizontal size={14} className="text-zinc-400" />
                                                                <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">{activeFieldInfo.fieldKey.replace(/_/g, ' ')}</span>
                                                            </div>
                                                            <button onClick={closeEditCard} className="rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                        {/* Editable textarea */}
                                                        <textarea
                                                            value={activeFieldInfo.field?.value !== undefined ? String(activeFieldInfo.field.value) : ''}
                                                            onChange={e => {
                                                                const newData = { ...extractedData };
                                                                newData[activeFieldInfo.groupKey] = {
                                                                    ...(newData[activeFieldInfo.groupKey] as FieldGroup),
                                                                    [activeFieldInfo.fieldKey]: {
                                                                        ...(activeFieldInfo.field || {}),
                                                                        value: e.target.value
                                                                    }
                                                                };
                                                                setExtractedData(newData);
                                                            }}
                                                            rows={1}
                                                            className="w-full resize-none rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                            style={{ minHeight: '32px' }}
                                                            onInput={e => {
                                                                const target = e.target as HTMLTextAreaElement;
                                                                target.style.height = 'auto';
                                                                target.style.height = `${target.scrollHeight}px`;
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Resizer */}
            <div
                className={`relative z-10 flex w-1 flex-shrink-0 cursor-col-resize items-center justify-center transition-colors hover:bg-blue-500 ${isResizing ? 'bg-blue-500' : 'bg-gray-200'}`}
                onMouseDown={startResizing}
            >
                <div className="absolute inset-y-0 z-20 -ml-1 w-3" />
            </div>

            <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                {/* Scrollable Fields List */}
                <div ref={rightPaneRef} onScroll={updateConnectionLine} className={`flex-1 overflow-y-auto px-6 py-6 ${styles.track}`}>
                    <div className="mx-auto max-w-3xl space-y-6">
                        {Object.entries(extractedData).map(([groupKey, groupValue]) => {
                            // Skip array groups (e.g. line_items)
                            if (Array.isArray(groupValue)) return null;

                            return (
                                <div key={groupKey} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                                    <div className="border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-zinc-100/50 px-5 py-3.5">
                                        <h3 className="text-sm font-semibold tracking-wide text-zinc-800 capitalize">{groupKey.replace(/_/g, ' ')}</h3>
                                    </div>
                                    <div className="flex flex-col gap-5 p-5">
                                        {Object.entries(groupValue).map(([fieldKey, fieldValue]: [string, any]) => (
                                            <div key={fieldKey} className="flex flex-col space-y-2">
                                                <label htmlFor={`input-${groupKey}-${fieldKey}`} className="text-xs font-semibold tracking-wider text-zinc-600 uppercase">
                                                    {fieldKey.replace(/_/g, ' ')}
                                                </label>
                                                <input
                                                    type="text"
                                                    id={`input-${groupKey}-${fieldKey}`}
                                                    onFocus={() => handleFocus(`${groupKey}-${fieldKey}`)}
                                                    onBlur={e => handleBlur(e)}
                                                    value={fieldValue?.value !== undefined ? String(fieldValue.value) : ''}
                                                    onChange={e => {
                                                        const newData = { ...extractedData };
                                                        newData[groupKey] = {
                                                            ...(newData[groupKey] as FieldGroup),
                                                            [fieldKey]: { ...(fieldValue || {}), value: e.target.value }
                                                        };
                                                        setExtractedData(newData);
                                                    }}
                                                    placeholder="Not available"
                                                    className="w-full rounded-md border border-gray-400 px-4 py-2.5 text-sm text-zinc-800 transition-all selection:bg-blue-200 placeholder:font-normal placeholder:text-zinc-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Fixed Save Bar */}
                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-zinc-200 px-4 py-3">
                    <button
                        onClick={handleClose}
                        className="text-md rounded-md border border-gray-400 bg-white px-3 py-1 font-light text-gray-500 transition-all duration-200 ease-in-out hover:border-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:shadow-md"
                    >
                        Close
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="text-md rounded-md border border-gray-400 bg-white px-3 py-1 font-light text-gray-500 transition-all duration-200 ease-in-out hover:border-blue-500 hover:bg-blue-400 hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>

                    <SubmitToMaraekat order={order} extractedData={extractedData} />
                </div>
            </div>

            {/* Connection line overlay — zig-zag (straight → cross → straight) */}
            <svg ref={lineRef} className="pointer-events-none absolute inset-0 z-[100] h-full w-full opacity-0 transition-opacity duration-150" xmlns="http://www.w3.org/2000/svg">
                <path fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="" />
                <circle className="dot-start" r="3" fill="#3b82f6" cx="0" cy="0" />
                <circle className="dot-end" r="3" fill="#3b82f6" cx="0" cy="0" />
            </svg>
        </div>
    );
};
