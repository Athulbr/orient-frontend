import { Trash2, XCircle } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { formatFieldLabel } from '../utils';
import { Button } from '../../../../../components/Button';
import { CommentDialog } from '../components/CommentDialog';
import { useToastStore } from '../../../../../components/toast/ToastStore';

export const RenderArrayFields: FC<any> = ({ refs }) => {
  const { state, setState } = useViewRecordState();
  const { fieldRefs, containerRef } = refs;
  const [commentDialog, setCommentDialog] = useState(false);
  const toast = useToastStore();
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

  const addLineItem = () => {
    // Get the column names from the first row to create the same structure
    const firstRow = Object.values(state.arrayFields[0])[0] || {};

    const columnNames = Object.keys(firstRow);
    if (columnNames.length === 0) {
      toast.error('Table must have at least one row to add a new row');
      return;
    }
    // Create a new row object with the same column structure
    const newRow: { [key: string]: { value: string } } = {};
    columnNames.forEach(columnName => {
      newRow[columnName] = { value: '' };
    });

    const newArrayFields = [...state.arrayFields];
    // Calculate the next index by getting the current number of entries
    const currentEntries = Object.keys(newArrayFields[0]);
    const nextIndex = currentEntries.length;
    newArrayFields[0] = { ...newArrayFields[0], [`${nextIndex}`]: newRow };

    setState(prev => {
      return { ...prev, arrayFields: newArrayFields };
    });
  };

  const deleteLineItem = (mainIndex: number, rowIndex: number) => {
    const newArrayFields = [...state.arrayFields];
    const currentItem = newArrayFields[mainIndex];

    // Convert the object to entries, filter out the row to delete, and convert back to object
    const entries = Object.entries(currentItem);
    const filteredEntries = entries.filter((_, index) => index !== rowIndex);
    const newItem = Object.fromEntries(filteredEntries);

    newArrayFields[mainIndex] = newItem;

    setState(prev => ({
      ...prev,
      hoveredFieldId: null,
      arrayFields: newArrayFields,
      bbox: null,
      wire: null,
    }));
  };

  return (
    <>
      {state.arrayFields.map((item, mainIndex) => {
        const firstRow = Object.values(item)[0] || {};
        const labels = Object.keys(firstRow);

        // const fieldId = `arrayFields:${mainIndex}:0:${labels[0]}`;

        return (
          <div key={mainIndex} className="mb-1 flex flex-1 flex-col overflow-hidden rounded-lg border bg-white p-4 pt-2 hover:border-blue-400">
            <section className="mb-2 flex justify-between text-lg font-bold capitalize">
              {formatFieldLabel(state.tableNames[mainIndex])}
              <div className="flex items-center gap-10">
                <div className="flex gap-2">
                  <Button tabIndex={-1} outlined onClick={() => setCommentDialog(true)}>
                    Add Comment
                  </Button>
                  <Button tabIndex={-1} outlined onClick={addLineItem}>
                    Add Line Item
                  </Button>
                </div>
                <XCircle
                  tabIndex={-1}
                  onClick={() => setState(prev => ({ ...prev, selectedTableName: '', hoveredOnArrayField: false, hoveredFieldId: null, bbox: null }))}
                  className="cursor-pointer text-gray-500 hover:text-red-500"
                />
              </div>
            </section>
            <div className="flex-1 overflow-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="sticky top-0 left-0 border">
                    {labels.map((label, i) => (
                      <th key={i} className="border bg-gray-50 px-4 py-3 text-left font-semibold">
                        {formatFieldLabel(label)}
                      </th>
                    ))}
                    {Object.entries(item).length > 1 && <th className="border bg-gray-50 px-4 py-2 text-left font-semibold">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(item).map(([key, subItem], rowIndex) => (
                    <tr key={rowIndex} className="bg-white">
                      {labels.map((label, i) => {
                        const value = subItem[label];

                        const hoveredFieldId = `arrayFields:${mainIndex}:${key}:${label}`;
                        return (
                          <ArrayFieldTextarea
                            key={i}
                            value={value}
                            fieldId={hoveredFieldId}
                            label={label}
                            fieldRefs={fieldRefs}
                            disabled={state.loadingS3File || state.reExtracting}
                            onChange={(e: any) => {
                              setState(prev => {
                                const updated = [...prev.arrayFields];
                                updated[mainIndex][key][label] = {
                                  ...updated[mainIndex][key][label],
                                  value: e.target.value,
                                };
                                return { ...prev, arrayFields: updated };
                              });
                            }}
                            onMouseEnter={() => {
                              const bbox = value?.bbox;
                              if (bbox) {
                                setState(prev => ({
                                  ...prev,
                                  hoveredFieldId: hoveredFieldId,
                                  pageNumber: value.page ? value.page : prev.pageNumber,
                                  hoveredOnArrayField: true,
                                }));
                                updateWire(hoveredFieldId, value.bbox);
                              } else {
                                setState(prev => ({
                                  ...prev,
                                  hoveredFieldId: null,
                                  hoveredOnArrayField: false,
                                  bbox: null,
                                  wire: null,
                                }));
                              }
                            }}
                          />
                        );
                      })}
                      {Object.entries(item).length > 1 && (
                        <td className="h-full border py-2 pl-9">
                          <Trash2
                            tabIndex={0}
                            onClick={() => deleteLineItem(mainIndex, rowIndex)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                deleteLineItem(mainIndex, rowIndex);
                              }
                            }}
                            size={20}
                            className="cursor-pointer text-gray-500 hover:text-red-500 focus:text-red-500"
                          />
                        </td>
                      )}
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

interface PropsIF {
  value: any;
  fieldId: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onMouseEnter: () => void;
  fieldRefs: any;
  disabled?: boolean;
}
const ArrayFieldTextarea: FC<PropsIF> = ({ value, fieldId, label, onChange, onMouseEnter, fieldRefs, disabled }) => {
  const adjustTextareaHeight = () => {
    const textarea = fieldRefs.current[fieldId];
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight + 4}px`;
  };

  const handleFocus = (event: any) => {
    // Select all text inside the textarea when it receives focus
    event.target.select();
    onMouseEnter();
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value?.value]);
  return (
    <td className="border p-1">
      <textarea
        data-gramm="false"
        id={fieldId}
        aria-label={fieldId}
        rows={1}
        className={` ${label === 'Description' ? 'min-w-90' : 'min-w-0'} rounded-md border p-2 px-4 outline-none ${value?.checked ? 'border-[#438f20]' : ''} hover:border-blue-500 focus:border-blue-500 ${label === 'description' ? 'w-full min-w-100' : 'w-full'}`}
        value={value?.value || ''}
        // @ts-ignore
        ref={el => (fieldRefs.current[fieldId] = el)}
        onChange={onChange}
        // onClick={onMouseEnter}
        onFocus={handleFocus}
        disabled={disabled}
      />
    </td>
  );
};
