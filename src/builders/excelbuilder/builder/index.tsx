import React, { useState } from 'react';
import { Plus, Code, FileSpreadsheet, X, MousePointerClick, Edit2, Check, ChevronRight, Maximize2, Eraser, Save, ChevronLeft } from 'lucide-react';
import { Button } from '../../../components/Button';
import { capitalize } from 'lodash';
import PathPickerDialog from './pathPickerDialog';
import JsEditorDialog from './JsEditor';
import SheetSelector from './SheetSelector';

// --- Types ---

export interface ExcelColumnIF {
    id: string;
    columnName: string;
    jsonPath: string;
    javascript?: string;
}

export interface ExcelSheetConfig {
    id: string;
    sheetName: string;
    columns: ExcelColumnIF[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

interface ExcelExportBuilderProps {
    sheets: ExcelSheetConfig[];
    setSheets: React.Dispatch<React.SetStateAction<ExcelSheetConfig[]>>;
    inputData: any;
}

export const ExcelExportBuilder: React.FC<ExcelExportBuilderProps> = ({ sheets, setSheets, inputData }) => {
    const [activeSheetIndex, setActiveSheetIndex] = useState(0);

    const [pathPickerOpen, setPathPickerOpen] = useState(false);
    const [jsEditorOpen, setJsEditorOpen] = useState(false);
    const [editingColId, setEditingColId] = useState<string | null>(null);
    const [tempJsCode, setTempJsCode] = useState('');

    const addSheet = () => {
        setSheets([...sheets, { id: generateId(), sheetName: `Sheet ${sheets.length + 1}`, columns: [] }]);
        setActiveSheetIndex(sheets.length);
    };

    const deleteSheet = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        if (sheets.length === 1) return;
        const newSheets = sheets.filter((_, i) => i !== index);
        setSheets(newSheets);
        if (activeSheetIndex >= index && activeSheetIndex > 0) setActiveSheetIndex(activeSheetIndex - 1);
    };

    const addColumn = () => {
        const newCol: ExcelColumnIF = {
            id: generateId(),
            columnName: 'New Column',
            jsonPath: ''
        };
        const updatedSheets = [...sheets];
        updatedSheets[activeSheetIndex].columns.push(newCol);
        setSheets(updatedSheets);
    };

    const updateColumn = (colId: string, field: keyof ExcelColumnIF, value: string) => {
        const updatedSheets = [...sheets];
        const col = updatedSheets[activeSheetIndex].columns.find(c => c.id === colId);
        if (col) {
            (col as any)[field] = value;
            setSheets(updatedSheets);
        }
    };

    const deleteColumn = (colId: string) => {
        const updatedSheets = [...sheets];
        updatedSheets[activeSheetIndex].columns = updatedSheets[activeSheetIndex].columns.filter(c => c.id !== colId);
        setSheets(updatedSheets);
    };

    const moveColumn = (fromIndex: number, toIndex: number) => {
        const updatedSheets = [...sheets];
        const cols = [...updatedSheets[activeSheetIndex].columns];
        if (toIndex < 0 || toIndex >= cols.length || fromIndex === toIndex) return;
        const [moved] = cols.splice(fromIndex, 1);
        cols.splice(toIndex, 0, moved);
        updatedSheets[activeSheetIndex].columns = cols;
        setSheets(updatedSheets);
    };

    const moveColumnLeft = (index: number) => moveColumn(index, index - 1);
    const moveColumnRight = (index: number) => moveColumn(index, index + 1);

    // --- Modal Handlers ---

    const openPathPicker = (colId: string) => {
        setEditingColId(colId);
        setPathPickerOpen(true);
    };

    const handlePathSelect = (path: string) => {
        const columnName = path.split('.')[path.split('.').length - 2]?.replace('_', ' ') || 'New Column';
        if (editingColId) {
            updateColumn(editingColId, 'jsonPath', path);
            updateColumn(editingColId, 'columnName', capitalize(columnName));
            setPathPickerOpen(false);
            setEditingColId(null);
        }
    };

    const openJsEditor = (colId: string, currentJs: string = '') => {
        setEditingColId(colId);
        setTempJsCode(currentJs || `function(data) {\n  // return modified value\n  return data;\n}`);
        setJsEditorOpen(true);
    };

    const saveJsCode = () => {
        if (editingColId) {
            updateColumn(editingColId, 'javascript', tempJsCode);
            setJsEditorOpen(false);
            setEditingColId(null);
        }
    };

    const activeSheet = sheets[activeSheetIndex];

    return (
        <>
            <div className="flex flex-col w-full h-full max-h-[400px] border rounded-lg bg-white shadow-lg font-sans overflow-hidden relative">
                {/* Header / Tabs */}
                <SheetSelector
                    sheets={sheets}
                    activeSheetIndex={activeSheetIndex}
                    setActiveSheetIndex={setActiveSheetIndex}
                    setSheets={setSheets}
                    addSheet={addSheet}
                    deleteSheet={deleteSheet}
                />

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col p-2 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">{activeSheet.sheetName} Configuration</h2>
                            <p className="text-xs text-gray-500">Define columns for this Excel sheet.</p>
                        </div>
                        <Button onClick={addColumn} outlined>
                            <Plus size={16} /> Add Column
                        </Button>
                    </div>

                    {/* Horizontal Column List */}
                    <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2">
                        <div className="flex gap-4 h-full items-start">
                            {activeSheet.columns.length === 0 ? (
                                <div className="flex flex-col items-center justify-center w-full h-40  text-gray-400">
                                    <FileSpreadsheet size={32} className="mb-2" />
                                    <p>No columns added yet.</p>
                                </div>
                            ) : (
                                activeSheet.columns.map((col, idx) => (
                                    <div
                                        key={col.id}
                                        className="flex flex-col flex-shrink-0 w-72 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow h-full max-h-[320px]"
                                    >
                                        <div className="p-3 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 rounded-t-xl">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Column Header</label>
                                                <input
                                                    value={col.columnName}
                                                    onChange={e => updateColumn(col.id, 'columnName', e.target.value)}
                                                    className="w-full font-medium text-gray-800 bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none text-sm pb-1"
                                                    placeholder="e.g. Full Name"
                                                />
                                            </div>
                                            <button onClick={() => deleteColumn(col.id)} className="text-gray-300 hover:text-red-500 p-1 cursor-pointer">
                                                <X size={14} />
                                            </button>
                                        </div>

                                        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                                        <ChevronRight size={12} /> JSON Path
                                                    </label>
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={col.jsonPath}
                                                        onChange={e => updateColumn(col.id, 'jsonPath', e.target.value)}
                                                        className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-2 font-mono text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none"
                                                        placeholder="path.to.value"
                                                    />
                                                    <button
                                                        onClick={() => openPathPicker(col.id)}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors cursor-pointer"
                                                        title="Pick from Data"
                                                    >
                                                        <MousePointerClick size={16} className="text-blue-500" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1 mt-auto">
                                                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                                    <Code size={12} /> Transformation
                                                </label>
                                                {col.javascript ? (
                                                    <div className="relative group">
                                                        <div className=" max-h-25 bg-gray-900 rounded p-2 text-[10px] font-mono text-green-400 overflow-hidden opacity-90">
                                                            <pre>{col.javascript}</pre>
                                                        </div>
                                                        <button
                                                            onClick={() => openJsEditor(col.id, col.javascript)}
                                                            className="absolute top-1 right-1 bg-white/20 hover:bg-white/40 text-white p-1 rounded backdrop-blur-sm"
                                                        >
                                                            <Edit2 size={10} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => openJsEditor(col.id)}
                                                        className="w-full py-2 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Plus size={12} /> Add JS Function
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex justify-between">
                                                <ChevronLeft
                                                    onClick={() => moveColumnLeft(idx)}
                                                    size={16}
                                                    className="text-gray-500 cursor-pointer hover:bg-gray-200 rounded"
                                                />
                                                <ChevronRight
                                                    onClick={() => moveColumnRight(idx)}
                                                    size={16}
                                                    className="text-gray-500 cursor-pointer hover:bg-gray-200 rounded"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Dialog: JSON Path Picker (FULL SCREEN) --- */}
            <PathPickerDialog isOpen={pathPickerOpen} closeDialog={() => setPathPickerOpen(false)} inputData={inputData} handlePathSelect={handlePathSelect} />

            {/* --- Dialog: JS Editor (FULL SCREEN) --- */}
            <JsEditorDialog
                isOpen={jsEditorOpen}
                closeDialog={() => setJsEditorOpen(false)}
                setTempJsCode={setTempJsCode}
                tempJsCode={tempJsCode}
                updateColumn={updateColumn}
                editingColId={editingColId}
                saveJsCode={saveJsCode}
            />
        </>
    );
};
