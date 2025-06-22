import { FC, useState } from 'react';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { formatFieldLabel } from '../utils';
import { ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';

export const TableNames: FC = () => {
  const { state, setState } = useViewRecordState();
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  return (
    <>
      {state.arrayFields.map((item, mainIndex) => {
        return (
          <div key={mainIndex} className="flex flex-col gap-2">
            <div className="pl-1 text-lg font-semibold">Tables</div>
            {state.tableNames.map((name, index) => (
              <button
                key={index}
                onClick={() => {
                  setState(prev => ({ ...prev, selectedTableName: prev.selectedTableName === name ? '' : name }));
                  setExpandedTable(expandedTable === name ? null : name);
                }}
                className={`flex cursor-pointer items-center justify-between rounded-lg border py-3 pr-3 pl-6 font-semibold hover:border-blue-300 ${state.selectedTableName === name ? 'border-blue-300 bg-blue-50' : 'bg-white'}`}
              >
                {formatFieldLabel(name)}
                {expandedTable === name ? (
                  <ChevronRight size={20} className="cursor-pointer text-gray-500 hover:text-blue-500" />
                ) : (
                  <ChevronDown size={20} className="cursor-pointer text-gray-500 hover:text-blue-500" />
                )}
              </button>
            ))}
          </div>
        );
      })}
    </>
  );
};
