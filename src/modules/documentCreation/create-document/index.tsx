import { useState } from 'react';
import { ResizableContainer } from '../../docsnap/template/update-template/components/ResizableContainer';
import { DocumentCreationEditorStateProvider } from './hooks/DocumentCreationEditorContext';
import { tabs } from './static-data/tabs';
import RightContainer from './right-container';
import PreviewComponent from './preview-container';
import { AnnotationLine, useAnnotationLine } from './components/AnnotationLine';

interface DocumentCreationIF {
    test?: string;
}

export interface Message {
    text: string;
    source?: string[];
    userMessage: boolean;
}

export interface DocumentCreationEditorStateIF {
    activeTab: string;
    formFields: any[];
    template: any;
    formValues: Record<string, any>;
    documentText: string;
    showFileInput: boolean;
    files: any[];
    loadingTemplate: boolean;
    formData: any;
    knowledgeBase: { name: string; fileName: string; documentText: string[]; imageFileNames: string[] }[];
    uploadingDocuments: string[];
    messages: Message[];
    chatLoading: boolean;
    applyingKnowledgeBase: boolean;
    activeId: string;
    showRichTextEditor: boolean;
}

const initialState: DocumentCreationEditorStateIF = {
    activeTab: tabs[0].id,
    formFields: [],
    template: null,
    formValues: {},
    documentText: '',
    showFileInput: false,
    files: [],
    loadingTemplate: false,
    formData: {},
    knowledgeBase: [],
    uploadingDocuments: [],
    messages: [],
    chatLoading: false,
    applyingKnowledgeBase: false,
    activeId: '',
    showRichTextEditor: false
};

const DocumentCreationEditor: React.FC<DocumentCreationIF> = () => {
    const [state, setState] = useState<DocumentCreationEditorStateIF>(initialState);
    const { sourceId, targetId, shouldRender } = useAnnotationLine(state.activeId);

    return (
        <DocumentCreationEditorStateProvider value={{ state, setState }}>
            <div className="flex flex-1 overflow-y-auto relative">
                <ResizableContainer
                    className="flex flex-1 overflow-y-auto"
                    left={<PreviewComponent />}
                    right={<RightContainer />}
                    initialLeftWidthPercent={55}
                    minLeftWidthPercent={30}
                    maxLeftWidthPercent={75}
                />
                {shouldRender && <AnnotationLine sourceId={sourceId} targetId={targetId} />}
            </div>
        </DocumentCreationEditorStateProvider>
    );
};

export default DocumentCreationEditor;

// <div className="w-full flex overflow-y-auto">
//     <div className="w-[50%] overflow-y-auto">
//         <DynamicForm formConfig={formFields} onChange={handleFormDataChange} />
//     </div>
//     <div className="w-[50%] flex flex-col gap-4  overflow-y-auto">
//         <TabNavComponent tabs={tabs} onChange={index => setActiveTab(index)} />
//         {documentText && activeTab === 0 && (
//             <div className="w-full p-6 pt-250 pb-50  flex flex-col gap-4 leading-8 justify-center overflow-y-auto">
//                 {documentText.split('\n').map((item: string, index: number) => (
//                     <div key={index}>{item}</div>
//                 ))}
//             </div>
//         )}
//         {activeTab === 1 && (
//             <div className="w-full p-6  flex flex-col gap-4 leading-8 justify-center overflow-y-auto">
//                 <div className="flex flex-col gap-4 flex-1 h-full">
//                     {files.length > 0 && (
//                         <div className="flex flex-col gap-4">
//                             {files.map((file: File, index: number) => (
//                                 <div
//                                     key={index}
//                                     className="flex text-sm items-center gap-2 w-full justify-between px-6 py-4 bg-sky-50 border border-sky-500 rounded-md"
//                                 >
//                                     <span>{file.name}</span>

//                                     <Trash2
//                                         onClick={() => {
//                                             const updatedFiles = [...files];
//                                             updatedFiles.splice(index, 1);
//                                             setFiles(updatedFiles);
//                                         }}
//                                         className="w-4 h-4"
//                                     />
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//                 <div className="flex flex-col gap-4">
//                     {showFileInput && <GenericFileInput onFilesChange={handleFilesChange} />}
//                     <Button onClick={() => setShowFileInput(true)}>Add Files</Button>
//                 </div>
//             </div>
//         )}
//     </div>
// </div>
