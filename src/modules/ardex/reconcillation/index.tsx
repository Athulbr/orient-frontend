import React, { useState, useRef, useEffect } from 'react';

const dummyCards = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    name: `Reconciliation Item ${i + 1}`,
    subName: `Sub detail for item ${i + 1}`,
    details: Array.from({ length: 22 }).map((_, j) => {
        const isWide = j % 6 === 0;
        const isTall = j % 8 === 0;
        return {
            id: j,
            label: `Detail Property ${j + 1}`,
            value: `Random value ${Math.random().toString(36).substring(7)}`,
            className: `${isWide ? 'col-span-2' : 'col-span-1'} ${isTall ? 'row-span-2' : 'row-span-1'}`
        };
    })
}));

const ArdexReconcillation: React.FC = () => {
    const [leftWidth, setLeftWidth] = useState(20);
    const [selectedCard, setSelectedCard] = useState(dummyCards[0]);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMouseDown = () => {
        isDragging.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        if (newLeftWidth > 15 && newLeftWidth < 85) {
            setLeftWidth(newLeftWidth);
        }
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <div ref={containerRef} className="flex h-full w-full bg-gray-50 overflow-hidden">
            {/* Left Container */}
            <div style={{ width: `${leftWidth}%` }} className="h-full flex flex-col border-r border-gray-200 bg-white">
                <div className="p-4 border-b border-gray-200 bg-gray-100 font-semibold text-lg">Reconciliation List</div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {dummyCards.map(card => (
                        <div
                            key={card.id}
                            onClick={() => setSelectedCard(card)}
                            className={`p-4 rounded-lg cursor-pointer border transition-all duration-200 shadow-sm
                                ${selectedCard.id === card.id ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'}`}
                        >
                            <h3 className="font-bold text-gray-800">{card.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{card.subName}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resizer */}
            <div onMouseDown={handleMouseDown} className="w-2 cursor-col-resize bg-gray-200 hover:bg-blue-400 active:bg-blue-500 transition-colors z-10" />

            {/* Right Container */}
            <div style={{ width: `calc(${100 - leftWidth}% - 8px)` }} className="h-full flex flex-col bg-gray-50">
                <div className="p-4 border-b border-gray-200 bg-white shadow-sm font-semibold text-lg sticky top-0 z-10 flex items-center justify-between">
                    <span>Details for {selectedCard.name}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[120px]">
                        {selectedCard.details.map(detail => (
                            <div
                                key={detail.id}
                                className={`bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col justify-center
                                    ${detail.className} hover:shadow-lg transition-shadow duration-300`}
                            >
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{detail.label}</span>
                                <span className="text-gray-800 font-medium text-lg break-words line-clamp-3">{detail.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArdexReconcillation;
