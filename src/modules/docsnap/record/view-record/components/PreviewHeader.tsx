import { ZoomOut, ZoomIn, Expand, Shrink, Download } from 'lucide-react';
import BackButton from '../../../../../components/BackButton';
import { cn } from '../../../../../global-utils/twMerge';
import { useNavigate } from 'react-router-dom';
interface PreviewHeaderComponentProps {
  zoom: number;
  zoomOut: () => void;
  zoomIn: () => void;
  handleZoomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  shrinked: boolean;
  shrinkExpandHandler: () => void;
  download: () => void;
}

export const PreviewHeaderComponent = ({ zoom, zoomOut, zoomIn, handleZoomChange, shrinked, shrinkExpandHandler, download }: PreviewHeaderComponentProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex h-16 items-center justify-between border border-r-0 bg-white px-4">
      <div className="flex items-center gap-2">
        <BackButton onClick={() => navigate('/docsnap/record/list')} />
        <span className="max-w-50 truncate text-lg">Document Name</span>
      </div>
      <div className="flex items-center gap-2 rounded-md border bg-white p-1">
        <LightIconButton Icon={ZoomOut} onClick={zoomOut} title="Zoom Out" />
        <input type="range" min="30" max="200" step={0.002} value={zoom} onChange={handleZoomChange} className="w-36 cursor-pointer" />
        <span className="w-8 text-sm font-light text-gray-500">{zoom.toFixed(0)}%</span>
        <LightIconButton Icon={ZoomIn} onClick={zoomIn} title="Zoom In" />
        {shrinked ? (
          <LightIconButton Icon={Expand} onClick={shrinkExpandHandler} title="Expand" />
        ) : (
          <LightIconButton Icon={Shrink} onClick={shrinkExpandHandler} title="Shrink" />
        )}
      </div>
      <LightIconButton Icon={Download} onClick={download} title="Download" />
    </div>
  );
};

const LightIconButton = ({
  onClick,
  Icon,
  title,
  iconClassName,
  className,
}: {
  onClick: (e: any) => void;
  Icon: any;
  title?: string;
  iconClassName?: string;
  className?: string;
}) => {
  const onClickHandler = (e: any) => {
    e.stopPropagation();
    onClick(e);
  };
  return (
    <span
      translate="no"
      className={cn('group relative cursor-pointer rounded-md border border-gray-50 p-1.5 hover:border-gray-200', className)}
      onClick={onClickHandler}
      unselectable="on"
    >
      <Icon translate="no" strokeWidth={1} size={18} className={iconClassName} />
      <div
        unselectable="on"
        translate="no"
        className="absolute top-10 left-1/2 z-10 -translate-x-1/2 transform rounded bg-gray-400 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        {title}
      </div>
    </span>
  );
};
