import { useViewRecordState } from '../hooks/viewRecordContext';

export const AnnotationLine = () => {
  const { state } = useViewRecordState();
  const wire = state.wire;

  if (!wire || state.tabIndex !== 0 || state.loadingS3File || state.bbox === null || state.selectedTableName) return null;

  // Calculate the horizontal segment end points
  const startHorizontalX = wire.x1 + 50;
  const startHorizontalY = wire.y1;
  const endHorizontalX = wire.x2 - 50;
  const endHorizontalY = wire.y2;

  return (
    <svg className="pointer-events-none absolute top-0 left-0 z-10 flex h-full w-full">
      <path
        d={`M ${wire.x1} ${wire.y1} L ${startHorizontalX} ${startHorizontalY} L ${endHorizontalX} ${endHorizontalY} L ${wire.x2} ${wire.y2}`}
        stroke="rgb(13 109 214)"
        strokeWidth={2}
        fill="none"
      />
      <circle cx={wire.x1} cy={wire.y1} r={4} fill="rgb(13 109 214)" />
      <circle cx={wire.x2} cy={wire.y2} r={4} fill="rgb(13 109 214)" />
    </svg>
  );
};
