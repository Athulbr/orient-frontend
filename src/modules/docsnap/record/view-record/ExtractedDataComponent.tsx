import { ChartAreaIcon, Loader, MessageSquareMore } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';
import { CompareResponseInputField } from './components/CompareResponseInputField';
import { useViewRecordState } from './hooks/viewRecordContext';
import { formatFieldLabel } from './utils';
import FullScreenLoader from '../../../../components/FullScreenLoader';

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
    <div className="flex flex-col gap-2 pb-10">
      <RenderTopLevelFields fieldRefs={fieldRefs} updateWire={updateWire} isScrollingRef={isScrollingRef} lastHoveredFieldRef={lastHoveredFieldRef} />
      <RenderObjectFields fieldRefs={fieldRefs} updateWire={updateWire} isScrollingRef={isScrollingRef} lastHoveredFieldRef={lastHoveredFieldRef} />
      {/* <RenderArrayFields fieldRefs={fieldRefs} updateWire={updateWire} isScrollingRef={isScrollingRef} lastHoveredFieldRef={lastHoveredFieldRef} /> */}
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
    <div className="flex flex-wrap gap-y-1 py-2">
      {Object.entries(state.topLevelFields).map(([key, value], i) => {
        const fieldId = `${value.value}_${i}`;
        const confidence = Number((value.confidence * 100).toFixed(2));
        let confColor: string = confidence > 90 ? 'green' : confidence > 80 ? 'orange' : 'red';
        if (isNaN(confidence)) {
          confColor = 'black';
        }
        return (
          <CompareResponseInputField
            label={formatFieldLabel(key)}
            value={value.value}
            style={{ color: confColor }}
            // @ts-ignore
            ref={el => (fieldRefs.current[fieldId] = el)}
            onMouseAction={() => {
              lastHoveredFieldRef.current = [fieldId, value.bbox];
              if (!isScrollingRef.current) {
                setState(prev => ({ ...prev, hoveredFieldId: fieldId }));
                updateWire(fieldId, value.bbox);
              }
            }}
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
        // console.log('value:===========', value);
        return (
          <div className="flex flex-col rounded-lg border bg-white">
            <label className="p-4 text-lg font-bold capitalize">{formatFieldLabel(key)}</label>
            <div className="flex flex-wrap gap-y-1">
              {Object.entries(valueMain).map(([key, value], i) => {
                const fieldId = `${valueMain.value}_${mainIndex}_${i}`;
                return (
                  <CompareResponseInputField
                    label={formatFieldLabel(key)}
                    value={value.value}
                    // @ts-ignore
                    ref={el => (fieldRefs.current[fieldId] = el)}
                    onMouseAction={() => {
                      lastHoveredFieldRef.current = [fieldId, value.bbox];
                      if (!isScrollingRef.current) {
                        setState(prev => ({ ...prev, hoveredFieldId: fieldId }));
                        updateWire(fieldId, value.bbox);
                      }
                    }}
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

  return (
    <>
      {state.arrayFields.map((item, mainIndex) => {
        console.log('value:===========', item);
        return (
          <div className="flex flex-col rounded-lg border bg-white">
            <label className="p-4 text-lg font-bold capitalize">{formatFieldLabel('qq')}</label>
            <div className="flex flex-wrap gap-y-1">
              {Object.entries(item).map(([key, value], i) => {
                console.log('key:===========', key);

                const fieldId = `array_${item.value}_${mainIndex}_${i}`;
                return (
                  <CompareResponseInputField
                    label={formatFieldLabel(key)}
                    value={value.value}
                    // @ts-ignore
                    ref={el => (fieldRefs.current[fieldId] = el)}
                    onMouseAction={() => {
                      lastHoveredFieldRef.current = [fieldId, value.bbox];
                      if (!isScrollingRef.current) {
                        setState(prev => ({ ...prev, hoveredFieldId: fieldId }));
                        updateWire(fieldId, value.bbox);
                      }
                    }}
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

// const handleMouseEnter = () => {
//   inputRefs.current[1]?.focus();
//   // onMouseEnter={handleMouseEnter}
//   // ref={el => (inputRefs.current[1] = el!)}
// };
