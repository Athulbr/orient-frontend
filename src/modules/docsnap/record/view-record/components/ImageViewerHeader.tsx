import { Download } from 'lucide-react';
import BackButton from '../../../../../components/BackButton';
import { useNavigate } from 'react-router-dom';

export const ImageViewerHeader = ({ name, zoomLevel, setZoomLevel }: { name: string; zoomLevel: number; setZoomLevel: (zoomLevel: number) => void }) => {
  const navigate = useNavigate();
  return (
    <div title="header" className="sticky top-0 z-30 flex h-15 w-full items-center justify-between border border-gray-200 bg-gray-100 px-6 shadow-sm">
      {/* <div className="flex items-center justify-between"> */}
      <div className="flex items-center gap-4">
        <BackButton onClick={() => navigate(-1)} />
        <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
        <div className="h-6 w-px bg-gray-300"></div>
        <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5">
          <button onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))} className="rounded p-1 transition-colors hover:bg-gray-100" title="Zoom out">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="min-w-[40px] text-center text-sm font-medium text-gray-700">{Math.round(zoomLevel * 100)}%</span>
          <button onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.1))} className="rounded p-1 transition-colors hover:bg-gray-100" title="Zoom in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Download size={20} className="cursor-pointer text-gray-500" />
      </div>
      {/* </div> */}
    </div>
  );
};
