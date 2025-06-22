import { Trash, XCircle } from 'lucide-react';
import { FC } from 'react';
import { InputField } from '../components/InputField';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { formatFieldLabel } from '../utils';
import { RenderTopLevelFieldsIF } from './RenderTopLevelFields';

export const RenderArrayFields: FC<any> = ({ refs }) => {
  const { state, setState } = useViewRecordState();
  const { fieldRefs, isScrollingRef, lastHoveredFieldRef, containerRef } = refs;

  const updateWire = (fieldId: string, bbox: any) => {
    if (!fieldId || !bbox) return;
    const fieldEl = fieldRefs.current[fieldId];
    const containerBox = containerRef.current?.getBoundingClientRect();
    if (!fieldEl || !containerBox) return;

    const fieldBox = fieldEl.getBoundingClientRect();
    const x2 = fieldBox.left - containerBox.left;
    const y2 = fieldBox.top + fieldBox.height / 2 - containerBox.top;

    setState(prev => ({
      ...prev,
      bbox,
      wire: {
        x1: prev?.wire?.x1 || 0,
        y1: prev?.wire?.y1 || 0,
        x2,
        y2,
      },
    }));
  };

  return (
    <>
      {state.arrayFields.map((item, mainIndex) => {
        // Get all unique labels (column names) from the first subItem
        const firstRow = Object.values(item)[0] || {};
        const labels = Object.keys(firstRow);

        return (
          <div key={mainIndex} className="mb-4 flex flex-col rounded-lg border bg-white p-4 hover:border-blue-400">
            <label className="mb-2 flex justify-between text-lg font-bold capitalize">
              {formatFieldLabel(state.tableNames[mainIndex])}
              <XCircle onClick={() => setState(prev => ({ ...prev, selectedTableName: '' }))} className="cursor-pointer text-gray-500 hover:text-red-500" />
            </label>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    {labels.map((label, i) => (
                      <th key={i} className="border bg-gray-50 px-4 py-2 text-left font-semibold">
                        {formatFieldLabel(label)}
                      </th>
                    ))}
                    <th className="border bg-gray-50 px-4 py-2 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(item).map(([key, subItem], rowIndex) => (
                    <tr key={rowIndex} className="bg-white">
                      {labels.map((label, i) => {
                        const value = subItem[label];
                        const fieldId = `${label}_${rowIndex}_${mainIndex}_${i}`;
                        if (!value) return <td key={i} className="border px-4 py-2" />;
                        return (
                          <td key={i} className="h-full border">
                            <textarea
                              className={`h-full min-w-0 p-2 px-4 ${label === 'Description' ? 'w-100' : 'w-full'}`}
                              value={value.value}
                              // @ts-ignore
                              ref={el => (fieldRefs.current[fieldId] = el)}
                              onMouseEnter={() => {
                                const bbox = value.bbox;
                                if (bbox) {
                                  lastHoveredFieldRef.current = [fieldId, bbox, value.page];
                                  if (!isScrollingRef.current) {
                                    setState(prev => ({
                                      ...prev,
                                      hoveredFieldId: fieldId,
                                      pageNumber: value.page ? value.page : prev.pageNumber,
                                      hideWire: true,
                                    }));
                                    updateWire(fieldId, value.bbox);
                                  }
                                }
                              }}
                            />
                          </td>
                        );
                      })}
                      <td className="h-full border py-2 pl-9">
                        <Trash size={20} className="cursor-pointer text-gray-500 hover:text-red-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </>
  );
};
