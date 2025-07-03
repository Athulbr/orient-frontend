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
        const validFiles = Array.from(files).filter(file => 
          file.type.startsWith('application/pdf') || 
          file.type.startsWith('image/')
        );
        if (validFiles.length > 0) {
          const dataTransfer = new DataTransfer();
          validFiles.forEach(file => dataTransfer.items.add(file));
          onFileDrop(dataTransfer.files);
        } else {
          alert('Only PDF and image files are allowed');
        }
      }
    },
    [onFileDrop]
  );

  const handleClick = () => {
    document.getElementById('fileInput')?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(file => 
        file.type.startsWith('application/pdf') || 
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        const dataTransfer = new DataTransfer();
        validFiles.forEach(file => dataTransfer.items.add(file));
        onFileDrop(dataTransfer.files);
      } else {
        alert('Only PDF and image files are allowed');
        e.target.value = ''; // Clear the input
      }
    }
  };

  return (
    <div
      className={`flex h-full w-full flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 hover:border-sky-300 hover:bg-sky-50 ${dragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input accept="application/pdf,image/jpeg,image/png" id="fileInput" type="file" className="hidden" multiple onChange={handleChange} />
      <FileUp strokeWidth={1.5} size={70} className="text-sky-600" />
      <p className="mt-2 font-semibold text-gray-800">Drag & drop </p>
      <div className="">
        or <span className="text-sky-500 underline">Browse </span>
      </div>
    </div>
  );
};

export default DragAndDropFileInput;
