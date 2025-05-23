import Spinner from '../../../../components/Spinner';
import { useViewRecordState } from './hooks/viewRecordContext';
import pdfLocation from '../../../../assets/PO_Private_hc7536 4_page-0001 (1).jpg';
import { useEffect, useRef } from 'react';

interface DocumentPreviewComponentIF {
  test?: string;
  containerRef: any;
}

export const DocumentPreviewComponent: React.FC<DocumentPreviewComponentIF> = ({ containerRef }) => {
  const { state, setState } = useViewRecordState();
  const bboxRef = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fieldEl = bboxRef.current[1234];
    const containerBox = containerRef.current?.getBoundingClientRect();
    if (!fieldEl || !containerBox) return;
    const stBox = fieldEl.getBoundingClientRect();
    // Field left-center
    const x1 = stBox.left - containerBox.left + stBox.width;
    const y1 = stBox.top + stBox.height / 2 - containerBox.top;
    setState(prev => ({ ...prev, wire: { x1, y1, x2: prev?.wire?.x2 || 0, y2: prev?.wire?.y2 || 0 } }));
  }, [state.bbox?.x_max]);

  const bbox = state.bbox;

  return (
    <div className="flex w-3/5 items-center justify-center">
      <div className="relative h-full w-fit">
        {/* <div className="relative mx-auto h-full w-full max-w-[830px] overflow-hidden rounded-lg"> */}
        {state.loading && (
          <div className="pointer-events-none absolute top-0 left-0 z-20 flex h-full w-full items-center justify-center rounded-xl border-3 border-sky-300 bg-[#1fa9f033]">
            <div className="animate-scan animate-pdf-scanner absolute top-0 left-0 h-[10px] w-full bg-[rgba(98,209,243,0.8)] shadow-[0_0_10px_2px_rgba(98,209,243,0.8)]"></div>
          </div>
        )}
        <div className="relative h-full border bg-red-200">
          <img className="h-full w-full object-contain" src={pdfLocation} alt="PDF" />
          {bbox && (
            <div
              // @ts-ignore
              ref={el => (bboxRef.current[1234] = el)}
              className="absolute border-2 border-[#FFA901]"
              style={{
                left: `${bbox.x_min * 100 - 0.4}%`,
                top: `${bbox.y_min * 100 - 0.4}%`,
                width: `${(bbox.x_max - bbox.x_min) * 100 + 0.8}%`,
                height: `${(bbox.y_max - bbox.y_min) * 100 + 0.6}%`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
