import { FC, useEffect, useState } from 'react';
import { InputField } from '../components/InputField';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { formatFieldLabel } from '../utils';

interface RenderObjectFieldsIF {
  updateWire: (fieldId: string, bbox: any) => void;
  refs: {
    fieldRefs: any;
    isScrollingRef: any;
  };
}

export const RenderObjectFields: FC<RenderObjectFieldsIF> = ({ updateWire, refs }) => {
  const { state, setState } = useViewRecordState();
  const { fieldRefs, isScrollingRef } = refs;

  return (
    <>
      {Object.entries(state.objectFields).map(([key, valueMain]) => {
        return (
          <div key={key} className="flex flex-col rounded-lg border bg-white p-1 hover:border-blue-400">
            <label className="p-3 text-lg font-bold capitalize">{formatFieldLabel(key)}</label>
            <div className="flex flex-wrap gap-y-4">
              {Object.entries(valueMain).map(([subKey, value]) => {
                const fieldId = `objectFields:${key}:${subKey}`;
                const onChange = (e: any) => {
                  setState(prev => {
                    const updated = prev.objectFields;
                    updated[key][subKey] = { ...updated[key][subKey], value: e.target.value };
                    return { ...prev, objectFields: updated };
                  });
                };

                const fields = state.record?.templateId?.fields;
                const field = fields.find((item: any) => item.jsonKey === key);
                const subField = Object.values(field).find((item: any) => true);
                return (
                  <InputField
                    key={fieldId}
                    label={formatFieldLabel(subKey)}
                    jsonKey={subKey}
                    value={`${value?.value}`}
                    confidence={`${value?.confidence * 100}`}
                    checked={value?.checked}
                    disabled={state.loadingS3File || state.reExtracting}
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
