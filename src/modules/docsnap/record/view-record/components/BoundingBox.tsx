import { useViewRecordState } from '../hooks/viewRecordContext';

interface BoundingBoxProps {
  bbox: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  };
  onRef: (el: HTMLDivElement | null) => void;
}

export const BoundingBox: React.FC<BoundingBoxProps> = ({ bbox, onRef }) => {
  const { setState } = useViewRecordState();

  return (
    <div
      ref={onRef}
      className="absolute border-2 border-[#FFA901]"
      style={{
        left: `${bbox.x_min * 100 - 0.4}%`,
        top: `${bbox.y_min * 100 - 0.4}%`,
        width: `${(bbox.x_max - bbox.x_min) * 100 + 0.8}%`,
        height: `${(bbox.y_max - bbox.y_min) * 100 + 0.6}%`,
      }}
      // onClick={() => {
      //   setState(prev => ({ ...prev, scrollToViewField: prev.scrollToViewField + 1 }));
      // }}
    />
  );
};
