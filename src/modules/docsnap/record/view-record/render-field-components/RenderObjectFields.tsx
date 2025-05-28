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
          <div className="flex flex-col rounded-lg border bg-white">
            <label className="p-4 text-lg font-bold capitalize">{formatFieldLabel(key)}</label>
            <div className="flex flex-wrap gap-y-1">
              {Object.entries(valueMain).map(([subKey, value], i) => {
                const fieldId = `${valueMain.value}_${mainIndex}_${i}`;
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
                    label={formatFieldLabel(subKey)}
                    value={value.value}
                    // @ts-ignore
                    ref={el => (fieldRefs.current[fieldId] = el)}
                    onMouseAction={() => {
                      fieldRefs.current[fieldId].focus();

                      if (value.bbox) lastHoveredFieldRef.current = [fieldId, value.bbox];
                      if (!isScrollingRef.current && value.bbox) {
                        setState(prev => ({ ...prev, hoveredFieldId: fieldId }));
                        updateWire(fieldId, value.bbox);
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
