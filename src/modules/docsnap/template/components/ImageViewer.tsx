import { FC, useState } from 'react';

interface ImageViewerProps {
  images: string[];
}

export const ImageViewer: FC<ImageViewerProps> = ({ images }) => {
  const [zoom, setZoom] = useState(100); // percent

  const zoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const zoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => setZoom(Number(e.target.value));

  return (
    <div className="flex h-full w-full flex-col bg-gray-100 p-4">
      {/* Zoom Controls */}
      <div className="mb-4 flex items-center gap-4">
        <button onClick={zoomOut} className="rounded bg-gray-300 px-3 py-1 hover:bg-gray-400">
          -
        </button>
        <input type="range" min="50" max="200" value={zoom} onChange={handleZoomChange} className="w-40" />
        <span>{zoom}%</span>
        <button onClick={zoomIn} className="rounded bg-gray-300 px-3 py-1 hover:bg-gray-400">
          +
        </button>
      </div>

      {/* Scrollable Image Viewer */}
      <div className={`flex h-[80vh] flex-col gap-2 overflow-auto rounded border bg-red-500 py-4 shadow ${zoom > 100 ? 'items-start' : 'items-center'}`}>
        {images.map((imgSrc, index) => (
          <div
            className="w-fit bg-green-500"
            style={{
              width: `${zoom}%`,
              height: 'auto',
            }}
          >
            <img src={imgSrc} alt={`image-${index}`} className="h-full w-full transition-all duration-300" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Demo with sample images
export default function App() {
  const sampleImages = ['https://picsum.photos/400/300?random=1', 'https://picsum.photos/400/300?random=2', 'https://picsum.photos/400/300?random=3'];

  return <ImageViewer images={sampleImages} />;
}
