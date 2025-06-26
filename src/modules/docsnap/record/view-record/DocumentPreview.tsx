import { ImageViewerHeader } from './components/ImageViewerHeader';
import { useViewRecordState } from './hooks/viewRecordContext';
import { Fragment, useEffect, useRef, useState } from 'react';
import { BoundingBox } from './components/BoundingBox';
import { HoveredFieldCard } from './components/HoveredFieldCard';
import { LoadingDataSpinner } from './components/Loaders';
import { AnnotationLine } from './components/AnnotationLine';

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
      const boxEl = bboxRef.current[1234];

      const containerBox = containerRef.current?.getBoundingClientRect();
      if (!boxEl || !containerBox) return;

      const stBox = boxEl.getBoundingClientRect();
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
  }, [state.hoveredFieldId]);

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
  }, [zoomLevel, state.bbox?.y_min]);

  const handleFieldHover = (hoveredFieldId: string, bbox: any, pageNumber: number) => {
    if (bbox && !isScrolling) {
      lastHoveredFieldRef.current = [hoveredFieldId, bbox, pageNumber];
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
    if (keysArray?.length === 4) {
      const [fieldType, fieldKey, subFieldKey, subSubFieldKey] = keysArray;
      setState(prev => ({
        ...prev,
        arrayFields: prev.arrayFields.map((table, tableIdx) => {
          if (tableIdx !== Number(fieldKey)) return table;
          return {
            ...table,
            [subFieldKey]: {
              ...table[subFieldKey],
              [subSubFieldKey]: {
                ...table[subFieldKey][subSubFieldKey],
                value,
              },
            },
          };
        }),
      }));
    }
  };

  const handleCheckToggle = (checked?: boolean) => {
    const hoveredFieldId = state.hoveredFieldId;
    const keysArray = hoveredFieldId?.split(':') ?? [];
    if (keysArray.length === 2) {
      const [fieldType, fieldKey] = keysArray;
      setState(prev => ({
        ...prev,
        topLevelFields: {
          ...prev.topLevelFields,
          [fieldKey]: {
            ...prev.topLevelFields[fieldKey],
            checked: Boolean(checked),
          },
        },
      }));
    } else if (keysArray.length === 3) {
      const [fieldType, fieldKey, subFieldKey] = keysArray;
      setState(prev => ({
        ...prev,
        objectFields: {
          ...prev.objectFields,
          [fieldKey]: {
            ...prev.objectFields[fieldKey],
            [subFieldKey]: {
              ...prev.objectFields[fieldKey][subFieldKey],
              checked: Boolean(checked),
            },
          },
        },
      }));
    }
    if (keysArray.length === 4) {
      const [fieldType, fieldKey, subFieldKey, subSubFieldKey] = keysArray;
      setState(prev => ({
        ...prev,
        arrayFields: prev.arrayFields.map((table, tableIdx) => {
          if (tableIdx !== Number(fieldKey)) return table;
          return {
            ...table,
            [subFieldKey]: {
              ...table[subFieldKey],
              [subSubFieldKey]: {
                ...table[subFieldKey][subSubFieldKey],
                checked: Boolean(checked),
              },
            },
          };
        }),
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
      if (fieldType === 'arrayFields') {
        const tableIndex = Number(fieldKey);
        const table = state.arrayFields[tableIndex];
        if (!table) return null;
        const row = table[subFieldKey];
        if (!row) return null;
        return row;
      }
      if (fieldType === 'objectFields') {
        return state.objectFields[fieldKey]?.[subFieldKey] || null;
      }
      return null;
    }
    if (keysArray?.length === 4) {
      const [fieldType, fieldKey, subFieldKey, subSubFieldKey] = keysArray;
      if (fieldType === 'arrayFields') {
        const tableIndex = Number(fieldKey);
        const table = state.arrayFields[tableIndex];
        if (!table) return null;
        const row = table[subFieldKey];
        if (!row) return null;
        const data = row[subSubFieldKey];
        if (!data) return null;
        return data;
      }
      return null;
    }
    return null;
  };
  const arrayLength = state.hoveredFieldId?.split(':').length;
  const mainKey = state.hoveredFieldId?.split(':')[0] as string;
  const subKey = state.hoveredFieldId?.split(':')[1] as string;
  const subSubKey = (state.hoveredFieldId?.split(':')[2] as string) || '';
  const label = (state.hoveredFieldId?.split(':')[3] as string) || '';

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

          {/* ========================== Top Level Fields ========================== */}
          {Object.entries(state.topLevelFields).map(([key, field], i: number) => {
            const bbox = field?.bbox;
            if (!bbox || field?.page !== index + 1) return null;
            const hoveredFieldId = `topLevelFields:${key}`;
            return (
              <div
                tabIndex={0}
                key={`${key}_${i}_${field?.confidence}`}
                className={`${field?.checked ? 'bg-[#53cd1b48]' : 'bg-[#dfea3f33]'} absolute rounded`}
                style={{
                  left: `${bbox.x_min * 100 - 0.4}%`,
                  top: `${bbox.y_min * 100 - 0.4}%`,
                  width: `${(bbox.x_max - bbox.x_min) * 100 + 0.8}%`,
                  height: `${(bbox.y_max - bbox.y_min) * 100 + 0.6}%`,
                }}
                onMouseEnter={() => {
                  if (isScrolling) return;
                  handleFieldHover(hoveredFieldId, bbox, index + 1);
                  setState(prev => ({ ...prev, scrollToViewField: prev.scrollToViewField + 1, hoveredOnArrayField: false, selectedTableName: '' }));
                }}
              />
            );
          })}
          {/* ========================== Object Fields ========================== */}
          {Object.entries(state.objectFields).map(([mainKey, mainValue], mainIndex) => {
            return (
              <Fragment key={`${mainKey}_${mainIndex}`}>
                {Object.entries(mainValue).map(([key, field]: any, i: number) => {
                  const bbox = field?.bbox;
                  if (!bbox || field?.page !== index + 1) return null;
                  const hoveredFieldId = `objectFields:${mainKey}:${key}`;
                  return (
                    <div
                      key={`${hoveredFieldId}_${i}_${field?.confidence}_${field?.page}_${mainKey}_${key}`}
                      className={`${field?.checked ? 'bg-[#53cd1b48]' : 'bg-[#dfea3f33]'} absolute rounded`}
                      style={{
                        left: `${bbox.x_min * 100 - 0.4}%`,
                        top: `${bbox.y_min * 100 - 0.4}%`,
                        width: `${(bbox.x_max - bbox.x_min) * 100 + 0.8}%`,
                        height: `${(bbox.y_max - bbox.y_min) * 100 + 0.6}%`,
                      }}
                      onMouseEnter={() => {
                        if (isScrolling) return;
                        handleFieldHover(hoveredFieldId, bbox, index + 1);
                        setState(prev => ({ ...prev, scrollToViewField: prev.scrollToViewField + 1, hoveredOnArrayField: false, selectedTableName: '' }));
                      }}
                    />
                  );
                })}
              </Fragment>
            );
          })}
          {/* ========================== Array Fields ========================== */}
          {state.arrayFields.map((table, mainIndex) => {
            return (
              <div key={`${mainIndex}`}>
                {Object.entries(table).map(([mainKey, row]: any, i: number) => {
                  return (
                    <div key={`${mainKey}_${i}`}>
                      {Object.entries(row).map(([key, field]: any, i: number) => {
                        const bbox = field?.bbox;
                        if (!bbox || field?.page !== index + 1) return null;
                        const hoveredFieldId = `arrayFields:${mainIndex}:${mainKey}:${key}`;
                        return (
                          <div
                            key={`${mainKey}_${i}`}
                            className={`${field?.checked ? 'bg-[#53cd1b48]' : 'bg-[#dfea3f33]'} absolute rounded`}
                            style={{
                              left: `${bbox.x_min * 100 - 0.4}%`,
                              top: `${bbox.y_min * 100 - 0.4}%`,
                              width: `${(bbox.x_max - bbox.x_min) * 100 + 0.8}%`,
                              height: `${(bbox.y_max - bbox.y_min) * 100 + 0.6}%`,
                            }}
                            onMouseEnter={() => {
                              if (isScrolling) return;
                              handleFieldHover(hoveredFieldId, bbox, index + 1);
                              setState(prev => ({
                                ...prev,
                                scrollToViewField: prev.scrollToViewField + 1,
                                hoveredOnArrayField: true,
                                selectedTableName: state.tableNames[mainIndex],
                              }));
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {/* ========================== Bounding Box ========================== */}
          {state.bbox && state.tabIndex === 0 && !state.loadingS3File && index === state.pageNumber - 1 && (
            <div>
              <BoundingBox
                bbox={state.bbox}
                onRef={el => {
                  bboxRef.current[1234] = el;
                }}
              />

              {/* ========================== Hovered Field Card ========================== */}
              {getHoveredField() && (
                <HoveredFieldCard
                  hoveredField={getHoveredField()}
                  hoveredFieldId={state.hoveredFieldId || ''}
                  bbox={state.bbox}
                  onValueChange={handleValueChange}
                  onCheckToggle={handleCheckToggle}
                  arrayLength={arrayLength}
                  isChecked={
                    arrayLength === 4
                      ? state.arrayFields[Number(subKey)]?.[subSubKey]?.[label]?.checked || false
                      : arrayLength === 3
                        ? // @ts-ignore
                          state[mainKey]?.[subKey]?.[subSubKey]?.checked || false
                        : // @ts-ignore
                          state[mainKey]?.[subKey]?.checked || false
                  }
                />
              )}
            </div>
          )}
        </div>
      ))}
      <AnnotationLine bboxRef={bboxRef} />
    </div>
  );
};
