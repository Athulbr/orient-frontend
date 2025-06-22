import { Trash, XCircle } from 'lucide-react';
import { FC } from 'react';
import { InputField } from '../components/InputField';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { formatFieldLabel } from '../utils';
import { RenderTopLevelFieldsIF } from './RenderTopLevelFields';
import { Button } from '../../../../../components/Button';

export const RenderArrayFields: FC<any> = ({ refs }) => {
  const { state, setState } = useViewRecordState();
  const { fieldRefs, isScrollingRef, lastHoveredFieldRef, containerRef } = refs;

  const updateWire = (fieldId: string, bbox: any) => {
    if (!fieldId || !bbox) return;
    const fieldEl = fieldRefs.current[fieldId];
    const containerBox = containerRef.current?.getBoundingClientRect();
    if (!fieldEl || !containerBox) return;

    const fieldBox = fieldEl.getBoundingClientRect();
    const x2 = fieldBox.left - containerBox.left + fieldBox.width / 2;
    const y2 = fieldBox.top;

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

        const addNewField = () => {
          // Get the column names from the first row to create the same structure
          const firstRow = Object.values(item)[0] || {};
          const columnNames = Object.keys(firstRow);

          // Create a new row object with the same column structure
          const newRow: { [key: string]: { value: string } } = {};
          columnNames.forEach(columnName => {
            newRow[columnName] = { value: '' };
          });

          const newArrayFields = [...state.arrayFields];
          newArrayFields[mainIndex] = { ...newArrayFields[mainIndex], newRow };

          setState(prev => {
            return { ...prev, arrayFields: newArrayFields };
          });
        };

        const addComment = () => {
          console.log('addComment');
        };

        return (
          <div key={mainIndex} className="mb-1 flex flex-1 flex-col overflow-hidden rounded-lg border bg-white p-4 hover:border-blue-400">
            <label className="mb-2 flex justify-between text-lg font-bold capitalize">
              {formatFieldLabel(state.tableNames[mainIndex])}
              <div className="flex gap-10">
                <div className="flex gap-2">
                  <Button id="Add New Field" outlined onClick={addNewField}>
                    Add New Field
                  </Button>
                  <Button id="Comment" outlined onClick={addComment}>
                    Comment
                  </Button>
                </div>
                <XCircle onClick={() => setState(prev => ({ ...prev, selectedTableName: '' }))} className="cursor-pointer text-gray-500 hover:text-red-500" />
              </div>
            </label>
            <div className="flex-1 overflow-auto">
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
                          <td key={i} className="border p-1">
                            <textarea
                              id={fieldId}
                              aria-label={fieldId}
                              rows={1}
                              className={`h-full min-w-0 rounded-md border p-2 px-4 outline-none hover:border-blue-500 focus:border-blue-500 ${label === 'Description' ? 'w-100' : 'w-full'}`}
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
                                      hoveredOnArrayField: true,
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
