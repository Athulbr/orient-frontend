import { ImageViewerHeader } from './components/ImageViewerHeader';
import { useViewRecordState } from './hooks/viewRecordContext';
import { Fragment, useEffect, useRef, useState } from 'react';
import { BoundingBox } from './components/BoundingBox';
import { HoveredFieldCard } from './components/HoveredFieldCard';
import Spinner from '../../../../components/Spinner';
import { LoadingDataSpinner } from './components/Loaders';

interface DocumentPreviewComponentIF {
  containerRef: any;
  lastHoveredFieldRef: any;
}

interface WirePoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const DocumentPreviewComponent: React.FC<DocumentPreviewComponentIF> = ({ containerRef, lastHoveredFieldRef }) => {
  const { state, setState } = useViewRecordState();
  const bboxRef = useRef<Record<string, HTMLDivElement | null>>({});
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      setIsScrolling(true);
      requestAnimationFrame(updateWirePosition);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [containerRef]);

  useEffect(() => {
    updateWirePosition();
  }, [zoomLevel]);

  const handleFieldHover = (hoveredFieldId: string, bbox: any, pageNumber: number) => {
    if (bbox && !isScrolling) {
      lastHoveredFieldRef.current = [null, bbox, pageNumber];
      setState(prev => ({
        ...prev,
        bbox: bbox,
        hoveredFieldId,
        pageNumber,
      }));
    }
  };

  const handleValueChange = (value: string) => {
    const keysArray = state.hoveredFieldId?.split(':');
    if (keysArray?.length === 2) {
      const [fieldType, fieldKey] = keysArray;
      setState(prev => {
        const newState = { ...prev };
        if (fieldType === 'topLevelFields') {
          newState.topLevelFields = {
            ...prev.topLevelFields,
            [fieldKey]: {
              ...prev.topLevelFields[fieldKey],
              value,
            },
          };
        }
        return newState;
      });
    }
    if (keysArray?.length === 3) {
      const [fieldType, fieldKey, subFieldKey] = keysArray;
      setState(prev => {
        const newState = { ...prev };
        if (fieldType === 'objectFields') {
          newState.objectFields = {
            ...prev.objectFields,
            [fieldKey]: {
              ...prev.objectFields[fieldKey],
              [subFieldKey]: {
                ...prev.objectFields[fieldKey][subFieldKey],
                value,
              },
            },
          };
        }
        return newState;
      });
    }
  };

  const handleCheckToggle = () => {
    const hoveredFieldId = state.hoveredFieldId;
    const keysArray = hoveredFieldId?.split(':');
    if (keysArray?.length === 2) {
      setState(prev => ({
        ...prev,
        topLevelFields: {
          ...prev.topLevelFields,
          [state.hoveredFieldId?.split(':')[1] as string]: {
            ...prev.topLevelFields[state.hoveredFieldId?.split(':')[1] as string],
            checked: !prev.topLevelFields[state.hoveredFieldId?.split(':')[1] as string].checked,
          },
        },
      }));
    }
    if (keysArray?.length === 3) {
      const [fieldType, fieldKey, subFieldKey] = keysArray;
      setState(prev => ({
        ...prev,
        objectFields: {
          ...prev.objectFields,
          [fieldKey]: {
            ...prev.objectFields[fieldKey],
            [subFieldKey]: {
              ...prev.objectFields[fieldKey][subFieldKey],
              checked: !prev.objectFields[fieldKey][subFieldKey].checked,
            },
          },
        },
      }));
    }
  };

  const getHoveredField = () => {
    const hoveredFieldId = state.hoveredFieldId;
    const keysArray = hoveredFieldId?.split(':');
    if (keysArray?.length === 2) {
      const [fieldType, fieldKey] = keysArray;
      if (fieldType === 'topLevelFields') {
        return state.topLevelFields[fieldKey] || null;
      }

      return null;
    }
    if (keysArray?.length === 3) {
      const [fieldType, fieldKey, subFieldKey] = keysArray;

      if (fieldType === 'objectFields') {
        return state.objectFields[fieldKey]?.[subFieldKey] || null;
      }
      return null;
    }
    return null;
  };
  const arrayLength = state.hoveredFieldId?.split(':').length;
  const mainKey = state.hoveredFieldId?.split(':')[0] as string;
  const subKey = state.hoveredFieldId?.split(':')[1] as string;
  const subSubKey = (state.hoveredFieldId?.split(':')[2] as string) || '';

  if (state.loadingS3File) {
    return (
      <div className="flex h-[100vh] w-full flex-col">
        <ImageViewerHeader name={state.record?.name} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />

        <div className="flex h-[100vh] w-full flex-1 flex-col items-center justify-center">
          <LoadingDataSpinner text="Loading Document..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" ref={imageContainerRef}>
      <ImageViewerHeader name={state.record?.name} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      {state.images.map((image, index) => (
        <div className="relative bg-amber-300" key={index} style={{ transform: `scale(${zoomLevel - 0.1})` }}>
          <img className="h-full w-full" src={image} alt={`Document page ${index + 1}`} loading="lazy" />

          {Object.entries(state.topLevelFields).map(([key, field], i: number) => {
            const bbox = field.bbox;
            if (!bbox || field.page !== index + 1) return null;
            const hoveredFieldId = `topLevelFields:${key}`;
            return (
              <div
                tabIndex={0}
                key={`${key}_${i}_${field.confidence}`}
                className="absolute rounded bg-[#b9ff2d33]"
                style={{
                  left: `${bbox.x_min * 100 - 0.4}%`,
                  top: `${bbox.y_min * 100 - 0.4}%`,
                  width: `${(bbox.x_max - bbox.x_min) * 100 + 0.8}%`,
                  height: `${(bbox.y_max - bbox.y_min) * 100 + 0.6}%`,
                }}
                onMouseEnter={() => {
                  handleFieldHover(hoveredFieldId, bbox, index + 1);
                  setState(prev => ({ ...prev, scrollToViewField: prev.scrollToViewField + 1 }));
                }}
              />
            );
          })}
          {Object.entries(state.objectFields).map(([mainKey, mainValue], mainIndex) => {
            return (
              <Fragment key={`${mainKey}_${mainIndex}`}>
                {Object.entries(mainValue).map(([key, field]: any, i: number) => {
                  const bbox = field.bbox;
                  if (!bbox || field.page !== index + 1) return null;
                  const hoveredFieldId = `objectFields:${mainKey}:${key}`;
                  // console.log(hoveredFieldId);
                  return (
                    <div
                      key={`${hoveredFieldId}_${i}_${field.confidence}_${field.page}_${mainKey}_${key}`}
                      className="absolute rounded bg-[#b9ff2d33]"
                      style={{
                        left: `${bbox.x_min * 100 - 0.4}%`,
                        top: `${bbox.y_min * 100 - 0.4}%`,
                        width: `${(bbox.x_max - bbox.x_min) * 100 + 0.8}%`,
                        height: `${(bbox.y_max - bbox.y_min) * 100 + 0.6}%`,
                      }}
                      onMouseEnter={() => {
                        handleFieldHover(hoveredFieldId, bbox, index + 1);
                        setState(prev => ({ ...prev, scrollToViewField: prev.scrollToViewField + 1 }));
                      }}
                    />
                  );
                })}
              </Fragment>
            );
          })}
          {state.bbox && state.tabIndex === 0 && !state.loadingS3File && index === state.pageNumber - 1 && (
            <>
              <BoundingBox
                bbox={state.bbox}
                onRef={el => {
                  bboxRef.current[1234] = el;
                }}
              />
              {getHoveredField() && (
                <HoveredFieldCard
                  hoveredField={getHoveredField()}
                  hoveredFieldId={state.hoveredFieldId || ''}
                  bbox={state.bbox}
                  onValueChange={handleValueChange}
                  onCheckToggle={handleCheckToggle}
                  // @ts-ignore
                  isChecked={arrayLength === 3 ? state[mainKey]?.[subKey]?.[subSubKey]?.checked || false : state[mainKey]?.[subKey]?.checked || false}
                />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};
