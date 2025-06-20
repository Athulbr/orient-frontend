import { ArrowDown, ChevronDown, Table, Trash } from 'lucide-react';
import { FC, useState } from 'react';
import { InputField } from '../components/InputField';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { formatFieldLabel } from '../utils';
import { RenderTopLevelFieldsIF } from './RenderTopLevelFields';

export const TableNames: FC<RenderTopLevelFieldsIF> = ({ updateWire, refs }) => {
  const { state, setState } = useViewRecordState();

  return (
    <>
      {state.arrayFields.map((item, mainIndex) => {
        return (
          <div key={mainIndex} className="flex flex-col gap-2">
            <div className="pl-1 text-lg font-semibold">Tables</div>
            {state.tableNames.map(name => (
              <div
                onClick={() => setState(prev => ({ ...prev, selectedTableName: name }))}
                className="flex cursor-pointer items-center justify-between rounded-lg border bg-white px-6 py-3 hover:border-blue-300"
              >
                {formatFieldLabel(name)}
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
};
