import { FileUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface DragAndDropFileInputProps {
  onFileDrop: (files: FileList) => void;
}

const DragAndDropFileInput: React.FC<DragAndDropFileInputProps> = ({ onFileDrop }) => {
  const [dragging, setDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileDrop(files);
      }
    },
    [onFileDrop]
  );

  const handleClick = () => {
    document.getElementById('fileInput')?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileDrop(e.target.files);
    }
  };

  return (
    <div
      className={`flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 hover:border-sky-300 hover:bg-sky-50 ${dragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input accept="application/pdf,image/jpeg,image/png" id="fileInput" type="file" className="hidden" multiple onChange={handleChange} />
      <FileUp strokeWidth={1.5} size={50} className="text-gray-400" />
      <p className="text-gray-500">Drag & drop files here or click to select</p>
    </div>
  );
};

export default DragAndDropFileInput;
