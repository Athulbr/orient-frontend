import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import Tooltip from '../../../../../components/Tooltip';
import { useState } from 'react';

interface TableFooterIF {
    test?: string;
}

const TableFooter: React.FC<TableFooterIF> = () => {
    const [showPageInput, setShowPageInput] = useState(false);

    return (
        <div className="flex justify-between">
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 pl-2">
                <span className="font-medium">
                    Showing&nbsp;{1}&nbsp;to&nbsp;{10}&nbsp;of&nbsp;100 &nbsp;results
                </span>
            </div>
            <div className="relative mt-2 mr-4 flex items-center gap-2">
                <Tooltip text="First Page" position="top">
                    <PaginationButton onClick={() => {}} disabled={false} icon={<ChevronsLeft className="h-4 w-4" />} />
                </Tooltip>
                <Tooltip text="Prev Page" position="top">
                    <PaginationButton onClick={() => {}} disabled={false} icon={<ChevronLeft className="h-4 w-4" />} />
                </Tooltip>

                <span onClick={() => setShowPageInput(true)} className="cursor-pointer rounded-lg border-1 border-gray-100 px-4 py-2 text-sm hover:bg-gray-50">
                    Page {showPageInput ? <input type="number" min="1" max="5" defaultValue="1" className="w-10 text-center border rounded" /> : '1'} of {5}
                </span>
                <Tooltip text="Next Page" position="top">
                    <PaginationButton onClick={() => {}} disabled={false} icon={<ChevronRight className="h-4 w-4" />} />
                </Tooltip>
                <Tooltip text="Last Page" position="top">
                    <PaginationButton onClick={() => {}} disabled={false} icon={<ChevronsRight className="h-4 w-4" />} />
                </Tooltip>
            </div>
        </div>
    );
};

export default TableFooter;

type PaginationButtonProps = {
    onClick: () => void;
    disabled: boolean;
    icon: React.ReactNode;
};

const PaginationButton: React.FC<PaginationButtonProps> = ({ onClick, disabled, icon }) => (
    <button
        className="cursor-pointer rounded-lg border p-2 hover:bg-gray-200 disabled:opacity-50 disabled:hover:cursor-default disabled:hover:bg-white"
        onClick={onClick}
        disabled={disabled}
    >
        {icon}
    </button>
);
