import { FC, useEffect, useRef, useState } from 'react';
import { useViewRecordState } from './hooks/viewRecordContext';
import { RenderArrayFields } from './render-field-components/RenderArrayFields';
import { RenderObjectFields } from './render-field-components/RenderObjectFields';
import { RenderTopLevelFields } from './render-field-components/RenderTopLevelFields';
import { TableViewDialog } from './render-field-components/TableViewDialog';
import { LoadingDataSpinner } from './components/Loaders';
import ExtractedDataFooter from './components/ExtractedDataFooter';
import { ExportButton } from './components/ExportButton';
import { Button } from '../../../../components/Button';

interface ExtractedDataComponentProps {
  containerRef: any;
  lastHoveredFieldRef: any;
}

const ExtractedDataComponent: FC<ExtractedDataComponentProps> = ({ containerRef, lastHoveredFieldRef }) => {
  const { state, setState } = useViewRecordState();

  const [data, setData] = useState<{ progress?: number; current_step?: string }>({});

  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const extractedDataContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef<boolean>(false);

  const updateWire = (fieldId: string, bbox: any) => {
    if (!fieldId || !bbox) return;
    const fieldEl = fieldRefs.current[fieldId];
    const containerBox = containerRef.current?.getBoundingClientRect();
    if (!fieldEl || !containerBox) return;

    const fieldBox = fieldEl.getBoundingClientRect();
    const x2 = fieldBox.left - containerBox.left;
    const y2 = fieldBox.top + fieldBox.height / 2 - containerBox.top;

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

  const scrollToView = (fieldId: string) => {
    const fieldEl = fieldRefs.current[fieldId];
    if (!fieldEl) return;

    fieldEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (state.hoveredFieldId !== null) updateWire(state.hoveredFieldId, state.bbox);

      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

      isScrollingRef.current = true;
      scrollTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        if (lastHoveredFieldRef.current !== null) {
          setState(prev => ({
            ...prev,
            hoveredFieldId: `${lastHoveredFieldRef.current?.[0]}`,
            pageNumber: lastHoveredFieldRef.current?.[2] || 0,
          }));
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
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [state.hoveredFieldId]);

  useEffect(() => {
    if (state.hoveredFieldId && state.scrollToViewField > 1) {
      scrollToView(state.hoveredFieldId);
    }
  }, [state.scrollToViewField]);

  useEffect(() => {
    if (!state.record?.extractedData && state.record?.metadata?.stream_url) {
      const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
      const eventSource = new EventSource(
        `${import.meta.env.VITE_PYTHON_URL}/ai/${state.record?.metadata?.stream_url}?token=Bearer ${JSON.parse(accessToken)}`
      );
      eventSource.addEventListener('task_update', (event: any) => {
        const data = JSON.parse(event.data);
        setData(data);
      });
      eventSource.onerror = () => {
        eventSource.close();
      };
    }
  }, [state.record]);

  // if (!state.record?.extractedData) return <ProgressLoader progress={data?.progress || 0} currentStep={data?.current_step || ''} />;
  if (state.loadingData) return <LoadingDataSpinner />;

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex justify-end gap-2 border-b p-2">
        <Button small outlined>
          Request New Field
        </Button>
        <ExportButton />
      </div>
      <div ref={extractedDataContainerRef} className="flex flex-1 flex-col overflow-y-auto px-2 pt-2">
        <RenderTopLevelFields refs={{ fieldRefs, isScrollingRef, lastHoveredFieldRef }} updateWire={updateWire} />
        <RenderObjectFields refs={{ fieldRefs, isScrollingRef, lastHoveredFieldRef }} updateWire={updateWire} />
        <RenderArrayFields refs={{ fieldRefs, isScrollingRef, lastHoveredFieldRef }} updateWire={updateWire} />
        <TableViewDialog refs={{ fieldRefs, isScrollingRef, lastHoveredFieldRef }} updateWire={updateWire} />
      </div>
      <ExtractedDataFooter />
    </div>
  );
};

export default ExtractedDataComponent;
