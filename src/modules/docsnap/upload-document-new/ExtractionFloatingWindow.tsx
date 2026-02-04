import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, CircleAlert, CircleX, Loader, LoaderCircle } from 'lucide-react';
import { cn } from '../../../global-utils/twMerge';
import { useExtractionStore } from '../../../zustand-store/extractionStore';
import ProgressBar from '../../../components/ProgressBar';
import { useDraggable } from './useDraggable';
import Spinner from '../../../components/Spinner';

interface ExtractionFloatingWindowIF {
    test?: string;
}

const ExtractionFloatingWindowNew: React.FC<ExtractionFloatingWindowIF> = () => {
    const { extractionQueue, clearExtractionQueue } = useExtractionStore();
    const [minimize, setMinimize] = useState(false);

    const { ref, position, isDragging, handleMouseDown } = useDraggable<HTMLDivElement>();

    if (!extractionQueue.length) return null;

    const getStatusUI = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="text-green-500" />;
            case 'failed':
                return <CircleAlert className="text-red-500" />;
            default:
                return <LoaderCircle size={18} className="text-amber-500 animate-spin" />;
        }
    };
    const getProgressUI = (step: string, progress: number) => {
        return (
            <div className="flex flex-col text-xs w-full">
                <span className="text-amber-500">{step}</span>
                <div className="flex items-center gap-3">
                    <ProgressBar value={progress || 0} />
                    <span className="text-[10px] text-amber-500">{progress || 0}%</span>
                </div>
            </div>
        );
    };

    return (
        <div
            ref={ref}
            className="fixed z-10000 bottom-2 right-2 flex w-120 flex-col gap-2 rounded-lg border bg-white shadow-lg shadow-gray-600"
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
                        ({extractionQueue.filter((i: any) => i.status === 'completed').length}/{extractionQueue.length})
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
                        <div
                            key={idx}
                            className={cn(
                                'flex items-center flex-col justify-between gap-1 border p-3 rounded-lg border-l-4 border-l-amber-500',
                                file.status === 'completed' ? 'border-l-green-500' : file.status === 'failed' ? 'border-l-red-500' : ''
                            )}
                        >
                            <div className="flex justify-between items-center w-full">
                                <div className="flex items-center max-w-[250px]">
                                    <p className="truncate text-sm">{file.fileName}</p>
                                    &nbsp;&nbsp;
                                    <span className="text-sm text-nowrap text-green-600">( {file.time}s )</span>
                                </div>
                                {getStatusUI(file.status)}
                            </div>
                            {file.status === 'processing' && getProgressUI(file.step, file.progress)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExtractionFloatingWindowNew;
