import { Download, Minus, Plus } from 'lucide-react';
import BackButton from '../../../../../components/BackButton';
import { useNavigate } from 'react-router-dom';
import { MakezLogoBlack } from '../../../../../assets/svg-icons/MakezLogoBlack';
import Tooltip from '../../../../../components/Tooltip';
import { useEffect } from 'react';

interface ImageViewerHeaderProps {
  name: string;
  zoomLevel: number;
  setZoomLevel: (zoomLevel: number) => void;
  onDownload?: () => void;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.1;

export const ImageViewerHeader = ({ name, zoomLevel, setZoomLevel, onDownload }: ImageViewerHeaderProps) => {
  const navigate = useNavigate();

  const updateZoomLevel = (type: 'in' | 'out') => {
    const newZoom = type === 'in' ? Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP) : Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP);

    setZoomLevel(newZoom);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '+' || event.key === '=') {
        updateZoomLevel('in');
      } else if (event.key === '-') {
        updateZoomLevel('out');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [zoomLevel]);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

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
          <Tooltip text="Zoom out (-)" position="bottom">
            <Minus
              onClick={() => updateZoomLevel('out')}
              className="cursor-pointer rounded p-1 text-gray-600 transition-colors hover:bg-gray-100"
              size={20}
              strokeWidth={3}
            />
          </Tooltip>
          <span className="min-w-[40px] text-center text-sm font-medium text-gray-700">{Math.round(zoomLevel * 100)}%</span>
          <Tooltip text="Zoom in (+)" position="bottom">
            <Plus
              onClick={() => updateZoomLevel('in')}
              className="cursor-pointer rounded p-1 text-gray-600 transition-colors hover:bg-gray-100"
              size={20}
              strokeWidth={3}
            />
          </Tooltip>
        </div>
      </div>
      <Tooltip text="Download" position="bottom">
        <Download size={20} className="mr-2 cursor-pointer text-gray-500 transition-colors hover:text-gray-700" onClick={handleDownload} />
      </Tooltip>
    </div>
  );
};
