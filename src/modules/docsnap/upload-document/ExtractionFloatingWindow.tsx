import { CheckCircle2, ChevronDown, ChevronRight, CircleAlert, CircleX } from 'lucide-react';
import { cn } from '../../../global-utils/twMerge';
import { useDocsnapStore } from '../../../zustand-store/DocsnapStore';
import ProgressBar from '../../../components/ProgressBar';
import { useState, useRef, useCallback } from 'react';
import React from 'react';

interface ExtractionFloatingWindowIF {
    test?: string;
}

const ExtractionFloatingWindow: React.FC<ExtractionFloatingWindowIF> = () => {
    const { extractionQueue, clearExtractionQueue } = useDocsnapStore();
    const [minimize, setMinimize] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const windowRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!windowRef.current) return;

        const rect = windowRef.current.getBoundingClientRect();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;

            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            // Constrain to viewport
            const maxX = window.innerWidth - (windowRef.current?.offsetWidth || 0);
            const maxY = window.innerHeight - (windowRef.current?.offsetHeight || 0);

            setPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY))
            });
        },
        [isDragging, dragStart]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Add global mouse event listeners
    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Early return after all hooks are declared
    if (!extractionQueue.length) return null;

    const getStatusUI = (status: string) => {
        switch (status) {
            case 'Uploading':
                return <p className="rounded bg-amber-100 px-2 py-1 text-sm text-amber-500">Uploading</p>;
            case 'Running OCR':
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-amber-500">Running OCR</span>
                        <div className="flex items-center gap-3">
                            <ProgressBar value={40} />
                            <span className="text-[10px] text-amber-500">40%</span>
                        </div>
                    </div>
                );
            case 'Converting File':
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-amber-500">Converting File</span>
                        <div className="flex items-center gap-3">
                            <ProgressBar value={10} />
                            <span className="text-[10px] text-amber-500">10%</span>
                        </div>
                    </div>
                );
            case 'Extracting Text':
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-amber-500">Extracting Text</span>
                        <div className="flex items-center gap-3">
                            <ProgressBar value={20} />
                            <span className="text-[10px] text-amber-500">20%</span>
                        </div>
                    </div>
                );
            case 'Simplifying Vision Data':
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-amber-500">Simplifying Vision Data</span>
                        <div className="flex items-center gap-3">
                            <ProgressBar value={30} />
                            <span className="text-[10px] text-amber-500">30%</span>
                        </div>
                    </div>
                );
            case 'Generating Prompt':
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-amber-500">Generating Prompt</span>
                        <div className="flex items-center gap-3">
                            <ProgressBar value={40} />
                            <span className="text-[10px] text-amber-500">40%</span>
                        </div>
                    </div>
                );
            case 'Generating Response':
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-amber-500">Generating Response</span>
                        <div className="flex items-center gap-3">
                            <ProgressBar value={50} />
                            <span className="text-[10px] text-amber-500">50%</span>
                        </div>
                    </div>
                );
            case 'Mapping Bounding Box':
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-amber-500">Mapping Bounding Box</span>
                        <div className="flex items-center gap-3">
                            <ProgressBar value={80} />
                            <span className="text-[10px] text-amber-500">80%</span>
                        </div>
                    </div>
                );
            case 'Saving Data':
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-amber-500">Saving Data</span>
                        <div className="flex items-center gap-3">
                            <ProgressBar value={90} />
                            <span className="text-[10px] text-amber-500">90%</span>
                        </div>
                    </div>
                );
            case 'OCR Processing':
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-amber-500">OCR Processing</span>
                        <div className="flex items-center gap-3">
                            <ProgressBar value={70} className="min-w-20" />
                            <span className="text-[10px] text-amber-500">70%</span>
                        </div>
                    </div>
                );
            case 'Complete':
                return <CheckCircle2 className="text-green-500" />;
            case 'failed':
                return <CircleAlert className="text-red-500" />;
            case 'Completed':
                return <CheckCircle2 className="text-green-500" />;
            case 'completed':
                return <CheckCircle2 className="text-green-500" />;
            case 'Failed':
                return <CircleAlert className="text-red-500" />;
            default:
                return <p className="rounded bg-amber-100 px-2 py-1 text-sm text-amber-500">Processing</p>;
        }
    };

    return (
        <div
            ref={windowRef}
            className="fixed z-10000 flex w-120 flex-col gap-2 rounded-lg border bg-white shadow-lg shadow-gray-600"
            style={{
                right: position.x === 0 ? '1rem' : 'auto',
                bottom: position.x === 0 ? '1rem' : 'auto',
                left: position.x !== 0 ? `${position.x}px` : 'auto',
                top: position.y !== 0 ? `${position.y}px` : 'auto',
                cursor: isDragging ? 'grabbing' : 'default'
            }}
        >
            <div
                className={cn('flex w-full items-center justify-between border-b p-4 text-lg font-semibold', 'cursor-grab active:cursor-grabbing select-none')}
                onMouseDown={handleMouseDown}
            >
                Extraction Status
                <div className="flex gap-3 items-center">
                    <span className="text-sm text-green-500 font-light">
                        ({extractionQueue.filter(i => i.status === 'Complete').length}/{extractionQueue.length})
                    </span>
                    {minimize ? (
                        <ChevronRight
                            size={22}
                            className="cursor-pointer text-gray-500 hover:text-gray-700"
                            onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMinimize(false);
                            }}
                            onMouseDown={e => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        />
                    ) : (
                        <ChevronDown
                            size={22}
                            className="cursor-pointer text-gray-500 hover:text-gray-700"
                            onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMinimize(true);
                            }}
                            onMouseDown={e => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        />
                    )}
                    <CircleX
                        size={20}
                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            clearExtractionQueue();
                        }}
                        onMouseDown={e => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    />
                </div>
            </div>
            {!minimize && (
                <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-4">
                    {extractionQueue.map((file: any, idx: number) => (
                        <div key={idx} className={cn('flex items-center justify-between gap-2')}>
                            <div className="flex justify-between items-center">
                                <p className="truncate text-sm">{file.fileName}</p>&nbsp;&nbsp;
                                <span className="text-sm text-nowrap text-green-600">( {file.time}s )</span>
                            </div>
                            {getStatusUI(file.status)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExtractionFloatingWindow;
