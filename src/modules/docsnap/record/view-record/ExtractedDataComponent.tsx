import { Loader, Table, Trash } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';
import { InputField } from './components/InputField';
import { useViewRecordState } from './hooks/viewRecordContext';
import { formatFieldLabel } from './utils';
import { RenderArrayFields } from './render-field-components/RenderArrayFields';
import { RenderObjectFields } from './render-field-components/RenderObjectFields';
import { RenderTopLevelFields } from './render-field-components/RenderTopLevelFields';
import Spinner from '../../../../components/Spinner';
import { TableViewDialog } from './render-field-components/TableViewDialog';

interface ExtractedDataComponentIF {
  containerRef: any;
}

const ExtractedDataComponent: React.FC<ExtractedDataComponentIF> = ({ containerRef }) => {
  const { state, setState } = useViewRecordState();
  const [data, setData] = useState<any>({});

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
          setState(prev => ({ ...prev, hoveredFieldId: `${lastHoveredFieldRef.current?.[0]}`, pageNumber: lastHoveredFieldRef.current?.[2] }));
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

  useEffect(() => {
    if (!state.record?.extractedData && state.record?.metadata?.stream_url) {
      const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
      const eventSource = new EventSource(`${import.meta.env.VITE_BASR_URL}/ai/${state.record?.metadata?.stream_url}?token=Bearer ${JSON.parse(accessToken)}`);

      eventSource.addEventListener('task_update', (event: any) => {
        const data = JSON.parse(event.data);
        setData(data);
      });
      eventSource.onerror = (error: any) => {
        eventSource.close();
      };
    }
  }, [state.record]);

  if (!state.record?.extractedData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            <svg height={90} width={90} className="-rotate-90 transform">
              {/* Background circle */}
              <circle stroke="#e5e7eb" fill="transparent" strokeWidth={8} r={37} cx={45} cy={45} />
              {/* Progress circle */}
              <circle
                stroke="#f59e0b"
                fill="transparent"
                strokeWidth={8}
                strokeDasharray={`${37 * 2 * Math.PI} ${37 * 2 * Math.PI}`}
                strokeDashoffset={37 * 2 * Math.PI - ((data?.progress || 0) / 100) * 37 * 2 * Math.PI}
                strokeLinecap="round"
                r={37}
                cx={45}
                cy={45}
                className="transition-all duration-300 ease-in-out"
              />
            </svg>
            {/* Percentage text in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-semibold text-amber-500">{data?.progress || 0}%</span>
            </div>
          </div>
          {/* Current step text */}
          <div className="text-center font-medium text-amber-500">{data?.current_step || ''}</div>
        </div>
      </div>
    );
  }

  if (state.loadingData) {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 bg-white">
        {/* <Loader size={26} className="ml-2 animate-spin" />
        <div className="pt-2 pl-4 text-sm"></div> */}
        <Spinner /> Loading Data...
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-y-2 p-2">
      <RenderTopLevelFields refs={{ fieldRefs, isScrollingRef, lastHoveredFieldRef }} updateWire={updateWire} />
      <RenderObjectFields refs={{ fieldRefs, isScrollingRef, lastHoveredFieldRef }} updateWire={updateWire} />
      <RenderArrayFields refs={{ fieldRefs, isScrollingRef, lastHoveredFieldRef }} updateWire={updateWire} />
      <TableViewDialog refs={{ fieldRefs, isScrollingRef, lastHoveredFieldRef }} updateWire={updateWire} />
    </div>
  );
};

export default ExtractedDataComponent;
