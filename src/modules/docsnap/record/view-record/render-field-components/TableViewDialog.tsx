import { Table, Trash } from 'lucide-react';
import { FC, useRef, useState } from 'react';
import { InputField } from '../components/InputField';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { formatFieldLabel } from '../utils';
import { RenderTopLevelFieldsIF } from './RenderTopLevelFields';
import { DialogComponent } from '../../../../../components/DialogComponent';
import { AnnotationLine } from '../components/AnnotationLine';

export const TableViewDialogDelete: FC<RenderTopLevelFieldsIF> = ({ updateWire, refs }) => {
  const { state, setState } = useViewRecordState();
  const { fieldRefs, isScrollingRef, lastHoveredFieldRef } = refs;
  const bboxRef = useRef<Record<string, HTMLDivElement | null>>({});

  const x_min = state.bbox?.x_min;
  const y_min = state.bbox?.y_min;
  const x_max = state.bbox?.x_max;
  const y_max = state.bbox?.y_max;

  const onChange = () => {};

  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Handle image load to get dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Convert normalized coordinates to pixel values
  const getPixelCoordinates = () => {
    if (!x_min || !y_min || !x_max || !y_max || !imageDimensions.width || !imageDimensions.height) {
      return null;
    }

    return {
      x_min_px: 0,
      y_min_px: y_min * imageDimensions.height - 100,
      x_max_px: imageDimensions.width,
      y_max_px: y_max * imageDimensions.height + 100,
    };
  };

  const pixelCoords = getPixelCoordinates();
  const cropWidth = pixelCoords ? pixelCoords.x_max_px - pixelCoords.x_min_px : 0;
  const cropHeight = pixelCoords ? pixelCoords.y_max_px - pixelCoords.y_min_px : 0;

  return (
    <DialogComponent
      fullScreen
      name="Table View"
      className="h-full w-[calc(100%-40px)]"
      isOpen={state.tableViewDialog}
      closeDialog={() => setState(prev => ({ ...prev, tableViewDialog: false }))}
    >
      <div className="p-2">
        {pixelCoords ? (
          <div className="flex h-58 max-h-58 min-h-58 w-full justify-center">
            <div
              className="relative overflow-hidden rounded-lg border-2 border-blue-300 bg-red-200"
              style={{
                width: `${cropWidth}px`,
                height: `${cropHeight}px`,
              }}
            >
              <img
                src={state.images[state.pageNumber - 1]}
                className="absolute max-w-[1280px]"
                style={{
                  left: `-${pixelCoords.x_min_px}px`,
                  top: `-${pixelCoords.y_min_px}px`,
                  maxWidth: 'none',
                  maxHeight: 'none',
                }}
                alt="Cropped document section"
                onLoad={handleImageLoad}
              />
              {x_min && x_max && (
                <div
                  className="pointer-events-none absolute border-2 border-[#FFA901]"
                  style={{
                    left: `${(x_min - 0) * 100 - 0.2}%`,
                    top: `${45}%`,
                    width: `${(x_max - x_min) * 100 + 0.6}%`,
                    height: `${12}%`,
                  }}
                />
              )}
            </div>
            <svg className="pointer-events-none absolute top-0 left-0 z-10 flex h-full w-full">
              {/* <line x1={wire.x1} y1={wire.y1} x2={wire.x2} y2={wire.y2} stroke="#FFA901" strokeWidth={2} strokeDasharray={4} />
      <circle cx={wire.x1} cy={wire.y1} r={4} fill="#FFA901" /> */}
              <circle cx={100} cy={100} r={4} fill="#FFA901" />
            </svg>
          </div>
        ) : (
          <img src={state.images[state.pageNumber - 1]} className="h-50" alt="Full document" onLoad={handleImageLoad} />
        )}

        {state.arrayFields.map((item, mainIndex) => {
          return (
            <div key={mainIndex} className="flex flex-col rounded-lg border bg-white hover:border-yellow-500">
              <label className="flex justify-between p-4 text-lg font-bold capitalize">{formatFieldLabel(state.tableNames[mainIndex])}</label>
              <div className="flex flex-col gap-y-4 rounded-lg bg-white p-2">
                {Object.entries(item).map(([key, subItem], rowIndex) => (
                  <div key={rowIndex} className="flex gap-y-1 rounded-lg border bg-white">
                    {Object.entries(subItem).map(([label, value], i) => {
                      const fieldId = `${label}_${rowIndex}_${mainIndex}_${i}`;
                      if (value === null) return;
                      return (
                        <InputField
                          key={fieldId}
                          label={formatFieldLabel(label)}
                          value={value.value}
                          confidence={`${value.confidence * 100}`}
                          // @ts-ignore
                          ref={el => (fieldRefs.current[fieldId] = el)}
                          bbox={value.bbox}
                          onMouseAction={() => {
                            const bbox = value.bbox;
                            if (bbox) {
                              lastHoveredFieldRef.current = [fieldId, bbox, value.page];
                              if (!isScrollingRef.current) {
                                setState(prev => ({ ...prev, hoveredFieldId: fieldId, pageNumber: value.page ? value.page : prev.pageNumber }));
                                updateWire(fieldId, bbox);
                              }
                            }
                          }}
                          onChange={onChange}
                          description={label === 'Description'}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </DialogComponent>
  );
};
