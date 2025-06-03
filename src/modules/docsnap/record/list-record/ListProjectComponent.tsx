import { FileSpreadsheet, Package } from 'lucide-react';
import { DialogComponent } from '../../../../components/DialogComponent';
import DragAndDropFileInput from './DragAndDropFileInput';
import React, { useState, useEffect } from 'react';
import { useToastStore } from '../../../../components/toast/ToastStore';
import httpRequest from '../../../../utils/httpRequest';
import httpUploadRequest from '../../../../utils/httpUploadRequest';
import { convertJSON } from './utils/convertJSON';
import { FileUploadAnimationComponent } from './components/FileUploadAnimationComponent';
import { useListRecordPageState } from './hooks/listRecordPageContext';
import Spinner from '../../../../components/Spinner';

interface ListProjectComponentIF {
  test?: string;
}

// Define proper interfaces for better type safety
interface Project {
  _id: string;
  name: string;
}

interface Document {
  _id: string;
  name: string;
  docType?: string;
  primaryModel: string;
  enableOcr?: boolean;
  fields: any;
}

export const RenderProjectComponent: React.FC<ListProjectComponentIF> = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>([]);

  const toast = useToastStore();
  const { state, setState } = useListRecordPageState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await httpRequest('POST', 'http://localhost:4000/api/idp/project');
        setProjects(res.data || []);
      } catch (error) {
        console.error('Error fetching project list:', error);
        toast.error('Failed to fetch projects');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!projectId) {
      setState(prev => ({ ...prev, documents: [], loadingDocuments: false }));

      return;
    }

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loadingDocuments: true }));
        const res = await httpRequest('POST', 'http://localhost:4000/api/idp/document', {
          filters: { projectId: projectId },
        });
        setDocuments(res.data || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to fetch documents');
      } finally {
        setState(prev => ({ ...prev, loadingDocuments: false }));
      }
    };

    fetchData();
  }, [projectId, toast]);

  const documentClickHandler = (document: any) => {
    setState(prev => ({ ...prev, fileUploadDialog: true, document }));
  };

  const toggleProject = (projectIdToToggle: string) => {
    setProjectId(current => (current === projectIdToToggle ? '' : projectIdToToggle));
  };

  return (
    <section className={`flex flex-col gap-2 ${projects.length ? 'border-b pb-2' : ''}`}>
      {Boolean(projects.length) && (
        <>
          <span className="text-md pl-1">Projects</span>
          <div className="animate-projects-container-slide-in flex h-full max-w-full gap-4 overflow-x-auto pb-2">
            {projects.map((item, index) => (
              <div
                key={item._id || index}
                className={`flex items-center gap-4 rounded-xl border ${
                  item._id === projectId ? 'bg-sky-100 pr-2' : 'animate-projects-container-slide-out pr-0'
                }`}
              >
                <div
                  onClick={() => toggleProject(item._id)}
                  className="group flex h-28 w-30 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-gray-300 transition-all duration-200 ease-in-out hover:border-sky-400 hover:bg-sky-50"
                >
                  <Package strokeWidth={1} className="text-gray-400 transition-colors duration-200 ease-in-out group-hover:text-sky-500" size={60} />
                  <span className="text-sm text-gray-600 transition-colors duration-200 ease-in-out group-hover:text-sky-600">{item.name}</span>
                </div>

                {item._id === projectId && (
                  <div className="animate-documents-fade-in flex gap-2 overflow-hidden">
                    {state.loadingDocuments ? (
                      <div className="flex h-25 w-30 items-center justify-center">
                        <Spinner />{' '}
                      </div>
                    ) : documents.length > 0 ? (
                      documents.map((doc, docIndex) => (
                        <div
                          key={doc._id || docIndex}
                          onClick={() => documentClickHandler(doc)}
                          className="group flex h-25 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-gray-300 transition-all duration-300 ease-in-out hover:border-sky-400 hover:bg-sky-50"
                          style={{
                            animationDelay: `${docIndex * 100}ms`,
                          }}
                        >
                          <FileSpreadsheet
                            strokeWidth={1}
                            className="text-gray-400 transition-colors duration-200 ease-in-out group-hover:text-sky-500"
                            size={60}
                          />
                          <span className="text-sm text-gray-600 transition-colors duration-200 ease-in-out group-hover:text-sky-600">{doc.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-25 w-40 items-center justify-center text-sm text-gray-500">No documents found</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
