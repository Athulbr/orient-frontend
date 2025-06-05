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
          <div key={key} className="flex flex-col rounded-lg border bg-white hover:border-amber-400">
            <label className="p-4 text-lg font-bold capitalize">{formatFieldLabel(key)}</label>
            <div className="flex flex-wrap gap-y-1">
              {Object.entries(valueMain).map(([subKey, value], i) => {
                const fieldId = `${valueMain.value}_${value}_${mainIndex}_${i}_${subKey}_${key === subKey ? 'test' : '2'}`;
                const onChange = (e: any) => {
                  console.log('e:===========', e.target.value);
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
