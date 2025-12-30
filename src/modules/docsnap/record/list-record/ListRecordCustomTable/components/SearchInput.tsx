import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useListRecordCustomTableState } from '../hooks/listRecordCustomTableStateContext';
import { useListRecordCustomTableApi } from '../hooks/useListRecordCustomTableApi';

interface SearchInputIF {}

export const SearchInput: React.FC<SearchInputIF> = () => {
    const { state, setState } = useListRecordCustomTableState();
    const { getRecordsApi } = useListRecordCustomTableApi();
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = () => {
        // Handle clear functionality if needed
    };
    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ ...prev, searchText: e.target.value }));
        getRecordsApi({ searchText: e.target.value });
    };

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
                onChange={handleOnChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={false}
            />
        </div>
    );
};
