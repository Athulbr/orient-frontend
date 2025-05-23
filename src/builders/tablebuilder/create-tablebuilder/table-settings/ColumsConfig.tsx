import { XCircle, Key, ArrowUpDown, Component, EyeOff, PlusSquare, Type, Text } from 'lucide-react';
import { useTablebuilderSettings } from '../hooks/useTablebuilderSettingsContext';
import { CheckboxTB } from '../tablebuilder-components/CheckboxTB';
import { TextFieldTB } from '../tablebuilder-components/TextFieldTB';

export const ColumnConfigSection: React.FC = () => {
  const { settings, setSettings } = useTablebuilderSettings();

  const addColumn = () => {
    setSettings(prev => ({
      ...prev,
      columns: [
        ...prev.columns,
        {
          key: '',
          header: '',
          sortable: false,
          customUI: false,
          customUiKey: '',
          capitalize: true,
          hidden: false,
          dateUI: false,
          editButton: false,
          deleteButton: false,
          editUrl: '',
          deleteUrl: '',
        },
      ],
    }));
  };

  return (
    <div className="mt-3 space-y-6 text-sm">
      {settings.columns.map((column, columnIndex) => (
        <div key={columnIndex} className="relative rounded-lg border p-3">
          <button
            className="absolute top-2 right-2 cursor-pointer rounded-3xl text-red-500 hover:bg-red-100"
            onClick={() => setSettings(prev => ({ ...prev, columns: prev.columns.filter((_, i) => i !== columnIndex) }))}
            aria-label="Remove column"
          >
            <XCircle size={18} />
          </button>

          <div className="grid grid-cols-1 gap-5 text-sm md:grid-cols-2">
            <TextFieldTB
              labelIcon={Type}
              label="Header Label"
              type="text"
              value={column.header}
              onChange={e =>
                setSettings(prev => ({ ...prev, columns: prev.columns.map((col, i) => (i === columnIndex ? { ...col, header: e.target.value } : col)) }))
              }
              placeholder="e.g., Name, Email"
            />
            <TextFieldTB
              labelIcon={Key}
              label="Column Key"
              type="text"
              value={column.key}
              onChange={e =>
                setSettings(prev => ({ ...prev, columns: prev.columns.map((col, i) => (i === columnIndex ? { ...col, key: e.target.value } : col)) }))
              }
              placeholder="e.g., Name, Email"
            />

            <CheckboxTB
              id={`sortable-${columnIndex}`}
              label="Sortable"
              icon={ArrowUpDown}
              checked={column.sortable}
              onChange={e =>
                setSettings(prev => ({ ...prev, columns: prev.columns.map((col, i) => (i === columnIndex ? { ...col, sortable: e.target.checked } : col)) }))
              }
            />
            <CheckboxTB
              id={`capitalize-${columnIndex}`}
              label="Capitalize Text"
              icon={Text}
              checked={column.capitalize}
              onChange={e =>
                setSettings(prev => ({
                  ...prev,
                  columns: prev.columns.map((col, i) => (i === columnIndex ? { ...col, capitalize: e.target.checked } : col)),
                }))
              }
            />
            <CheckboxTB
              id={`hidden-${columnIndex}`}
              label="Hidden Column"
              icon={EyeOff}
              checked={column.hidden}
              onChange={e =>
                setSettings(prev => ({
                  ...prev,
                  columns: prev.columns.map((col, i) => (i === columnIndex ? { ...col, hidden: e.target.checked } : col)),
                }))
              }
            />
            <CheckboxTB
              id={`customUI-${columnIndex}`}
              label="Use Custom UI"
              icon={Component}
              checked={column.customUI}
              onChange={e =>
                setSettings(prev => ({
                  ...prev,
                  columns: prev.columns.map((col, i) => (i === columnIndex ? { ...col, customUI: e.target.checked } : col)),
                }))
              }
            />
            {!column.customUI && (
              <CheckboxTB
                id={`dateUI-${columnIndex}`}
                label="Date UI"
                icon={Component}
                checked={column.dateUI}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    columns: prev.columns.map((col, i) => (i === columnIndex ? { ...col, dateUI: e.target.checked } : col)),
                  }))
                }
              />
            )}
            {!column.customUI && (
              <CheckboxTB
                id={`editButton-${columnIndex}`}
                label="Edit Button"
                icon={Component}
                checked={column.editButton}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    columns: prev.columns.map((col, i) => (i === columnIndex ? { ...col, editButton: e.target.checked } : col)),
                  }))
                }
              />
            )}
            {!column.customUI && (
              <CheckboxTB
                id={`deleteButton-${columnIndex}`}
                label="Delete Button"
                icon={Component}
                checked={column.deleteButton}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    columns: prev.columns.map((col, i) => (i === columnIndex ? { ...col, deleteButton: e.target.checked } : col)),
                  }))
                }
              />
            )}

            {column.customUI && (
              <TextFieldTB
                label="Custom UI Key"
                type="text"
                value={column.customUiKey}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    columns: prev.columns.map((col, i) => (i === columnIndex ? { ...col, customUiKey: e.target.value } : col)),
                  }))
                }
              />
            )}
            {column.editButton && column.customUI && (
              <TextFieldTB
                label="Edit Url"
                type="text"
                value={column.editUrl}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    columns: prev.columns.map((col, i) => (i === columnIndex ? { ...col, editUrl: e.target.value } : col)),
                  }))
                }
              />
            )}
            {column.deleteButton && column.customUI && (
              <TextFieldTB
                label="Delete Url"
                type="text"
                value={column.deleteUrl}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    columns: prev.columns.map((col, i) => (i === columnIndex ? { ...col, deleteUrl: e.target.value } : col)),
                  }))
                }
              />
            )}

            {/* Column Preview Badge */}
            <div className="flex justify-center md:col-span-2">
              <div
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${
                  column.hidden
                    ? 'bg-gray-200 text-gray-600'
                    : column.customUI
                      ? 'bg-purple-100 text-purple-800'
                      : column.sortable
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                }`}
              >
                {column.hidden && <EyeOff size={14} />}
                {column.customUI && <Component size={14} />}
                {!column.hidden && !column.customUI && column.sortable && <ArrowUpDown size={14} />}
                <span>{column.header || column.key || 'Column'}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-blue-300 py-1.5 text-sm text-blue-600 transition hover:bg-blue-50"
        onClick={addColumn}
      >
        <PlusSquare size={16} /> Add Column
      </button>
    </div>
  );
};
