import { ChartAreaIcon, Loader, MessageSquareMore, Table, Trash } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';
import { CompareResponseInputField } from './components/CompareResponseInputField';
import { useViewRecordState } from './hooks/viewRecordContext';
import { formatFieldLabel } from './utils';

interface ExtractedDataComponentIF {
  containerRef: any;
}

const ExtractedDataComponent: React.FC<ExtractedDataComponentIF> = ({ containerRef }) => {
  const { state, setState } = useViewRecordState();
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef<boolean>(false);
  const lastHoveredFieldRef = useRef<any[] | null>(null);

  const updateWire = (fieldId: string, bbox: any) => {
    if (!fieldId || !bbox) return;
    const fieldEl = fieldRefs.current[fieldId];
    const containerBox = containerRef.current?.getBoundingClientRect();
    if (!fieldEl || !containerBox) return;
    const fieldBox = fieldEl.getBoundingClientRect();
    // Field left-center
    const x2 = fieldBox.left - containerBox.left;
    const y2 = fieldBox.top + fieldBox.height / 2 - containerBox.top;
    setState(prev => ({ ...prev, bbox }));
    setState(prev => ({ ...prev, wire: { x1: prev?.wire?.x1 || 0, y1: prev?.wire?.y1 || 0, x2, y2 } }));
  };

  useEffect(() => {
    const handleScroll = () => {
      // Update wire position immediately during scroll for current connection
      if (state.hoveredFieldId !== null) {
        updateWire(state.hoveredFieldId, state.bbox);
      }
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      isScrollingRef.current = true;
      // Set a timer to clear the scrolling flag after 500ms
      scrollTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        // After scrolling completes, connect to the last hovered field if one exists
        if (lastHoveredFieldRef.current !== null) {
          setState(prev => ({ ...prev, hoveredFieldId: `${lastHoveredFieldRef.current?.[0]}` }));
          updateWire(`${lastHoveredFieldRef.current[0]}`, lastHoveredFieldRef.current[1]);
        }
      }, 500);
    };
    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      container?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll, true);
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [state.hoveredFieldId]);

  if (state.loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white">
        <Loader size={26} className="ml-2 animate-spin" />
        <div className="pt-2 pl-4 text-sm">Extracting Document...</div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-y-2 p-2">
      <RenderTopLevelFields fieldRefs={fieldRefs} updateWire={updateWire} isScrollingRef={isScrollingRef} lastHoveredFieldRef={lastHoveredFieldRef} />
      <RenderObjectFields fieldRefs={fieldRefs} updateWire={updateWire} isScrollingRef={isScrollingRef} lastHoveredFieldRef={lastHoveredFieldRef} />
      <RenderArrayFields fieldRefs={fieldRefs} updateWire={updateWire} isScrollingRef={isScrollingRef} lastHoveredFieldRef={lastHoveredFieldRef} />
    </div>
  );
};

export default ExtractedDataComponent;

interface RenderTopLevelFieldsIF {
  fieldRefs: any;
  isScrollingRef: any;
  lastHoveredFieldRef: any;
  updateWire: (fieldId: string, bbox: any) => void;
}

const RenderTopLevelFields: FC<RenderTopLevelFieldsIF> = ({ fieldRefs, updateWire, isScrollingRef, lastHoveredFieldRef }) => {
  const { state, setState } = useViewRecordState();

  return (
    <div className="flex flex-wrap gap-y-1">
      {Object.entries(state.topLevelFields).map(([key, value], i) => {
        const fieldId = `${value.value}_${i}`;
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
          <CompareResponseInputField
            label={formatFieldLabel(key)}
            value={value.value}
            confidence={`${value.confidence * 100}`}
            // @ts-ignore
            ref={el => (fieldRefs.current[fieldId] = el)}
            onMouseAction={() => {
              fieldRefs.current[fieldId].focus();
              if (value.bbox) lastHoveredFieldRef.current = [fieldId, value.bbox];
              if (!isScrollingRef.current) {
                setState(prev => ({ ...prev, hoveredFieldId: fieldId }));
                updateWire(fieldId, value.bbox);
              }
            }}
            onChange={onChange}
          />
        );
      })}
    </div>
  );
};
const RenderObjectFields: FC<RenderTopLevelFieldsIF> = ({ fieldRefs, updateWire, isScrollingRef, lastHoveredFieldRef }) => {
  const { state, setState } = useViewRecordState();

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
                  <CompareResponseInputField
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

const RenderArrayFields: FC<RenderTopLevelFieldsIF> = ({ fieldRefs, updateWire, isScrollingRef, lastHoveredFieldRef }) => {
  const { state, setState } = useViewRecordState();
  const [dialog, setDialog] = useState(false);

  return (
    <>
      {state.arrayFields.map((item, mainIndex) => {
        return (
          <div className="flex flex-col rounded-lg border bg-white">
            <label className="flex justify-between p-4 text-lg font-bold capitalize">
              {formatFieldLabel(state.tableNames[mainIndex])}
              <span className="flex cursor-pointer items-center gap-1 text-sm font-normal text-sky-500 hover:text-sky-600">
                <Table size={16} strokeWidth={1} /> View in table
              </span>
            </label>
            <div className="flex flex-col gap-y-4 p-2">
              {Object.entries(item).map(([key, subItem], rowIndex) => (
                <div className="flex flex-wrap rounded-lg border bg-[#f9fafb]">
                  <label className="text-md flex w-full items-center justify-between px-4 py-2 font-bold text-gray-600">
                    Row {rowIndex + 1} <Trash className="cursor-pointer hover:text-red-500" size={18} />
                  </label>

                  {Object.entries(subItem).map(([header, data], i) => {
                    const fieldId = `${header}_${rowIndex}_${mainIndex}_${i}`;

                    return (
                      <CompareResponseInputField
                        label={formatFieldLabel(header)}
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
                        description={header === 'description'}
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
