import { Loader, Table, Trash } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';
import { InputField } from './components/InputField';
import { useViewRecordState } from './hooks/viewRecordContext';
import { formatFieldLabel } from './utils';
import { RenderArrayFields } from './render-field-components/RenderArrayFields';
import { RenderObjectFields } from './render-field-components/RenderObjectFields';
import { RenderTopLevelFields } from './render-field-components/RenderTopLevelFields';

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
      }, 50);
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
      <RenderTopLevelFields refs={{ fieldRefs, isScrollingRef, lastHoveredFieldRef }} updateWire={updateWire} />
      <RenderObjectFields refs={{ fieldRefs, isScrollingRef, lastHoveredFieldRef }} updateWire={updateWire} />
      <RenderArrayFields refs={{ fieldRefs, isScrollingRef, lastHoveredFieldRef }} updateWire={updateWire} />
    </div>
  );
};

export default ExtractedDataComponent;
