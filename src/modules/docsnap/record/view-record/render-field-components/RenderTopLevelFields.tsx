import { FC } from 'react';
import { InputField } from '../components/InputField';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { formatFieldLabel } from '../utils';

export interface RenderTopLevelFieldsIF {
  refs: {
    fieldRefs: any;
    isScrollingRef: any;
    lastHoveredFieldRef: any;
  };
  updateWire: (fieldId: string, bbox: any) => void;
}

export const RenderTopLevelFields: FC<RenderTopLevelFieldsIF> = ({ updateWire, refs }) => {
  const { state, setState } = useViewRecordState();
  const { fieldRefs, isScrollingRef, lastHoveredFieldRef } = refs;

  return (
    <div className="flex flex-wrap gap-y-2">
      {Object.entries(state.topLevelFields).map(([key, value], i) => {
        const fieldId = `topLevelFields:${key}`;
        const confidence = Number((value.confidence * 100).toFixed(2));
        let confColor: string = confidence > 90 ? 'green' : confidence > 80 ? 'orange' : 'red';
        if (isNaN(confidence)) {
          confColor = 'black';
        }
        const onChange = (e: any) => {
          setState(prev => {
            const updated = prev.topLevelFields;
            updated[key] = { ...updated[key], value: e.target.value };
            return { ...prev, topLevelFields: updated };
          });
        };
        return (
          <InputField
            key={fieldId}
            label={formatFieldLabel(key)}
            value={value.value}
            confidence={`${value.confidence * 100}`}
            checked={value.checked}
            checkClickHandler={(checked: boolean) => {
              setState(prev => {
                const updated = prev.topLevelFields;
                updated[key] = { ...updated[key], checked: checked };
                return { ...prev, topLevelFields: updated };
              });
            }}
            // @ts-ignore
            ref={el => (fieldRefs.current[fieldId] = el)}
            onMouseAction={() => {
              if (value.bbox) {
                lastHoveredFieldRef.current = [fieldId, value.bbox, value.page];
                if (!isScrollingRef.current) {
                  setState(prev => ({ ...prev, hoveredOnArrayField: false, hoveredFieldId: fieldId, pageNumber: value.page ? value.page : prev.pageNumber }));
                  updateWire(fieldId, value.bbox);
                }
              }
            }}
            onChange={onChange}
          />
        );
      })}
    </div>
  );
};
