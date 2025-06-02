import { Table, Trash } from 'lucide-react';
import { FC, useState } from 'react';
import { InputField } from '../components/InputField';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { formatFieldLabel } from '../utils';
import { RenderTopLevelFieldsIF } from './RenderTopLevelFields';

export const RenderArrayFields: FC<RenderTopLevelFieldsIF> = ({ updateWire, refs }) => {
  const { state, setState } = useViewRecordState();
  const { fieldRefs, isScrollingRef, lastHoveredFieldRef } = refs;

  const [dialog, setDialog] = useState(false);

  return (
    <>
      {state.arrayFields.map((item, mainIndex) => {
        return (
          <div className="flex flex-col rounded-lg border bg-white hover:border-yellow-500">
            <label className="flex justify-between p-4 text-lg font-bold capitalize">
              {formatFieldLabel(state.tableNames[mainIndex])}
              <span className="flex cursor-pointer items-center gap-1 text-sm font-normal text-sky-500 hover:text-sky-600">
                <Table size={16} strokeWidth={1} /> View in table
              </span>
            </label>
            <div className="flex flex-col gap-y-4 rounded-lg bg-white p-2">
              {/* bg-[#f9fafb] */}
              {Object.entries(item).map(([key, subItem], rowIndex) => (
                <div className="flex flex-wrap gap-y-1 rounded-lg border bg-white hover:border-blue-500">
                  <label className="text-md flex w-full items-center justify-between px-4 py-2 font-bold text-gray-600">
                    Row {rowIndex + 1} <Trash className="cursor-pointer hover:text-red-500" size={18} />
                  </label>

                  {Object.entries(subItem).map(([label, data], i) => {
                    const fieldId = `${label}_${rowIndex}_${mainIndex}_${i}`;

                    return (
                      <InputField
                        label={formatFieldLabel(label)}
                        value={data.value}
                        // @ts-ignore
                        ref={el => (fieldRefs.current[fieldId] = el)}
                        onMouseAction={() => {
                          fieldRefs.current[fieldId].focus();

                          if (data.bbox) lastHoveredFieldRef.current = [fieldId, data.bbox];
                          if (!isScrollingRef.current && data.bbox) {
                            setState(prev => ({ ...prev, hoveredFieldId: fieldId }));
                            updateWire(fieldId, data.bbox);
                          }
                        }}
                        description={label === 'description'}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
};
