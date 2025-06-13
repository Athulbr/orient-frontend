import { Table, Trash } from 'lucide-react';
import { FC, useState } from 'react';
import { InputField } from '../components/InputField';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { formatFieldLabel } from '../utils';
import { RenderTopLevelFieldsIF } from './RenderTopLevelFields';

export const RenderArrayFields: FC<RenderTopLevelFieldsIF> = ({ updateWire, refs }) => {
  const { state, setState } = useViewRecordState();
  const { fieldRefs, isScrollingRef, lastHoveredFieldRef } = refs;

  

  return (
    <>
      {state.arrayFields.map((item, mainIndex) => {
        return (
          <div key={mainIndex} className="flex flex-col rounded-lg border bg-white hover:border-yellow-300">
            <label className="flex justify-between p-4 text-lg font-bold capitalize">
              {formatFieldLabel(state.tableNames[mainIndex])}
              <span
                onClick={() => setState(prev => ({ ...prev, tableViewDialog: true }))}
                className="flex cursor-pointer items-center gap-1 text-sm font-normal text-sky-500 hover:text-sky-600"
              >
                <Table size={16} strokeWidth={1} /> View in table
              </span>
            </label>
            <div className="flex flex-col gap-y-4 rounded-lg bg-white p-2">
              {Object.entries(item).map(([key, subItem], rowIndex) => (
                <div key={rowIndex} className="flex flex-wrap gap-y-1 rounded-lg border bg-white hover:border-yellow-500">
                  <label className="text-md flex w-full items-center justify-between px-4 py-2 font-bold text-gray-600">
                    Row {rowIndex + 1} <Trash className="cursor-pointer hover:text-red-500" size={18} />
                  </label>

                  {Object.entries(subItem).map(([label, value], i) => {
                    const fieldId = `${label}_${rowIndex}_${mainIndex}_${i}`;
                    if (value === null) return;
                    const onChange = (e: any) => {
                      setState(prev => {
                        const updated = [...prev.arrayFields];
                        updated[mainIndex][key][label] = {
                          ...updated[mainIndex][key][label],
                          value: e.target.value
                        };
                        return { ...prev, arrayFields: updated };
                      });
                    };
                    return (
                      <InputField
                        key={fieldId}
                        label={formatFieldLabel(label)}
                        value={value.value}
                        confidence={`${value.confidence * 100}`}
                        // @ts-ignore
                        ref={el => (fieldRefs.current[fieldId] = el)}
                        bbox={value.bbox}
                        onMouseAction={bbox => {
                          if (bbox) {
                            lastHoveredFieldRef.current = [fieldId, bbox, value.page];
                            if (!isScrollingRef.current) {
                              setState(prev => ({ ...prev, hoveredFieldId: fieldId, pageNumber: value.page ? value.page : prev.pageNumber }));
                              updateWire(fieldId, bbox);
                            }
                          }
                        }}
                        onChange={onChange}
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
