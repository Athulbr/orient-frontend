import { Download, Minus, Plus } from 'lucide-react';
import BackButton from '../../../../../components/BackButton';
import { useNavigate } from 'react-router-dom';
import { MakezLogoHeader } from '../../../../../assets/svg-icons/MakezLogoHeader';
import { MakezLogoBlack } from '../../../../../assets/svg-icons/MakezLogoBlack';
import Tooltip from '../../../../../components/Tooltip';

export const ImageViewerHeader = ({ name, zoomLevel, setZoomLevel }: { name: string; zoomLevel: number; setZoomLevel: (zoomLevel: number) => void }) => {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-30 flex h-15 w-full items-center justify-between border border-gray-200 bg-gray-100 px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <BackButton onClick={() => navigate(-1)} />
        <MakezLogoBlack />
      </div>
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
        <div className="h-6 w-px bg-gray-300"></div>
        <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5">
          <Tooltip text="Zoom out" position="bottom">
            <Minus
              onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))}
              className="cursor-pointer rounded p-1 text-gray-600 transition-colors hover:bg-gray-100"
              size={20}
              strokeWidth={3}
            />
          </Tooltip>
          <span className="min-w-[40px] text-center text-sm font-medium text-gray-700">{Math.round(zoomLevel * 100)}%</span>
          <Tooltip text="Zoom out" position="bottom">
            <Plus
              onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))}
              className="cursor-pointer rounded p-1 text-gray-600 transition-colors hover:bg-gray-100"
              size={20}
              strokeWidth={3}
            />
          </Tooltip>
        </div>
      </div>
      <Tooltip text="Download" position="bottom">
        <Download size={20} className="mr-2 cursor-pointer text-gray-500" />
      </Tooltip>
    </div>
  );
};
