import { FC, useState, useRef, useEffect } from 'react';
import { Download, Expand, Shrink, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '../../../../global-utils/twMerge';
import BackButton from '../../../../components/BackButton';
import { PreviewHeaderComponent } from './components/PreviewHeader';
interface PreviewComponentProps {
  images: string[];
  name?: string;
}

export const PreviewComponent: FC<PreviewComponentProps> = ({ images, name = 'Document Name' }) => {
  const [zoom, setZoom] = useState(100);
  const [shrinked, setShrinked] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = () => {
    const newZoom = Math.min(zoom + 10, 200);
    setZoom(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoom - 10, 50);
    setZoom(newZoom);
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = Number(e.target.value);
    setZoom(newZoom);
  };

  useEffect(() => {
    if (zoom > 130 && containerRef.current) {
      const container = containerRef.current;
      const scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [zoom]);

  const download = () => {
    const link = document.createElement('a');
    link.href = images[0];
    link.download = name;
    link.click();
  };

  const shrinkExpandHandler = () => {
    setZoom(shrinked ? 110 : 60);
    setShrinked(!shrinked);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <PreviewHeaderComponent
        zoom={zoom}
        zoomOut={zoomOut}
        zoomIn={zoomIn}
        handleZoomChange={handleZoomChange}
        shrinked={shrinked}
        shrinkExpandHandler={shrinkExpandHandler}
        download={download}
      />

      <div
        ref={containerRef}
        className={`relative flex h-full flex-col gap-6 overflow-auto bg-gray-100 pt-8 pb-50 shadow ${zoom > 120 ? 'items-start' : 'items-center'}`}
      >
        {images.map((imgSrc, index) => (
          <div
            className="w-fit bg-green-500 shadow-xl shadow-gray-400"
            style={{
              width: `${zoom - 10}%`,
              height: 'auto',
            }}
            key={index}
          >
            <img src={imgSrc} alt={`image-${index}`} className="h-full w-full transition-all duration-300" />
          </div>
        ))}
        <div className="absolute top-0 right-0 z-10 h-full w-1 shadow-2xl shadow-gray-500"></div>
      </div>
    </div>
  );
};
