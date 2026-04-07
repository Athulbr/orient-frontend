import React, { useLayoutEffect, useRef, useState } from 'react';

interface DialogTooltipProps {
    content: string;
    children: React.ReactNode;
}

export default function DialogTooltip({ content, children }: DialogTooltipProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [align, setAlign] = useState<'center' | 'left' | 'right'>('center');
    const [maxWidth, setMaxWidth] = useState<number>(220);
    const wrapperRef = useRef<HTMLSpanElement | null>(null);
    const tooltipRef = useRef<HTMLSpanElement | null>(null);

    useLayoutEffect(() => {
        if (!isOpen || !wrapperRef.current || !tooltipRef.current) {
            return;
        }

        const padding = 12;
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const boundaryElement = wrapperRef.current.closest('[role="dialog"]') as HTMLElement | null;
        const boundaryRect = boundaryElement?.getBoundingClientRect();
        const boundaryLeft = boundaryRect?.left ?? 0;
        const boundaryRight = boundaryRect?.right ?? window.innerWidth;
        const availableWidth = Math.max(160, boundaryRight - boundaryLeft - padding * 2);

        setMaxWidth(Math.min(220, availableWidth));

        if (tooltipRect.left < boundaryLeft + padding) {
            setAlign('left');
        } else if (tooltipRect.right > boundaryRight - padding) {
            setAlign('right');
        } else {
            setAlign('center');
        }
    }, [isOpen, content]);

    return (
        <span
            ref={wrapperRef}
            className="relative inline-flex"
            onMouseEnter={() => {
                setAlign('center');
                setIsOpen(true);
            }}
            onMouseLeave={() => setIsOpen(false)}
            onFocus={() => {
                setAlign('center');
                setIsOpen(true);
            }}
            onBlur={() => setIsOpen(false)}
        >
            {children}
            {isOpen && (
                <span
                    ref={tooltipRef}
                    style={{ maxWidth: `${maxWidth}px` }}
                    className={`absolute bottom-full z-10 mb-2 w-max max-w-[220px] rounded-md bg-gray-800 px-3 py-2 text-xs leading-relaxed text-white shadow-lg ${
                        align === 'center'
                            ? 'left-1/2 -translate-x-1/2'
                            : align === 'left'
                                ? 'left-0'
                                : 'right-0'
                    }`}
                >
                    {content}
                    <span
                        className={`absolute top-full h-2 w-2 -translate-y-1/2 rotate-45 bg-gray-800 ${
                            align === 'center'
                                ? 'left-1/2 -translate-x-1/2'
                                : align === 'left'
                                    ? 'left-4'
                                    : 'right-4'
                        }`}
                    />
                </span>
            )}
        </span>
    );
}
