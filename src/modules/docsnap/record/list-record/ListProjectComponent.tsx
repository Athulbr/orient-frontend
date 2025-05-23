import { FileSpreadsheet, Package } from 'lucide-react';
import { DialogComponent } from '../../../../components/Dialog';
import DragAndDropFileInput from './DragAndDropFileInput';
import { useEffect, useState } from 'react';
import Spinner from '../../../../components/Spinner';
import { entitySchema } from './../static-data/entitySchema';
import { useToastStore } from '../../../../components/toast/ToastStore';

interface ListProjectComponentIF {
  test?: string;
}

export const ListProjectComponent: React.FC<ListProjectComponentIF> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<any>([]);
  const [project, setProject] = useState<string>('');
  const [documents, setDocuments] = useState<any>([]);
  const toast = useToastStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await httpRequest.get('/docsnap/project/list');
        setTimeout(() => {
          setDocuments(documentsDummy);
        }, 2000);
      } catch (error) {
        console.error('Error fetching project list:', error);
      }
    };

    fetchData();
  });
  useEffect(() => {
    setTimeout(() => {
      setProjects(projectsDummy);
    }, 1000);
  });

  const extractDocument = (selectedFile: File) => {
    console.log('extractDocument():===========');
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('schema', JSON.stringify(entitySchema));
    formData.append('filename', selectedFile.name);

    fetch('http://localhost:3000/extract-data', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
        return response.json();
      })
      .then(data => {
        console.log('File uploaded successfully:', data);
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });
  };

  const onFileDrop = (files: FileList) => {
    const file = files[0];
    if (!file) return;
    if (file && file.type !== 'application/pdf') {
      toast.warning('Please upload a PDF file');
      return;
    }
    const url = URL.createObjectURL(file);
    toast.success('Selected files added for extraction successfully');

    setIsOpen(false);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  return (
    <section className={`flex flex-col gap-2 ${projects.length ? 'border-b pb-2' : ''} `}>
      {Boolean(projects.length) && (
        <>
          <span className="text-md pl-1">Projects</span>
          <div className={`animate-projects-container-slide-in flex h-full max-w-full gap-4 overflow-x-auto pb-2`}>
            {projects.map((item: any, index: number) => (
              <div
                key={index}
                className={`flex items-center gap-4 rounded-xl border ${item._id === project ? 'bg-sky-50 pr-2' : 'animate-projects-container-slide-out pr-0'}`}
              >
                <div
                  onClick={() => (item._id === project ? setProject('') : setProject(item._id))}
                  className="flex h-28 w-30 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-gray-300 transition-all duration-200 ease-in-out hover:border-sky-400 hover:bg-sky-50"
                >
                  <Package strokeWidth={1} className="text-gray-400 transition-colors duration-200 ease-in-out group-hover:text-sky-500" size={60} />
                  <span className="text-sm text-gray-600 transition-colors duration-200 ease-in-out group-hover:text-sky-600">{item.name}</span>
                </div>

                {item._id === project && (
                  <div className="animate-documents-fade-in flex gap-2 overflow-hidden">
                    {documents.map((doc: any, index: number) => (
                      <div
                        key={index}
                        onClick={() => {
                          setIsOpen(true);
                        }}
                        className="flex h-25 w-30 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-gray-300 transition-all duration-300 ease-in-out hover:border-sky-400 hover:bg-sky-50"
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        <FileSpreadsheet
                          strokeWidth={1}
                          className="text-gray-400 transition-colors duration-200 ease-in-out group-hover:text-sky-500"
                          size={60}
                        />
                        <span className="text-sm text-gray-600 transition-colors duration-200 ease-in-out group-hover:text-sky-600">{doc.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      <DialogComponent name="Select File" isOpen={isOpen} closeDialog={closeDialog}>
        <div className="flex h-[calc(100vh-200px)] w-[80vw] items-center justify-center px-20 py-5">
          <DragAndDropFileInput onFileDrop={onFileDrop} />
        </div>
      </DialogComponent>
    </section>
  );
};

const projectsDummy = [
  {
    name: 'Purchase Order',
    _id: '123456789082737737422991',
  },
  {
    name: 'Demo',
    _id: '123456789082737737422992',
  },
];
const documentsDummy = [
  {
    name: 'PO Private',
    _id: '123456789082737737422991',
  },
  {
    name: 'Po Public',
    _id: '123456789082737737422992',
  },
];
