import { ImageViewerHeader } from './components/ImageViewerHeader';
import { useViewRecordState } from './hooks/viewRecordContext';
import { useEffect, useRef, useState } from 'react';
import { formatFieldLabel } from './utils';
import { CircleCheck, Trash } from 'lucide-react';

interface DocumentPreviewComponentIF {
  containerRef: React.RefObject<HTMLDivElement>;
}

interface WirePoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const DocumentPreviewComponent: React.FC<DocumentPreviewComponentIF> = ({ containerRef }) => {
  const { state, setState } = useViewRecordState();
  const bboxRef = useRef<Record<string, HTMLDivElement | null>>({});
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const updateWirePosition = () => {
    try {
      const fieldEl = bboxRef.current[1234];
      const containerBox = containerRef.current?.getBoundingClientRect();
      if (!fieldEl || !containerBox) return;

      const stBox = fieldEl.getBoundingClientRect();
      const x1 = stBox.left - containerBox.left + stBox.width;
      const y1 = stBox.top + stBox.height / 2 - containerBox.top;

      setState(prev => ({
        ...prev,
        wire: {
          x1,
          y1,
          x2: prev?.wire?.x2 || 0,
          y2: prev?.wire?.y2 || 0,
        } as WirePoints,
      }));
    } catch (error) {
      console.error('Error updating wire position:', error);
    }
  };

  useEffect(() => {
    if (!state.bbox?.x_max) return;

    updateWirePosition();

    const container = imageContainerRef.current;
    const fieldEl = bboxRef.current[1234];
    if (!container || !fieldEl) return;

    const containerRect = container.getBoundingClientRect();
    const fieldRect = fieldEl.getBoundingClientRect();

    const bboxCenter = fieldRect.top + fieldRect.height / 2;
    const containerCenter = containerRect.top + containerRect.height / 2;
    const scrollAmount = bboxCenter - containerCenter;

    container.scrollTo({
      top: container.scrollTop + scrollAmount,
      behavior: 'smooth',
    });
  }, [state.bbox?.x_max]);

  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      requestAnimationFrame(updateWirePosition);
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
  let hoveredField: any = null;
  const hoveredFieldId = state.hoveredFieldId;
  const keysArray = hoveredFieldId?.split(':');
  if (keysArray?.length === 2) {
    hoveredField = state[keysArray[0] as string]?.[keysArray[1]] || null;
  }

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    console.error('Failed to load image');
  };

  return (
    <div className="flex-1 overflow-auto" ref={imageContainerRef}>
      <ImageViewerHeader name={state.record?.name} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      {state.images.map((image, index) => (
        <div className="relative bg-amber-300" key={index} style={{ transform: `scale(${zoomLevel - 0.1})` }}>
          {isLoading && (
            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            </div>
          )}
          <img className="h-full w-full" src={image} alt={`Document page ${index + 1}`} onLoad={handleImageLoad} onError={handleImageError} loading="lazy" />
          {Object.values(state.topLevelFields).map((field: any, i: number) => {
            const bbox = field.bbox;
            if (!bbox || field.page !== index + 1) return null;

            return (
              <div
                key={i}
                className="absolute rounded border-2 bg-[#ffaa011d]"
                style={{
                  left: `${bbox.x_min * 100 - 0.4}%`,
                  top: `${bbox.y_min * 100 - 0.4}%`,
                  width: `${(bbox.x_max - bbox.x_min) * 100 + 0.8}%`,
                  height: `${(bbox.y_max - bbox.y_min) * 100 + 0.6}%`,
                }}
                onMouseEnter={() => {
                  setState(prev => ({
                    ...prev,
                    hoveredFieldId: `topLevelFields:${field.key}`,
                  }));
                }}
              />
            );
          })}
          {bbox && state.tabIndex === 0 && !state.loadingS3File && index === state.pageNumber - 1 && (
            <>
              <div
                ref={(el: HTMLDivElement | null) => {
                  bboxRef.current[1234] = el;
                }}
                className="absolute border-2 border-[#FFA901]"
                style={{
                  left: `${bbox.x_min * 100 - 0.4}%`,
                  top: `${bbox.y_min * 100 - 0.4}%`,
                  width: `${(bbox.x_max - bbox.x_min) * 100 + 0.8}%`,
                  height: `${(bbox.y_max - bbox.y_min) * 100 + 0.6}%`,
                }}
              />
              {hoveredField && (
                <div
                  className="absolute rounded-lg border border-gray-200 bg-gray-800 p-4 shadow-lg"
                  style={{
                    left: `${bbox.x_min * 100 - 1}%`,
                    top: `${bbox.y_max * 100 + 1}%`,
                    minWidth: '220px',
                  }}
                >
                  <div className="flex justify-between gap-2 pl-1 font-semibold text-white">
                    {formatFieldLabel(hoveredFieldId?.split(':')[1] || '')}
                    <Trash
                      className="cursor-pointer hover:text-red-500"
                      size={16}
                      onClick={() => {
                        setState(prev => ({
                          ...prev,
                          hoveredFieldId: null,
                        }));
                      }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-lg text-white">
                    <input
                      onChange={e => {
                        if (keysArray?.length === 2) {
                          const [fieldType, fieldKey] = keysArray;
                          setState(prev => {
                            const newState = { ...prev };
                            if (fieldType === 'topLevelFields') {
                              newState.topLevelFields = {
                                ...prev.topLevelFields,
                                [fieldKey]: {
                                  ...prev.topLevelFields[fieldKey],
                                  value: e.target.value,
                                },
                              };
                            }
                            return newState;
                          });
                        }
                      }}
                      value={hoveredField.value}
                      className="w-full border-none bg-transparent p-1 text-white"
                    />
                    <CircleCheck className="cursor-pointer text-green-500" size={20} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};
