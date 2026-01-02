import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useListRecordCustomTableState } from '../hooks/listRecordCustomTableStateContext';
import { useListRecordCustomTableApi } from '../hooks/useListRecordCustomTableApi';

interface SearchInputIF {}

export const SearchInput: React.FC<SearchInputIF> = () => {
    const { state, setState } = useListRecordCustomTableState();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`relative max-w-90 min-w-60 flex-1`}>
            <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600" tabIndex={-1}>
                <Search size={16} />
            </button>
            <input
                className={`h-10 w-full rounded-md border bg-white px-3 py-2 pl-10 text-sm text-gray-700 transition-all duration-200 focus:outline-none ${
                    isFocused ? 'border-blue-400' : 'border-gray-300'
                }`}
                placeholder="Search..."
                value={state.searchText}
                onChange={e => setState(prev => ({ ...prev, searchText: e.target.value }))}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={false}
            />
            {state.searchText && (
                <button
                    onClick={() => setState(prev => ({ ...prev, searchText: '' }))}
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};
