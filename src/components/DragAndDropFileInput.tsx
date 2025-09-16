import { FileUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useToastStore } from './toast/ToastStore';

interface DragAndDropFileInputProps {
    onFileDrop: (files: FileList) => void;
    accept?: string;
    onlyImage?: boolean;
}

const DragAndDropFileInput: React.FC<DragAndDropFileInputProps> = ({ onFileDrop, accept, onlyImage }) => {
    const [dragging, setDragging] = useState(false);
    const toast = useToastStore();

    const allowedTypes = [
        'application/pdf',
        'image/',
        'audio/',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];

    const isValidFile = (file: File) => {
        if (onlyImage) return file.type.startsWith('image/');
        return (
            file.type.startsWith('image/') ||
            file.type.startsWith('audio/') ||
            file.type === 'application/pdf' ||
            file.type === 'text/plain' ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
    };

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
                const validFiles = Array.from(files).filter(isValidFile);
                if (validFiles.length > 0) {
                    const dataTransfer = new DataTransfer();
                    validFiles.forEach(file => dataTransfer.items.add(file));
                    onFileDrop(dataTransfer.files);
                } else {
                    toast.error('Only images, PDFs, audio, TXT, or DOCX files are allowed');
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
            const validFiles = Array.from(files).filter(isValidFile);
            if (validFiles.length > 0) {
                const dataTransfer = new DataTransfer();
                validFiles.forEach(file => dataTransfer.items.add(file));
                onFileDrop(dataTransfer.files);
            } else {
                toast.error('Only images, PDFs, audio, TXT, or DOCX files are allowed');
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
            <input
                accept={
                    accept ||
                    (onlyImage
                        ? 'image/*'
                        : 'application/pdf,image/*,audio/*,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                }
                id="fileInput"
                type="file"
                className="hidden"
                multiple
                onChange={handleChange}
            />
            <FileUp strokeWidth={1.5} size={70} className="text-sky-600" />
            <p className="mt-2 font-semibold text-gray-800">Drag & drop </p>
            <div>
                or <span className="text-sky-500 underline">Browse </span>
            </div>
        </div>
    );
};

export default DragAndDropFileInput;
