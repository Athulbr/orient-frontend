import Spinner from '../../../../components/Spinner';
import { ImageViewerHeader } from './components/ImageViewerHeader';
import { ImageMagnifier } from './components/Magnifier';
import { useViewRecordState } from './hooks/viewRecordContext';
import { useEffect, useRef, useState } from 'react';

interface DocumentPreviewComponentIF {
  test?: string;
  containerRef: any;
}

export const DocumentPreviewComponent: React.FC<DocumentPreviewComponentIF> = ({ containerRef }) => {
  const { state, setState } = useViewRecordState();
  const bboxRef = useRef<Record<string, HTMLDivElement | null>>({});
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const updateWirePosition = () => {
    const fieldEl = bboxRef.current[1234];
    const containerBox = containerRef.current?.getBoundingClientRect();
    if (!fieldEl || !containerBox) return;
    const stBox = fieldEl.getBoundingClientRect();
    // Field left-center
    const x1 = stBox.left - containerBox.left + stBox.width;
    const y1 = stBox.top + stBox.height / 2 - containerBox.top;
    setState(prev => ({ ...prev, wire: { x1, y1, x2: prev?.wire?.x2 || 0, y2: prev?.wire?.y2 || 0 } }));
  };

  useEffect(() => {
    updateWirePosition();

    // Scroll to center the bbox when it's updated
    const container = imageContainerRef.current;
    const fieldEl = bboxRef.current[1234];
    if (!container || !fieldEl) return;

    const containerRect = container.getBoundingClientRect();
    const fieldRect = fieldEl.getBoundingClientRect();

    // Calculate the center position of the bbox relative to the container
    const bboxCenter = fieldRect.top + fieldRect.height / 2;
    const containerCenter = containerRect.top + containerRect.height / 2;

    // Calculate how much we need to scroll to center the bbox
    const scrollAmount = bboxCenter - containerCenter;

    // Smooth scroll to the target position
    container.scrollTo({
      top: container.scrollTop + scrollAmount,
      behavior: 'smooth',
    });
  }, [state.bbox?.x_max]);

  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateWirePosition();
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef]);

  useEffect(() => {
    updateWirePosition();
  }, [zoomLevel]);

  const bbox = state.bbox;

  return (
    <div className="flex-1 overflow-auto" ref={imageContainerRef}>
      <ImageViewerHeader name={state.record?.name} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      {state.images.map((image, index) => (
        <div className="relative bg-amber-300" style={{ transform: `scale(${zoomLevel})` }}>
          <img className="h-full w-full" src={image} alt="PDF" />
          {bbox && state.tabIndex === 0 && !state.loadingS3File && index === state.pageNumber - 1 && (
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
      ))}
    </div>
  );
};
