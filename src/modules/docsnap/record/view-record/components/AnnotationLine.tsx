import { useViewRecordState } from '../hooks/viewRecordContext';

export const AnnotationLine = () => {
  const { state } = useViewRecordState();
  const wire = state.wire;

  if (!wire || state.tabIndex !== 0 || state.loadingS3File) return null;

  return (
    <svg className="pointer-events-none absolute top-0 left-0 z-10 flex h-full w-full">
      <line x1={wire.x1} y1={wire.y1} x2={wire.x2} y2={wire.y2} stroke="#FFA901" strokeWidth={2} />
      <circle cx={wire.x1} cy={wire.y1} r={4} fill="#FFA901" />
      <circle cx={wire.x2} cy={wire.y2} r={4} fill="#FFA901" />
    </svg>
  );
};
