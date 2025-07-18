import { ZoomOut, ZoomIn, Expand, Shrink, Download } from 'lucide-react';
import BackButton from '../../../../../components/BackButton';
import { cn } from '../../../../../global-utils/twMerge';
import { useNavigate } from 'react-router-dom';
import { useS3DocumentsStore } from '../../../../../zustand-store/useStoredDocuments';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { useToastStore } from '../../../../../components/toast/ToastStore';
interface PreviewHeaderComponentProps {
  zoom: number;
  zoomOut: () => void;
  zoomIn: () => void;
  handleZoomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  shrinked: boolean;
  shrinkExpandHandler: () => void;
  name?: string;
}

export const PreviewHeaderComponent = ({ zoom, name, zoomOut, zoomIn, handleZoomChange, shrinked, shrinkExpandHandler }: PreviewHeaderComponentProps) => {
  const navigate = useNavigate();
  const { getS3File } = useS3DocumentsStore();
  const { state } = useViewRecordState();
  const toast = useToastStore();

  const handleDownload = async () => {
    try {
      if (!state.record?.pdfFileName) {
        toast.error('No file to download');
        return;
      }

      const s3Response = await getS3File(state.record.pdfFileName);

      if (!s3Response?.success || !s3Response?.data?.Body?.data) {
        toast.error('File not found or invalid response');
        return;
      }

      // Convert the number array to Uint8Array
      const fileDataArray = s3Response.data.Body.data;
      const fileData = new Uint8Array(fileDataArray);

      // Determine MIME type
      const fileName = state.record.pdfFileName.split('/').pop() || 'document';
      const mimeType = fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';

      // Create blob
      const blob = new Blob([fileData], { type: mimeType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName;
      link.style.display = 'none';

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup with delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 100);

      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex h-16 items-center justify-between border border-r-0 bg-white px-4">
      <div className="flex items-center gap-2">
        <BackButton onClick={() => navigate('/docsnap/record/list')} />
        <span className="max-w-50 truncate text-lg">{name}</span>
      </div>
      <div className="flex items-center gap-2 rounded-md border bg-white p-1">
        <LightIconButton Icon={ZoomOut} onClick={zoomOut} title="Zoom Out" />
        <input type="range" min="30" max="200" step="0.002" value={zoom} onChange={handleZoomChange} className="w-36 cursor-pointer" />
        <span className="w-8 text-sm font-light text-gray-500">{zoom.toFixed(0)}%</span>
        <LightIconButton Icon={ZoomIn} onClick={zoomIn} title="Zoom In" />
        {shrinked ? (
          <LightIconButton Icon={Expand} onClick={shrinkExpandHandler} title="Expand" />
        ) : (
          <LightIconButton Icon={Shrink} onClick={shrinkExpandHandler} title="Shrink" />
        )}
      </div>
      <LightIconButton Icon={Download} onClick={handleDownload} title="Download" />
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

const s3Response = {
  success: true,
  data: {
    AcceptRanges: 'bytes',
    LastModified: '2025-07-17T11:13:36.000Z',
    ContentLength: 134959,
    ETag: '"784bd5509cdd559d55e74f8d6444dff8"',
    ContentType: 'application/octet-stream',
    ServerSideEncryption: 'AES256',
    Metadata: {},
    Body: {
      type: 'Buffer',
      data: [37, 80, 68, 70, 45, 49, 46, 51, 10], // removed remaining numbers
    },
  },
  message: 'File Get Successfully',
  error: null,
};
