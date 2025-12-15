import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ExcelSheetConfig } from './index';

interface SheetSelectorProps {
    sheets: ExcelSheetConfig[];
    activeSheetIndex: number;
    setActiveSheetIndex: (index: number) => void;
    setSheets: React.Dispatch<React.SetStateAction<ExcelSheetConfig[]>>;
    addSheet: () => void;
    deleteSheet: (e: React.MouseEvent, index: number) => void;
}

const SheetSelector: React.FC<SheetSelectorProps> = ({ sheets, activeSheetIndex, setActiveSheetIndex, setSheets, addSheet, deleteSheet }) => {
    return (
        <div className="flex items-center bg-gray-50 border-b overflow-x-auto no-scrollbar">
            {sheets.map((sheet, idx) => (
                <div
                    key={sheet.id}
                    onClick={() => setActiveSheetIndex(idx)}
                    className={`
              group flex items-center px-4 py-2 cursor-pointer text-sm font-medium border-r transition-all min-w-[120px] justify-between
              ${activeSheetIndex === idx ? 'bg-white text-blue-600 border-b-2 border-b-blue-600' : 'text-gray-500 hover:bg-gray-100'}
          `}
                >
                    <input
                        className="bg-transparent focus:outline-none w-full cursor-pointer"
                        value={sheet.sheetName}
                        onChange={e => {
                            const newSheets = [...sheets];
                            newSheets[idx].sheetName = e.target.value;
                            setSheets(newSheets);
                        }}
                    />
                    {sheets.length > 1 && (
                        <Trash2
                            size={14}
                            className="ml-2 text-gray-300 group-hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={e => deleteSheet(e, idx)}
                        />
                    )}
                </div>
            ))}
            <button onClick={addSheet} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Add Sheet">
                <Plus size={18} />
            </button>
        </div>
    );
};

export default SheetSelector;
