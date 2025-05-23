import { XCircle, Key, Trash, PlusCircle, Filter } from 'lucide-react';
import { useTablebuilderSettings } from '../hooks/useTablebuilderSettingsContext';

export const FilterConfigSection: React.FC = () => {
  const { settings, setSettings } = useTablebuilderSettings();

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-3 text-sm">
        {settings.filters.map((filter, filterIndex) => (
          <FilterItem
            key={filterIndex}
            filter={filter}
            filterIndex={filterIndex}
            onRemoveFilter={() =>
              setSettings(prev => ({
                ...prev,
                filters: prev.filters.filter((_, index) => index !== filterIndex),
              }))
            }
            onFilterKeyChange={newKey =>
              setSettings(prev => ({
                ...prev,
                filters: prev.filters.map((f, index) => (index === filterIndex ? { ...f, key: newKey } : f)),
              }))
            }
            onAddOption={() =>
              setSettings(prev => ({
                ...prev,
                filters: prev.filters.map((f, index) => (index === filterIndex ? { ...f, options: [...f.options, ''] } : f)),
              }))
            }
            onUpdateOption={(optionIndex, value) =>
              setSettings(prev => ({
                ...prev,
                filters: prev.filters.map((f, index) =>
                  index === filterIndex
                    ? {
                        ...f,
                        options: f.options.map((o, i) => (i === optionIndex ? value : o)),
                      }
                    : f
                ),
              }))
            }
            onRemoveOption={optionIndex =>
              setSettings(prev => ({
                ...prev,
                filters: prev.filters.map((f, index) =>
                  index === filterIndex
                    ? {
                        ...f,
                        options: f.options.filter((_, i) => i !== optionIndex),
                      }
                    : f
                ),
              }))
            }
          />
        ))}

        <AddFilterButton onClick={() => setSettings(prev => ({ ...prev, filters: [...prev.filters, { key: '', options: [''] }] }))} />
      </div>
    </div>
  );
};

interface FilterType {
  key: string;
  options: string[];
}

// Extracted components for better readability and maintenance
interface FilterItemProps {
  filter: FilterType;
  filterIndex: number;
  onRemoveFilter: () => void;
  onFilterKeyChange: (newKey: string) => void;
  onAddOption: () => void;
  onUpdateOption: (optionIndex: number, value: string) => void;
  onRemoveOption: (optionIndex: number) => void;
}

const FilterItem: React.FC<FilterItemProps> = ({ filter, onRemoveFilter, onFilterKeyChange, onAddOption, onUpdateOption, onRemoveOption }) => {
  return (
    <div className="relative rounded-lg border p-4">
      <button className="absolute top-2 right-2 cursor-pointer rounded-3xl text-red-500 hover:bg-red-100" onClick={onRemoveFilter} aria-label="Remove filter">
        <XCircle size={18} />
      </button>

      <div className="space-y-5">
        <FilterKeyInput value={filter.key} onChange={newKey => onFilterKeyChange(newKey)} />

        <FilterOptions options={filter.options} onAddOption={onAddOption} onUpdateOption={onUpdateOption} onRemoveOption={onRemoveOption} />
      </div>
    </div>
  );
};

interface FilterKeyInputProps {
  value: string;
  onChange: (value: string) => void;
}

const FilterKeyInput: React.FC<FilterKeyInputProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="block flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <Key size={16} /> Filter Key
      </label>
      <input
        type="text"
        className="w-full rounded border p-1.5 text-sm"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g., status, role"
      />
    </div>
  );
};

interface FilterOptionsProps {
  options: string[];
  onAddOption: () => void;
  onUpdateOption: (optionIndex: number, value: string) => void;
  onRemoveOption: (optionIndex: number) => void;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({ options, onAddOption, onUpdateOption, onRemoveOption }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Options</label>
      <div className="space-y-3">
        {options.map((option, optionIndex) => (
          <div key={optionIndex} className="flex gap-1.5">
            <input
              type="text"
              className="flex-1 rounded border p-1.5 text-sm"
              value={option}
              onChange={e => onUpdateOption(optionIndex, e.target.value)}
              placeholder="Option value"
            />
            <button className="cursor-pointer rounded p-1 text-red-500 hover:bg-red-100" onClick={() => onRemoveOption(optionIndex)} aria-label="Remove option">
              <Trash size={16} />
            </button>
          </div>
        ))}
        <button className="flex items-center gap-1.5 text-xs text-blue-600" onClick={onAddOption}>
          <PlusCircle size={14} /> Add Option
        </button>
      </div>
    </div>
  );
};

interface AddFilterButtonProps {
  onClick: () => void;
}

const AddFilterButton: React.FC<AddFilterButtonProps> = ({ onClick }) => {
  return (
    <button
      className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-blue-300 py-1.5 text-sm text-blue-600 transition hover:bg-blue-50"
      onClick={onClick}
    >
      <Filter size={16} /> Add Filter
    </button>
  );
};
