import { FC } from 'react';
import { InputField } from '../components/InputField';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { formatFieldLabel } from '../utils';
import { RenderTopLevelFieldsIF } from './RenderTopLevelFields';

export const RenderObjectFields: FC<RenderTopLevelFieldsIF> = ({ updateWire, refs }) => {
  const { state, setState } = useViewRecordState();
  const { fieldRefs, isScrollingRef, lastHoveredFieldRef } = refs;
  return (
    <>
      {Object.entries(state.objectFields).map(([key, valueMain], mainIndex) => {
        return (
          <div key={key} className="flex flex-col rounded-lg border bg-white p-1 hover:border-blue-400">
            <label className="p-3 text-lg font-bold capitalize">{formatFieldLabel(key)}</label>
            <div className="flex flex-wrap gap-y-2">
              {Object.entries(valueMain).map(([subKey, value], i) => {
                const fieldId = `objectFields:${key}:${subKey}`;
                const onChange = (e: any) => {
                  setState(prev => {
                    const updated = prev.objectFields;
                    updated[key][subKey] = { ...updated[key][subKey], value: e.target.value };
                    return { ...prev, objectFields: updated };
                  });
                };
                return (
                  <InputField
                    key={fieldId}
                    label={formatFieldLabel(subKey)}
                    value={value?.value || ''}
                    confidence={`${value?.confidence * 100}`}
                    checked={value?.checked}
                    checkClickHandler={(checked: boolean) => {
                      setState(prev => ({
                        ...prev,
                        objectFields: {
                          ...prev.objectFields,
                          [key]: {
                            ...prev.objectFields[key],
                            [subKey]: { ...prev.objectFields[key][subKey], checked: checked },
                          },
                        },
                      }));
                    }}
                    // @ts-ignore
                    ref={el => (fieldRefs.current[fieldId] = el)}
                    onMouseAction={() => {
                      if (value?.bbox) {
                        lastHoveredFieldRef.current = [fieldId, value?.bbox, value?.page];
                        if (!isScrollingRef.current) {
                          setState(prev => ({
                            ...prev,
                            hoveredFieldId: fieldId,
                            pageNumber: value?.page ? value?.page : prev.pageNumber,
                            hoveredOnArrayField: false,
                            selectedTableName: '',
                          }));
                          updateWire(fieldId, value?.bbox);
                        }
                      }
                    }}
                    onChange={onChange}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};
