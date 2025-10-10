import { Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '../../../../components/Button';
import { DialogComponent } from '../../../../components/DialogComponent';
import { useDocumentCreationEditorState } from '../hooks/DocumentCreationEditorContext';
import GenericFileInput from '../../../../components/DragAndDropFileInput';

interface KnowledgeBaseIF {
    test?: string;
}

const KnowledgeBase: React.FC<KnowledgeBaseIF> = () => {
    const { state, setState } = useDocumentCreationEditorState();

    console.log('state:===========', state);

    const handleFilesChange = (files: File[]) => {
        console.log(files);
        setState(prev => ({ ...prev, files: [...prev.files, ...files], showFileInput: false }));
    };
    const uploadFileHandler = (file: any) => {
        console.log('uploadFileHandler', file);
    };
    return (
        <div className="w-full flex flex-col overflow-y-auto h-full">
            <div className="p-4  flex flex-col h-full overflow-y-auto flex-1 gap-4 pb-20">
                {state.files.map((file: any, index: number) => (
                    <div key={index} className="flex text-sm items-center gap-2 w-full justify-between px-6 py-2 bg-sky-50 border border-sky-500 rounded-md">
                        <span className="truncate">{file.name}</span>
                        <input
                            value={file.fileName}
                            onChange={e => {
                                const updatedFiles = [...state.files];
                                updatedFiles[index].fileName = e.target.value;
                                setState(prev => ({ ...prev, files: updatedFiles }));
                            }}
                            type="text"
                            placeholder="Enter document name"
                            className="text-xs flex-1 max-w-[250px] border py-2 px-4 bg-white rounded-md"
                        />
                        <div className="flex gap-4">
                            <span
                                onClick={() => uploadFileHandler(file)}
                                className="border px-3 bg-blue-100 cursor-pointer hover:bg-blue-300 py-1 text-xs rounded-md"
                            >
                                Upload
                            </span>
                            <Trash2
                                onClick={() => {
                                    const updatedFiles = [...state.files];
                                    updatedFiles.splice(index, 1);
                                    setState(prev => ({ ...prev, files: updatedFiles }));
                                }}
                                className="w-4 h-4 hover:text-red-500 cursor-pointer"
                            />
                        </div>
                    </div>
                ))}
                {state.files.length > 0 && (
                    <span className="flex gap-4">
                        <Button className="w-full min-h-10">Upload All</Button>
                        <Button className="w-full min-h-10">Clear All</Button>
                    </span>
                )}
            </div>
            <div className="flex w-full justify-end p-2">
                <Button className="w-full" startIcon={<Plus size={16} />} onClick={() => setState(prev => ({ ...prev, showFileInput: true }))}>
                    Add Knowledge Base
                </Button>
            </div>

            <DialogComponent
                className="flex max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)] w-[80vw] flex-col overflow-y-auto"
                name="Upload Documents"
                isOpen={state.showFileInput}
                closeDialog={() => setState(prev => ({ ...prev, showFileInput: false }))}
            >
                <div className="flex h-full w-full flex-1 flex-col overflow-y-auto p-10">
                    <GenericFileInput maxFiles={10} onFilesChange={handleFilesChange} />
                </div>
            </DialogComponent>
        </div>
    );
};

export default KnowledgeBase;
