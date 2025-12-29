import React, { useState } from 'react';
import {
    Plus,
    Filter as FilterIcon,
    MousePointerClick,
    ChevronRight,
    ChevronLeft,
    Trash2
} from 'lucide-react';
import { Button } from '../../../components/Button';
import PathPickerDialog from './pathPickerDialog';
import { cn } from '../../../global-utils/twMerge';
import SheetSelector from './SheetSelector';

// --- Types ---

export interface FilterItemIF {
    id: string;
    key: string;
    jsonPath?: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

interface FiltersBuilderProps {
    filters: FilterItemIF[];
    setFilters: React.Dispatch<React.SetStateAction<FilterItemIF[]>>;
    inputData: any;
    showFiltersView?: boolean;
    onToggleFiltersView?: () => void;
}

export const FiltersBuilder: React.FC<FiltersBuilderProps> = ({ filters, setFilters, inputData, showFiltersView, onToggleFiltersView }) => {
    const [pathPickerOpen, setPathPickerOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [editingFilterId, setEditingFilterId] = useState<string | null>(null);

    const addFilter = () => {
        const newFilter: FilterItemIF = {
            id: generateId(),
            key: '',
            jsonPath: ''
        };
        setFilters([...filters, newFilter]);
    };

    const updateFilter = (filterId: string, field: keyof FilterItemIF, value: string) => {
        setFilters(prev =>
            prev.map(f => (f.id === filterId ? { ...f, [field]: value } : f))
        );
    };

    const deleteFilter = (filterId: string) => {
        setFilters(prev => prev.filter(f => f.id !== filterId));
    };

    const moveFilter = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= filters.length || fromIndex === toIndex) return;
        const newFilters = [...filters];
        const [moved] = newFilters.splice(fromIndex, 1);
        newFilters.splice(toIndex, 0, moved);
        setFilters(newFilters);
    };

    const moveFilterLeft = (index: number) => moveFilter(index, index - 1);
    const moveFilterRight = (index: number) => moveFilter(index, index + 1);

    // --- Modal Handlers ---

    const openPathPicker = (filterId: string) => {
        setEditingFilterId(filterId);
        setPathPickerOpen(true);
    };

    const handlePathSelect = (path: string) => {
        if (editingFilterId) {
            const key = path ? path.split('.').slice(-1)[0] || '' : '';
            updateFilter(editingFilterId, 'jsonPath', path);
            updateFilter(editingFilterId, 'key', key);
            setPathPickerOpen(false);
            setEditingFilterId(null);
        }
    };

    return (
        <>
            <div
                className={cn(
                    'flex flex-col w-full border rounded-lg bg-white shadow-lg font-sans overflow-hidden relative transition-discrete',
                    showFilters ? 'h-full max-h-[400px]' : ''
                )}
            >
                {/* Header with SheetSelector */}
                <SheetSelector
                    sheets={[]}
                    activeSheetIndex={0}
                    setActiveSheetIndex={() => {}}
                    setSheets={() => {}}
                    addSheet={() => {}}
                    deleteSheet={() => {}}
                    showColumns={showFilters}
                    setShowColumns={setShowFilters}
                    showFiltersView={showFiltersView}
                    onToggleFiltersView={onToggleFiltersView}
                />

                {/* Main Content Area */}
                {showFilters && (
                    <div className="flex-1 overflow-hidden flex flex-col p-2 bg-gray-50/50">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Filter Configuration</h2>
                                <p className="text-xs text-gray-500">Define filter keys using JSON paths. Options will be loaded dynamically from API response.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={addFilter} outlined>
                                    <Plus size={16} /> Add Filter
                                </Button>
                            </div>
                        </div>

                        {/* Horizontal Filter List */}
                        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2">
                            <div className="flex gap-4 h-full items-start">
                                {filters.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center w-full h-40 text-gray-400">
                                        <FilterIcon size={32} className="mb-2" />
                                        <p>No filters added yet.</p>
                                    </div>
                                ) : (
                                    filters.map((filter, idx) => (
                                        <div
                                            key={filter.id}
                                            className="flex flex-col flex-shrink-0 w-72 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="p-3 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 rounded-t-xl">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Filter Key</label>
                                                    <input
                                                        value={filter.key}
                                                        onChange={e => updateFilter(filter.id, 'key', e.target.value)}
                                                        className="w-full font-medium text-gray-800 bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none text-sm pb-1"
                                                        placeholder="e.g. status"
                                                    />
                                                </div>
                                                <button onClick={() => deleteFilter(filter.id)} className="text-gray-400 hover:text-red-500 p-1 cursor-pointer">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            <div className="p-4 flex flex-col gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                                            <ChevronRight size={12} /> JSON Path
                                                        </label>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <input
                                                            value={filter.jsonPath || ''}
                                                            onChange={e => {
                                                                const path = e.target.value;
                                                                updateFilter(filter.id, 'jsonPath', path);
                                                                // Auto-extract key from path
                                                                const key = path ? path.split('.').slice(-1)[0] || '' : '';
                                                                updateFilter(filter.id, 'key', key);
                                                            }}
                                                            className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-2 font-mono text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none"
                                                            placeholder="path.to.field"
                                                        />
                                                        <button
                                                            onClick={() => openPathPicker(filter.id)}
                                                            className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors cursor-pointer"
                                                            title="Pick from Data"
                                                        >
                                                            <MousePointerClick size={16} className="text-blue-500" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between mt-auto pt-2 border-t border-gray-100">
                                                    <button
                                                        onClick={() => moveFilterLeft(idx)}
                                                        disabled={idx === 0}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <ChevronLeft size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => moveFilterRight(idx)}
                                                        disabled={idx === filters.length - 1}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Dialog: JSON Path Picker (FULL SCREEN) --- */}
            <PathPickerDialog isOpen={pathPickerOpen} closeDialog={() => setPathPickerOpen(false)} inputData={inputData} handlePathSelect={handlePathSelect} />
        </>
    );
};
