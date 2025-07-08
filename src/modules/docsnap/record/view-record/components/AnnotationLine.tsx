import { useViewRecordState } from '../hooks/viewRecordContext';

export const AnnotationLine = ({ bboxRef }: { bboxRef: any }) => {
  const { state } = useViewRecordState();
  const wire = state.wire;

  if (
    !wire ||
    state.tabIndex !== 0 ||
    state.loadingS3File ||
    state.bbox === null ||
    !bboxRef ||
    !state.hoveredFieldId ||
    !wire.x1 ||
    !wire.y1 ||
    !wire.x2 ||
    !wire.y2
  )
    return null;

  // Calculate the horizontal segment end points
  let startHorizontalX = wire.x1 + 50;
  let startHorizontalY = wire.y1;
  let endHorizontalX = wire.x2 - 50;
  let endHorizontalY = wire.y2;

  const box = bboxRef.current[1234]?.getBoundingClientRect();
  if (state.hoveredOnArrayField) {
    wire.x1 = box?.left + box?.width / 2;
    wire.y1 = box?.top + box?.height;
    startHorizontalX = wire.x1;
    startHorizontalY = wire.y1;
    endHorizontalX = wire.x2;
    endHorizontalY = wire.y2;
  }

  return (
    <svg className="pointer-events-none absolute top-0 left-0 z-10 flex h-full w-full">
      <path
        d={`M ${wire.x1} ${wire.y1} L ${startHorizontalX} ${startHorizontalY} L ${endHorizontalX} ${endHorizontalY} L ${wire.x2} ${wire.y2}`}
        stroke="rgb(13 109 214)"
        strokeWidth={2}
        fill="none"
      />
      <circle cx={wire.x1} cy={wire.y1} r={2.5} fill="rgb(13 109 214)" />
      <circle cx={wire.x2} cy={wire.y2} r={3} fill="rgb(13 109 214)" />
    </svg>
  );
};
